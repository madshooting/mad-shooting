
import React, { useState, useRef } from 'react';
import { APP_DATABASE } from '../config';
import LogoMaddie from '../components/LogoMaddie';

interface GalleryImage {
    id: string;
    src: string;
    title: string;
    date: string;
    aspect: string;
}

const Gallery: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    const [images, setImages] = useState<GalleryImage[]>([
        { id: '1', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGGMw3BffIYZBIyRqfuSbXofp-A_R2T-p_GfcSJAd8X1IQjMFUvyUdrwjp5cgX_OecW8q3FRmDY5FMoGcIpzuDajngieNAkwlVcdAZ8ZfphsX97YI8dTyVWZFvwTvdfIWcOsyELimU7DtACM43U0IwW6YxpT3mXbhlZ9aMHnq0h2QZo2PoTxs8qDiU6VrLxJV_Iv_WALwb8gFessCJ8-Up-UrX2x78p4lbhQGstc5QwyDpdOvFkUwr6LQy0GjpXQStUbgA877xMlbI", title: "Noche de Neón", date: "12 Oct 2023", aspect: "portrait" },
        { id: '2', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5898VWdXsXFf-xdxm3QSMDpQqcwX45NUsxFZYEP6IjOPqDCQnvSCAxdgHoLlHp56BXHrxrhiq4Hv-futRLQE9cLbzvfnBJ_DIlakYrrNsBFc-yL6yqlffDZZQPfojbW6fUHISmjNJbJ0zQqNb4zDIjYsMD0bhJOrgRQq3boqLP-ZsydScdAkAb0zn5aaQ0lwT5RKryGoY95LMm9sttdT_Ru24uXf3qD7q20N_Vde43qwLtsqLVMJsbeMpd8hZ1d0bLLIB_x2buR__", title: "Estudio High Key", date: "05 Nov 2023", aspect: "portrait" },
        { id: '3', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCEo8KPMw0YJXI7lP2akTmPL7HdLEijiP86Ho-OnN8pf6mqIuz3rOJI9YH8w3smCkryQ5_he8bhjBej-HTOoJbgsMqHgUdTZF8O4V_d_TIr944bgSBsRT-eKwh-07q0bn8n4Wiz6xVIbVMwfxNOILyGoFC_tupll7_nHGaLNdRWpFmmbWhDYs9Lbf_HAFx5OXhrtdPd-RyXHuU41Gw3-eOxF5ch30X-NCyWueUQAKp9o0jGabi6tcHXaNAnd3A36fNTJ2131BV5Qkg", title: "Skyline Madrid", date: "20 Sep 2023", aspect: "wide" },
        { id: '4', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgzER97c_VUk4-i2rIV2X8SSMdyA7QlZvo3FCuP2V7NYQytOTs8zDneVcP-tVtpnteoUR6UHrvC7SbeaqYxsqhVCZ-tYEDT3vlzI7dXb-rnL9UMufCtXJqu0XSkyIqFWuZH_nU2DrqVR_OSXbmmKHpUaW4ecZgKqtHnCWTI_1HzWnlxDvDDtDMsdaNniKb74rXej7QDSXYzpplhmyyaLxXhTseOSXd2kTp-T6P8AAWpM7qMFm-Owf2xxaZDYFTEkTLgMuaAcnYoZSm", title: "Equipo", date: "15 Ago 2023", aspect: "square" },
        { id: '5', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtiav8u1WbWg9na5_m2rsvEbhguj2Ym3MojznUY0ptz7mUjQAwi7ZuUmeU2iFeedP778lqXNt6Oor3OUX3cUVbc6uGkP4xoTNjGtwg3ayWV3lAM2dQ-KtBSXmBWoriQVXXm9tXWK6wK68dLjxWwoz-ZxwFqqNXO_5f65ojkdAOYI5LygHCbpA8KIT_ZQnxRegEA1lyXce-duhqbyhMGFDzZFGtTDEMfAGOF66t9ztbaKQx9GSiX8LtrEG5qTkqvj5v6xzvGOyeQAla", title: "Retrato", date: "30 Jul 2023", aspect: "square" },
        { id: '6', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAi85r3IaYYhTg44XJwEuYyeUejqEfS-5lTnTCpvHxa64zGRlAYmqMoxcIX1b67cVMoD3KdNDoEvTkeNeZdgrq6w6zP8-qIqJu6YKqp4cjE5CMViPbYFsnNzC8xtOnA1wxjs9mChlnMOoVSLLLiwas53Z3JEkEpXDLtVT0xgiHvpfcVLq_On5AE2RuK5mJDOVWwC0EK-HkS1J3U48USVFb1nLFDrmdz3IvG7YzPr8KvsDEWyeBPGRH7jzDnOUMH2iGUHY4PPvMMxZAA", title: "Exteriores", date: "10 Jul 2023", aspect: "portrait" },
        { id: '7', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHMMtHK8AjRTAAR-zeKYY0pnjsQJMLMMG6D_Y_8oZkfrDJZtnV2_pfOrDuZTxONoT6EISNXfSEY9dVOmigatcHXEzwA3e4KPV5NlhQjUE-4tlk81iYhw2hWs_i7e_gVrlr8B7D1O8qElGVUnEnBJ6KcaQ6z9lXsJPsYCsEu8iuB5rak8Y08Ae_WP4kBIwbJHakKLFnvXK9EL2GrboyhooYUk6Q5YnCqspZkonacPO_PYI40wNRXaMvH9DbjR8pCge_0ws66BVeCeoG", title: "Boda", date: "02 Jun 2023", aspect: "portrait" },
    ]);

    const handleCompressAndUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsCompressing(true);

        const compressImage = (file: File): Promise<{ url: string }> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    const img = new Image();
                    img.src = e.target?.result as string;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const MAX_WIDTH = 1280;
                        let width = img.width;
                        let height = img.height;

                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx?.drawImage(img, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve({ url: URL.createObjectURL(blob) });
                            }
                        }, 'image/jpeg', 0.7);
                    };
                };
            });
        };

        try {
            const { url } = await compressImage(file);
            const newImage: GalleryImage = {
                id: Date.now().toString(),
                src: url,
                title: "Mis Recuerdos",
                date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                aspect: "square"
            };
            setImages(prev => [newImage, ...prev]);
        } catch (error) {
            console.error("Error en subida", error);
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen pb-24 relative font-sans">
             <header className="px-6 py-6 sticky top-0 z-40 bg-background-dark/95 ios-blur flex justify-between items-center border-b border-white/5">
                <div>
                    <h1 className="text-xl font-oswald uppercase tracking-tight font-bold text-primary italic">
                        MAD SHOOTING
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">Galería de Recuerdos</p>
                </div>
                {/* LOGO MADDIE */}
                <LogoMaddie className="w-12 h-12" />
            </header>

            {/* Categorías (Scroll Horizontal) */}
            <div className="px-6 py-4 overflow-x-auto hide-scrollbar flex gap-2">
                <button className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-[0_0_15px_rgba(255,82,0,0.3)]">Todo</button>
                <button className="bg-card-dark border border-white/10 text-slate-400 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-white/5">Favoritos</button>
                <button className="bg-card-dark border border-white/10 text-slate-400 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-white/5">Neón</button>
                <button className="bg-card-dark border border-white/10 text-slate-400 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-white/5">Estudio</button>
            </div>

            {/* Rejilla de Imágenes */}
            <main className="px-4 pb-4 grid grid-cols-2 gap-3">
                {images.map((img) => (
                    <div 
                        key={img.id} 
                        onClick={() => setSelectedImage(img)}
                        className={`group relative overflow-hidden rounded-2xl bg-card-dark cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-[0_0_20px_#FF5200] hover:ring-1 hover:ring-primary ${img.aspect === 'wide' ? 'col-span-2 aspect-video' : 'aspect-square'}`}
                    >
                        <img alt={img.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" src={img.src}/>
                        
                        {/* Overlay sutil al hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Icono de zoom al hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="material-icons-round text-white drop-shadow-md text-3xl">visibility</span>
                        </div>
                    </div>
                ))}
            </main>

            {/* LIGHTBOX / MODAL */}
            {selectedImage && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in">
                    {/* Botón cerrar */}
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>

                    {/* Imagen principal */}
                    <img 
                        src={selectedImage.src} 
                        alt={selectedImage.title}
                        className="max-h-[70vh] w-full object-contain rounded-lg shadow-2xl shadow-primary/20 mb-6"
                    />

                    {/* Información */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                            {selectedImage.title}
                        </h2>
                        <div className="inline-block bg-primary px-3 py-1 rounded-full">
                            <p className="text-xs font-bold text-black uppercase tracking-wide">
                                {selectedImage.date}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Branding */}
            <div className="mt-8 flex flex-col items-center opacity-30 pb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Mad Shooting • Memories</span>
            </div>

            {/* Botón Flotante de Subida (FAB) */}
            <div className="fixed bottom-24 right-6 z-40">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleCompressAndUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-16 h-16 bg-primary text-white rounded-full shadow-[0_0_20px_rgba(255,82,0,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-background-dark"
                >
                    {isCompressing ? (
                        <span className="material-icons-round animate-spin text-3xl">autorenew</span>
                    ) : (
                        <span className="material-icons-round text-3xl">camera_alt</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Gallery;
