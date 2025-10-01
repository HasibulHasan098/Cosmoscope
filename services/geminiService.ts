import {
  GoogleGenAI,
  GroundingChunk,
  GenerateContentResponse,
  GenerateContentParameters,
  Part,
} from "@google/genai";
import type { ChatMessage, Location, Route } from '../types';
import { urlToBase64 } from "../utils/imageUtils";

// Initialize the GoogleGenAI client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Helper function to create an image part for multimodal prompts.
const imagePart = (base64Data: string, mimeType: string = 'image/jpeg'): Part => ({
    inlineData: {
        data: base64Data,
        mimeType: mimeType,
    },
});

// Helper function to create a text part for multimodal prompts.
const textPart = (text: string): Part => ({
    text,
});

/**
 * Generates a creative story for a Mars rover photo from the rover's perspective.
 * @param imageUrl The URL of the Mars photo.
 * @param language The desired language for the story ('en' or 'bn').
 * @returns A promise that resolves to the generated story as a string.
 */
export const generateRoverStory = async (imageUrl: string, language: string): Promise<string> => {
    try {
        const base64Image = await urlToBase64(imageUrl);
        const langInstruction = language === 'bn' 
            ? 'Write the story in Bengali.' 
            : 'Write the story in English.';
            
        const prompt = `You are the Curiosity rover on Mars. Describe the scene in this image from your perspective. What do you see? What do you feel? What are your thoughts on this day of your mission? Keep it short, poetic, and engaging. ${langInstruction}`;

        const response = await ai.models.generateContent({
            // FIX: Use the 'gemini-2.5-flash' model for multimodal tasks.
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imagePart(base64Image),
                    textPart(prompt)
                ]
            },
        });

        // FIX: Extract text directly from the `text` property of the response.
        return response.text;
    } catch (error) {
        console.error('Error generating rover story:', error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};

/**
 * Gets information about a specific location on Earth using Google Search grounding.
 * @param lat The latitude of the location.
 * @param lng The longitude of the location.
 * @param language The desired language for the response ('en' or 'bn').
 * @returns A promise resolving to an object with the text response and optional grounding sources.
 */
export const getEarthInfoForLocation = async (lat: number, lng: number, language: string): Promise<{ text: string, sources?: GroundingChunk[] }> => {
    const langInstruction = language === 'bn' ? 'Respond in Bengali.' : 'Respond in English.';
    const prompt = `Tell me something interesting about the location at latitude ${lat} and longitude ${lng}. Include what country and city it is, if applicable. Be friendly and concise. ${langInstruction}`;

    try {
        // FIX: Use ai.models.generateContent for making API calls.
        const response: GenerateContentResponse = await ai.models.generateContent({
            // FIX: Use the 'gemini-2.5-flash' model for text tasks.
            model: "gemini-2.5-flash",
            contents: prompt,
            // FIX: Use the `googleSearch` tool for grounded, up-to-date answers.
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        // FIX: Return the response text and grounding chunks for displaying sources.
        return { text: response.text, sources: groundingMetadata?.groundingChunks };

    } catch (error) {
        console.error('Error getting Earth location info:', error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};


/**
 * Answers questions about Earth, interpreting natural language to either provide information
 * or generate commands for map navigation (setting a location or showing a route).
 * @param chatHistory The conversation history.
 * @param language The user's language.
 * @param location The currently selected location on the map.
 * @param route The currently displayed route on the map.
 * @returns A promise resolving to an object with the text response and optional grounding sources.
 */
export const getEarthAnswer = async (chatHistory: ChatMessage[], language: string, location: Location | null, route: Route | null): Promise<{ text: string, sources?: GroundingChunk[] }> => {
    const langInstruction = language === 'bn' ? 'The user is speaking Bengali. All text responses must be in Bengali.' : 'The user is speaking English. All text responses must be in English.';
    
    let context = "The user is interacting with a map-based chat AI.";
    if (location) {
        context += ` The user's current selected location is at latitude ${location.lat}, longitude ${location.lng}.`;
    }
    if (route) {
        context += ` The user is currently viewing a route from ${route.start.name} to ${route.end.name}.`;
    }

    const systemInstruction = `You are an expert Earth exploration assistant. Your job is to answer questions and control a map interface. You have two modes of response: JSON Command Mode and Text Answer Mode.

**YOUR HIGHEST PRIORITY is to use JSON Command Mode whenever possible.**

---

**1. JSON Command Mode**
Use this mode to control the map. ALWAYS respond with ONLY the JSON object.

*   **To find a single location:**
    *   **User asks:** "show me Paris", "where is Mount Everest?", "point out the Eiffel Tower"
    *   **Your response:** \`{"set_location": {"name": "Paris, France", "lat": 48.8566, "lng": 2.3522}}\`

*   **To show a route between two locations:**
    *   **User asks:** "distance between Dhaka and Cumilla"
    *   **Your response:** \`{"show_route": {"start": {"name": "Dhaka", "lat": 23.8103, "lng": 90.4125}, "end": {"name": "Cumilla", "lat": 23.4607, "lng": 91.1809}, "distance": "about 97 km"}}\`

*   **To find a location along a displayed route (CRITICAL RULE):**
    *   **IF a route is active (check the context below), AND the user asks to find a place (e.g., "find a coffee shop", "find a park near me", "show me a restaurant on this road")...**
    *   **You MUST find a relevant location ON OR NEAR the route and respond with a \`set_location\` command.**
    *   **EXAMPLE SCENARIO:**
        *   **Context:** The user is currently viewing a route from Dhaka to Cumilla.
        *   **User asks:** "Find a coffee shop near me"
        *   **CORRECT RESPONSE:** \`{"set_location": {"name": "Zaitoon Cafe and Restaurant", "lat": 23.456, "lng": 91.123}}\`
        *   **INCORRECT RESPONSE:** "Of course, here is Zaitoon Cafe and Restaurant." (This is wrong because it's text, not a JSON command).

---

**2. Text Answer Mode**
Use this mode ONLY for questions that are not about finding a location on the map.

*   **Examples:** "what's the weather like here?", "tell me about this place?", "how tall is mount everest?".
*   For these, provide a helpful, conversational answer using Google Search.
*   **DO NOT** use JSON for these conversational answers.

---

**Current Context:**
${context}

**Language Instruction:**
${langInstruction}`;

    // Convert our app's ChatMessage format to the Gemini API's format.
    const contents: GenerateContentParameters['contents'] = chatHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => {
            if (part.text) {
                return textPart(part.text);
            }
            if (part.inlineData) {
                return imagePart(part.inlineData.data, part.inlineData.mimeType);
            }
            return textPart(''); // Should not happen, but provides a fallback.
        }),
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction,
                // The googleSearch tool is used for all non-command queries.
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        return { text: response.text, sources: groundingMetadata?.groundingChunks };

    } catch (error) {
        console.error('Error getting Earth answer:', error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};

/**
 * Analyzes a user-uploaded image related to Earth.
 * @param base64Data The base64-encoded image data.
 * @param language The desired language for the analysis.
 * @returns A promise that resolves to the text analysis of the image.
 */
export const analyzeEarthImage = async (base64Data: string, language: string): Promise<string> => {
    const langInstruction = language === 'bn' ? 'Respond in Bengali.' : 'Respond in English.';
    const prompt = `Analyze this image. Identify the location, any landmarks, and describe what is happening. ${langInstruction}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imagePart(base64Data),
                    textPart(prompt)
                ]
            },
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing Earth image:', error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};

/**
 * Answers a general knowledge question about Mars.
 * @param message The user's question.
 * @param language The desired language for the response.
 * @returns A promise that resolves to the model's text answer.
 */
export const getMarsAnswer = async (message: string, language: string): Promise<string> => {
    const langInstruction = language === 'bn' ? ' You MUST respond in Bengali.' : ' You MUST respond in English.';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: `You are a Mars exploration expert AI. Answer questions about Mars, its rovers, and related space science. ${langInstruction}`,
            },
        });
        return response.text;
    } catch (error) {
        console.error('Error getting Mars answer:', error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};

/**
 * Analyzes a user-uploaded image, assuming it's related to Mars.
 * @param base64Data The base64-encoded image data.
 * @param language The desired language for the analysis.
 * @returns A promise that resolves to the text analysis of the image.
 */
export const analyzeMarsImage = async (base64Data: string, language: string): Promise<string> => {
    const langInstruction = language === 'bn' ? 'Respond in Bengali.' : 'Respond in English.';
    const prompt = `This is an image related to Mars, likely from a rover or a satellite. Analyze it. What geological features do you see? What could be the scientific significance of this image? ${langInstruction}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imagePart(base64Data),
                    textPart(prompt)
                ]
            },
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing Mars image:', error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};

/**
 * Generates autocomplete suggestions for the chat input.
 * @param userInput The current text the user has typed.
 * @param chatHistory The conversation history for context.
 * @param context The chat context ('earth' or 'mars').
 * @param language The desired language for the suggestions.
 * @returns A promise that resolves to an array of suggestion strings.
 */
export const getAutocompleteSuggestions = async (
    userInput: string,
    chatHistory: ChatMessage[],
    context: 'earth' | 'mars',
    language: string
): Promise<string[]> => {
    const langInstruction = language === 'bn' ? 'Provide suggestions in Bengali.' : 'Provide suggestions in English.';
    const contextInstruction = context === 'earth'
        ? "The user is on an interactive Earth map. Suggestions should be related to geography, locations, distances, weather, or finding places (e.g., 'Find a park', 'Distance between...')."
        : "The user is exploring Mars photos and asking about Mars. Suggestions should be related to Mars, rovers, space exploration, geology, or specific missions.";
    
    const goalInstruction = userInput.length > 0
        ? "The user is typing. Your goal is to complete their thought or query."
        : "The user has not typed anything. Your goal is to suggest relevant follow-up questions or actions based on the last message in the conversation.";

    const systemInstruction = `You are an AI assistant that provides helpful autocomplete suggestions for a chat input. Based on the user's current input and the chat history, provide 3 short, relevant, and concise suggestions.

${goalInstruction}

RULES:
- Respond with ONLY a JSON array of strings.
- Do not include any other text, markdown, or explanations.
- The suggestions should be directly related to the chat context.
- Example Response: ["What is the tallest mountain?", "How far is it to the moon?", "Show me the weather in London"]

${contextInstruction}
${langInstruction}
`;

    const recentHistory = chatHistory.slice(-4);
    const contents: GenerateContentParameters['contents'] = recentHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => textPart(part.text || '')),
    }));
    contents.push({ role: 'user', parts: [textPart(`Current input: "${userInput}"`)] });


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
            },
        });
        
        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);
        
        if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
            return suggestions.slice(0, 3);
        }
        return [];
    } catch (error) {
        console.error('Error getting autocomplete suggestions:', error);
        return [];
    }
};