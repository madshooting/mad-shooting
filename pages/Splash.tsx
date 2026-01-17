
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoMaddie from '../components/LogoMaddie';

const Splash: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 3500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="h-screen bg-background-dark text-white overflow-hidden flex flex-col items-center justify-between font-sans relative">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
                {/* Clean black background as requested */}
            </div>

            {/* Top Text */}
            <div className="z-10 mt-16 text-center opacity-0 animate-fade-in">
                <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-2 block font-oswald">CLUB DE FOTOGRAFÍA</span>
                <div className="h-[1px] w-8 bg-primary mx-auto"></div>
            </div>

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center justify-center flex-1 px-8">
                <div className="relative animate-subtle-zoom">
                    {/* Maddie Full Image */}
                    <div className="w-64 h-64 relative z-10">
                         <LogoMaddie className="w-full h-full" />
                    </div>
                </div>
                <div className="mt-10 text-center space-y-2 opacity-0 animate-fade-in-up">
                    <h1 className="text-5xl font-oswald font-bold tracking-tighter text-[#FF5500] uppercase drop-shadow-[0_0_15px_rgba(255,85,0,0.6)]">
                        MAD SHOOTING
                    </h1>
                    <p className="text-white font-medium tracking-wide text-xs uppercase font-sans mt-2">
                        FOTOGRAFÍA & ESTILO DE VIDA
                    </p>
                </div>
            </div>

            {/* Bottom Content / Loader */}
            <div className="z-10 w-full max-w-[280px] mb-20 space-y-8 opacity-0 animate-fade-in delay-1000">
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                        <span className="material-icons-round text-primary text-sm">stars</span>
                        <span className="text-[11px] font-bold tracking-widest text-slate-200 uppercase">MIEMBROS EXCLUSIVOS</span>
                    </div>
                    <p className="text-xs text-slate-500 font-light text-center">
                        Cargando experiencia...
                    </p>
                </div>
                <div className="relative h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_#FF0000] w-full animate-[progress_3s_ease-in-out_forwards]"></div>
                </div>
                <div className="text-center">
                    <span className="text-sm font-medium text-slate-600">@mad_shooting</span>
                </div>
            </div>
        </div>
    );
};

export default Splash;
