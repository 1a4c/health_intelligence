import React from 'react';
import { Eye, RefreshCw, Download, Sparkles, Sliders, ShieldAlert, Activity } from 'lucide-react';

interface HeaderProps {
  isLive: boolean;
  setIsLive: (val: boolean) => void;
  currentFrame: number;
  totalEvents: number;
  onRunDiagnostics: () => void;
  isAnalyzing: boolean;
  onExportLogs: () => void;
  onResetData: () => void;
  activeMode: 'all' | 'ocular' | 'glucose' | 'audio-tau';
  setActiveMode: (mode: 'all' | 'ocular' | 'glucose' | 'audio-tau') => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  setIsLive,
  currentFrame,
  totalEvents,
  onRunDiagnostics,
  isAnalyzing,
  onExportLogs,
  onResetData,
  activeMode,
  setActiveMode,
}) => {
  return (
    <header className="bg-[#0B0C0E] border-b border-[#333538] text-[#D1D1D1] px-4 py-5 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        {/* Brand & Subtitle (Editorial Style) */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase">
              Etched Sensed
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[#1A1C1E] text-[#FF4E00] border border-[#FF4E00]/40">
              GOLF_KERNEL
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-[#D1D1D1]/50 uppercase flex items-center space-x-2">
            <span>PROTOCOL: ETCHED_SENSED_VIRAL_TUBE.KERNEL.MOUNTED</span>
            <span>//</span>
            <span>EVENTS: <strong className="text-white font-mono">{totalEvents}</strong></span>
          </p>
        </div>

        {/* Query Index & View Modes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r border-[#FF4E00] sm:pr-4 pl-3 sm:pl-0">
            <div className="text-2xl font-serif italic text-[#FF4E00] leading-none">
              Query #{currentFrame}
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#D1D1D1]/60 font-mono mt-0.5">
              Pupil_Trajected_Index
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 bg-[#1A1C1E] p-1 border border-[#333538] text-[10px] uppercase tracking-wider font-mono">
            <button
              onClick={() => setActiveMode('all')}
              className={`px-3 py-1.5 transition-colors ${
                activeMode === 'all'
                  ? 'bg-[#FF4E00] text-black font-bold'
                  : 'text-[#D1D1D1]/70 hover:text-white hover:bg-[#333538]'
              }`}
            >
              All Systems
            </button>
            <button
              onClick={() => setActiveMode('ocular')}
              className={`px-3 py-1.5 transition-colors ${
                activeMode === 'ocular'
                  ? 'bg-[#FF4E00] text-black font-bold'
                  : 'text-[#D1D1D1]/70 hover:text-white hover:bg-[#333538]'
              }`}
            >
              Ocular Pupil
            </button>
            <button
              onClick={() => setActiveMode('glucose')}
              className={`px-3 py-1.5 transition-colors ${
                activeMode === 'glucose'
                  ? 'bg-[#FF4E00] text-black font-bold'
                  : 'text-[#D1D1D1]/70 hover:text-white hover:bg-[#333538]'
              }`}
            >
              Glucose
            </button>
            <button
              onClick={() => setActiveMode('audio-tau')}
              className={`px-3 py-1.5 transition-colors ${
                activeMode === 'audio-tau'
                  ? 'bg-[#FF4E00] text-black font-bold'
                  : 'text-[#D1D1D1]/70 hover:text-white hover:bg-[#333538]'
              }`}
            >
              Audio / Tau
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Live stream toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center space-x-2 px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase border transition-all ${
              isLive
                ? 'bg-[#1A1C1E] text-[#FF4E00] border-[#FF4E00]'
                : 'bg-[#1A1C1E] text-amber-400 border-amber-600/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-[#FF4E00] animate-ping' : 'bg-amber-400'
              }`}
            />
            <span>{isLive ? 'STREAM LIVE' : 'PAUSED'}</span>
          </button>

          {/* AI Diagnostics button */}
          <button
            onClick={onRunDiagnostics}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-[10px] font-mono tracking-widest uppercase font-bold bg-[#FF4E00] text-black hover:bg-orange-500 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'ANALYZING...' : 'AI DIAGNOSTICS'}</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetData}
            title="Reset telemetry stream"
            className="p-1.5 bg-[#1A1C1E] text-[#D1D1D1] hover:text-white border border-[#333538] hover:border-[#FF4E00] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export logs */}
          <button
            onClick={onExportLogs}
            title="Export CSV logs"
            className="p-1.5 bg-[#1A1C1E] text-[#D1D1D1] hover:text-white border border-[#333538] hover:border-[#FF4E00] transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

