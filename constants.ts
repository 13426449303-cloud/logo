import { LogoSystem, LogoLayer } from './types';

export const DEFAULT_LAYER: LogoLayer = {
  id: 'layer-1',
  segments: 5,
  radius: 100,
  noise: 10,
  smoothness: 0.5,
  rotation: 0,
  opacity: 0.8,
  strokeWidth: 2,
  color: '#38bdf8',
  fill: false,
  speed: 0.5,
  wobble: 1.0,
};

export const DEFAULT_SYSTEM: LogoSystem = {
  name: "Neo-Geometric Start",
  description: "A basic parametric starting point.",
  backgroundColor: "#0f172a",
  layers: [
    { ...DEFAULT_LAYER },
    { 
      ...DEFAULT_LAYER, 
      id: 'layer-2', 
      radius: 60, 
      color: '#c084fc', 
      rotation: 45, 
      segments: 3,
      fill: true,
      opacity: 0.3
    }
  ]
};

export const PRESETS: LogoSystem[] = [
  {
    name: "Tech Hive",
    description: "Hexagonal structures representing connection.",
    backgroundColor: "#000000",
    layers: [
      { id: 'p1-1', segments: 6, radius: 120, noise: 0, smoothness: 0, rotation: 0, opacity: 1, strokeWidth: 4, color: '#00ffcc', fill: false, speed: 0.2, wobble: 0 },
      { id: 'p1-2', segments: 6, radius: 80, noise: 0, smoothness: 0, rotation: 30, opacity: 0.5, strokeWidth: 2, color: '#0088ff', fill: true, speed: -0.2, wobble: 0 }
    ]
  },
  {
    name: "Organic Flow",
    description: "Soft, breathing shapes inspired by nature.",
    backgroundColor: "#1a2e1a",
    layers: [
      { id: 'p2-1', segments: 12, radius: 100, noise: 20, smoothness: 1, rotation: 0, opacity: 0.6, strokeWidth: 2, color: '#4ade80', fill: true, speed: 0.5, wobble: 5 },
      { id: 'p2-2', segments: 8, radius: 130, noise: 15, smoothness: 0.8, rotation: 45, opacity: 0.4, strokeWidth: 1, color: '#facc15', fill: false, speed: 0.3, wobble: 3 }
    ]
  }
];
