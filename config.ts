
// BASE DE DATOS CENTRALIZADA (APP_DATABASE)
// Edita aquí los precios, sesiones y datos maestros.

export const APP_DATABASE = {
    company: {
        name: "Mad Shooting",
        // LOGO LOCAL
        logo: "maddie.jpg", 
        // NÚMERO VERIFICADO
        whatsapp: "34640703435" 
    },
    admin: {
        email: "info@bartolomephotography.es" // ÚNICO EMAIL CON PERMISOS DE ADMIN
    },
    // NOTA: El sistema de avisos urgentes ahora se gestiona dinámicamente desde el Panel de Admin.
    affiliate: {
        tag: "bph02-21", // AMAZON TAG
        amazonStore: "https://www.amazon.es/shop/bartolomephotography", 
        disclaimer: "Como afiliado de Amazon, Mad Shooting obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables."
    },
    precios: {
        reserva: 50,
        promo: "10ª Gratis",
        objetivoFidelidad: 10,
        moneda: "€"
    },
    proximasSesiones: [
        { 
            id: 301, 
            tema: "GOLDEN HOUR", 
            tag: "PAREJAS REALES",
            description: "Parejas Reales. Capturando la química y la luz dorada del atardecer. Estética romántica y cálida.",
            plazas: 10, 
            ocupadas: 2, 
            fecha: "SÁB 08 MAR", // Fecha estimada (puedes cambiarla)
            hora: "18:30",
            ubicacion: "Casa de Campo", // Ubicación genérica (la exacta sale al reservar)
            precio: 15,
            actionType: "paypal",
            imagen: "https://images.unsplash.com/photo-1621621667797-e06afc217fb0?q=80&w=1000&auto=format&fit=crop",
            moodboard: [
                "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop"
            ]
        },
        { 
            id: 302, 
            tema: "URBAN STYLE", 
            tag: "MOTO + MODELOS",
            description: "4 modelos + Moto. Estética callejera, cuero, humo y asfalto. Traed angulares y flashes.",
            plazas: 12, 
            ocupadas: 4, 
            fecha: "DOM 16 MAR", // Fecha estimada (puedes cambiarla)
            hora: "10:30",
            ubicacion: "Madrid Río", // Ubicación genérica
            precio: 15,
            actionType: "paypal",
            imagen: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop",
            moodboard: [
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
            ]
        },
        { 
            id: 303, 
            tema: "FEMME FATALE", 
            tag: "CINE NEGRO",
            description: "Estética Noir, misterio, sombras duras y elegancia clásica. Ideal para blanco y negro.",
            plazas: 10, 
            ocupadas: 1, 
            fecha: "SÁB 21 FEB", 
            hora: "13:00",
            ubicacion: "Estudio Centro",
            precio: 15,
            actionType: "paypal",
            imagen: "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop",
            moodboard: [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519699047748-40baea614fda?q=80&w=600&auto=format&fit=crop"
            ]
        }
    ],
    // CONCURSOS: Se generan dinámicamente según la fecha de las sesiones. 
    // Empezamos vacío.
    concursos: [],
    
    // PROPUESTAS INICIALES (New Structure)
    propuestas: [
        { id: "p1", author: "Maddie Fans", theme: "Cárcel / Orange is the New Black", description: "Estética carcelaria grunge.", votes: 158 },
        { id: "p2", author: "DarkLens", theme: "Vampiros Góticos", description: "Sangre falsa, colmillos y humo.", votes: 94 },
        { id: "p3", author: "RetroGuy", theme: "Gym 80s Aerobic", description: "Calentadores y neones.", votes: 45 }
    ],
    recommendedGear: [
        {
            id: 1,
            name: "Sony FE 35mm f/1.4 GM",
            description: "El objetivo definitivo para nuestras sesiones nocturnas. Nitidez brutal y un bokeh cremoso para destacar al modelo entre neones.",
            price: "1.699€",
            image: "https://m.media-amazon.com/images/I/71YI-9J+HQL._AC_SL1500_.jpg",
            link: "https://www.amazon.es/s?k=Sony+FE+35mm+f1.4+GM&tag=bph02-21" 
        },
        {
            id: 2,
            name: "K&F Concept Filtro ND Variable",
            description: "Imprescindible para controlar la luz en las sesiones de 'Urban Mad' a pleno día sin perder ese f/1.4 que tanto nos gusta.",
            price: "65€",
            image: "https://m.media-amazon.com/images/I/71Xy+i+6tQL._AC_SL1500_.jpg",
            link: "https://www.amazon.es/s?k=filtro+nd+variable+k%26f+concept&tag=bph02-21" 
        },
        {
            id: 3,
            name: "SanDisk Extreme PRO 128GB",
            description: "No te la juegues. Velocidad de escritura V90 para ráfagas RAW en nuestras pasarelas de moda rápida.",
            price: "45€",
            image: "https://m.media-amazon.com/images/I/61jD57J-C0L._AC_SL1000_.jpg",
            link: "https://www.amazon.es/s?k=sandisk+extreme+pro+128gb&tag=bph02-21"
        }
    ]
};
