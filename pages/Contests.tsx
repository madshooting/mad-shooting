
import React, { useState, useRef, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import LogoMaddie from '../components/LogoMaddie';
import { ContestEntry } from '../types';
import { useNavigate } from 'react-router-dom';

const Contests: React.FC = () => {
    const navigate = useNavigate();
    const { contests, voteEntry, uploadContestEntry, sessions } = useBooking();
    const { user } = useAuth();
    const [activeContestId, setActiveContestId] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- LÓGICA DE PRIVACIDAD ---
    // Filtramos los concursos disponibles basándonos en el historial de reservas del usuario.
    // Solo puede ver concursos asociados a sesiones que tenga en su lista de 'bookedSessionIds'.
    const myContests = contests.filter(c => user?.bookedSessionIds?.includes(c.sessionId));

    // Seleccionar por defecto el primer concurso accesible si existe
    useEffect(() => {
        if (myContests.length > 0) {
            // Si no hay seleccionado, o el seleccionado ya no es accesible (cambio de usuario/estado)
            const isCurrentValid = myContests.find(c => c.id === activeContestId);
            if (!isCurrentValid) {
                setActiveContestId(myContests[0].id);
            }
        }
    }, [myContests, activeContestId]);

    const currentContest = myContests.find(c => c.id === activeContestId);
    
    // Sort entries by votes to determine ranking
    const sortedEntries = currentContest ? [...currentContest.entries].sort((a, b) => b.votes - a.votes) : [];
    const leaderId = sortedEntries.length > 0 ? sortedEntries[0].id : null;

    const handleVote = (entryId: string) => {
        voteEntry(activeContestId, entryId);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);

        // Simulate upload delay and compression
        setTimeout(() => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newEntry: ContestEntry = {
                    id: Date.now().toString(),
                    photographer: user.name || "Anon",
                    votes: 0,
                    imageUrl: e.target?.result as string,
                    isUserEntry: true
                };

                const success = uploadContestEntry(activeContestId, newEntry);
                if (!success) {
                    alert("Ya has subido una foto a este concurso.");
                }
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }, 1500);
    };

    // Determinar la próxima sesión para el mensaje "Empty State"
    const nextSession = sessions.length > 0 ? sessions[0] : null;

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen pb-28 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/95 ios-blur border-b border-white/10 px-4 pt-4 pb-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative flex-shrink-0">
                         <LogoMaddie className="w-full h-full shadow-[0_0_15px_rgba(255,85,0,0.4)]" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-oswald font-bold text-[#FF5500] tracking-wide leading-none">
                            MAD AWARDS
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                            Galería Privada
                        </p>
                    </div>
                </div>
            </header>

            {contests.length > 0 ? (
                <>
                    {/* CASO 1: TIENE ACCESO (Ha reservado la sesión) */}
                    {myContests.length > 0 ? (
                        <>
                            {/* Contest Selector (Tabs) */}
                            <div className="px-4 py-6 overflow-x-auto hide-scrollbar flex gap-3">
                                {myContests.map(c => (
                                    <button 
                                        key={c.id}
                                        onClick={() => setActiveContestId(c.id)}
                                        className={`whitespace-nowrap px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                                            activeContestId === c.id 
                                            ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]' 
                                            : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {c.title}
                                    </button>
                                ))}
                            </div>

                            <main className="px-4">
                                {currentContest && (
                                    <>
                                        <div className="mb-6 flex justify-between items-end">
                                            <h2 className="text-xl font-oswald text-white uppercase tracking-wide">
                                                Galería <span className="text-[#FF5500]">{sortedEntries.length}</span> Fotos
                                            </h2>
                                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 uppercase font-bold flex items-center gap-1">
                                                <span className="material-icons-round text-xs text-green-500">lock_open</span>
                                                Acceso VIP
                                            </span>
                                        </div>

                                        {sortedEntries.length === 0 ? (
                                            <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                                                <p className="text-sm text-slate-500 mb-2">Aún no hay fotos.</p>
                                                <p className="text-xs text-[#FF5500]">¡Sube la primera!</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                {sortedEntries.map((entry, index) => {
                                                    const isLeader = entry.id === leaderId;
                                                    
                                                    return (
                                                        <div key={entry.id} className={`relative group rounded-2xl overflow-hidden bg-card-dark border ${isLeader ? 'border-[#FF5500] ring-1 ring-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.2)]' : 'border-white/10'}`}>
                                                            
                                                            {/* Image */}
                                                            <div className="aspect-[4/5] overflow-hidden">
                                                                <img src={entry.imageUrl} alt="entry" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80"></div>
                                                            </div>

                                                            {/* Leader Badge */}
                                                            {isLeader && (
                                                                <div className="absolute top-2 left-2 bg-[#FF5500] text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg flex items-center gap-1 z-10 animate-pulse">
                                                                    <span className="material-icons-round text-xs">emoji_events</span>
                                                                    Candidata
                                                                </div>
                                                            )}

                                                            {/* Info Overlay */}
                                                            <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                                                                <div className="flex justify-between items-end">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider truncate max-w-[80px]">
                                                                            {entry.photographer}
                                                                        </span>
                                                                        <span className="text-xs font-black text-white">
                                                                            {entry.votes} Votos
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <button 
                                                                        onClick={() => handleVote(entry.id)}
                                                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF5500] flex items-center justify-center backdrop-blur-md transition-colors active:scale-90"
                                                                    >
                                                                        <span className="material-icons-round text-sm text-white">favorite</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </main>

                            {/* Floating Upload Button - Solo visible si tienes acceso */}
                            <div className="fixed bottom-24 right-6 z-40">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <button 
                                    onClick={handleUploadClick}
                                    disabled={isUploading}
                                    className="h-14 bg-[#FF5500] text-white rounded-full shadow-[0_0_20px_rgba(255,85,0,0.5)] px-6 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all border-2 border-white/10"
                                >
                                    {isUploading ? (
                                        <span className="material-icons-round animate-spin">autorenew</span>
                                    ) : (
                                        <>
                                            <span className="material-icons-round">add_a_photo</span>
                                            <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Subir Foto</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        /* CASO 2: HAY CONCURSOS PERO EL USUARIO NO TIENE ACCESO (NO RESERVÓ) */
                        <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center animate-fade-in-up">
                            <div className="w-24 h-24 rounded-full bg-[#FF5500]/5 border border-[#FF5500]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,85,0,0.1)]">
                                <span className="material-icons-round text-4xl text-[#FF5500]">lock</span>
                            </div>
                            <h2 className="text-2xl font-oswald font-bold text-white uppercase tracking-wide mb-3">
                                Galería Restringida
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-8">
                                Las fotos de los concursos y votaciones son exclusivas para los asistentes de la sesión.
                                <br/><br/>
                                <span className="text-slate-500 italic">Si participaste, asegúrate de que tu reserva aparece en tu perfil.</span>
                            </p>
                            <button 
                                onClick={() => navigate('/sessions')}
                                className="bg-[#FF5500] hover:bg-orange-600 text-white font-black py-4 px-8 rounded-xl uppercase tracking-widest text-xs shadow-lg transition-all"
                            >
                                Ver Próximas Sesiones
                            </button>
                        </div>
                    )}
                </>
            ) : (
                /* CASO 3: NO HAY CONCURSOS ACTIVOS EN EL SISTEMA */
                <main className="flex flex-col items-center justify-center h-[60vh] px-8 text-center animate-fade-in-up">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <span className="material-icons-round text-4xl text-slate-600">timer</span>
                    </div>
                    <h2 className="text-2xl font-oswald font-bold text-white uppercase tracking-wide mb-3">
                        Próximamente
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                        {nextSession 
                            ? `Aquí podrás subir tus fotos tras la sesión de "${nextSession.tema}" del ${nextSession.fecha}.` 
                            : 'No hay sesiones programadas próximas para activar concursos.'}
                    </p>
                    <div className="mt-8 px-4 py-2 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-lg text-[#FF5500] text-xs font-bold uppercase tracking-widest">
                        Zona de Votación inactiva
                    </div>
                </main>
            )}
        </div>
    );
};

export default Contests;
