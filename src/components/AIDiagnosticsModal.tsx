import React from 'react';
import { DiagnosticReport } from '../types';
import { Sparkles, X, CheckCircle, AlertTriangle, ShieldCheck, Download, Cpu, Activity, Eye } from 'lucide-react';

interface AIDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DiagnosticReport | null;
  isLoading: boolean;
  error: string | null;
}

export const AIDiagnosticsModal: React.FC<AIDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-[#0B0C0E] text-[#FF4E00] border-[#FF4E00]';
      case 'Elevated':
        return 'bg-[#0B0C0E] text-amber-400 border-amber-600/60';
      case 'Moderate':
        return 'bg-[#0B0C0E] text-yellow-300 border-yellow-500/60';
      case 'Low':
        return 'bg-[#0B0C0E] text-[#D1D1D1] border-[#333538]';
      default:
        return 'bg-[#0B0C0E] text-[#D1D1D1] border-[#333538]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#1A1C1E] border border-[#333538] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#333538] flex items-center justify-between bg-[#1A1C1E]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0B0C0E] border border-[#FF4E00] text-[#FF4E00]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-white">
                Gemini AI Telemetry Diagnostic Report
              </h2>
              <p className="text-[10px] text-[#D1D1D1]/50 font-mono uppercase tracking-widest mt-0.5">
                Model: gemini-3.6-flash • Ocular & Biosensor Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#0B0C0E] text-[#D1D1D1] hover:text-[#FF4E00] border border-[#333538] hover:border-[#FF4E00] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#D1D1D1]">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-[#FF4E00]/20 border-t-[#FF4E00] rounded-full animate-spin" />
              <p className="text-xs font-mono uppercase tracking-widest text-[#FF4E00] animate-pulse">
                Evaluating Pupil Dynamics, Glucose & Tau Congestion...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-[#0B0C0E] border border-[#FF4E00] text-[#FF4E00] text-xs flex items-start space-x-3 font-mono uppercase">
              <AlertTriangle className="w-5 h-5 text-[#FF4E00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Diagnostic Evaluation Failed</p>
                <p className="text-[11px] text-[#D1D1D1]/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {report && !isLoading && (
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="p-4 bg-[#0B0C0E] border border-[#333538] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#D1D1D1]/40 font-mono block">Primary AI Assessment</span>
                  <h3 className="text-lg font-black uppercase text-white mt-0.5">{report.diagnosisTitle}</h3>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase font-bold border ${getRiskColor(report.riskLevel)}`}>
                    Risk: {report.riskLevel}
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[9px] uppercase tracking-widest text-[#D1D1D1]/40 block">Stability</span>
                    <span className="text-sm font-bold text-[#FF4E00]">{report.neuralStabilityScore}%</span>
                  </div>
                </div>
              </div>

              {/* Clinical Synthesis */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-[#FF4E00] uppercase tracking-[0.2em] mb-2">
                  Clinical & Physiological Synthesis
                </h4>
                <p className="text-xs text-[#D1D1D1] leading-relaxed bg-[#0B0C0E] p-4 border border-[#333538]">
                  {report.summary}
                </p>
              </div>

              {/* Key Observations */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em] mb-2">
                  Key Sensor Observations
                </h4>
                <div className="space-y-2">
                  {report.keyObservations.map((obs, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 bg-[#0B0C0E] border border-[#333538] text-xs text-[#D1D1D1]"
                    >
                      <Eye className="w-4 h-4 text-[#FF4E00] flex-shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-[#FF4E00] uppercase tracking-[0.2em] mb-2">
                  Protocol Recommendations
                </h4>
                <div className="space-y-2">
                  {report.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 bg-[#0B0C0E] border border-[#333538] text-xs text-[#D1D1D1]"
                    >
                      <CheckCircle className="w-4 h-4 text-[#FF4E00] flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#333538] bg-[#1A1C1E] flex justify-between items-center text-xs font-mono text-[#D1D1D1]/50">
          <span>{report ? `Generated: ${report.timestamp}` : ''}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FF4E00] text-black font-bold text-[10px] font-mono tracking-widest uppercase hover:bg-orange-500 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
