import type { GroundingChunk } from "@google/genai";

export interface ChatMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded image
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
  sources?: GroundingChunk[];
}

export interface NasaPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Route {
    start: Location & { name: string };
    end: Location & { name: string };
}
