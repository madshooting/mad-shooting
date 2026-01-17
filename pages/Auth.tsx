
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoMaddie from '../components/LogoMaddie';

const Auth: React.FC = () => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);
        
        // Simular pequeño delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 500));

        let result;

        if (view === 'login') {
            result = login(email, password);
        } else {
            // Validación extra para registro
            if (!name.trim()) {
                setErrorMsg("El nombre es obligatorio");
                setIsLoading(false);
                return;
            }
            if (!phone.trim()) {
                setErrorMsg("El teléfono es obligatorio para contactarte");
                setIsLoading(false);
                return;
            }
            result = register(email, password, name, phone);
        }

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrorMsg(result.message || "Error desconocido");
            setIsLoading(false);
        }
    };

    const toggleView = () => {
        setView(view === 'login' ? 'register' : 'login');
        setErrorMsg(null);
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
            
            <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
                {/* Logo Principal - Maddie */}
                <div className="w-48 h-48 mb-4 relative">
                     <LogoMaddie className="w-full h-full" showGlow={true} />
                </div>

                {/* TÍTULO PRINCIPAL - NARANJA #FF5500 */}
                <h1 className="text-5xl font-oswald font-bold text-[#FF5500] mb-2 tracking-wide uppercase drop-shadow-[0_0_15px_rgba(255,85,0,0.5)] text-center leading-none">
                    MAD SHOOTING
                </h1>
                
                <p className="text-slate-400 text-[10px] mb-8 uppercase tracking-[0.3em] font-bold">
                    {view === 'login' ? 'Acceso Miembros' : 'Registro Oficial'}
                </p>

                {/* Mensaje de Error */}
                {errorMsg && (
                    <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded-xl mb-6 text-center animate-pulse">
                        <span className="material-icons-round text-sm align-middle mr-1">error_outline</span>
                        {errorMsg}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleAuth} className="w-full space-y-5">
                    
                    {view === 'register' && (
                        <>
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Artístico</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-white placeholder-slate-700 focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500] transition-all"
                                    placeholder="Ej: Alex Shutter"
                                />
                            </div>
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Móvil (WhatsApp)</label>
                                <input 
                                    type="tel" 
                                    required 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-white placeholder-slate-700 focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500] transition-all"
                                    placeholder="600 000 000"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-white placeholder-slate-700 focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500] transition-all"
                            placeholder="tucorreo@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-white placeholder-slate-700 focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#FF5500] hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,85,0,0.3)] mt-8 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'PROCESANDO...' : (view === 'login' ? 'ENTRAR' : 'CREAR CUENTA')}
                        {!isLoading && <span className="material-icons-round text-sm">arrow_forward</span>}
                    </button>
                </form>

                {/* Toggle Registro/Login */}
                <div className="mt-8 text-center">
                    <button 
                        onClick={toggleView}
                        className="text-[#FF5500] font-bold text-xs uppercase tracking-wider hover:text-white transition-colors border-b border-[#FF5500]/30 pb-1"
                    >
                        {view === 'login' 
                            ? '¿Eres nuevo? Regístrate aquí' 
                            : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>

            <div className="fixed bottom-6 text-[10px] text-slate-600 uppercase tracking-widest">
                Mad Shooting v3.5
            </div>
        </div>
    );
};

export default Auth;
