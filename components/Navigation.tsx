
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoMaddie from './LogoMaddie';
import { useAuth } from '../context/AuthContext';
import { APP_DATABASE } from '../config';

const Navigation: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [hasUnread, setHasUnread] = useState(false);
    
    // Hide nav on splash screen
    if (location.pathname === '/') return null;

    // Verificar notificaciones de chat (Simulación de tiempo real)
    useEffect(() => {
        if (!user) return;

        const checkUnread = () => {
            const unread = localStorage.getItem(`mad_chat_unread_${user.email}`);
            setHasUnread(unread === 'true');
        };

        // Chequeo inicial
        checkUnread();

        // Intervalo para simular "push notifications" mientras navegas
        const interval = setInterval(checkUnread, 2000);
        return () => clearInterval(interval);
    }, [user, location.pathname]); // Re-check al cambiar de página

    const isActive = (path: string) => {
        return location.pathname === path 
            ? "text-primary dark:text-primary scale-110" 
            : "text-slate-400 dark:text-slate-500 hover:text-white";
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <nav className="w-full max-w-md bg-background-light/95 dark:bg-[#000000]/95 ios-blur border-t border-slate-200 dark:border-white/10 px-8 py-4 pb-8 flex justify-between items-center shadow-2xl">
                
                {/* 1. HOME / AGENDA */}
                <Link to="/dashboard" className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive('/dashboard')}`}>
                    <span className="material-icons-round text-[28px]">calendar_month</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Agenda</span>
                </Link>
                
                {/* 2. CHAT (CENTRAL) */}
                <div className="relative -top-6 group">
                    <Link to="/chat" className="bg-black w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,85,0,0.4)] border-4 border-background-light dark:border-background-dark active:scale-95 transition-all overflow-hidden relative z-10">
                        <LogoMaddie className="w-full h-full p-0.5" />
                    </Link>
                    
                    {/* NOTIFICATION DOT */}
                    {hasUnread && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-[#FF5500] rounded-full border-2 border-black z-20 flex items-center justify-center animate-bounce">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                        </div>
                    )}

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* 3. MI MADDIE (PERFIL + FIDELIDAD) */}
                <Link to="/profile" className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive('/profile')}`}>
                    <span className="material-icons-round text-[28px]">stars</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Mi Maddie</span>
                </Link>

            </nav>
        </div>
    );
};

export default Navigation;
