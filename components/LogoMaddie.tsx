import React, { useState } from 'react';

interface LogoProps {
    className?: string;
    showGlow?: boolean;
}

const LogoMaddie: React.FC<LogoProps> = ({ className = "", showGlow = false }) => {
    // ---------------------------------------------------------------------------
    // ENLACE DIRECTO PROPORCIONADO (ImgBB)
    // ---------------------------------------------------------------------------
    const REMOTE_LOGO_URL = "https://i.ibb.co/pjCNLmKr/maddie.jpg"; 
    
    const [hasError, setHasError] = useState(false);
    
    return (
        // CONTENEDOR: Mantiene el Círculo y el Borde Naranja Estricto (#FF5500)
        <div className={`relative flex items-center justify-center rounded-full bg-black border-2 border-[#FF5500] overflow-hidden ${className}`}>
            
            {/* Efecto de brillo opcional */}
            {showGlow && (
                <div className="absolute inset-0 bg-[#FF5500] blur-[30px] opacity-40 animate-pulse"></div>
            )}
            
            {!hasError ? (
                // IMAGEN: Usamos object-cover para que llene el círculo sin bordes vacíos
                <img 
                    src={REMOTE_LOGO_URL}
                    alt="Mad Shooting Logo" 
                    className="w-full h-full object-cover relative z-10"
                    onError={() => setHasError(true)}
                />
            ) : (
                // Fallback si el enlace falla
                <div className="w-full h-full flex items-center justify-center bg-black relative z-10">
                    <span className="font-oswald font-bold text-[#FF5500] text-xs">MS</span>
                </div>
            )}
        </div>
    );
};

export default LogoMaddie;