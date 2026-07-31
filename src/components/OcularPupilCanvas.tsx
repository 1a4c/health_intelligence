import React, { useRef, useEffect, useState } from 'react';
import { PupilScanData } from '../types';
import { Eye, Crosshair, Zap, Sliders, Maximize2, ShieldCheck, RefreshCw } from 'lucide-react';

interface OcularPupilCanvasProps {
  pupilData: PupilScanData;
  onStimulusFlash: () => void;
  isLive: boolean;
  frameIndex: number;
  setFrameIndex: (idx: number) => void;
  turbulenceWeight: number;
  pupilAsymmetry: number;
}

export const OcularPupilCanvas: React.FC<OcularPupilCanvasProps> = ({
  pupilData,
  onStimulusFlash,
  isLive,
  frameIndex,
  setFrameIndex,
  turbulenceWeight,
  pupilAsymmetry,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [interactiveGaze, setInteractiveGaze] = useState<{ x: number; y: number } | null>(null);
  const [showPigmentGrid, setShowPigmentGrid] = useState(true);
  const [showGazeVector, setShowGazeVector] = useState(true);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0B0C0E'; // Editorial matte dark background
    ctx.fillRect(0, 0, width, height);

    // Grid lines (CV2 Frame Matrix)
    ctx.strokeStyle = '#333538';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer Sclera Outline
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 150, 85, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 78, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Iris Radius
    const irisRadius = 75;
    
    // Gaze target position
    const gazeOffsetX = interactiveGaze ? interactiveGaze.x - centerX : pupilData.gazeX * 0.8;
    const gazeOffsetY = interactiveGaze ? interactiveGaze.y - centerY : pupilData.gazeY * 0.8;

    const irisX = centerX + gazeOffsetX * 0.4;
    const irisY = centerY + gazeOffsetY * 0.4;

    // Iris Gradient & Halo Pigment Orientation
    const irisGrad = ctx.createRadialGradient(
      irisX, irisY, 10,
      irisX, irisY, irisRadius
    );
    irisGrad.addColorStop(0, '#FF4E00'); // Editorial Flame
    irisGrad.addColorStop(0.5, '#9a3000'); // Deep amber rust
    irisGrad.addColorStop(0.85, '#26282b'); // Dark metallic charcoal
    irisGrad.addColorStop(1, '#0B0C0E'); // Edge ring

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 150, 85, 0, 0, Math.PI * 2);
    ctx.clip(); // Keep iris inside sclera bounds

    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF4E00';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Halo Pigment Rays (Halo_pigment_orientated)
    if (showPigmentGrid) {
      const rayCount = 36;
      ctx.strokeStyle = 'rgba(209, 209, 209, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i * Math.PI * 2) / rayCount;
        const x1 = irisX + Math.cos(angle) * (pupilData.pupilRadius + 4);
        const y1 = irisY + Math.sin(angle) * (pupilData.pupilRadius + 4);
        const x2 = irisX + Math.cos(angle) * (irisRadius - 5);
        const y2 = irisY + Math.sin(angle) * (irisRadius - 5);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Pupil (cv2 pupil scanned & fitted boundary)
    const pupilRadiusPixel = Math.max(8, Math.min(50, pupilData.pupilRadius * 3.8));
    ctx.fillStyle = '#0B0C0E'; // Pitch dark pupil
    ctx.beginPath();
    ctx.arc(irisX, irisY, pupilRadiusPixel, 0, Math.PI * 2);
    ctx.fill();

    // Pupil Fitted Edge Ring
    ctx.strokeStyle = pupilAsymmetry > 12 ? '#FF4E00' : '#D1D1D1';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Light Reflection Catchlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(irisX - pupilRadiusPixel * 0.35, irisY - pupilRadiusPixel * 0.35, Math.max(2, pupilRadiusPixel * 0.22), 0, Math.PI * 2);
    ctx.fill();

    // Gaze Trajectory Vector
    if (showGazeVector) {
      const gazeLength = 120;
      const angleRad = (pupilData.gazeAngle * Math.PI) / 180;
      const endX = irisX + Math.cos(angleRad) * gazeLength;
      const endY = irisY + Math.sin(angleRad) * gazeLength;

      ctx.beginPath();
      ctx.moveTo(irisX, irisY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#FF4E00'; // Editorial Flame Orange
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vector Arrowhead
      ctx.fillStyle = '#FF4E00';
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label on Gaze Vector
      ctx.font = '10px monospace';
      ctx.fillStyle = '#FF4E00';
      ctx.fillText(`θ=${pupilData.gazeAngle.toFixed(1)}°`, endX + 6, endY - 4);
    }

    ctx.restore(); // Restore sclera clip

    // Crosshair HUD Target (Pupil centroid lock)
    ctx.strokeStyle = 'rgba(255, 78, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(irisX - 25, irisY);
    ctx.lineTo(irisX + 25, irisY);
    ctx.moveTo(irisX, irisY - 25);
    ctx.lineTo(irisX, irisY + 25);
    ctx.stroke();

    // Corner HUD Target Reticle Boxes
    ctx.strokeStyle = '#333538';
    const boxSize = 20;
    const margin = 15;
    ctx.strokeRect(margin, margin, boxSize, boxSize);
    ctx.strokeRect(width - margin - boxSize, margin, boxSize, boxSize);
    ctx.strokeRect(margin, height - margin - boxSize, boxSize, boxSize);
    ctx.strokeRect(width - margin - boxSize, height - margin - boxSize, boxSize, boxSize);

    // HUD Text Overlay
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = '#D1D1D1';
    ctx.fillText(`FRAME: #${frameIndex} / 1080`, 20, 28);
    ctx.fillText(`PUPIL DIA: ${pupilData.pupilDilation.toFixed(2)} mm`, 20, 44);
    ctx.fillText(`ASYMMETRY: ${pupilAsymmetry.toFixed(1)}%`, 20, 60);

    ctx.fillStyle = turbulenceWeight > 0.45 ? '#FF4E00' : '#D1D1D1';
    ctx.fillText(`CV2 TURBULENCE WT: ${turbulenceWeight.toFixed(3)}`, width - 210, 28);
    ctx.fillText(`PIGMENT HALO INT: ${pupilData.pigmentIntensity}%`, width - 210, 44);

  }, [pupilData, interactiveGaze, showPigmentGrid, showGazeVector, frameIndex, turbulenceWeight, pupilAsymmetry]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setInteractiveGaze({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  const handleMouseLeave = () => {
    setInteractiveGaze(null);
  };

  return (
    <div className="bg-[#1A1C1E] border border-[#333538] p-5 flex flex-col justify-between h-full shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 border-b border-[#333538] pb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-[#FF4E00]" />
          <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
            Ocular Pupil Scanner <span className="opacity-40">// CV2 Kernel</span>
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPigmentGrid(!showPigmentGrid)}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase border transition-colors ${
              showPigmentGrid
                ? 'bg-[#FF4E00] text-black font-bold border-[#FF4E00]'
                : 'bg-[#0B0C0E] text-[#D1D1D1]/60 border-[#333538]'
            }`}
            title="Toggle Iris Pigment Radial Rays"
          >
            Halo Grid
          </button>
          <button
            onClick={() => setShowGazeVector(!showGazeVector)}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase border transition-colors ${
              showGazeVector
                ? 'bg-[#FF4E00] text-black font-bold border-[#FF4E00]'
                : 'bg-[#0B0C0E] text-[#D1D1D1]/60 border-[#333538]'
            }`}
            title="Toggle Gaze Vector Angle Line"
          >
            Gaze Vector
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 bg-[#0B0C0E] overflow-hidden border border-[#333538] flex items-center justify-center min-h-[280px]">
        <canvas
          ref={canvasRef}
          width={520}
          height={320}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full object-contain cursor-crosshair"
        />
        {/* Interactive Pointer Hint Overlay */}
        <div className="absolute bottom-2 left-2 text-[9px] font-mono tracking-widest uppercase text-[#D1D1D1]/50 bg-[#1A1C1E] px-2 py-1 border border-[#333538]">
          Gaze Control Matrix
        </div>
      </div>

      {/* Frame Scrubber & Stimulus Bar */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#D1D1D1]/50">
            <Sliders className="w-3.5 h-3.5 text-[#FF4E00]" />
            <span>Frame Scrubber Query</span>
          </span>
          <span className="text-[#FF4E00] font-bold tracking-widest">#{frameIndex} / 1080</span>
        </div>
        <input
          type="range"
          min={0}
          max={1080}
          value={frameIndex}
          onChange={(e) => setFrameIndex(Number(e.target.value))}
          className="w-full h-1 bg-[#0B0C0E] border border-[#333538] appearance-none cursor-pointer accent-[#FF4E00]"
        />

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={onStimulusFlash}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-[10px] font-mono tracking-widest uppercase font-bold bg-[#1A1C1E] text-[#FF4E00] border border-[#FF4E00] hover:bg-[#FF4E00] hover:text-black transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Light Stimulus Flash</span>
          </button>
          
          <div className="text-right text-[10px] font-mono tracking-widest uppercase text-[#D1D1D1]/60">
            <span className={pupilAsymmetry > 15 ? 'text-[#FF4E00] font-bold' : 'text-[#D1D1D1]/80'}>
              {pupilAsymmetry > 15 ? '⚠️ Asymmetrical' : 'Symmetry Normal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
