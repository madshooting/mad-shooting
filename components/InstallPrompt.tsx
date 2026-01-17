
import React, { useState, useEffect } from 'react';
import LogoMaddie from './LogoMaddie';

const InstallPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

    useEffect(() => {
        // 1. Chequear si ya se mostró antes
        const hasSeenPrompt = localStorage.getItem('mad_install_prompt_seen');
        if (hasSeenPrompt) return;

        // 2. Chequear si ya está instalada (Standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // 3. Detectar Plataforma
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) {
            setPlatform('ios');
            setShowPrompt(true);
        } else if (isAndroid) {
            setPlatform('android');
            setShowPrompt(true);
        }
        // No mostramos en desktop para no molestar, o podrías habilitarlo si quieres.

    }, []);

    const handleDismiss = () => {
        localStorage.setItem('mad_install_prompt_seen', 'true');
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-fade-in text-center font-sans">
            
            {/* Logo y Branding */}
            <div className="w-24 h-24 mb-6 relative">
                 <LogoMaddie className="w-full h-full shadow-[0_0_30px_rgba(255,85,0,0.5)]" showGlow={true} />
            </div>

            <h2 className="text-3xl font-oswald font-bold text-white uppercase italic tracking-wide mb-2">
                LLÉVANOS CONTIGO
            </h2>
            <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
                Instala <span className="text-[#FF5500] font-bold">Mad Shooting</span> como una app real para acceder más rápido y recibir claves.
            </p>

            {/* Instrucciones iOS */}
            {platform === 'ios' && (
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5500]"></div>
                    <div className="flex flex-col gap-4 text-left">
                        <div className="flex items-center gap-4">
                            <span className="material-icons-round text-[#007AFF] text-3xl bg-white/10 p-2 rounded-lg">ios_share</span>
                            <p className="text-xs text-slate-300">
                                1. Pulsa el icono <span className="font-bold text-white">Compartir</span> en la barra inferior de Safari.
                            </p>
                        </div>
                        <div className="w-full h-[1px] bg-white/5"></div>
                        <div className="flex items-center gap-4">
                            <span className="material-icons-round text-white text-3xl bg-white/10 p-2 rounded-lg">add_box</span>
                            <p className="text-xs text-slate-300">
                                2. Busca y selecciona <span className="font-bold text-white">"Añadir a pantalla de inicio"</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Instrucciones Android */}
            {platform === 'android' && (
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#3DDC84]"></div>
                    <div className="flex flex-col gap-4 text-left">
                        <div className="flex items-center gap-4">
                            <span className="material-icons-round text-white text-3xl bg-white/10 p-2 rounded-lg">more_vert</span>
                            <p className="text-xs text-slate-300">
                                1. Pulsa los <span className="font-bold text-white">tres puntos</span> arriba a la derecha del navegador.
                            </p>
                        </div>
                        <div className="w-full h-[1px] bg-white/5"></div>
                        <div className="flex items-center gap-4">
                            <span className="material-icons-round text-[#3DDC84] text-3xl bg-white/10 p-2 rounded-lg">install_mobile</span>
                            <p className="text-xs text-slate-300">
                                2. Selecciona la opción <span className="font-bold text-white">"Instalar aplicación"</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={handleDismiss}
                className="w-full max-w-xs bg-[#FF5500] hover:bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Entendido, ir a la App
                <span className="material-icons-round text-sm">arrow_forward</span>
            </button>
            
            <button 
                onClick={handleDismiss}
                className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
                Ahora no
            </button>
        </div>
    );
};

export default InstallPrompt;
