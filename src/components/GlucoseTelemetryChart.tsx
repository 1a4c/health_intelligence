import React from 'react';
import { GlucosePoint } from '../types';
import { Activity, ShieldAlert, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface GlucoseTelemetryChartProps {
  data: GlucosePoint[];
  currentGlucose: number;
  baseline: number;
  turbulenceWeight: number;
  healthEvents: string[];
}

export const GlucoseTelemetryChart: React.FC<GlucoseTelemetryChartProps> = ({
  data,
  currentGlucose,
  baseline,
  turbulenceWeight,
  healthEvents,
}) => {
  // Glucose Status calculation
  const getStatus = (val: number) => {
    if (val < 70) return { label: 'HYPOGLYCEMIC', color: 'text-amber-400 bg-[#0B0C0E] border-amber-600/60' };
    if (val > 140) return { label: 'HYPERGLYCEMIC', color: 'text-[#FF4E00] bg-[#0B0C0E] border-[#FF4E00]' };
    return { label: 'OPTIMAL RANGE', color: 'text-[#D1D1D1] bg-[#0B0C0E] border-[#333538]' };
  };

  const status = getStatus(currentGlucose);

  return (
    <div className="bg-[#1A1C1E] border border-[#333538] p-5 flex flex-col justify-between h-full shadow-2xl">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 border-b border-[#333538] pb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#D1D1D1]/50 font-mono mb-1">
            Glucose Level Telemetry
          </div>
          <div className="text-4xl font-light text-white font-mono tracking-tight flex items-baseline">
            {currentGlucose.toFixed(1)}
            <span className="text-xs text-[#D1D1D1]/50 ml-1.5 font-sans uppercase tracking-widest">mg/dL</span>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className={`px-3 py-1 text-[10px] font-mono tracking-widest font-bold border uppercase ${status.color}`}>
          {status.label}
        </div>
      </div>

      {/* Chart Graphic Area */}
      <div className="w-full h-[220px] bg-[#0B0C0E] p-2 border border-[#333538]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4E00" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF4E00" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#333538" />
            <XAxis dataKey="time" stroke="#D1D1D1" tick={{ fontSize: 9, fill: '#D1D1D1', opacity: 0.5 }} />
            <YAxis
              domain={[50, 180]}
              stroke="#D1D1D1"
              tick={{ fontSize: 9, fill: '#D1D1D1', opacity: 0.5 }}
              unit=" "
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pData = payload[0].payload as GlucosePoint;
                  return (
                    <div className="bg-[#1A1C1E] border border-[#FF4E00] p-3 text-xs font-mono shadow-2xl">
                      <div className="text-[#FF4E00] font-bold mb-1 uppercase tracking-wider">{label}</div>
                      <div className="text-white">
                        Glucose: <strong className="text-[#FF4E00]">{pData.glucoseLevel.toFixed(1)} mg/dL</strong>
                      </div>
                      <div className="text-[#D1D1D1]/60">
                        Baseline: {pData.baseline.toFixed(1)} mg/dL
                      </div>
                      <div className="text-amber-400 mt-0.5">
                        Turbulence Weight: {pData.turbulenceWeight.toFixed(3)}
                      </div>
                      {pData.healthEvent && (
                        <div className="mt-1 pt-1 border-t border-[#333538] text-[#FF4E00] font-bold flex items-center space-x-1 uppercase">
                          <AlertTriangle className="w-3 h-3 inline" />
                          <span>{pData.healthEvent}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Target Normal Zone Limits */}
            <ReferenceLine y={130} stroke="#FF4E00" strokeDasharray="3 3" label={{ value: 'Hyper (130)', fill: '#FF4E00', fontSize: 9 }} />
            <ReferenceLine y={70} stroke="#FF4E00" strokeDasharray="3 3" label={{ value: 'Hypo (70)', fill: '#FF4E00', fontSize: 9 }} />

            {/* Glucose Area */}
            <Area
              type="monotone"
              dataKey="glucoseLevel"
              name="Glucose Level"
              stroke="#FF4E00"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#glucoseGradient)"
            />

            {/* Baseline Target Line */}
            <Line
              type="monotone"
              dataKey="baseline"
              name="Target Baseline"
              stroke="#D1D1D1"
              strokeDasharray="4 4"
              dot={false}
            />

            {/* Turbulence Weight Line overlay */}
            <Line
              type="monotone"
              dataKey={(d) => d.turbulenceWeight * 50 + 50}
              name="Turbulence Weight"
              stroke="#e11d48"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mt-4 font-mono text-xs">
        <div className="bg-[#0B0C0E] p-3 border border-[#333538]">
          <span className="text-[9px] uppercase tracking-widest text-[#D1D1D1]/40 block mb-1">Target Baseline</span>
          <span className="text-white font-bold text-sm">{baseline.toFixed(0)} mg/dL</span>
        </div>

        <div className="bg-[#0B0C0E] p-3 border border-[#333538]">
          <span className="text-[9px] uppercase tracking-widest text-[#D1D1D1]/40 block mb-1">Turbulence Weight</span>
          <span className={turbulenceWeight > 0.4 ? 'text-[#FF4E00] font-bold text-sm' : 'text-white font-bold text-sm'}>
            {turbulenceWeight.toFixed(3)}
          </span>
        </div>

        <div className="bg-[#0B0C0E] p-3 border border-[#333538]">
          <span className="text-[9px] uppercase tracking-widest text-[#D1D1D1]/40 block mb-1">Matched Events</span>
          <span className="text-[#FF4E00] font-bold text-sm">
            {healthEvents.length > 0 ? `${healthEvents.length} Active` : '0 Clean'}
          </span>
        </div>
      </div>
    </div>
  );
};
