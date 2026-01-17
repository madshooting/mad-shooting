import React from 'react';
import { APP_DATABASE } from '../config';
import { useAuth } from '../context/AuthContext';
import LogoMaddie from '../components/LogoMaddie';

const Loyalty: React.FC = () => {
    const { user } = useAuth();
    const historyCount = user?.sessionsCompleted || 0;
    const target = APP_DATABASE.precios.objetivoFidelidad; 

    // Progreso actual en el ciclo de 10
    const currentProgress = historyCount % target;
    const isCompleted = currentProgress === (target - 1); // Si llevamos 9 de 10 (la 10 es gratis)

    // Generar array de slots
    const slots = Array.from({ length: target - 1 }, (_, i) => i + 1);

    return (
        <div className="bg-background-light text-slate-900 min-h-screen pb-24 font-sans">
            <header className="px-6 pt-12 py-4 flex justify-between items-center sticky top-0 bg-background-light/90 ios-blur z-50">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Premium Club</span>
                    <h1 className="text-xl font-oswald tracking-tight leading-none text-primary font-bold">MAD SHOOTING</h1>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary bg-black shadow-[0_0_10px_rgba(255,85,0,0.5)]">
                     <LogoMaddie className="w-full h-full" />
                </div>
            </header>

            <main className="px-6">
                <div className="flex justify-center my-8">
                    <div className="relative w-32 h-32">
                        <LogoMaddie className="w-full h-full" showGlow={true} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-black/5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Estado actual</p>
                                <h2 className="text-3xl font-display text-primary italic">Llevas {currentProgress} de {target - 1}</h2>
                            </div>
                            {isCompleted && (
                                <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter border border-amber-200 animate-pulse">
                                    ¡Completo!
                                </div>
                            )}
                        </div>
                        
                        <div className="w-full h-3 bg-slate-100 rounded-full mb-8 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: `${(currentProgress / (target - 1)) * 100}%`}}></div>
                        </div>

                        <div className="grid grid-cols-5 gap-3 mb-8">
                            {slots.map(i => {
                                const checked = i <= currentProgress;
                                return (
                                    <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${checked ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,82,0,0.4)]' : 'bg-slate-100 text-slate-300'}`}>
                                        <span className="material-icons-round text-xl">{checked ? 'check_circle' : 'circle'}</span>
                                    </div>
                                );
                            })}
                            
                            {/* Casilla de Regalo (la 10ª) */}
                            <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-white shadow-lg border-4 transition-all ${isCompleted ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-200 animate-pulse scale-110' : 'bg-slate-300 border-slate-200 grayscale'}`}>
                                <span className="material-icons-round text-lg">card_giftcard</span>
                                <span className="text-[10px] font-black uppercase leading-none mt-1">Gratis</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {isCompleted ? (
                                <p className="text-xs text-primary leading-relaxed text-center font-bold">
                                    ¡Objetivo Alcanzado! Tu próxima sesión es GRATIS. Ve a la Agenda para canjearla.
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 leading-relaxed text-center">
                                    Completa {target - 1} sesiones y nosotros te invitamos a la siguiente. ¡Es nuestra forma de decir gracias!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="bg-indigo-600 rounded-3xl p-5 flex items-center gap-4 text-white shadow-lg shadow-indigo-500/20">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-2xl">auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Asistente IA Mad Shooting</h3>
                            <p className="text-xs text-indigo-100 opacity-90">
                                {isCompleted ? "¡Guau! Tienes una sesión gratis. ¿Te ayudo a elegir?" : "¿Sabías que cada 10 sesiones tienes una gratis?"}
                            </p>
                        </div>
                        <span className="material-icons-round ml-auto opacity-60">chevron_right</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Loyalty;