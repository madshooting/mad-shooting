import React, { useState } from 'react';

// --- TU BASE DE DATOS CENTRALIZADA ---
export const APP_DATABASE = {
    company: {
        name: "Mad Shooting",
        logo: "https://raw.githubusercontent.com/FelixBartolome/MadShooting/main/Maddie.png",
        whatsapp: "34640703435"
    },
    admin: {
        email: "info@bartolomephotography.es"
    },
    precios: {
        reserva: 50,
        promo: "10ª Gratis",
        objetivoFidelidad: 10,
        moneda: "€"
    },
    proximasSesiones: [
        { id: 301, tema: "GOLDEN HOUR", tag: "PAREJAS REALES", fecha: "SÁB 08 MAR", plazas: 10, ocupadas: 2, precio: 15 },
        { id: 302, tema: "URBAN STYLE", tag: "MOTO + MODELOS", fecha: "DOM 16 MAR", plazas: 12, ocupadas: 4, precio: 15 },
        { id: 303, tema: "FEMME FATALE", tag: "CINE NEGRO", fecha: "SÁB 21 FEB", plazas: 10, ocupadas: 1, precio: 15 }
    ]
};

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [puntos, setPuntos] = useState(0);

  // Verificación constante de si el usuario logueado es el jefe
  const esAdminOficial = email.toLowerCase().trim() === APP_DATABASE.admin.email.toLowerCase();

  const handleLogin = () => {
    if (email.includes('@') && pass.length >= 4) {
      setIsLogged(true);
    } else {
      alert("Por favor, introduce email y contraseña");
    }
  };

  // --- VISTA: PANEL DE JEFE (ACCESO DIRECTO) ---
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 text-white font-sans animate-fade-in">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black italic text-orange-500 uppercase">Panel Jefe</h2>
          <button onClick={() => setIsAdminMode(false)} className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg">
            Volver
          </button>
        </header>
        
        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 text-center shadow-xl">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-4 tracking-widest">Control de Puntos</p>
          <div className="flex justify-center items-center gap-8">
            <button onClick={() => setPuntos(Math.max(0, puntos-1))} className="w-14 h-14 bg-black rounded-2xl border border-zinc-800 text-2xl font-black active:scale-90 transition-transform">-</button>
            <span className="text-6xl font-black text-orange-500">{puntos}</span>
            <button onClick={() => setPuntos(puntos+1)} className="w-14 h-14 bg-orange-500 text-black rounded-2xl text-2xl font-bold shadow-lg shadow-orange-500/20 active:scale-90 transition-transform">+</button>
          </div>
        </div>
        
        <p className="text-center text-[9px] text-zinc-700 uppercase mt-10 tracking-widest">Autenticado como: {APP_DATABASE.admin.email}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white font-sans flex flex-col border-x border-zinc-900 shadow-2xl overflow-hidden">
      {!isLogged ? (
        /* --- LOGIN --- */
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-fade-in">
          <img src={APP_DATABASE.company.logo} className="w-40 h-40 rounded-full border-2 border-orange-500 mb-8 object-cover shadow-2xl" />
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-1 leading-none text-white">{APP_DATABASE.company.name}</h1>
          <p className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] mb-12 italic">Cinematic Club</p>
          <div className="w-full space-y-3">
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-all" />
            <input type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-all" />
            <button onClick={handleLogin} className="w-full py-5 bg-orange-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl mt-4 active:scale-95 transition-all shadow-lg shadow-orange-500/20">Entrar al Club</button>
          </div>
        </div>
      ) : (
        /* --- VISTA SOCIO --- */
        <div className="flex-1 p-6 animate-fade-in overflow-y-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <img src={APP_DATABASE.company.logo} className="w-12 h-12 rounded-full border border-orange-500 object-cover" />
              <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">MAD SHOOTING</h2>
            </div>
            {/* Si eres el admin oficial, este botón te lleva DIRECTO al panel */}
            {esAdminOficial && (
              <button 
                onClick={() => setIsAdminMode(true)} 
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-orange-500 transition-all active:scale-90"
              >
                <span className="material-icons-round text-2xl">settings</span>
              </button>
            )}
          </header>

          <div className="bg-gradient-to-br from-zinc-900 to-black p-10 rounded-[3rem] border border-zinc-800 text-center shadow-2xl mb-12 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-orange-500/5 text-[120px] font-black italic">MAD</div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-4 font-black">Fidelidad</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-8xl font-black text-orange-500 leading-none">{puntos}</span>
              <span className="text-zinc-700 font-black text-2xl mb-2">/ 10</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] mb-4">Próximos Shootings</p>
            {APP_DATABASE.proximasSesiones.map(s => (
              <div key={s.id} className="bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800/40 flex justify-between items-center group active:scale-[0.98] transition-all">
                <div>
                  <h4 className="text-base font-black italic uppercase text-white tracking-tight">{s.tema}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">{s.fecha}</p>
                </div>
                <button className="bg-white text-black text-[10px] font-black px-5 py-2.5 rounded-xl uppercase tracking-widest active:bg-orange-500 active:text-white transition-all shadow-md">Reserva</button>
              </div>
            ))}
          </div>
          
          <button onClick={() => setIsLogged(false)} className="mt-20 w-full text-zinc-800 text-[9px] font-black uppercase tracking-[0.6em] py-10 border-t border-zinc-900">Cerrar Sesión</button>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
