export interface LogoLayer {
  id: string;
  segments: number; // 3 - 20
  radius: number; // 10 - 200
  noise: number; // 0 - 50 (Random deviation)
  smoothness: number; // 0 (sharp) - 1 (circle)
  rotation: number; // 0 - 360
  opacity: number; // 0 - 1
  strokeWidth: number; // 1 - 20
  color: string;
  fill: boolean;
  speed: number; // Animation rotation speed
  wobble: number; // Animation pulse intensity
}

export interface LogoSystem {
  name: string;
  description: string;
  backgroundColor: string;
  layers: LogoLayer[];
}

export interface GeminiResponse {
  name: string;
  description: string;
  backgroundColor: string;
  layers: Omit<LogoLayer, 'id'>[]; // AI doesn't need to generate IDs
}
