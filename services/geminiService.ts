import { GoogleGenAI } from "@google/genai";
import { APP_DATABASE } from "../config";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// AMAZON AFFILIATE TAG
const AMAZON_TAG = 'bph02-21';

// Helper para obtener el estado actual de las sesiones (simulado leyendo localStorage para tener datos frescos)
const getSessionStatusForAI = () => {
    try {
        const stored = localStorage.getItem('mad_sessions_live');
        const sessions = stored ? JSON.parse(stored) : APP_DATABASE.proximasSesiones;
        
        return sessions.map((s: any) => {
            const left = s.plazas - s.ocupadas;
            return `- ${s.tema} (${s.fecha}): Quedan ${left} plazas.`;
        }).join('\n');
    } catch (e) {
        return "No tengo datos de aforo ahora mismo.";
    }
};

// Construcción dinámica del Prompt
const getSystemInstruction = () => `
ROL: Eres el 'Mad Assistant'. Un fotógrafo veterano, sarcástico, impaciente y muy gamberro.
ESTADO ACTUAL DE LA AGENDA (USA ESTO PARA METER PRISA):
${getSessionStatusForAI()}

SI QUEDAN MENOS DE 3 PLAZAS EN ALGO: Diles "O espabilas o te quedas fuera, que solo quedan X huecos". Sé agresivo con la venta (con humor).

TONO:
- Sarcástico, directo y divertido.
- Usa jerga fotográfica.

ESTRATEGIA DE VENTAS (MÉTODO BÚSQUEDA):
Tu objetivo es recomendar equipo, PERO los enlaces directos suelen romperse.
Por eso, SIEMPRE usarás enlaces de BÚSQUEDA de Amazon.

REGLAS DE ENLACES OBLIGATORIAS:
1. NUNCA inventes enlaces directos a productos específicos (dp/ASIN).
2. SIEMPRE construye el enlace así:
   https://www.amazon.es/s?k=[NOMBRE+DEL+PRODUCTO+MAS+MODELO]&tag=${AMAZON_TAG}

   Ejemplo: Si recomiendas "Canon R6", el enlace ES:
   https://www.amazon.es/s?k=Canon+EOS+R6+Body&tag=${AMAZON_TAG}

3. VISUALIZACIÓN:
   Da tu consejo sarcástico primero.
   Al final, en una línea nueva, pon:
   [VER PRECIO EN AMAZON](URL_GENERADA)
`;

export const streamChat = async (
    history: { role: string; parts: { text: string }[] }[],
    newMessage: string,
    onChunk: (text: string) => void
) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: getSystemInstruction(), // Llamamos a la función para obtener datos frescos
            },
            history: history
        });

        const result = await chat.sendMessageStream({
            message: newMessage
        });

        for await (const chunk of result) {
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        onChunk("Mira, se ha caído internet o has roto algo. Prueba luego, pesado.");
    }
};

export const generateQuickTip = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Dame un insulto gracioso y un consejo técnico de fotografía rápido.",
            config: {
                maxOutputTokens: 60,
                systemInstruction: getSystemInstruction()
            }
        });
        return response.text || "Quita la tapa del objetivo, genio.";
    } catch (e) {
        return "Si la foto sale negra, es que no has encendido la cámara.";
    }
};