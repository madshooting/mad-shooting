
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_DATABASE } from '../config';
import { Session, Contest, ContestEntry, Proposal } from '../types';

interface ConsumeResult {
    success: boolean;
    type?: 'standard' | 'vip';
    message?: string;
}

// Nueva interfaz para claves de un solo uso
export interface OneTimeKey {
    code: string;
    status: 'active' | 'used';
    createdAt: number;
}

interface BookingContextType {
    // Gestión de Claves
    bookingPassword: string; // Clave Maestra (Fallback)
    rewardPassword: string;  // Clave Premio
    generatedKeys: OneTimeKey[]; // Lista de claves generadas
    
    updateBookingPassword: (pass: string) => void;
    updateRewardPassword: (pass: string) => void;
    
    createOneTimeKey: () => string; // Generar clave única
    deleteOneTimeKey: (code: string) => void; // Borrar clave
    consumeCode: (input: string) => ConsumeResult; // Validar y quemar clave
    
    // Gestión de Sesiones en Vivo
    sessions: Session[];
    addNewSession: (newSessionData: Partial<Session>) => void;
    bookSessionSlot: (sessionId: number) => boolean;
    isNextSessionFree: (userSessions: number) => boolean;
    getSessionEndTime: (session: Session) => Date; 

    // Gestión de Concursos
    contests: Contest[];
    voteEntry: (contestId: number, entryId: string) => void;
    uploadContestEntry: (contestId: number, entry: ContestEntry) => boolean;

    // Gestión de Propuestas
    proposals: Proposal[];
    voteProposal: (proposalId: string) => void;
    addProposal: (theme: string, author: string) => void;

    // Gestión de Avisos Urgentes
    urgentMessage: string | null;
    publishUrgentMessage: (msg: string) => void;
    clearUrgentMessage: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// HELPER INTERNO: Parsear fecha de inicio
const parseSessionStart = (dateStr: string, timeStr: string): Date => {
    const currentYear = new Date().getFullYear();
    const months: {[key:string]: number} = {
        'ENE': 0, 'FEB': 1, 'MAR': 2, 'ABR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AGO': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DIC': 11
    };
    
    try {
        const parts = dateStr.trim().split(' '); // Ej: ["SÁB", "21", "FEB"]
        if (parts.length < 3) return new Date(currentYear + 1, 0, 1);

        const day = parseInt(parts[1], 10);
        const month = months[parts[2].toUpperCase()] || 0;
        
        let hour = 10; // Default mañana
        const timeLower = timeStr.toLowerCase();

        if (timeStr.includes(':')) {
            hour = parseInt(timeStr.split(':')[0], 10);
        } else if (timeLower.includes('tarde')) {
            hour = 17; // Estandarizamos "Tarde" a las 17:00
        } else if (timeLower.includes('noche')) {
            hour = 21; // "Noche" a las 21:00
        } else if (timeLower.includes('mañana')) {
            hour = 11; // "Mañana" a las 11:00
        }

        return new Date(currentYear, month, day, hour, 0, 0);
    } catch (e) {
        return new Date(currentYear + 1, 0, 1);
    }
};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    // --- GESTIÓN DE CLAVES MAESTRAS Y GENERADAS ---
    const [bookingPassword, setBookingPassword] = useState(localStorage.getItem('mad_key_booking') || 'MAD2026');
    const [rewardPassword, setRewardPassword] = useState(localStorage.getItem('mad_key_reward') || 'PREMIO2025');
    
    // Estado para claves generadas automáticamente
    const [generatedKeys, setGeneratedKeys] = useState<OneTimeKey[]>(() => {
        const stored = localStorage.getItem('mad_generated_keys');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('mad_generated_keys', JSON.stringify(generatedKeys));
    }, [generatedKeys]);

    const updateBookingPassword = (pass: string) => {
        setBookingPassword(pass);
        localStorage.setItem('mad_key_booking', pass);
    };

    const updateRewardPassword = (pass: string) => {
        setRewardPassword(pass);
        localStorage.setItem('mad_key_reward', pass);
    };

