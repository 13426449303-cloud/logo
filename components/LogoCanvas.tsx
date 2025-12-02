import React, { useMemo, useEffect, useState, useRef } from 'react';
import { LogoSystem, LogoLayer } from '../types';

interface LogoCanvasProps {
  system: LogoSystem;
  isPlaying: boolean;
  timeScale: number;
  is3D: boolean;
}

interface ViewState {
  rotX: number;
  rotY: number;
}

const LogoLayerRenderer = ({ 
  layer, 
  time, 
  index, 
  totalLayers, 
  is3D,
  viewState
}: { 
  layer: LogoLayer; 
  time: number; 
  index: number; 
  totalLayers: number; 
  is3D: boolean;
  viewState: ViewState;
}) => {
  const { segments, radius, noise, smoothness, rotation, color, fill, opacity, strokeWidth, speed, wobble } = layer;

  // Generate base points
  const points = useMemo(() => {
    const pts: [number, number][] = [];
    const step = (Math.PI * 2) / segments;
    
    for (let i = 0; i < segments; i++) {
      const theta = step * i;
      const rNoise = Math.sin(i * 123.45) * noise; 
      // Clamp radius to ensure it doesn't invert significantly
      const r = Math.max(1, radius + rNoise);
      pts.push([r * Math.cos(theta), r * Math.sin(theta)]);
    }
    return pts;
  }, [segments, radius, noise]);

  // Apply Animation & 3D Projection
  const projectedPoints: [number, number][] = useMemo(() => {
     return points.map(([x, y], i) => {
        // 1. Basic 2D Animation
        const animRotation = (time * speed * 0.5 + rotation) * (Math.PI / 180);
        const wobbleOffset = Math.sin(time * 2 + i) * wobble;
        
        const originalDist = Math.sqrt(x*x + y*y);
        const originalAngle = Math.atan2(y, x);
        
        const newDist = originalDist + wobbleOffset;
        const finalAngle = originalAngle + animRotation;
        
        let px = newDist * Math.cos(finalAngle);
        let py = newDist * Math.sin(finalAngle);
        let pz = 0;

        // 2. 3D Projection (if enabled)
        if (is3D) {
            // Exploded view spacing: Increase spacing for clearer decomposition
            const depthSpacing = 80; 
            const zOffset = (index - (totalLayers - 1) / 2) * depthSpacing;
            pz = zOffset;

            // Interactive Rotation
            const { rotX, rotY } = viewState;

            // Apply Rotation Matrix Y (Spin)
            const x1 = px * Math.cos(rotY) - pz * Math.sin(rotY);
            const z1 = px * Math.sin(rotY) + pz * Math.cos(rotY);

            // Apply Rotation Matrix X (Tilt)
            const y2 = py * Math.cos(rotX) - z1 * Math.sin(rotX);
            const z2 = py * Math.sin(rotX) + z1 * Math.cos(rotX);

            // Apply Perspective Projection
            // Camera is at z = 600
            const fov = 500;
            const cameraZ = 600;
            
            // Prevent division by zero or negative scale behind camera
            const depth = fov + cameraZ - z2;
            const scale = depth > 0 ? fov / depth : 0;

            px = x1 * scale;
            py = y2 * scale;
        }

        return [px, py];
     });
  }, [points, time, speed, rotation, wobble, is3D, index, totalLayers, viewState]);

  // Construct SVG Path from projected points
  const pathData = useMemo(() => {
    if (projectedPoints.length < 3) return "";

    // Optimization: If simple polygon
    if (smoothness < 0.1) {
      return `M ${projectedPoints[0][0]} ${projectedPoints[0][1]} ` + 
             projectedPoints.map(p => `L ${p[0]} ${p[1]}`).join(' ') + 
             ` Z`;
    }

    const len = projectedPoints.length;
    let path = `M ${projectedPoints[0][0]} ${projectedPoints[0][1]}`;
    
    for (let i = 0; i < len; i++) {
        const pCurrent = projectedPoints[i];
        const pNext = projectedPoints[(i + 1) % len];
        const pPrev = projectedPoints[(i - 1 + len) % len];
        const pNextNext = projectedPoints[(i + 2) % len];

        const cp1x = pCurrent[0] + (pNext[0] - pPrev[0]) * smoothness * 0.2;
        const cp1y = pCurrent[1] + (pNext[1] - pPrev[1]) * smoothness * 0.2;

        const cp2x = pNext[0] - (pNextNext[0] - pCurrent[0]) * smoothness * 0.2;
        const cp2y = pNext[1] - (pNextNext[1] - pCurrent[1]) * smoothness * 0.2;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pNext[0]} ${pNext[1]}`;
    }

    return path + " Z";
  }, [projectedPoints, smoothness]);

  return (
    <path 
      d={pathData} 
      fill={fill ? color : 'none'} 
      stroke={color} 
      strokeWidth={strokeWidth}
      strokeOpacity={opacity}
      fillOpacity={fill ? opacity : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Add depth sort hint? SVG paints in order, so index 0 is back.
      // 3D effect: Fade out back layers slightly if many layers
      style={{ 
        transition: 'd 0.1s linear',
        filter: is3D && index === 0 && totalLayers > 2 ? 'blur(0.5px) grayscale(30%)' : 'none' 
      }}
    />
  );
};

export const LogoCanvas: React.FC<LogoCanvasProps> = ({ system, isPlaying, timeScale, is3D }) => {
  const [time, setTime] = useState(0);
  const requestRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interactive Rotation State
  const [viewState, setViewState] = useState<ViewState>({ rotX: 0.2, rotY: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const animate = (timestamp: number) => {
    if (isPlaying) {
      setTime(t => t + 0.01 * timeScale);
      
      // Auto-rotate if not dragging and in 3D mode
      if (is3D && !isDragging.current) {
         setViewState(prev => ({
            ...prev,
            rotY: prev.rotY + 0.005 * timeScale
         }));
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, timeScale, is3D]);

  // Reset view when switching to 3D
  useEffect(() => {
    if (is3D) {
      setViewState({ rotX: 0.3, rotY: 0 });
    }
  }, [is3D]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!is3D) return;
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!is3D || !isDragging.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;
    
    setViewState(prev => ({
      rotY: prev.rotY + deltaX * 0.01,
      rotX: prev.rotX + deltaY * 0.01
    }));
    
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center relative overflow-hidden rounded-xl shadow-2xl transition-colors duration-700 ${is3D ? 'cursor-move' : ''}`}
      style={{ backgroundColor: system.backgroundColor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(${system.layers[0]?.color || '#fff'} 1px, transparent 1px)`, 
             backgroundSize: '30px 30px' 
           }} 
      />
      
      {/* 3D Axis Helper (Only in 3D mode) */}
      {is3D && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
             <div className="w-[1px] h-32 bg-white absolute" />
             <div className="w-32 h-[1px] bg-white absolute" />
        </div>
      )}

      <svg 
        viewBox="-250 -250 500 500" 
        className="w-full h-full max-w-[600px] max-h-[600px] drop-shadow-2xl"
        style={{ overflow: 'visible' }}
      >
        {/* Render layers. In simple painter's algorithm, for transparency, back layers first. */}
        {system.layers.map((layer, idx) => (
          <LogoLayerRenderer 
            key={layer.id} 
            layer={layer} 
            time={time} 
            index={idx} 
            totalLayers={system.layers.length}
            is3D={is3D}
            viewState={viewState}
          />
        ))}
      </svg>
      
      <div className="absolute bottom-4 left-4 text-xs font-mono opacity-40 pointer-events-none select-none">
        <div>SYS: {system.name.toUpperCase()}</div>
        <div>LYR: {system.layers.length}</div>
        <div>MODE: {is3D ? '3D (DRAG TO ROTATE)' : '2D (FLAT)'}</div>
      </div>
    </div>
  );
};