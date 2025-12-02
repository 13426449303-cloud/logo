import React from 'react';
import { LogoSystem, LogoLayer } from '../types';
import { Trash2, Copy, Layers, Sliders } from 'lucide-react';

interface ControlPanelProps {
  system: LogoSystem;
  setSystem: React.Dispatch<React.SetStateAction<LogoSystem>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

const Slider = ({ label, value, min, max, step, onChange }: any) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
    />
  </div>
);

const ColorPicker = ({ label, value, onChange }: any) => (
  <div className="mb-3 flex items-center justify-between">
    <span className="text-xs text-slate-400 font-mono">{label}</span>
    <div className="flex items-center gap-2">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
      />
      <span className="text-xs text-slate-500 font-mono w-16">{value}</span>
    </div>
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ system, setSystem, selectedLayerId, setSelectedLayerId }) => {
  
  const updateLayer = (id: string, updates: Partial<LogoLayer>) => {
    setSystem(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const removeLayer = (id: string) => {
    setSystem(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const duplicateLayer = (layer: LogoLayer) => {
    const newLayer = { ...layer, id: `layer-${Date.now()}` };
    setSystem(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));
    setSelectedLayerId(newLayer.id);
  };

  const addLayer = () => {
     const newLayer: LogoLayer = {
       id: `layer-${Date.now()}`,
       segments: 5,
       radius: 80,
       noise: 0,
       smoothness: 0.5,
       rotation: 0,
       opacity: 1,
       strokeWidth: 2,
       color: '#ffffff',
       fill: false,
       speed: 0.2,
       wobble: 0
     };
     setSystem(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
     setSelectedLayerId(newLayer.id);
  };

  const selectedLayer = system.layers.find(l => l.id === selectedLayerId);

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 w-full overflow-hidden">
      {/* Global Settings */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Sliders size={14} /> SYSTEM SETTINGS
        </h2>
        <ColorPicker 
          label="Background" 
          value={system.backgroundColor} 
          onChange={(c: string) => setSystem(s => ({ ...s, backgroundColor: c }))} 
        />
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers size={14} /> LAYERS
            </h2>
            <button 
              onClick={addLayer}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {system.layers.map((layer, index) => (
              <div 
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between group ${
                  selectedLayerId === layer.id 
                    ? 'bg-blue-900/30 border-blue-500/50' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: layer.color }}></div>
                  <span className="text-sm font-mono text-slate-300">Layer {index + 1}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer); }} className="text-slate-400 hover:text-white">
                    <Copy size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="text-slate-400 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Layer Controls */}
          {selectedLayer ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">Parameters</h3>
              
              <Slider label="Segments" value={selectedLayer.segments} min={3} max={20} step={1} onChange={(v: number) => updateLayer(selectedLayer.id, { segments: v })} />
              <Slider label="Radius" value={selectedLayer.radius} min={10} max={220} step={1} onChange={(v: number) => updateLayer(selectedLayer.id, { radius: v })} />
              <Slider label="Smoothness" value={selectedLayer.smoothness} min={0} max={1} step={0.01} onChange={(v: number) => updateLayer(selectedLayer.id, { smoothness: v })} />
              <Slider label="Noise (Chaos)" value={selectedLayer.noise} min={0} max={50} step={0.1} onChange={(v: number) => updateLayer(selectedLayer.id, { noise: v })} />
              <Slider label="Rotation" value={selectedLayer.rotation} min={0} max={360} step={1} onChange={(v: number) => updateLayer(selectedLayer.id, { rotation: v })} />
              <Slider label="Stroke Width" value={selectedLayer.strokeWidth} min={0} max={20} step={0.5} onChange={(v: number) => updateLayer(selectedLayer.id, { strokeWidth: v })} />
              <Slider label="Opacity" value={selectedLayer.opacity} min={0} max={1} step={0.01} onChange={(v: number) => updateLayer(selectedLayer.id, { opacity: v })} />
              
              <div className="my-4 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-wider">Animation</h3>
                <Slider label="Rotation Speed" value={selectedLayer.speed} min={-5} max={5} step={0.1} onChange={(v: number) => updateLayer(selectedLayer.id, { speed: v })} />
                <Slider label="Wobble (Pulse)" value={selectedLayer.wobble} min={0} max={20} step={0.1} onChange={(v: number) => updateLayer(selectedLayer.id, { wobble: v })} />
              </div>

              <div className="my-4 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider">Style</h3>
                <ColorPicker label="Color" value={selectedLayer.color} onChange={(c: string) => updateLayer(selectedLayer.id, { color: c })} />
                <div className="flex items-center gap-2 mb-3">
                    <input 
                        type="checkbox" 
                        checked={selectedLayer.fill} 
                        onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.checked })}
                        className="rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-xs text-slate-400">Fill Shape</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 text-sm mt-10 p-4 border border-dashed border-slate-700 rounded">
              Select a layer to edit parameters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
