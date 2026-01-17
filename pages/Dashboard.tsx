
import React, { useState, useEffect } from 'react';
import { APP_DATABASE } from '../config';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import LogoMaddie from '../components/LogoMaddie';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, incrementSessionCount, addBookedSession } = useAuth();
    const { sessions, bookSessionSlot, isNextSessionFree, consumeCode, urgentMessage, getSessionEndTime } = useBooking();
    const navigate = useNavigate();
    
    // Calcular si la próxima es gratis para este usuario
    const isFreeLoyalty = user ? isNextSessionFree(user.sessionsCompleted) : false;

    // --- LIMPIEZA DE AGENDA ---
    // Filtramos las sesiones que NO han terminado todavía (Ahora < Fin + 3h)
    const now = new Date();
    const activeSessions = sessions.filter(session => {
        const endTime = getSessionEndTime(session);
        return now < endTime; 
    });

    // --- LÓGICA DE AVISO URGENTE ---
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (urgentMessage) {
            setShowBanner(true);
        } else {
            setShowBanner(false);
        }
    }, [urgentMessage]);

    // --- LÓGICA DE RESERVA ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [inputCode, setInputCode] = useState('');
    const [feedback, setFeedback] = useState<{type: 'error' | 'success' | 'vip', msg: string} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // ESTADO DE BLOQUEO DE MADDIE (Datos faltantes)
    const [maddieBlock, setMaddieBlock] = useState(false);

    // MOODBOARD STATE
    const [activeMoodboard, setActiveMoodboard] = useState<{images: string[], title: string} | null>(null);
    
    const [modalMode, setModalMode] = useState<'code' | 'pay'>('pay'); // Default to Pay

    const openBookingModal = (sessionId: number, initialMode: 'code' | 'pay' = 'pay') => {
        // VALIDACIÓN DE MADDIE: ¿Tiene Nombre Real e Instagram?
        if (user && (!user.realName || !user.realName.trim() || !user.instagram || !user.instagram.trim())) {
            setMaddieBlock(true);
            return;
        }

        setSelectedSessionId(sessionId);
        setFeedback(null);
        setInputCode('');
        setModalMode(initialMode); 
        setIsModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsModalOpen(false);
        setSelectedSessionId(null);
    };

    const currentSession = sessions.find(s => s.id === selectedSessionId);

    // PAGO CONFIRMADO (Simulación)
    const handlePaymentConfirmation = () => {
        if (!currentSession || !user) return;
        setIsProcessing(true);
        setTimeout(() => {
            const success = bookSessionSlot(currentSession.id);
            if (success) {
                incrementSessionCount();
                // Determinar tipo de pago
                const type = isFreeLoyalty ? 'vip' : 'standard';
                addBookedSession(currentSession.id, type); 
                
                setFeedback({ 
                    type: 'success', 
                    msg: isFreeLoyalty ? '¡CANJEADO! Disfruta tu sesión GRATIS.' : '¡PAGO CONFIRMADO! Plaza asegurada.' 
                });
                setTimeout(() => closeBookingModal(), 2000);
            } else {
                setFeedback({ type: 'error', msg: '¡Vaya! Se han agotado las plazas.' });
            }
            setIsProcessing(false);
        }, 1500);
    };

    // CÓDIGO (CLAVE MAESTRA)
    const validateAndBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSessionId) return;
        setIsProcessing(true);
        setFeedback(null);
        setTimeout(() => {
            const result = consumeCode(inputCode);
            if (!result.success) {
                setFeedback({ type: 'error', msg: 'Clave incorrecta.' });
                setIsProcessing(false);
                return;
            }
            if (user?.bookedSessionIds?.includes(selectedSessionId)) {
                setFeedback({ type: 'error', msg: 'Ya tienes plaza confirmada.' });
                setIsProcessing(false);
                return;
            }
            const success = bookSessionSlot(selectedSessionId);
            if(success) {
                const bookingType = result.type || 'standard';
                addBookedSession(selectedSessionId, bookingType); 
                incrementSessionCount();
                setFeedback({ type: 'success', msg: '¡Clave Aceptada! Plaza asegurada.' });
                setTimeout(() => closeBookingModal(), 2000);
            } else {
                setFeedback({ type: 'error', msg: 'Clave válida pero AFORO COMPLETO.' });
            }
            setIsProcessing(false);
        }, 800);
    };

    const getPayPalLink = (session = currentSession) => {
        if (!session) return '#';
        const price = isFreeLoyalty ? 0 : session.precio;
        if (price === 0) return '#';
        const concept = `Reserva ${session.tema} (${session.fecha}) - ${user?.email || 'Invitado'}`;
        return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jfelixbart@yahoo.es&currency_code=EUR&amount=${price}&item_name=${encodeURIComponent(concept)}`;
    };

    const openWhatsApp = (session: typeof sessions[0]) => {
        const phone = APP_DATABASE.company.whatsapp; 
        const message = `Hola Mad! Tengo una duda sobre la sesión del ${session?.fecha}: "${session?.tema}".`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // NUEVO: ABRIR MAPA (Con fallback a búsqueda si no hay URL exacta)
    const handleOpenLocation = (session: typeof sessions[0]) => {
        if (session.mapsUrl) {
            window.open(session.mapsUrl, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.ubicacion)}`, '_blank');
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen pb-24 font-sans">
            {/* CABECERA GLOBAL ESTANDARIZADA */}
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
                            Agenda Oficial
                        </p>
                    </div>
                </div>

                {user?.email === APP_DATABASE.admin.email && (
                    <button onClick={() => navigate('/admin')} className="bg-white/5 p-2 rounded-full hover:bg-white/20 transition-colors border border-white/10">
                        <span className="material-icons-round text-slate-300 text-sm">admin_panel_settings</span>
                    </button>
                )}
            </header>

            {/* MARQUESINA */}
            {urgentMessage && showBanner && (
                <div className="bg-[#FF5500] text-white px-4 py-3 relative flex items-start gap-3 shadow-lg z-30 animate-fade-in border-b border-orange-700/30">
                    <span className="material-icons-round text-lg mt-0.5 animate-pulse">warning</span>
                    <p className="text-xs font-bold uppercase tracking-wide flex-1 leading-relaxed">
                        {urgentMessage}
                    </p>
                    <button 
                        onClick={() => setShowBanner(false)}
                        className="opacity-70 hover:opacity-100 transition-opacity p-1"
                    >
                        <span className="material-icons-round text-sm">close</span>
                    </button>
                </div>
            )}

            <main className="p-4 mt-2">
                
                {/* BLOQUE CENTRAL DE MARCA - TAMAÑO REDUCIDO */}
                <div className="flex flex-col items-center justify-center mb-4 animate-fade-in">
                    <div className="w-14 h-14 mb-2 relative transition-transform duration-700 hover:scale-105">
                         <LogoMaddie className="w-full h-full shadow-[0_0_20px_rgba(255,85,0,0.2)]" />
                    </div>
                    <h2 className="text-[10px] font-oswald font-bold text-[#FF5500] tracking-widest uppercase leading-none">
                        MAD SHOOTING
                    </h2>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
                        Season 2025
                    </p>
                </div>

                {/* LISTA DE SESIONES ACTIVAS (AGENDA LIMPIA) */}
                <div className="space-y-6">
                    {activeSessions.length === 0 ? (
                         <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <span className="material-icons-round text-slate-600 text-4xl mb-3">calendar_today</span>
                            <h3 className="text-white font-oswald font-bold uppercase tracking-wide">Agenda Vacía</h3>
                            <p className="text-xs text-slate-500 mt-2">Estamos cocinando las próximas locuras. Vuelve pronto.</p>
                        </div>
                    ) : (
                        activeSessions.map(session => {
                            const plazasLibres = session.plazas - session.ocupadas;
                            const isSoldOut = plazasLibres === 0;
                            const isUrgent = plazasLibres > 0 && plazasLibres <= 3;
                            const isBooked = user?.bookedSessionIds?.includes(session.id); 
                            const isSpecial = session.tag === 'EXCLUSIVO' || session.tag === 'DOMINGO' || session.tag === 'SÁBADO';
                            const finalPrice = isFreeLoyalty ? 0 : session.precio;

                            // Fallback para moodboard si es una sesión creada manualmente con solo una imagen
                            const moodboardImages = session.moodboard && session.moodboard.length > 0 ? session.moodboard : [session.imagen];

                            return (
                                <div key={session.id} className={`bg-[#121212] rounded-3xl overflow-hidden border border-[#FF5500]/30 shadow-2xl relative group flex flex-col ${isSpecial ? 'ring-2 ring-[#FF5500]/20' : ''}`}>
                                    
                                    {/* ALERTA DE URGENCIA */}
                                    {isUrgent && !isBooked && (
                                        <div className="absolute top-0 left-0 right-0 z-20 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1 animate-pulse shadow-lg">
                                            🔥 ¡Últimas {plazasLibres} Plazas!
                                        </div>
                                    )}

                                    {/* Imagen */}
                                    <div className="h-44 relative overflow-hidden">
                                        <img 
                                            src={session.imagen} 
                                            alt={session.tema} 
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-50' : ''}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                                        
                                        <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg ${isFreeLoyalty ? 'bg-amber-400 text-black animate-bounce' : 'bg-black/60 border border-[#FF5500]/50 text-[#FF5500]'}`}>
                                            {isFreeLoyalty ? '¡GRATIS!' : `${finalPrice}€`}
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-[10px] font-black bg-[#FF5500] text-white px-2 py-0.5 rounded uppercase tracking-wider inline-block shadow-lg shadow-orange-900/50">
                                                    {session.tag}
                                                </span>
                                                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10 uppercase">
                                                    {session.fecha}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-oswald font-bold text-white leading-none drop-shadow-xl uppercase italic tracking-wide">
                                                {session.tema}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <p className="text-sm text-slate-300 mb-4 leading-relaxed font-medium line-clamp-2">
                                            {session.description}
                                        </p>
                                        
                                        {/* BOTÓN MOODBOARD (Siempre disponible si hay imagen) */}
                                        <button 
                                            onClick={() => setActiveMoodboard({ images: moodboardImages, title: session.tema })}
                                            className="mb-5 flex items-center gap-2 text-xs font-bold text-[#FF5500] hover:text-white transition-colors bg-[#FF5500]/10 hover:bg-[#FF5500]/20 px-3 py-2 rounded-lg w-fit border border-[#FF5500]/30"
                                        >
                                            <span className="material-icons-round text-sm">palette</span>
                                            Ver Estilo / Moodboard
                                        </button>

                                        <div className="mt-auto">
                                            
                                            {/* INFO UBICACIÓN Y HORA (CON LÓGICA DE MAPA) */}
                                            <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-bold border-t border-white/5 pt-3">
                                                
                                                {/* UBICACIÓN */}
                                                <div className="flex flex-col">
                                                     <div className="flex items-center gap-1 text-slate-300 uppercase tracking-wider mb-1">
                                                        <span className="material-icons-round text-sm text-[#FF5500]">place</span>
                                                        <span>{session.ubicacion}</span>
                                                    </div>

                                                    {isBooked ? (
                                                        <button 
                                                            onClick={() => handleOpenLocation(session)}
                                                            className="text-[10px] text-[#FF5500] hover:text-white font-black uppercase tracking-wide flex items-center gap-1 transition-colors self-start bg-[#FF5500]/10 px-2 py-1 rounded border border-[#FF5500]/30"
                                                        >
                                                            Cómo llegar
                                                            <span className="material-icons-round text-xs">near_me</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                            📍 Ubicación exacta disponible tras confirmar reserva
                                                        </span>
                                                    )}
                                                </div>

                                                {/* HORA */}
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1 text-slate-300 uppercase tracking-wider mb-1">
                                                        <span>{session.hora}</span>
                                                        <span className="material-icons-round text-sm text-[#FF5500]">schedule</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Barra de Plazas */}
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mb-2 overflow-hidden">
                                                <div className="h-full bg-[#FF5500]" style={{ width: `${(session.ocupadas / session.plazas) * 100}%` }}></div>
                                            </div>
                                            <div className="flex justify-end text-[10px] uppercase font-bold mb-5">
                                                <span className={plazasLibres < 3 ? 'text-red-500 font-black' : 'text-[#FF5500]'}>
                                                    {isSoldOut ? 'SOLD OUT' : `${plazasLibres} de ${session.plazas} plazas disponibles`}
                                                </span>
                                            </div>

                                            {/* BOTONES */}
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => openBookingModal(session.id, 'pay')}
                                                    disabled={isSoldOut || isBooked}
                                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transform duration-150
                                                        ${isSoldOut 
                                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                                                            : isBooked 
                                                                ? 'bg-green-600 text-white cursor-default shadow-green-900/40'
                                                                : isFreeLoyalty 
                                                                    ? 'bg-amber-400 hover:bg-amber-500 text-black shadow-amber-400/30 animate-pulse'
                                                                    : 'bg-[#FF5500] hover:bg-orange-600 text-white shadow-[#FF5500]/30 border border-orange-400/50'
                                                        }`}
                                                >
                                                    {isSoldOut 
                                                        ? '🚫 AGOTADO' 
                                                        : isBooked 
                                                            ? '✅ Plaza Reservada' 
                                                            : isFreeLoyalty
                                                                ? <>RESERVAR (0€) <span className="material-icons-round text-sm">stars</span></>
                                                                : <>Reservar {finalPrice}€ <span className="material-icons-round text-sm">payments</span></>
                                                    }
                                                </button>
                                                
                                                {!isSoldOut && (
                                                    <button 
                                                        onClick={() => openWhatsApp(session)}
                                                        className="w-full py-3 rounded-xl border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors active:scale-95"
                                                    >
                                                        <span>Dudas Rápidas</span>
                                                        <span className="material-icons-round text-sm">whatsapp</span>
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* MODAL MOODBOARD */}
            {activeMoodboard && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setActiveMoodboard(null)}></div>
                    <div className="bg-[#121212] border border-[#FF5500]/30 w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-fade-in-up">
                        <button onClick={() => setActiveMoodboard(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-slate-400 hover:text-white hover:bg-white/20">
                            <span className="material-icons-round text-sm">close</span>
                        </button>
                        
                        <h3 className="text-lg font-oswald font-bold text-white uppercase tracking-wide mb-1 pr-8 truncate">
                            {activeMoodboard.title}
                        </h3>
                        <p className="text-[10px] text-[#FF5500] uppercase tracking-widest font-bold mb-4">Moodboard & Referencias</p>

                        <div className="grid grid-cols-2 gap-3">
                            {activeMoodboard.images.map((src, index) => (
                                <div key={index} className="aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg relative group">
                                    <img src={src} alt={`Ref ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE BLOQUEO DE MADDIE (DATOS FALTANTES) */}
            {maddieBlock && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm animate-fade-in"></div>
                    <div className="bg-[#121212] border-2 border-[#FF5500] w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl shadow-orange-900/40 animate-fade-in-up text-center">
                        <div className="w-20 h-20 mx-auto mb-4 relative">
                             <LogoMaddie className="w-full h-full" showGlow={true} />
                        </div>
                        <h3 className="text-2xl font-oswald font-bold text-white uppercase italic tracking-wide mb-2">¡Frena, artista! 🛑</h3>
                        <p className="text-sm text-slate-300 leading-relaxed mb-6 font-medium">
                            "Rellena tu perfil en <span className="text-[#FF5500] font-bold">'Mi Maddie'</span> primero para que podamos etiquetarte. Solo te llevará 10 segundos."
                        </p>
                        <button 
                            onClick={() => { setMaddieBlock(false); navigate('/profile'); }}
                            className="w-full bg-[#FF5500] hover:bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            Ir a Mi Maddie
                            <span className="material-icons-round text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE RESERVA */}
            {isModalOpen && currentSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={closeBookingModal}></div>
                    <div className="bg-[#121212] border border-[#FF5500]/30 w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl shadow-orange-900/20 animate-fade-in-up flex flex-col min-h-[480px]">
                        <button onClick={closeBookingModal} className="absolute top-4 right-4 text-slate-400 hover:text-white z-20">
                            <span className="material-icons-round">close</span>
                        </button>

                        <div className="flex border-b border-white/10 mb-6 relative">
                            <button onClick={() => setModalMode('pay')} className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${modalMode === 'pay' ? 'text-[#FF5500] border-b-2 border-[#FF5500]' : 'text-slate-500 hover:text-white'}`}>Confirmar Pago</button>
                            <button onClick={() => setModalMode('code')} className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${modalMode === 'code' ? 'text-[#FF5500] border-b-2 border-[#FF5500]' : 'text-slate-500 hover:text-white'}`}>Clave Maestra</button>
                        </div>

                        {modalMode === 'code' && (
                            <div className="flex flex-col flex-1 animate-fade-in">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold text-white font-oswald tracking-wide">CLAVE DE ACCESO</h3>
                                    <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed">Si tienes la Clave Maestra facilitada por Mad, úsala aquí.</p>
                                </div>
                                <form onSubmit={validateAndBook} className="mt-auto">
                                    <input type="text" value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="Introduce Clave" className="w-full bg-black border border-white/20 rounded-xl px-4 py-4 text-center text-xl font-mono text-white focus:border-[#FF5500] focus:outline-none uppercase tracking-widest shadow-inner mb-4" autoFocus />
                                    {feedback && <div className={`mb-4 p-4 rounded-xl text-xs font-bold text-center animate-fade-in ${feedback.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{feedback.msg}</div>}
                                    <button type="submit" disabled={isProcessing || !inputCode} className="w-full bg-[#FF5500] hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95 transition-transform">{isProcessing ? 'Verificando...' : 'Validar Entrada'}</button>
                                </form>
                            </div>
                        )}

                        {modalMode === 'pay' && (
                            <div className="flex flex-col flex-1 animate-fade-in text-center">
                                <div className="mb-6">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Total a Pagar</p>
                                    <h2 className={`text-5xl font-oswald font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${isFreeLoyalty ? 'text-amber-400' : 'text-white'}`}>
                                        {isFreeLoyalty ? '0€' : `${currentSession.precio}€`}
                                    </h2>
                                    {isFreeLoyalty && <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black uppercase tracking-wider">PREMIO FIDELIDAD</span>}
                                </div>

                                {isFreeLoyalty ? (
                                    <div className="mt-auto mb-4">
                                        <p className="text-xs text-slate-400 mb-4 px-4">¡Felicidades! Tienes esta sesión gratis.</p>
                                        <button onClick={handlePaymentConfirmation} disabled={isProcessing} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-transform">{isProcessing ? 'Canjeando...' : 'CANJEAR AHORA'}</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-[#003087] rounded-2xl p-6 mb-4 relative overflow-hidden group shadow-xl border border-white/10 transition-transform hover:scale-[1.02]">
                                            <div className="text-left mb-6">
                                                <h4 className="text-white font-bold text-lg italic tracking-wider mb-1 flex items-center gap-2"><span className="material-icons-round">paypal</span> PayPal</h4>
                                                <p className="text-xs text-blue-100 opacity-80 leading-snug">Pago a: <span className="font-mono bg-black/20 px-1 rounded text-white">jfelixbart@yahoo.es</span></p>
                                            </div>
                                            <a href={getPayPalLink()} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white text-[#003087] py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:bg-slate-100">Ir a PayPal</a>
                                        </div>
                                        <div className="mt-auto">
                                            {feedback && <div className={`mb-2 p-2 rounded-xl text-xs font-bold text-center ${feedback.type === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{feedback.msg}</div>}
                                            <button onClick={handlePaymentConfirmation} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95">{isProcessing ? 'Confirmando...' : 'He realizado el pago (Confirmar)'}</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