    // GENERAR CLAVE ÚNICA (Formato: MS-XXXX)
    const createOneTimeKey = (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 1, 0 para evitar confusión
        let randomStr = '';
        for (let i = 0; i < 4; i++) {
            randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const newCode = `MS-${randomStr}`;
        
        const newKey: OneTimeKey = {
            code: newCode,
            status: 'active',
            createdAt: Date.now()
        };

        setGeneratedKeys(prev => [newKey, ...prev]);
        return newCode;
    };

    const deleteOneTimeKey = (code: string) => {
        setGeneratedKeys(prev => prev.filter(k => k.code !== code));
    };

    // CONSUMIR CÓDIGO (Validación inteligente)
    const consumeCode = (inputCode: string): ConsumeResult => {
        const normalized = inputCode.trim();
        
        // 1. Verificar Claves de Un Solo Uso (Prioridad)
        const keyIndex = generatedKeys.findIndex(k => k.code === normalized);
        
        if (keyIndex !== -1) {
            const key = generatedKeys[keyIndex];
            
            if (key.status === 'used') {
                return { success: false, message: "Esta clave ya ha sido canjeada." };
            }

            // MARCAR COMO USADA AUTOMÁTICAMENTE
            const updatedKeys = [...generatedKeys];
            updatedKeys[keyIndex] = { ...key, status: 'used' };
            setGeneratedKeys(updatedKeys);

            return { success: true, type: 'standard', message: "Clave válida. Canjeada correctamente." };
        }

        // 2. Clave Maestra (Fallback Admin)
        if (normalized === bookingPassword) {
            return { success: true, type: 'standard' };
        }
        
        // 3. Clave de Premio (Fidelidad)
        if (normalized === rewardPassword) {
            return { success: true, type: 'vip' };
        }

        return { success: false, message: "Clave no válida." };
    };

    // --- GESTIÓN DE SESIONES ---
    const [sessions, setSessions] = useState<Session[]>([]);

    useEffect(() => {
        const storedSessions = localStorage.getItem('mad_sessions_live');
        if (storedSessions) {
            setSessions(JSON.parse(storedSessions));
        } else {
            setSessions(APP_DATABASE.proximasSesiones as unknown as Session[]);
        }
    }, []);

    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem('mad_sessions_live', JSON.stringify(sessions));
        }
    }, [sessions]);

    const addNewSession = (data: Partial<Session>) => {
        const newId = Date.now(); 
        const imageUrl = data.imagen || "https://images.unsplash.com/photo-1542038784456-1ea0e93ca64b?q=80&w=1000&auto=format&fit=crop";
        
        const newSession: Session = {
            id: newId,
            tema: data.tema || "Nueva Sesión",
            description: data.description || "Descripción pendiente de actualizar.",
            tag: data.tag || "NUEVO",
            fecha: data.fecha || "PENDIENTE",
            hora: data.hora || "10:00",
            ubicacion: data.ubicacion || "Madrid",
            mapsUrl: data.mapsUrl || "", // Default empty
            plazas: data.plazas || 10,
            ocupadas: 0,
            precio: data.precio || 15,
            imagen: imageUrl,
            moodboard: data.moodboard && data.moodboard.length > 0 ? data.moodboard : [imageUrl],
            actionType: 'paypal'
        };

        setSessions(prev => [newSession, ...prev]);
    };

    const getSessionEndTime = (session: Session): Date => {
        const start = parseSessionStart(session.fecha, session.hora);
        return new Date(start.getTime() + 3 * 60 * 60 * 1000);
    };

    const bookSessionSlot = (sessionId: number): boolean => {
        let success = false;
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                if (s.ocupadas < s.plazas) {
                    success = true;
                    return { ...s, ocupadas: s.ocupadas + 1 };
                }
            }
            return s;
        }));
        return success;
    };

    const isNextSessionFree = (userSessions: number) => {
        return (userSessions % 10) === 9;
    };

    // --- GESTIÓN DE CONCURSOS ---
    const [contests, setContests] = useState<Contest[]>([]);
    
    useEffect(() => {
        const storedContestsRaw = localStorage.getItem('mad_contests_entries');
        const storedEntries: Record<number, ContestEntry[]> = storedContestsRaw ? JSON.parse(storedContestsRaw) : {};

        const now = new Date();
        const activeContests: Contest[] = [];

        sessions.forEach(session => {
            const sessionEndTime = getSessionEndTime(session);
            
            if (now >= sessionEndTime) {
                const existingEntries = storedEntries[session.id] || [];
                activeContests.push({
                    id: session.id,
                    sessionId: session.id,
                    title: session.tema,
                    status: 'voting', 
                    entries: existingEntries
                });
            }
        });

        const sortedContests = activeContests.sort((a, b) => b.id - a.id);
        setContests(sortedContests);
    }, [sessions]);

    useEffect(() => {
        if (contests.length > 0) {
            const entriesMap: Record<number, ContestEntry[]> = {};
            contests.forEach(c => {
                entriesMap[c.sessionId] = c.entries;
            });
            localStorage.setItem('mad_contests_entries', JSON.stringify(entriesMap));
        }
    }, [contests]);

    const voteEntry = (contestId: number, entryId: string) => {
        setContests(prev => prev.map(c => {
            if (c.id === contestId) {
                const updatedEntries = c.entries.map(e => {
                    if (e.id === entryId) {
                        return { ...e, votes: e.votes + 1 };
                    }
                    return e;
                });
                return { ...c, entries: updatedEntries };
            }
            return c;
        }));
    };

    const uploadContestEntry = (contestId: number, entry: ContestEntry): boolean => {
        let success = false;
        setContests(prev => prev.map(c => {
            if (c.id === contestId) {
                const alreadyExists = c.entries.some(e => e.isUserEntry);
                if (alreadyExists) return c; 
                success = true;
                return { ...c, entries: [entry, ...c.entries] };
            }
            return c;
        }));
        return success;
    };

    // --- GESTIÓN DE PROPUESTAS ---
    const [proposals, setProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        const storedProps = localStorage.getItem('mad_proposals');
        if (storedProps) {
            setProposals(JSON.parse(storedProps));
        } else {
            // @ts-ignore
            setProposals(APP_DATABASE.propuestas || []);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('mad_proposals', JSON.stringify(proposals));
    }, [proposals]);

    const voteProposal = (proposalId: string) => {
        setProposals(prev => prev.map(p => {
            if (p.id === proposalId) {
                return { ...p, votes: p.votes + 1, isVotedByUser: true };
            }
            return p;
        }));
    };

    const addProposal = (theme: string, author: string) => {
        const newProposal: Proposal = {
            id: Date.now().toString(),
            theme,
            author,
            votes: 1,
            isVotedByUser: true
        };
        setProposals(prev => [newProposal, ...prev]);
    };

    // --- GESTIÓN DE AVISOS URGENTES ---
    const [urgentMessage, setUrgentMessage] = useState<string | null>(localStorage.getItem('mad_urgent_msg') || null);

    const publishUrgentMessage = (msg: string) => {
        setUrgentMessage(msg);
        localStorage.setItem('mad_urgent_msg', msg);
    };

    const clearUrgentMessage = () => {
        setUrgentMessage(null);
        localStorage.removeItem('mad_urgent_msg');
    };

    return (
        <BookingContext.Provider value={{ 
            bookingPassword, rewardPassword, generatedKeys, 
            updateBookingPassword, updateRewardPassword, 
            createOneTimeKey, deleteOneTimeKey, consumeCode,
            sessions, addNewSession, bookSessionSlot, isNextSessionFree, getSessionEndTime,
            contests, voteEntry, uploadContestEntry,
            proposals, voteProposal, addProposal,
            urgentMessage, publishUrgentMessage, clearUrgentMessage
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) throw new Error("useBooking must be used within an AuthProvider");
    return context;
};
