import React, { useRef, useEffect, useState } from 'react';
import { AudioRosePoint } from '../types';
import { Radio, Volume2, VolumeX, Cpu, Zap, Activity } from 'lucide-react';

interface AudioRoseSpectrumProps {
  rosePoints: AudioRosePoint[];
  tauCongestion: number; // 0.00 to 1.00
  audioSpikeFrequency: number;
  audioAmplitude: number;
  isLive: boolean;
}

export const AudioRoseSpectrum: React.FC<AudioRoseSpectrumProps> = ({
  rosePoints,
  tauCongestion,
  audioSpikeFrequency,
  audioAmplitude,
  isLive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'polar' | 'waveform'>('polar');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Tone generation effect if user enables audio feedback
  useEffect(() => {
    if (audioEnabled && isLive) {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!oscRef.current) {
        oscRef.current = ctx.createOscillator();
        gainRef.current = ctx.createGain();
        oscRef.current.type = 'sine';
        gainRef.current.gain.value = 0.05; // Soft safe audio tone
        oscRef.current.connect(gainRef.current);
        gainRef.current.connect(ctx.destination);
        oscRef.current.start();
      }

      if (oscRef.current && ctx) {
        // Map spike frequency safely to audible range 220Hz - 880Hz
        const mappedFreq = Math.min(1200, Math.max(150, audioSpikeFrequency));
        oscRef.current.frequency.setTargetAtTime(mappedFreq, ctx.currentTime, 0.05);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    }

    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    };
  }, [audioEnabled, isLive, audioSpikeFrequency]);

  // Canvas drawing effect for Audio Rose Spectrum
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = '#0B0C0E';
    ctx.fillRect(0, 0, width, height);

    if (viewMode === 'polar') {
      // Draw Polar Audio Rose Grid
      const maxRadius = Math.min(centerX, centerY) - 25;

      // Concentric circles
      ctx.strokeStyle = '#333538';
      ctx.lineWidth = 1;
      for (let r = 30; r <= maxRadius; r += 30) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radial spoke lines
      for (let a = 0; a < 360; a += 45) {
        const rad = (a * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
        ctx.stroke();
      }

      // Draw Rose Spectrum Shape
      if (rosePoints.length > 0) {
        ctx.beginPath();
        rosePoints.forEach((pt, idx) => {
          const angleRad = (pt.angle * Math.PI) / 180;
          const r = (pt.radius / 100) * maxRadius;
          const x = centerX + Math.cos(angleRad) * r;
          const y = centerY + Math.sin(angleRad) * r;

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();

        // Rose Gradient Fill
        const roseGrad = ctx.createRadialGradient(
          centerX, centerY, 5,
          centerX, centerY, maxRadius
        );
        roseGrad.addColorStop(0, 'rgba(255, 78, 0, 0.5)');
        roseGrad.addColorStop(0.7, 'rgba(255, 78, 0, 0.25)');
        roseGrad.addColorStop(1, 'rgba(209, 209, 209, 0.05)');

        ctx.fillStyle = roseGrad;
        ctx.fill();
        ctx.strokeStyle = '#FF4E00'; // Editorial Flame Orange border
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight Tau Spikes
        rosePoints.forEach((pt) => {
          if (pt.isSpike) {
            const angleRad = (pt.angle * Math.PI) / 180;
            const r = (pt.radius / 100) * maxRadius;
            const x = centerX + Math.cos(angleRad) * r;
            const y = centerY + Math.sin(angleRad) * r;

            // Pulsing spike marker
            ctx.fillStyle = '#FF4E00';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Spike halo
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      }
    } else {
      // Oscilloscope Waveform View
      ctx.strokeStyle = '#333538';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      ctx.beginPath();
      rosePoints.forEach((pt, idx) => {
        const x = (idx / (rosePoints.length - 1)) * width;
        const waveY = centerY + Math.sin((pt.angle * Math.PI) / 180 * 2) * (pt.radius * 0.8);
        if (idx === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      });
      ctx.strokeStyle = '#FF4E00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // HUD Text overlay
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#D1D1D1';
    ctx.fillText(`SPIKE FREQ: ${audioSpikeFrequency.toFixed(0)} Hz`, 15, 20);
    ctx.fillText(`AMP: ${audioAmplitude.toFixed(1)} dB`, 15, 34);

    ctx.fillStyle = tauCongestion > 0.6 ? '#FF4E00' : '#D1D1D1';
    ctx.fillText(`TAU CONGESTION (μ): ${(tauCongestion * 100).toFixed(1)}%`, width - 170, 20);

  }, [rosePoints, tauCongestion, audioSpikeFrequency, audioAmplitude, viewMode]);

  return (
    <div className="bg-[#1A1C1E] border border-[#333538] p-5 flex flex-col justify-between h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-[#333538] pb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#FF4E00]" />
          <div>
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
              Audio-Rose & Tau Spectrum
            </h2>
            <p className="text-[10px] text-[#D1D1D1]/50 font-mono uppercase tracking-wider">
              Acoustic Turbulence • Tau Memory Well (μ)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 border text-xs transition-colors ${
              audioEnabled
                ? 'bg-[#FF4E00] text-black border-[#FF4E00]'
                : 'bg-[#0B0C0E] text-[#D1D1D1]/60 border-[#333538]'
            }`}
            title="Toggle Synthesized Audio Tone"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'polar' ? 'waveform' : 'polar')}
            className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-[#0B0C0E] text-[#D1D1D1] border border-[#333538] hover:border-[#FF4E00] transition-colors"
          >
            {viewMode === 'polar' ? 'Polar Rose' : 'Oscilloscope'}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 bg-[#0B0C0E] overflow-hidden border border-[#333538] flex items-center justify-center min-h-[200px]">
        <canvas
          ref={canvasRef}
          width={400}
          height={220}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Tau Memory Congestion Well Meter */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-[#D1D1D1]/50 text-[10px] uppercase tracking-[0.2em] flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>Tau Congestion Well (μ)</span>
          </span>
          <span className={tauCongestion > 0.6 ? 'text-[#FF4E00] font-bold' : 'text-white font-bold'}>
            {(tauCongestion * 100).toFixed(1)}%
          </span>
        </div>

        <div className="w-full h-1.5 bg-[#0B0C0E] overflow-hidden border border-[#333538]">
          <div
            className="h-full bg-[#FF4E00] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, tauCongestion * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
