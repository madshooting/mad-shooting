
import React, { useState } from 'react';
import { APP_DATABASE } from '../config';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import LogoMaddie from '../components/LogoMaddie';
import { useNavigate } from 'react-router-dom';

const Sessions: React.FC = () => {
    const { user, incrementSessionCount, addBookedSession } = useAuth();
    const { sessions, bookSessionSlot, isNextSessionFree, consumeCode } = useBooking();
    const navigate = useNavigate();
    
    // Calcular si la próxima es gratis para este usuario (Tiene 9 sesiones, la 10 es gratis)
    const isFreeLoyalty = user ? isNextSessionFree(user.sessionsCompleted) : false;

    // --- LÓGICA DE RESERVA ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [inputCode, setInputCode] = useState('');
    const [feedback, setFeedback] = useState<{type: 'error' | 'success', msg: string} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // ESTADO DE BLOQUEO DE MADDIE
    const [maddieBlock, setMaddieBlock] = useState(false);
    
    // Estados visuales locales (para feedback inmediato antes de recarga)
    const [userBookedSessions, setUserBookedSessions] = useState<number[]>([]);
    
    // Fases del Modal: 'payment', 'reward_key', 'manual_code'
    const [modalStep, setModalStep] = useState<'payment' | 'reward_key' | 'manual_code'>('payment');
    
    // MOODBOARD STATE
    const [activeMoodboard, setActiveMoodboard] = useState<{images: string[], title: string} | null>(null);

    // --- NUEVOS ESTADOS PARA CONFIRMACIÓN "MADDIE" ---
    const [maddieSuccess, setMaddieSuccess] = useState<{show: boolean, sessionName: string, time: string} | null>(null);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);

    // 1. ABRIR MODAL INTELIGENTE
    const openBookingModal = (sessionId: number) => {
        // VALIDACIÓN DE MADDIE: ¿Tiene Nombre Real e Instagram?
        if (user && (!user.realName || !user.realName.trim() || !user.instagram || !user.instagram.trim())) {
            setMaddieBlock(true);
            return;
        }

        setSelectedSessionId(sessionId);
        setFeedback(null);
        setInputCode('');
        
        // LÓGICA DE PRIVILEGIOS AUTOMÁTICA
        if (isFreeLoyalty) {
            setModalStep('reward_key');
        } else {
            setModalStep('payment');
        }
        
        setIsModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsModalOpen(false);
        setSelectedSessionId(null);
    };

    const currentSession = sessions.find(s => s.id === selectedSessionId);

    // 2. VALIDAR CLAVE (Solo para Premios o Invitaciones Manuales)
    const handleValidateKey = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setFeedback(null);

        setTimeout(() => {
            const result = consumeCode(inputCode);

            // CASO A: CLAVE DE PREMIO
            if (modalStep === 'reward_key') {
                if (result.success && result.type === 'vip') {
                    processBooking(true); // Canje Gratis
                } else {
                    setFeedback({ type: 'error', msg: 'Esa no es la Clave de Premio correcta.' });
                    setIsProcessing(false);
                }
            }
            // CASO B: CÓDIGO MANUAL / INVITACIÓN
            else if (modalStep === 'manual_code') {
                if (result.success) {
                    if (result.type === 'vip') {
                        processBooking(true); // Fue un código VIP
                    } else {
                        // Fue un código standard (Manual code)
                        processBooking(false); // Canje Standard
                    }
                } else {
                    setFeedback({ type: 'error', msg: 'Código de invitación no válido.' });
                    setIsProcessing(false);
                }
            }
        }, 600);
    };

    // 3. PROCESAR RESERVA (STOCK CHECK + REGISTRO + MADDIE SUCCESS)
    const processBooking = (isFreeOverride: boolean = false) => {
        if (!currentSession || !user) return;
        
        if(!isProcessing) setIsProcessing(true);

        setTimeout(() => {
            // A) PREVENCIÓN DE OVERBOOKING (Check Final)
            const sessionNow = sessions.find(s => s.id === currentSession.id);
            
            if (!sessionNow || sessionNow.ocupadas >= sessionNow.plazas) {
                setFeedback({ type: 'error', msg: '⚠️ ¡Lo sentimos! La sesión se acaba de AGOTAR.' });
                setIsProcessing(false);
                return;
            }

            // B) EJECUTAR RESERVA (-1 Plaza)
            const success = bookSessionSlot(currentSession.id);
            
            if (success) {
                // C) REGISTRO EN PERFIL Y FIDELIDAD
                incrementSessionCount(); 
                
                // Determinar tipo
                const type = isFreeOverride ? 'vip' : 'standard';
                addBookedSession(currentSession.id, type); 
                
                // Actualizar UI Local de la lista
                setUserBookedSessions(prev => [...prev, currentSession.id]); 

                // D) ACTIVAR FLUJO DE ÉXITO DE MADDIE
                closeBookingModal(); // Cerramos el modal de pago/código
                
                // Mostramos Banner Verde
                setShowSuccessBanner(true);
                setTimeout(() => setShowSuccessBanner(false), 5000);

                // Abrimos Modal de Maddie
                setMaddieSuccess({
                    show: true,
                    sessionName: currentSession.tema,
                    time: currentSession.hora
                });

                setIsProcessing(false);
            } else {
                setFeedback({ type: 'error', msg: 'Error técnico al procesar la reserva.' });
                setIsProcessing(false);
            }
        }, 1500);
    };

    // GENERAR LINK DE PAYPAL
    const getPayPalLink = (session = currentSession) => {
        if (!session) return '#';
        const price = session.precio;
        const concept = `Reserva ${session.tema} (${session.fecha}) - ${user?.email}`;
        return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jfelixbart@yahoo.es&currency_code=EUR&amount=${price}&item_name=${encodeURIComponent(concept)}`;
    };

    const openWhatsApp = (session: typeof sessions[0]) => {
        const phone = "34640703435"; 
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
        <div className="bg-background-dark text-slate-100 min-h-screen pb-24 font-sans relative">
            
            {/* BANNER DE ÉXITO SUPERIOR (Simulación de Notificación) */}
            {showSuccessBanner && (
                <div className="fixed top-0 left-0 right-0 z-[70] bg-green-600 text-white px-4 py-3 shadow-2xl animate-fade-in flex items-center justify-center gap-2">
                    <span className="material-icons-round bg-white text-green-600 rounded-full text-sm p-0.5">check</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Reserva Confirmada con Éxito</span>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/95 ios-blur border-b border-white/10 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10">
                         <LogoMaddie />
                    </div>
                    <div>
                        <h1 className="text-xl font-oswald font-bold text-[#FF5500] tracking-wide">AGENDA</h1>
                        <p className="text-[10px] text-slate-400">Eventos Oficiales</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Fidelidad</span>
                    <div className="flex gap-0.5">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (user?.sessionsCompleted || 0) % 10 ? 'bg-[#FF5500]' : 'bg-slate-700'}`}></div>
                            ))}
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-8 mt-2">
                
                {/* BLOQUE CENTRAL DE MARCA */}
                <div className="flex flex-col items-center justify-center mb-2 animate-fade-in">
                    <div className="w-14 h-14 mb-2 relative transition-transform duration-700 hover:scale-105">
                         <LogoMaddie className="w-full h-full shadow-[0_0_20px_rgba(255,85,0,0.2)]" />
                    </div>
                    <h2 className="text-[10px] font-oswald font-bold text-[#FF5500] tracking-widest uppercase leading-none opacity-90">
                        MAD SHOOTING
                    </h2>
                </div>

                {sessions.map(session => {
                    const plazasLibres = session.plazas - session.ocupadas;
                    const isSoldOut = plazasLibres === 0;
                    const isUrgent = plazasLibres > 0 && plazasLibres <= 3;
                    const isBooked = userBookedSessions.includes(session.id) || user?.bookedSessionIds?.includes(session.id);
                    const isSpecial = session.tag === 'EXCLUSIVO' || session.tag === 'DOMINGO' || session.tag === 'SÁBADO';
                    const finalPrice = isFreeLoyalty ? 0 : session.precio;

                    // Fallback para moodboard
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
                            <div className="h-56 relative overflow-hidden">
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
                                    <h2 className="text-2xl font-oswald font-bold text-white leading-none drop-shadow-xl uppercase italic tracking-wide">
                                        {session.tema}
                                    </h2>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-sm text-slate-300 mb-4 leading-relaxed font-medium">
                                    {session.description}
                                </p>

                                {/* BOTÓN MOODBOARD */}
                                <button 
                                    onClick={() => setActiveMoodboard({ images: moodboardImages, title: session.tema })}
                                    className="mb-6 flex items-center gap-2 text-xs font-bold text-[#FF5500] hover:text-white transition-colors bg-[#FF5500]/10 hover:bg-[#FF5500]/20 px-3 py-2 rounded-lg w-fit border border-[#FF5500]/30"
                                >
                                    <span className="material-icons-round text-sm">palette</span>
                                    Ver Estilo / Moodboard
                                </button>

                                <div className="mt-auto">
                                    
                                    {/* INFO UBICACIÓN Y HORA (CON LÓGICA DE MAPA) */}
                                    <div className="grid grid-cols-2 gap-4 mb-5 text-xs font-bold border-t border-white/5 pt-4">
                                        
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
                                        <div 
                                            className="h-full bg-[#FF5500]" 
                                            style={{ width: `${(session.ocupadas / session.plazas) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-end text-[10px] uppercase font-bold mb-6">
                                        <span className={plazasLibres < 3 ? 'text-red-500 font-black' : 'text-[#FF5500]'}>
                                            {isSoldOut ? 'SOLD OUT' : `${plazasLibres} de ${session.plazas} plazas disponibles`}
                                        </span>
                                    </div>

                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => openBookingModal(session.id)}
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
                                                        ? <>🎁 Canjear Premio <span className="material-icons-round text-sm">stars</span></>
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
                })}
            </main>

            {/* MODAL DE ÉXITO DE MADDIE (CONFIRMACIÓN POST-PAGO) */}
            {maddieSuccess && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in"></div>
                    <div className="bg-[#121212] border-2 border-[#FF5500] w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-[0_0_50px_rgba(255,85,0,0.3)] animate-fade-in-up text-center">
                        
                        {/* Foto de Maddie */}
                        <div className="w-24 h-24 mx-auto -mt-12 mb-4 relative">
                            <LogoMaddie className="w-full h-full shadow-2xl" showGlow={true} />
                            <div className="absolute bottom-0 right-0 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black">
                                ONLINE
                            </div>
                        </div>

                        <h3 className="text-2xl font-oswald font-bold text-white uppercase italic tracking-wide mb-2">
                            ¡Trato Hecho!
                        </h3>
                        
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6 text-left">
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                "Ya tienes tu plaza para <span className="text-[#FF5500] font-bold">{maddieSuccess.sessionName}</span>. 
                                <br/><br/>
                                No me seas tardón, que empezamos a las <span className="text-white font-bold bg-white/20 px-1 rounded">{maddieSuccess.time}</span>. 
                                <br/><br/>
                                Tienes tu ticket digital guardado en tu perfil."
                            </p>
                        </div>

                        <button 
                            onClick={() => {
                                setMaddieSuccess(null);
                                navigate('/profile');
                            }}
                            className="w-full bg-[#FF5500] hover:bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
                        >
                            Ver Mi Ticket
                            <span className="material-icons-round">confirmation_number</span>
                        </button>
                    </div>
                </div>
            )}

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

            {/* MODAL DE RESERVA INTELIGENTE */}
            {isModalOpen && currentSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={closeBookingModal}></div>
                    <div className="bg-[#121212] border border-[#FF5500]/30 w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl shadow-orange-900/20 animate-fade-in-up flex flex-col min-h-[440px]">
                        <button onClick={closeBookingModal} className="absolute top-4 right-4 text-slate-400 hover:text-white z-20">
                            <span className="material-icons-round">close</span>
                        </button>

                        {/* PASO 1: FIDELIDAD / PREMIO (Pide Clave VIP) */}
                        {modalStep === 'reward_key' && (
                            <div className="flex flex-col flex-1 animate-fade-in text-center pt-6">
                                <div className="w-20 h-20 bg-amber-400/10 border border-amber-400/50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                                    <span className="material-icons-round text-4xl">celebration</span>
                                </div>
                                <h3 className="text-xl font-bold text-amber-400 font-oswald tracking-wide mb-1">¡SESIÓN GRATUITA ACTIVADA!</h3>
                                <p className="text-xs text-slate-300 mt-2 px-4 leading-relaxed">
                                    Has alcanzado el nivel de fidelidad. Introduce tu <b>Clave de Premio</b> para canjear esta sesión a coste 0€.
                                </p>
                                
                                <form onSubmit={handleValidateKey} className="mt-auto w-full">
                                    <input 
                                        type="text" 
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value)}
                                        placeholder="Clave de Premio"
                                        className="w-full bg-black border border-amber-500/50 rounded-xl px-4 py-4 text-center text-xl font-mono text-amber-400 placeholder-slate-700 focus:border-amber-400 focus:outline-none uppercase tracking-widest shadow-inner mb-4"
                                        autoFocus
                                    />
                                    {feedback && (
                                        <div className="mb-4 p-3 rounded-xl text-xs font-bold text-center bg-red-500/20 text-red-500 animate-fade-in">
                                            {feedback.msg}
                                        </div>
                                    )}
                                    <button 
                                        type="submit" 
                                        disabled={isProcessing || !inputCode}
                                        className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                                    >
                                        {isProcessing ? 'Canjeando...' : 'CONFIRMAR CANJE'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* PASO 2: PAGO DIRECTO (Flujo Normal sin Clave 1234) */}
                        {modalStep === 'payment' && (
                            <div className="flex flex-col flex-1 animate-fade-in text-center pt-2">
                                <div className="mb-6">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Total a Pagar</p>
                                    <h2 className="text-5xl font-oswald font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-white">
                                        {currentSession.precio}€
                                    </h2>
                                </div>

                                <div className="bg-[#003087] rounded-2xl p-5 mb-4 relative overflow-hidden group shadow-xl border border-white/10 transition-transform hover:scale-[1.02]">
                                    <div className="text-left mb-4">
                                        <h4 className="text-white font-bold text-lg italic tracking-wider mb-1 flex items-center gap-2">
                                            <span className="material-icons-round">paypal</span> PayPal
                                        </h4>
                                        <p className="text-[10px] text-blue-100 opacity-80 leading-snug">
                                            Pago directo a: <span className="font-mono bg-black/20 px-1 rounded text-white">jfelixbart@yahoo.es</span>
                                        </p>
                                    </div>
                                    
                                    <a 
                                        href={getPayPalLink()}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-white text-[#003087] py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:bg-slate-100"
                                    >
                                        1. Pagar con PayPal
                                        <span className="material-icons-round text-sm">open_in_new</span>
                                    </a>
                                </div>

                                <div className="mt-auto">
                                    {feedback && (
                                        <div className={`mb-2 p-2 rounded-xl text-xs font-bold text-center ${feedback.type === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                            {feedback.msg}
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => processBooking(false)}
                                        disabled={isProcessing}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2 border border-green-500/50"
                                    >
                                        {isProcessing ? 'Verificando...' : '2. Confirmar Pago Realizado'}
                                        <span className="material-icons-round text-sm">check_circle</span>
                                    </button>

                                    {/* Opción para código manual si alguien tiene invitación */}
                                    <button 
                                        onClick={() => setModalStep('manual_code')}
                                        className="mt-4 text-[10px] text-slate-500 hover:text-white underline decoration-slate-600 underline-offset-2"
                                    >
                                        ¿Tienes un código de invitación?
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PASO 3: CÓDIGO MANUAL (Solo si se solicita explícitamente) */}
                        {modalStep === 'manual_code' && (
                            <div className="flex flex-col flex-1 animate-fade-in text-center pt-6">
                                <h3 className="text-lg font-bold text-white font-oswald tracking-wide mb-2">CÓDIGO DE INVITACIÓN</h3>
                                <p className="text-xs text-slate-400 px-4 mb-6">
                                    Introduce tu código especial para acceder a la reserva.
                                </p>
                                
                                <form onSubmit={handleValidateKey} className="mt-auto w-full">
                                    <input 
                                        type="text" 
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value)}
                                        placeholder="Tu Código"
                                        className="w-full bg-black border border-white/20 rounded-xl px-4 py-4 text-center text-xl font-mono text-white placeholder-slate-700 focus:border-[#FF5500] focus:outline-none uppercase tracking-widest shadow-inner mb-4"
                                        autoFocus
                                    />
                                    {feedback && (
                                        <div className="mb-4 p-3 rounded-xl text-xs font-bold text-center bg-red-500/20 text-red-500 animate-fade-in">
                                            {feedback.msg}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setModalStep('payment')}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 rounded-xl uppercase tracking-widest text-xs"
                                        >
                                            Volver
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isProcessing || !inputCode}
                                            className="flex-1 bg-[#FF5500] hover:bg-orange-600 disabled:opacity-50 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs"
                                        >
                                            {isProcessing ? '...' : 'Validar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default Sessions;
