import React, { useState } from 'react';
import { LogoCanvas } from './components/LogoCanvas';
import { ControlPanel } from './components/ControlPanel';
import { AIPrompt } from './components/AIPrompt';
import { DEFAULT_SYSTEM, PRESETS } from './constants';
import { LogoSystem } from './types';
import { Play, Pause, Download, Command, Wand2, Grid, Box } from 'lucide-react';

const App = () => {
  const [system, setSystem] = useState<LogoSystem>(DEFAULT_SYSTEM);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(system.layers[0]?.id || null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeScale, setTimeScale] = useState(1);
  const [showPresets, setShowPresets] = useState(false);
  const [is3D, setIs3D] = useState(false);

  const handleDownload = () => {
    // Simple SVG download logic
    const svgEl = document.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${system.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar Controls */}
      <div className="w-80 flex-shrink-0 z-20 shadow-2xl">
        <ControlPanel 
          system={system} 
          setSystem={setSystem} 
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Top Header / Toolbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
             <div>
               <h1 className="text-lg font-bold font-display tracking-tight text-white">{system.name}</h1>
               <p className="text-xs text-slate-400 truncate max-w-[300px]">{system.description}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button
               onClick={() => setIs3D(!is3D)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${is3D ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
             >
               <Box size={14} /> 3D MODE
             </button>

             <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
               <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                title={isPlaying ? "Pause Animation" : "Play Animation"}
               >
                 {isPlaying ? <Pause size={18} /> : <Play size={18} />}
               </button>
               <div className="w-px h-4 bg-slate-700 mx-1"></div>
               <span className="text-xs font-mono text-slate-500 px-2">SPEED</span>
               <input 
                 type="range" 
                 min="0" max="3" step="0.1" 
                 value={timeScale}
                 onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                 className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
             </div>

             <button 
               onClick={handleDownload}
               className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg transition-all text-sm font-medium"
             >
               <Download size={16} /> Export SVG
             </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 bg-[#0f172a] relative p-8 flex items-center justify-center">
            <LogoCanvas system={system} isPlaying={isPlaying} timeScale={timeScale} is3D={is3D} />
            
            {/* Floating AI Panel */}
            <div className="absolute top-8 left-8 w-80 z-20 flex flex-col gap-4">
              <AIPrompt 
                onSystemGenerated={(newSystem) => {
                  setSystem(newSystem);
                  setSelectedLayerId(newSystem.layers[0]?.id || null);
                }} 
                onEnable3D={() => setIs3D(true)}
              />

              {/* Quick Presets Toggle */}
              <button 
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors bg-slate-900/50 p-2 rounded border border-slate-800 w-fit"
              >
                <Grid size={12} /> {showPresets ? "Hide Presets" : "Show Presets"}
              </button>
              
              {showPresets && (
                <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSystem(preset);
                        setSelectedLayerId(preset.layers[0]?.id || null);
                      }}
                      className="text-left p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
                    >
                      <div className="text-sm font-bold text-slate-200">{preset.name}</div>
                      <div className="text-xs text-slate-500 truncate">{preset.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Canvas Info Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col items-end pointer-events-none">
               <div className="text-[10px] text-slate-600 font-mono mb-1">PARAMETRIC ENGINE V1.0</div>
               <div className="flex gap-1">
                 {[1,2,3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-900'}`} style={{animationDelay: `${i*0.2}s`}}/>)}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;