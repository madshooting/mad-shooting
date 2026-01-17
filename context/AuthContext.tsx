
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_DATABASE } from '../config';

// Estructura del Historial de Reservas
interface BookingRecord {
    sessionId: number;
    type: 'standard' | 'vip';
    date: string;
}

// Estructura del Usuario
interface User {
    name: string; // Nombre Artístico / Nick
    realName?: string; // Nuevo: Nombre Real para lista de puerta
    instagram?: string; // Nuevo: Usuario de IG
    email: string;
    phone?: string; 
    avatar: string;
    level: string;
    points: number;
    sessionsCompleted: number;
    bookedSessionIds: number[]; 
    bookingHistory?: BookingRecord[]; 
    password?: string; 
}

interface AuthResponse {
    success: boolean;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, pass: string) => AuthResponse;
    register: (email: string, pass: string, name: string, phone: string) => AuthResponse; 
    logout: () => void;
    incrementSessionCount: () => void;
    addBookedSession: (sessionId: number, type?: 'standard' | 'vip') => void;
    getAllUsers: () => User[]; 
    updateUserProfile: (data: Partial<User>) => void; // Nueva función expuesta
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Claves de LocalStorage
const STORAGE_KEYS = {
    SESSION: 'mad_session',      // Usuario logueado actualmente
    USERS_DB: 'mad_users_db'     // "Base de datos" de usuarios registrados
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // 1. Cargar sesión activa al iniciar
    useEffect(() => {
        const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (storedSession) {
            try {
                setUser(JSON.parse(storedSession));
            } catch (e) {
                console.error("Error recuperando sesión", e);
                localStorage.removeItem(STORAGE_KEYS.SESSION);
            }
        }
    }, []);

    // Helper: Obtener DB de usuarios
    const getUsersDB = (): User[] => {
        const db = localStorage.getItem(STORAGE_KEYS.USERS_DB);
        return db ? JSON.parse(db) : [];
    };

    // Helper: Guardar DB
    const saveUsersDB = (users: User[]) => {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    };

    // Exponer la DB para el admin
    const getAllUsers = () => getUsersDB();

    // --- LOGIN STRICT VALIDATION ---
    const login = (email: string, pass: string): AuthResponse => {
        if (!email.trim() || !pass.trim()) return { success: false, message: "Rellena todos los campos." };

        const db = getUsersDB();
        const foundUser = db.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

        if (!foundUser || foundUser.password !== pass) {
            return { success: false, message: "Email o contraseña incorrectos." };
        }

        const { password, ...sessionUser } = foundUser;
        // Asegurar campos nuevos para usuarios viejos
        if (!sessionUser.bookedSessionIds) sessionUser.bookedSessionIds = [];
        if (!sessionUser.bookingHistory) sessionUser.bookingHistory = [];
        
        setUser(sessionUser as User);
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
        
        return { success: true };
    };

    // --- REGISTER ---
    const register = (email: string, pass: string, name: string, phone: string): AuthResponse => {
        if (!email.trim() || !pass.trim() || !name.trim()) return { success: false, message: "Todos los campos son obligatorios." };

        const db = getUsersDB();
        const existingIndex = db.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase());
        
        if (existingIndex !== -1) {
            return { success: false, message: "El usuario ya existe. Por favor, inicia sesión." };
        }

        const isAdmin = email.toLowerCase() === APP_DATABASE.admin.email.toLowerCase();

        const newUser: User = {
            name: name.trim() || "Nuevo Fotógrafo",
            email: email.trim(),
            phone: phone.trim(),
            password: pass,
            avatar: "", 
            level: isAdmin ? "DIOS" : "Bronce",
            points: isAdmin ? 999999 : 100,
            sessionsCompleted: 0,
            bookedSessionIds: [],
            bookingHistory: []
        };

        db.push(newUser);
        saveUsersDB(db);

        const { password, ...sessionUser } = newUser;
        setUser(sessionUser as User);
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));

        return { success: true };
    };

    // --- FIDELIDAD AUTOMÁTICA ---
    const incrementSessionCount = () => {
        if (!user) return;
        
        let newCount = user.sessionsCompleted + 1;
        updateUser({ sessionsCompleted: newCount });
    };

    // --- GUARDAR RESERVA ---
    const addBookedSession = (sessionId: number, type: 'standard' | 'vip' = 'standard') => {
        if (!user) return;
        if (user.bookedSessionIds?.includes(sessionId)) return;

        const newBookingsIds = [...(user.bookedSessionIds || []), sessionId];
        
        const newRecord: BookingRecord = {
            sessionId,
            type,
            date: new Date().toISOString()
        };
        const newHistory = [...(user.bookingHistory || []), newRecord];

        updateUser({ 
            bookedSessionIds: newBookingsIds,
            bookingHistory: newHistory
        });
    };

    // Helper interno para actualizar estado y localStorage/DB
    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));

        const db = getUsersDB();
        const idx = db.findIndex(u => u.email === user.email);
        if (idx !== -1) {
            db[idx] = { ...db[idx], ...updates };
            saveUsersDB(db);
        }
    };

    // Exponer la actualización de perfil para usarla en Profile.tsx
    const updateUserProfile = (data: Partial<User>) => {
        updateUser(data);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, incrementSessionCount, addBookedSession, getAllUsers, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
