
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { APP_DATABASE } from '../config';
import LogoMaddie from '../components/LogoMaddie';
import { Session } from '../types';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout, updateUserProfile } = useAuth();
    const { sessions, getSessionEndTime } = useBooking();
    
    // ESTADOS PARA FORMULARIO DE PERFIL
    const [realName, setRealName] = useState('');
    const [instagram, setInstagram] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    useEffect(() => {
        if (user) {
            setRealName(user.realName || '');
            setInstagram(user.instagram || '');
        }
    }, [user]);

    // MANEJAR GUARDADO
    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación básica visual
        if (!realName.trim() || !instagram.trim()) return;

        setIsSaving(true);
        
        // Formatear Instagram con @ si no lo tiene
        let formattedIg = instagram.trim();
        if (formattedIg && !formattedIg.startsWith('@')) {
            formattedIg = '@' + formattedIg;
        }

        updateUserProfile({
            realName: realName.trim(),
            instagram: formattedIg
        });

        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 800);
    };

    // VERIFICACIÓN DE ADMIN
    const isAdmin = user?.email === APP_DATABASE.admin.email;

    // LÓGICA DE FIDELIDAD MINIMALISTA
    const historyCount = user?.sessionsCompleted || 0;
    const cycleProgress = historyCount % 10; // 0 a 9
    const remainingForFree = 9 - cycleProgress; 
    const isNextFree = cycleProgress === 9; 

    // FILTRAR SESIONES RESERVADAS Y DIVIDIR EN PASADAS / FUTURAS
    const myBookedSessions = sessions.filter(s => user?.bookedSessionIds?.includes(s.id));
    
    const now = new Date();
    const upcomingSessions = myBookedSessions.filter(s => now < getSessionEndTime(s));
    const pastSessions = myBookedSessions.filter(s => now >= getSessionEndTime(s));

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const openSupport = () => {
        const phone = APP_DATABASE.company.whatsapp;
        const msg = "Hola Soporte Mad Shooting, tengo una duda sobre mi cuenta/reserva.";
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleLocationClick = (session: Session) => {
        if (session.mapsUrl) {
             window.open(session.mapsUrl, '_blank');
        } else {
             const loc = session.ubicacion.toLowerCase();
             if (loc.includes('secreta') || loc.includes('exteriores') || loc.includes('pendiente')) {
                 alert("📍 UBICACIÓN PROTEGIDA: El punto exacto se anunciará en la marquesina naranja de la App el día del evento.");
             } else {
                 window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.ubicacion)}`, '_blank');
             }
        }
    };

    // Helper visual para campos vacíos
    const isNameEmpty = !realName.trim();
    const isIgEmpty = !instagram.trim();

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen pb-28 font-sans">
            {/* CABECERA GLOBAL */}
            <header className="sticky top-0 z-40 bg-background-dark/95 ios-blur border-b border-white/10 px-4 pt-4 pb-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative flex-shrink-0">
                         <LogoMaddie className="w-full h-full shadow-[0_0_15px_rgba(255,85,0,0.4)]" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-oswald font-bold text-[#FF5500] tracking-wide leading-none">
                            MAD SHOOTING
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                            Mi Maddie
                        </p>
                    </div>
                </div>
                
                <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-colors border border-white/10">
                    <span className="material-icons-round text-slate-400 text-lg">logout</span>
                </button>
            </header>

            <main className="max-w-md mx-auto px-6 pt-8 space-y-10">
                
                {/* 1. SECCIÓN USUARIO + EDICIÓN OBLIGATORIA */}
                <section className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold font-oswald tracking-wide text-white uppercase mb-1">{user?.name}</h2>
                    <span className="text-[10px] font-bold text-[#FF5500] uppercase tracking-widest mb-6">Nivel {user?.level}</span>

                    {/* FORMULARIO DE DATOS REALES */}
                    <form onSubmit={handleSaveProfile} className="w-full bg-[#121212] p-5 rounded-2xl border border-white/10 mb-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5500]"></div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-[#FF5500]">badge</span>
                            Identificación Obligatoria
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className={`text-[10px] font-bold uppercase block mb-1 ${isNameEmpty ? 'text-[#FF5500] animate-pulse' : 'text-slate-500'}`}>
                                    Nombre Real (DNI/Puerta) {isNameEmpty && '*'}
                                </label>
                                <input 
                                    type="text" 
                                    value={realName}
                                    onChange={(e) => setRealName(e.target.value)}
                                    placeholder="Nombre y Apellidos"
                                    className={`w-full bg-black border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${isNameEmpty ? 'border-[#FF5500] placeholder-[#FF5500]/50' : 'border-white/20 focus:border-[#FF5500]'}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`text-[10px] font-bold uppercase block mb-1 ${isIgEmpty ? 'text-[#FF5500] animate-pulse' : 'text-slate-500'}`}>
                                    Instagram (Para etiquetas) {isIgEmpty && '*'}
                                </label>
                                <input 
                                    type="text" 
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="@tu_usuario"
                                    className={`w-full bg-black border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${isIgEmpty ? 'border-[#FF5500] placeholder-[#FF5500]/50' : 'border-white/20 focus:border-[#FF5500]'}`}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving || isNameEmpty || isIgEmpty}
                                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                    saveStatus === 'success' 
                                    ? 'bg-green-600 text-white' 
                                    : (isNameEmpty || isIgEmpty) 
                                        ? 'bg-[#FF5500] text-white animate-pulse shadow-[0_0_15px_rgba(255,85,0,0.4)]'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                {saveStatus === 'success' ? '¡Guardado!' : (isSaving ? 'Guardando...' : ((isNameEmpty || isIgEmpty) ? 'RELLENA LOS CAMPOS PARA GUARDAR' : 'Guardar Cambios'))}
                            </button>
                        </div>
                    </form>

                    {/* Fila de 10 Puntos de Fidelidad */}
                    <div className="flex items-center gap-3 mb-4">
                        {[...Array(9)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                                    i < cycleProgress 
                                        ? 'bg-[#FF5500] shadow-[0_0_8px_#FF5500]' 
                                        : 'bg-[#2A2A2A]'
                                }`}
                            />
                        ))}
                        
                        {/* El Décimo Punto (El Premio) */}
                        <div className={`relative flex items-center justify-center transition-all duration-700 ${isNextFree ? 'scale-125' : 'opacity-40 grayscale'}`}>
                            <span className={`material-icons-round text-lg ${isNextFree ? 'text-[#FF5500] animate-pulse drop-shadow-[0_0_10px_rgba(255,85,0,0.8)]' : 'text-slate-600'}`}>
                                camera_alt
                            </span>
                        </div>
                    </div>

                    <p className="text-[10px] font-medium tracking-widest text-white/80 uppercase text-center">
                        {isNextFree 
                            ? "¡Tu próxima sesión es GRATIS!" 
                            : `${remainingForFree} disparos para tu próxima sesión libre`
                        }
                    </p>
                </section>

                {/* BOTONES COMUNIDAD */}
                <section className="grid grid-cols-2 gap-3 animate-fade-in-up">
                    <button 
                        onClick={() => navigate('/contests')}
                        className="bg-[#181818] rounded-2xl p-4 shadow-lg border border-white/5 group hover:bg-[#202020] transition-colors relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-round text-4xl text-[#FF5500]">emoji_events</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <span className="material-icons-round text-[#FF5500] text-xl mb-1">emoji_events</span>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Concursos</h3>
                            <p className="text-[9px] text-slate-500 leading-tight">Vota la mejor foto</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/proposals')}
                        className="bg-[#181818] rounded-2xl p-4 shadow-lg border border-white/5 group hover:bg-[#202020] transition-colors relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons-round text-4xl text-[#FF5500]">lightbulb</span>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <span className="material-icons-round text-[#FF5500] text-xl mb-1">lightbulb</span>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Propuestas</h3>
                            <p className="text-[9px] text-slate-500 leading-tight">Decide la temática</p>
                        </div>
                    </button>
                </section>

                {/* 2. PRÓXIMAS SESIONES (TICKETS ACTIVOS) */}
                <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-4 px-1 border-b border-white/10 pb-2">
                        <span className="material-icons-round text-[#FF5500] text-sm">confirmation_number</span>
                        <h3 className="text-sm font-oswald font-bold text-white uppercase tracking-wider">
                            Próximos Eventos ({upcomingSessions.length})
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {upcomingSessions.length === 0 ? (
                            <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <span className="material-icons-round text-slate-600 text-3xl mb-2">event_available</span>
                                <p className="text-xs text-slate-500">No tienes sesiones pendientes.</p>
                                <button onClick={() => navigate('/sessions')} className="mt-4 text-[#FF5500] text-xs font-bold uppercase tracking-widest hover:underline">
                                    Ver Agenda
                                </button>
                            </div>
                        ) : (
                            upcomingSessions.map(session => (
                                <div key={session.id} className="bg-[#181818] p-4 rounded-2xl border border-white/5 flex flex-col gap-4 relative overflow-hidden group">
                                    <div className="w-1 bg-[#FF5500] absolute left-0 top-0 bottom-0"></div>
                                    
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-white/10">
                                            <img src={session.imagen} alt="thumb" className="w-full h-full object-cover opacity-80" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-white uppercase truncate tracking-wide">{session.tema}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                                                <span className="flex items-center gap-1"><span className="material-icons-round text-[10px] text-[#FF5500]">calendar_today</span> {session.fecha}</span>
                                                <span className="flex items-center gap-1"><span className="material-icons-round text-[10px] text-[#FF5500]">schedule</span> {session.hora}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                             <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border border-green-500/20 flex items-center gap-1">
                                                <span className="material-icons-round text-[10px]">check_circle</span>
                                                TICKET
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-white/5">
                                        <button 
                                            onClick={() => handleLocationClick(session)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <span className="material-icons-round text-sm text-[#FF5500]">map</span>
                                            Ubicación
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 3. HISTORIAL (SESIONES PASADAS) */}
                {pastSessions.length > 0 && (
                    <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-2 mb-4 px-1 border-b border-white/10 pb-2 mt-8">
                            <span className="material-icons-round text-slate-500 text-sm">history</span>
                            <h3 className="text-sm font-oswald font-bold text-slate-500 uppercase tracking-wider">
                                Historial ({pastSessions.length})
                            </h3>
                        </div>

                        <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
                            {pastSessions.map(session => (
                                <div key={session.id} className="bg-[#121212] p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-black overflow-hidden flex-shrink-0 grayscale">
                                        <img src={session.imagen} alt="thumb" className="w-full h-full object-cover opacity-60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase truncate tracking-wide line-through decoration-slate-600">{session.tema}</h4>
                                        <p className="text-[10px] text-slate-600 mt-0.5 font-bold">FINALIZADA</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/contests')}
                                        className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-white/5"
                                    >
                                        Subir Fotos
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. BOTÓN DE SOPORTE */}
                <section className="animate-fade-in-up mt-8" style={{ animationDelay: '0.3s' }}>
                    <button 
                        onClick={openSupport}
                        className="w-full bg-[#25D366] hover:bg-[#20b858] text-white p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
                    >
                        <span className="material-icons-round">whatsapp</span>
                        <span className="font-bold text-xs uppercase tracking-widest">Contactar Soporte</span>
                    </button>
                </section>

                {/* BOTÓN ADMIN */}
                {isAdmin && (
                    <section className="pb-4">
                        <button 
                            onClick={() => navigate('/admin')}
                            className="w-full bg-slate-800 text-slate-300 p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-icons-round text-sm">vpn_key</span>
                            Administración
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Profile;
