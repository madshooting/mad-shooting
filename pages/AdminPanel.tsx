
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { APP_DATABASE } from '../config';
import { Session, ChatMessage } from '../types';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const { user, getAllUsers } = useAuth();
    const { 
        urgentMessage, publishUrgentMessage, clearUrgentMessage,
        bookingPassword, updateBookingPassword,
        rewardPassword, updateRewardPassword,
        generatedKeys, createOneTimeKey, deleteOneTimeKey,
        sessions, addNewSession 
    } = useBooking();

    // ESTADO DE SEGURIDAD
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [unlockPass, setUnlockPass] = useState('');
    const [unlockError, setUnlockError] = useState(false);
    
    // Estados Admin
    const [alertText, setAlertText] = useState('');
    const [newBookingPass, setNewBookingPass] = useState(bookingPassword);
    const [newRewardPass, setNewRewardPass] = useState(rewardPassword);
    
    // Session State
    const [newSessionData, setNewSessionData] = useState({
        tema: '', fecha: '', hora: '', plazas: 10, imagen: '', ubicacion: 'Madrid', mapsUrl: ''
    });

    const [statusMsg, setStatusMsg] = useState<{txt: string, success: boolean} | null>(null);
    const [viewingSessionId, setViewingSessionId] = useState<number | null>(null);

    // --- NUEVO: GESTIÓN DE USUARIOS ---
    const usersList = getAllUsers().filter(u => u.email !== APP_DATABASE.admin.email); // Excluir admin

    if (user?.email !== APP_DATABASE.admin.email) {
        navigate('/dashboard');
        return null;
    }

    const showStatus = (txt: string, success: boolean) => {
        setStatusMsg({ txt, success });
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (unlockPass === 'admin' || unlockPass === user.email) {
            setIsUnlocked(true);
            setUnlockError(false);
        } else {
            setUnlockError(true);
        }
    };

    // --- ENVIAR CLAVE POR CHAT (AUTOMATIZACIÓN) ---
    const handleSendKeyToUser = (targetUserEmail: string, targetUserName: string) => {
        // 1. Generar Clave
        const code = createOneTimeKey();

        // 2. Construir Mensaje
        const msg: ChatMessage = {
            id: Date.now().toString(),
            role: 'model',
            text: `¡Hola ${targetUserName}! 👋\n\nAquí tienes tu CLAVE DE ACCESO personal para la próxima sesión. \n\nCÓDIGO: **${code}**\n\nÚsala en el botón "Tengo Clave" de la Agenda para asegurar tu plaza.`,
            timestamp: new Date(),
            actionLabel: "IR A RESERVAR",
            actionUrl: "/sessions"
        };

        // 3. Escribir en el LocalStorage del Usuario (Simulando Backend)
        const chatKey = `mad_chat_history_${targetUserEmail}`;
        const existingChatStr = localStorage.getItem(chatKey);
        const existingChat = existingChatStr ? JSON.parse(existingChatStr) : [];
        const newChat = [...existingChat, msg];
        
        localStorage.setItem(chatKey, JSON.stringify(newChat));

        // 4. Marcar como NO LEÍDO (Notification Dot)
        localStorage.setItem(`mad_chat_unread_${targetUserEmail}`, 'true');

        showStatus(`Clave ${code} enviada a ${targetUserName}`, true);
    };

    // --- Resto de Manejadores (Session, Alert, Keys...) ---
    const handlePublishAlert = (e: React.FormEvent) => {
        e.preventDefault();
        if (!alertText.trim()) return;
        publishUrgentMessage(alertText);
        setAlertText('');
        showStatus('Aviso activado en Agenda', true);
    };

    const handleClearAlert = () => {
        clearUrgentMessage();
        showStatus('Aviso borrado', true);
    };

    const handleUpdateKeys = (e: React.FormEvent) => {
        e.preventDefault();
        updateBookingPassword(newBookingPass);
        updateRewardPassword(newRewardPass);
        showStatus('Claves Maestras actualizadas', true);
    };

    const handleCreateSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSessionData.tema || !newSessionData.fecha) {
            showStatus('Faltan datos obligatorios', false);
            return;
        }
        addNewSession(newSessionData);
        setNewSessionData({ tema: '', fecha: '', hora: '', plazas: 10, imagen: '', ubicacion: 'Madrid', mapsUrl: '' });
        showStatus('¡Sesión publicada en Agenda!', true);
    };

    const handleGenerateKey = () => {
        const code = createOneTimeKey();
        showStatus(`Clave creada: ${code}`, true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showStatus('Copiado al portapapeles', true);
    };

    const getAttendeesForSession = (sessionId: number) => {
        const allUsers = getAllUsers();
        return allUsers.filter(u => u.bookedSessionIds?.includes(sessionId));
    };

    const handleCopyList = (attendees: any[], sessionTitle: string) => {
        const header = `📋 LISTA: ${sessionTitle}\n-------------------------`;
        const list = attendees.map((u, i) => `${i + 1}. ${u.realName || u.name} (${u.instagram || 'Sin IG'})`).join('\n');
        const text = `${header}\n${list}`;
        navigator.clipboard.writeText(text).then(() => showStatus('Lista copiada', true));
    };

    const openWhatsApp = (phone?: string) => {
        if (!phone) {
            showStatus('Usuario sin teléfono', false);
            return;
        }
        window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
    };

    // --- PANTALLA DE BLOQUEO ---
    if (!isUnlocked) {
        return (
            <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center p-6 relative font-sans">
                <button onClick={() => navigate('/profile')} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                    <span className="material-icons-round text-3xl">close</span>
                </button>
                <div className="w-16 h-16 bg-[#121212] rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
                    <span className="material-icons-round text-3xl text-red-500">lock</span>
                </div>
                <h1 className="text-xl font-oswald font-bold uppercase tracking-widest mb-2">Acceso Restringido</h1>
                <p className="text-xs text-slate-500 mb-8 text-center max-w-xs">Solo para administración.</p>
                <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
                    <input 
                        type="password" 
                        value={unlockPass} 
                        onChange={(e) => { setUnlockPass(e.target.value); setUnlockError(false); }}
                        placeholder="Contraseña Admin"
                        className={`w-full bg-[#121212] border ${unlockError ? 'border-red-500' : 'border-white/20'} rounded-xl px-4 py-4 text-center text-white placeholder-slate-700 focus:outline-none focus:border-white transition-colors`}
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">Desbloquear</button>
                </form>
            </div>
        );
    }

    const sessionForModal = sessions.find(s => s.id === viewingSessionId);
    const attendeesForModal = sessionForModal ? getAttendeesForSession(sessionForModal.id) : [];

    // --- PANEL DE CONTROL ---
    return (
        <div className="bg-black min-h-screen text-white p-6 font-sans pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 sticky top-0 bg-black z-50 pt-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF5500] rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
                        <span className="material-icons-round text-white text-xl">settings</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold uppercase tracking-widest text-white font-oswald">Admin Panel</h1>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Configuración Global</p>
                    </div>
                </div>
                <button onClick={() => navigate('/profile')} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <span className="material-icons-round">close</span>
                </button>
            </div>

            <div className="space-y-8 max-w-lg mx-auto">
                
                {/* 1. GESTIÓN DE USUARIOS Y ENTREGAS (NUEVO) */}
                <section className="bg-[#121212] p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h2 className="text-xs font-bold text-blue-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-icons-round text-lg">manage_accounts</span>
                        Gestión de Usuarios & Entregas
                    </h2>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {usersList.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No hay usuarios registrados.</p>
                        ) : (
                            usersList.map((u, i) => (
                                <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-lg">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{u.realName || u.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{u.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSendKeyToUser(u.email, u.name)}
                                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
                                    >
                                        <span className="material-icons-round text-sm">vpn_key</span>
                                        Enviar Clave
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 2. GENERADOR DE CLAVES MANUAL */}
                <section className="bg-[#121212] p-6 rounded-3xl border border-white/10 relative overflow-hidden opacity-80">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xs font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-icons-round text-lg">qr_code_2</span>
                            Claves Manuales
                        </h2>
                        <button onClick={handleGenerateKey} className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded uppercase font-bold hover:bg-purple-500 hover:text-white transition-colors">
                            + Crear Suelta
                        </button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                         {generatedKeys.map((key) => (
                            <div key={key.code} className="bg-black/40 border border-white/5 p-2 rounded-lg flex justify-between items-center">
                                <span className="font-mono text-white text-xs font-bold tracking-wider">{key.code}</span>
                                <div className="flex gap-2">
                                    {key.status === 'active' ? 
                                        <button onClick={() => copyToClipboard(key.code)} className="text-slate-400 hover:text-white"><span className="material-icons-round text-sm">content_copy</span></button> :
                                        <span className="text-[9px] text-slate-600 uppercase">Usada</span>
                                    }
                                    <button onClick={() => deleteOneTimeKey(key.code)} className="text-red-900 hover:text-red-500"><span className="material-icons-round text-sm">close</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. CREAR NUEVA SESIÓN */}
                <section className="bg-[#121212] p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5500]"></div>
                    <h2 className="text-xs font-bold text-[#FF5500] mb-6 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-icons-round text-lg">add_a_photo</span>
                        Crear Nueva Sesión
                    </h2>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                        <input type="text" placeholder="Título" value={newSessionData.tema} onChange={(e) => setNewSessionData({...newSessionData, tema: e.target.value})} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF5500] focus:outline-none"/>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Fecha" value={newSessionData.fecha} onChange={(e) => setNewSessionData({...newSessionData, fecha: e.target.value})} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF5500] focus:outline-none"/>
                            <input type="text" placeholder="Hora" value={newSessionData.hora} onChange={(e) => setNewSessionData({...newSessionData, hora: e.target.value})} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF5500] focus:outline-none"/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" placeholder="Aforo" value={newSessionData.plazas} onChange={(e) => setNewSessionData({...newSessionData, plazas: parseInt(e.target.value) || 0})} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF5500] focus:outline-none"/>
                             <input type="text" placeholder="Ubicación" value={newSessionData.ubicacion} onChange={(e) => setNewSessionData({...newSessionData, ubicacion: e.target.value})} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF5500] focus:outline-none"/>
                        </div>
                        
                        {/* INPUT PARA GOOGLE MAPS URL */}
                        <input 
                            type="text" 
                            placeholder="Enlace de Google Maps" 
                            value={newSessionData.mapsUrl} 
                            onChange={(e) => setNewSessionData({...newSessionData, mapsUrl: e.target.value})} 
                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF5500] focus:outline-none"
                        />
                        
                        <input type="text" placeholder="Imagen URL" value={newSessionData.imagen} onChange={(e) => setNewSessionData({...newSessionData, imagen: e.target.value})} className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF5500] focus:outline-none"/>
                        <button type="submit" className="w-full bg-white hover:bg-slate-200 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs mt-2 transition-colors">Publicar</button>
                    </form>
                </section>
                
                {/* 4. ASISTENCIA */}
                <section className="bg-[#121212] p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h2 className="text-xs font-bold text-green-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-icons-round text-lg">people</span>
                        Listas de Asistencia
                    </h2>
                    <div className="space-y-3">
                        {sessions.map(session => (
                            <div key={session.id} className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={session.imagen} alt="thumb" className="w-10 h-10 rounded object-cover opacity-80" />
                                    <div>
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wide truncate max-w-[120px]">{session.tema}</h3>
                                        <p className="text-[10px] text-slate-500">{session.ocupadas}/{session.plazas} Plazas</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingSessionId(session.id)} className="bg-green-600/20 text-green-500 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest">Ver</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* MODAL LISTA */}
            {viewingSessionId && sessionForModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setViewingSessionId(null)}></div>
                    <div className="bg-[#121212] border border-white/20 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-oswald font-bold text-white uppercase">{sessionForModal.tema}</h3>
                                <p className="text-xs text-slate-400">{attendeesForModal.length} inscritos</p>
                            </div>
                            <button onClick={() => setViewingSessionId(null)} className="bg-white/10 p-1 rounded-full text-slate-300"><span className="material-icons-round">close</span></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 mb-6 hide-scrollbar">
                            {attendeesForModal.map((attendee, index) => (
                                <div key={index} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center">
                                            {attendee.avatar ? <img src={attendee.avatar} className="w-full h-full object-cover rounded-full"/> : <span className="material-icons-round text-[#FF5500]">person</span>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{attendee.realName || attendee.name}</p>
                                            <p className="text-[10px] text-[#FF5500]">{attendee.instagram || 'Sin IG'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => openWhatsApp(attendee.phone)} className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center"><span className="material-icons-round text-xl">whatsapp</span></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => handleCopyList(attendeesForModal, sessionForModal.tema)} className="w-full bg-[#FF5500] text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs flex justify-center gap-2"><span className="material-icons-round text-sm">content_copy</span>Copiar Lista</button>
                    </div>
                </div>
            )}
            
            {statusMsg && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest animate-fade-in ${statusMsg.success ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>{statusMsg.txt}</div>
            )}
        </div>
    );
};

export default AdminPanel;
