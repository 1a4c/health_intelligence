import React from 'react';
import { ControlsState } from '../types';
import { Sliders, Zap, AlertTriangle, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface TelemetryControlPanelProps {
  controls: ControlsState;
  setControls: React.Dispatch<React.SetStateAction<ControlsState>>;
  onInjectEvent: (type: 'glucose' | 'turbulence' | 'pupil' | 'tau') => void;
}

export const TelemetryControlPanel: React.FC<TelemetryControlPanelProps> = ({
  controls,
  setControls,
  onInjectEvent,
}) => {
  return (
    <div className="bg-[#1A1C1E] border border-[#333538] p-5 shadow-2xl flex flex-col justify-between h-full">
      <div className="flex items-center space-x-2 mb-4 border-b border-[#333538] pb-3">
        <Sliders className="w-4 h-4 text-[#FF4E00]" />
        <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
          Telemetry & Biosensor Controls
        </h2>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        {/* Glucose Target */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#D1D1D1]/50 text-[10px] uppercase tracking-wider">Target Glucose Baseline</span>
            <span className="text-[#FF4E00] font-bold">{controls.targetGlucose} mg/dL</span>
          </div>
          <input
            type="range"
            min={70}
            max={160}
            value={controls.targetGlucose}
            onChange={(e) =>
              setControls((prev) => ({ ...prev, targetGlucose: Number(e.target.value) }))
            }
            className="w-full h-1 bg-[#0B0C0E] border border-[#333538] appearance-none cursor-pointer accent-[#FF4E00]"
          />
        </div>

        {/* Turbulence Bias */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#D1D1D1]/50 text-[10px] uppercase tracking-wider">CV2 Turbulence Weight</span>
            <span className={controls.turbulenceBias > 0.5 ? 'text-[#FF4E00] font-bold' : 'text-white font-bold'}>
              {controls.turbulenceBias.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={controls.turbulenceBias}
            onChange={(e) =>
              setControls((prev) => ({ ...prev, turbulenceBias: Number(e.target.value) }))
            }
            className="w-full h-1 bg-[#0B0C0E] border border-[#333538] appearance-none cursor-pointer accent-[#FF4E00]"
          />
        </div>

        {/* Pupil Sensitivity */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#D1D1D1]/50 text-[10px] uppercase tracking-wider">Pupil Response Gain</span>
            <span className="text-[#FF4E00] font-bold">{controls.pupilSensitivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={2.0}
            step={0.1}
            value={controls.pupilSensitivity}
            onChange={(e) =>
              setControls((prev) => ({ ...prev, pupilSensitivity: Number(e.target.value) }))
            }
            className="w-full h-1 bg-[#0B0C0E] border border-[#333538] appearance-none cursor-pointer accent-[#FF4E00]"
          />
        </div>

        {/* Tau Congestion */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[#D1D1D1]/50 text-[10px] uppercase tracking-wider">Tau Memory Congestion (μ)</span>
            <span className="text-white font-bold">{(controls.tauCongestionLevel * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={controls.tauCongestionLevel}
            onChange={(e) =>
              setControls((prev) => ({ ...prev, tauCongestionLevel: Number(e.target.value) }))
            }
            className="w-full h-1 bg-[#0B0C0E] border border-[#333538] appearance-none cursor-pointer accent-[#FF4E00]"
          />
        </div>
      </div>

      {/* Simulated Event Injector */}
      <div className="mt-5 pt-4 border-t border-[#333538]">
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#D1D1D1]/50 block mb-2.5 font-semibold">
          Simulated Health Event Injector
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={() => onInjectEvent('glucose')}
            className="p-2.5 bg-[#0B0C0E] border border-[#333538] hover:border-[#FF4E00] text-white hover:text-[#FF4E00] flex items-center justify-center space-x-2 transition-colors text-[10px] uppercase tracking-widest"
          >
            <Activity className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>Glucose Surge</span>
          </button>

          <button
            onClick={() => onInjectEvent('pupil')}
            className="p-2.5 bg-[#0B0C0E] border border-[#333538] hover:border-[#FF4E00] text-white hover:text-[#FF4E00] flex items-center justify-center space-x-2 transition-colors text-[10px] uppercase tracking-widest"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>Pupil Spasm</span>
          </button>

          <button
            onClick={() => onInjectEvent('turbulence')}
            className="p-2.5 bg-[#0B0C0E] border border-[#333538] hover:border-[#FF4E00] text-white hover:text-[#FF4E00] flex items-center justify-center space-x-2 transition-colors text-[10px] uppercase tracking-widest"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>Acoustic Spike</span>
          </button>

          <button
            onClick={() => onInjectEvent('tau')}
            className="p-2.5 bg-[#0B0C0E] border border-[#333538] hover:border-[#FF4E00] text-white hover:text-[#FF4E00] flex items-center justify-center space-x-2 transition-colors text-[10px] uppercase tracking-widest"
          >
            <Cpu className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>Tau Congestion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
