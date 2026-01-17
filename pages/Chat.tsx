
import React, { useState, useRef, useEffect } from 'react';
import { streamChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { APP_DATABASE } from '../config'; // Import DB for Amazon Link
import LogoMaddie from '../components/LogoMaddie';

const Chat: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { sessions, getSessionEndTime } = useBooking(); 
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // --- CARGAR / GUARDAR MENSAJES ---
    useEffect(() => {
        if (!user) return;

        // 1. Limpiar notificación de "No Leído" al entrar
        localStorage.removeItem(`mad_chat_unread_${user.email}`);

        // 2. Cargar historial
        const storageKey = `mad_chat_history_${user.email}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
            // Hidratar fechas (JSON las guarda como string)
            const parsed = JSON.parse(stored).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
            
            // --- FIX: Restaurar mensaje de Amazon si no existe ---
            // Comprobamos si el mensaje de afiliado ya está en el historial, si no, lo añadimos al final (o principio si es nuevo)
            const hasAmazonMsg = parsed.some((m: ChatMessage) => m.id === 'mad-affiliate-msg');
            if (!hasAmazonMsg) {
                 const affiliateMsg: ChatMessage = {
                    id: 'mad-affiliate-msg',
                    role: 'model',
                    text: "Por cierto, si quieres conseguir el look de esta sesión o mejorar tu equipo, aquí tienes lo que yo uso (y de paso me ayudas con una pequeña comisión):",
                    timestamp: new Date(),
                    actionLabel: "VER MI EQUIPO EN AMAZON",
                    actionUrl: APP_DATABASE.affiliate.amazonStore
                };
                // Lo añadimos al historial existente
                parsed.push(affiliateMsg);
            }
            
            setMessages(parsed);
        } else {
            // Mensaje de bienvenida default si no hay historial
            setMessages([
                {
                    id: 'welcome',
                    role: 'model',
                    text: `¡Qué pasa ${user.name}! 📸\nSoy el Asistente Mad. Aquí te enviaré tus CLAVES DE ACCESO privadas y confirmaciones.\n\nTambién puedes pedirme recomendaciones de equipo. ¿Qué necesitas hoy?`,
                    timestamp: new Date()
                },
                {
                    id: 'mad-affiliate-msg',
                    role: 'model',
                    text: "Por cierto, si quieres conseguir el look de esta sesión o mejorar tu equipo, aquí tienes lo que yo uso (y de paso me ayudas con una pequeña comisión):",
                    timestamp: new Date(),
                    actionLabel: "VER MI EQUIPO EN AMAZON",
                    actionUrl: APP_DATABASE.affiliate.amazonStore
                }
            ]);
        }
    }, [user]);

    // Guardar en cada cambio
    useEffect(() => {
        if (!user || messages.length === 0) return;
        const storageKey = `mad_chat_history_${user.email}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
        scrollToBottom();
    }, [messages, user]);

    // --- LÓGICA DE RECORDATORIOS AUTOMÁTICOS (24H y FIN DE SESIÓN) ---
    // Nota: Mantenemos esto separado del historial persistente para que se inyecte si corresponde
    useEffect(() => {
        if (!user || !user.bookedSessionIds) return;

        const checkAutomatedMessages = () => {
            const now = new Date();
            const bookedSessions = sessions.filter(s => user.bookedSessionIds.includes(s.id));
            let newMsgs: ChatMessage[] = [];

            bookedSessions.forEach(session => {
                const endTime = getSessionEndTime(session);
                const startTime = new Date(endTime.getTime() - 3 * 60 * 60 * 1000);

                // 1. RECORDATORIO 24H ANTES
                const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const diffTime = startTime.getTime() - todayMidnight.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                const reminderKey = `mad_reminder_24h_${session.id}_${user.email}`;
                if (diffDays === 1 && !localStorage.getItem(reminderKey)) {
                    newMsgs.push({
                        id: `reminder-24h-${session.id}`,
                        role: 'model',
                        text: `¡Eh! Mañana tenemos lío con ${session.tema}. Carga las baterías. 📸🔥`,
                        timestamp: new Date(),
                        actionLabel: "📍 VER UBICACIÓN",
                        actionUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.ubicacion)}`
                    });
                    localStorage.setItem(reminderKey, 'true');
                }
            });

            if (newMsgs.length > 0) {
                setMessages(prev => [...prev, ...newMsgs]);
            }
        };

        checkAutomatedMessages();
    }, [user, sessions, getSessionEndTime]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        let accumulatedText = "";
        const aiMsgId = (Date.now() + 1).toString();
        
        setMessages(prev => [...prev, {
            id: aiMsgId,
            role: 'model',
            text: "",
            isTyping: true,
            timestamp: new Date()
        }]);

        await streamChat(history, userMsg.text, (chunk) => {
            accumulatedText += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId 
                ? { ...msg, text: accumulatedText, isTyping: false } 
                : msg
            ));
        });
        
        setIsTyping(false);
    };

    // Renderizado de Markdown y Botones
    const renderMessageContent = (msg: ChatMessage) => {
        const text = msg.text;
        
        // Render simple para este snippet
        if (msg.actionLabel && msg.actionUrl) {
            const isInternal = msg.actionUrl.startsWith('#') || msg.actionUrl.startsWith('/');
            return (
                <>
                    <div className="whitespace-pre-wrap">{text}</div>
                    {isInternal ? (
                        <button 
                            onClick={() => navigate(msg.actionUrl!.replace('#', ''))}
                            className="mt-3 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                            <span className="material-icons-round text-sm text-[#FF5500]">confirmation_number</span>
                            {msg.actionLabel}
                        </button>
                    ) : (
                        <a 
                            href={msg.actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 block w-full bg-[#FF5500]/10 hover:bg-[#FF5500]/20 border border-[#FF5500]/30 text-[#FF5500] text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,85,0,0.2)]"
                        >
                            <span className="material-icons-round text-sm">shopping_cart</span>
                            {msg.actionLabel}
                        </a>
                    )}
                </>
            );
        }
        return <div className="whitespace-pre-wrap">{text}</div>;
    };

    return (
        <div className="bg-background-dark text-slate-100 h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark/95 ios-blur border-b border-white/10 px-4 pt-4 pb-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative flex-shrink-0">
                         <LogoMaddie className="w-full h-full shadow-[0_0_15px_rgba(255,85,0,0.4)]" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-oswald font-bold text-[#FF5500] tracking-wide leading-none">
                            MAD SHOOTING
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                            <span className="material-icons-round text-[10px] text-[#FF5500]">lock</span>
                            Canal Privado
                        </p>
                    </div>
                </div>
                <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors border border-white/10">
                    <span className="material-icons-round text-slate-400 text-lg">close</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pt-32 pb-32 space-y-6 max-w-lg mx-auto w-full hide-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-2 max-w-[90%] ${msg.role === 'user' ? 'ml-auto items-end' : ''}`}>
                        <div className={`p-4 rounded-2xl shadow-sm border ${
                            msg.role === 'user' 
                            ? 'bg-[#FF5500] text-white border-[#FF5500] rounded-tr-none' 
                            : 'bg-[#121212] text-slate-200 border-white/10 rounded-tl-none'
                        }`}>
                            <div className="text-sm leading-relaxed font-medium">
                                {renderMessageContent(msg)}
                            </div>
                            {msg.isTyping && <span className="animate-pulse inline-block w-2 h-4 bg-[#FF5500] ml-1">|</span>}
                        </div>
                        <span className="text-[10px] text-slate-500 mx-1 uppercase tracking-wider font-bold">
                            {msg.role === 'user' ? 'Tú' : 'Mad Assistant'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                
                <div ref={messagesEndRef} />
            </main>

            <div className="fixed bottom-0 left-0 right-0 pt-2 pb-8 px-4 bg-black/95 ios-blur border-t border-white/10 z-50">
                <div className="max-w-lg mx-auto flex items-center gap-2">
                    <div className="relative flex-1">
                        <input 
                            className="w-full bg-[#121212] border border-white/10 rounded-full py-4 px-6 text-sm focus:ring-1 focus:ring-[#FF5500] focus:border-[#FF5500] text-white placeholder-slate-600 outline-none transition-all" 
                            placeholder="Escribe aquí..." 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center rounded-full bg-[#FF5500] text-white hover:bg-orange-600 transition-colors shadow-[0_0_10px_rgba(255,85,0,0.4)]"
                        >
                            <span className="material-icons-round text-sm">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
