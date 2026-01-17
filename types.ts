
export interface Session {
    id: number;
    title?: string; // Legacy support
    tema: string;
    description?: string; // New field
    date?: string;
    time?: string;
    location?: string;
    image?: string;
    status?: 'available' | 'booked' | 'completed';
    badge?: string;
    price?: number; // Legacy support
    precio: number; // Active field
    tag?: string;
    timeBadge?: string;
    totalSpots?: number;
    openSpots?: number;
    plazas: number;
    ocupadas: number;
    actionType?: 'paypal' | 'whatsapp'; // New field for button logic
    moodboard?: string[]; // New: Array of 4 images for style reference

    // Spanish fields matching usage in components and config
    fecha: string;
    hora: string;
    ubicacion: string;
    mapsUrl?: string; // New: Specific Google Maps Link
    imagen: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'alert' | 'success' | 'info' | 'promo';
    isNew?: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
    timestamp: Date;
    // New fields for interactive actions
    actionLabel?: string;
    actionUrl?: string;
}

export interface Suggestion {
    id: number;
    tema: string;
    votos: number;
}

// Nueva interfaz para Propuestas de Temáticas
export interface Proposal {
    id: string;
    author: string;
    theme: string;
    description?: string;
    votes: number;
    isVotedByUser?: boolean; // Para controlar estado visual del voto
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    link: string;
}

export interface ContestEntry {
    id: string;
    photographer: string;
    imageUrl: string;
    votes: number;
    isUserEntry?: boolean; // To identify if it belongs to current user
}

export interface Contest {
    id: number;
    sessionId: number; // Links to a past session
    title: string;
    status: 'active' | 'voting' | 'completed';
    entries: ContestEntry[];
}
