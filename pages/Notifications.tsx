
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen flex flex-col pb-20">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 sticky top-0 z-40 bg-background-dark/95 ios-blur">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <span className="material-icons-round text-2xl">arrow_back_ios_new</span>
                    </button>
                    <button className="text-primary font-medium text-sm">Marcar todo como leído</button>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
            </header>

            <main className="flex-grow px-4 space-y-3 overflow-y-auto hide-scrollbar">
                {/* Today Section */}
                <div className="px-2 py-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hoy</h2>
                </div>

                <div className="p-4 bg-card-dark rounded-2xl shadow-sm border border-white/5 flex gap-4 transition-transform active:scale-[0.98]">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-round text-primary">camera_alt</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">Nueva Sesión Disponible</span>
                            <span className="text-[11px] text-slate-500">10:45</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">
                            "Gala de Verano 2025" ya está disponible para inscripción. ¡Sé el primero en postularte!
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg">Ver Detalles</button>
                            <button className="bg-white/10 text-xs font-bold px-4 py-2 rounded-lg">Ignorar</button>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                </div>

                <div className="p-4 bg-card-dark rounded-2xl shadow-sm border border-white/5 flex gap-4 transition-transform active:scale-[0.98]">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-round text-green-500">check_circle</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">Plaza Confirmada</span>
                            <span className="text-[11px] text-slate-500">Hace 2h</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">
                            Has sido seleccionado para la sesión "Retrato Urbano Madrid". Revisa tu agenda.
                        </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                </div>

                {/* Yesterday Section */}
                <div className="px-2 py-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ayer</h2>
                </div>

                <div className="p-4 bg-card-dark/60 rounded-2xl border border-white/5 flex gap-4 opacity-80">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-round text-blue-500">smart_toy</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">Asistente IA</span>
                            <span className="text-[11px] text-slate-500">Ayer</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">
                            He optimizado tu portfolio basándome en las últimas tendencias de Mad Shooting.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-card-dark/60 rounded-2xl border border-white/5 flex gap-4 opacity-80">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-round text-amber-500">celebration</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">Novedades de la Plataforma</span>
                            <span className="text-[11px] text-slate-500">Ayer</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-snug">
                            ¡Nuevo sistema de puntos de fidelidad! Ahora tus reseñas valen el doble.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Notifications;
