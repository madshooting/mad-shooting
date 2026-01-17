
import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import LogoMaddie from '../components/LogoMaddie';
import { useNavigate } from 'react-router-dom';

const Proposals: React.FC = () => {
    const navigate = useNavigate();
    const { proposals, voteProposal, addProposal } = useBooking();
    const { user } = useAuth();
    const [newTheme, setNewTheme] = useState('');

    // Ordenar propuestas por votos (Descendente)
    const sortedProposals = [...proposals].sort((a, b) => b.votes - a.votes);

    const handleVote = (id: string) => {
        voteProposal(id);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTheme.trim() || !user) return;
        addProposal(newTheme, user.name);
        setNewTheme('');
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen pb-32 font-sans relative">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/95 ios-blur border-b border-white/10 px-4 pt-4 pb-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative flex-shrink-0">
                         <LogoMaddie className="w-full h-full shadow-[0_0_15px_rgba(255,85,0,0.4)]" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-oswald font-bold text-[#FF5500] tracking-wide leading-none">
                            PROPUESTAS
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                            Decide la próxima sesión
                        </p>
                    </div>
                </div>
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="material-icons-round text-slate-400">close</span>
                </button>
            </header>

            <main className="p-4 space-y-4">
                {/* Intro Card */}
                <div className="bg-gradient-to-br from-[#FF5500]/20 to-transparent p-6 rounded-2xl border border-[#FF5500]/30 mb-6">
                    <h2 className="text-lg font-bold text-white mb-2 font-oswald uppercase tracking-wide">Tu voz importa</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Propón temáticas locas para futuras sesiones. Si la comunidad apoya tu idea con votos, ¡la haremos realidad!
                    </p>
                </div>

                {/* Proposals List */}
                <div className="space-y-3">
                    {sortedProposals.map((item, index) => (
                        <div key={item.id} className="bg-[#181818] p-4 rounded-xl border border-white/5 flex items-center justify-between group transition-all hover:bg-[#202020] hover:border-white/10">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`text-xl font-black font-oswald w-8 text-center ${index < 3 ? 'text-[#FF5500]' : 'text-slate-600'}`}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">{item.theme}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Propuesto por {item.author}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleVote(item.id)}
                                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all active:scale-95 ${
                                    item.isVotedByUser 
                                    ? 'bg-[#FF5500] border-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]' 
                                    : 'bg-black border-white/10 text-slate-500 hover:text-white hover:border-white/30'
                                }`}
                            >
                                <span className="material-icons-round text-lg">photo_camera</span>
                                <span className="text-[10px] font-black">{item.votes}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* Input Fixed at Bottom */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-background-dark/95 ios-blur border-t border-white/10 z-30">
                <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
                    <input 
                        type="text" 
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        placeholder="Ej: Vikingos, Cyberpunk, 80s..."
                        className="flex-1 bg-[#121212] border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF5500] focus:outline-none transition-colors"
                    />
                    <button 
                        type="submit" 
                        disabled={!newTheme.trim()}
                        className="bg-[#FF5500] hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-4 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <span className="material-icons-round">send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Proposals;
