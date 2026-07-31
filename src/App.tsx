import React, { useState, useEffect, useRef } from 'react';
import {
  PupilScanData,
  GlucosePoint,
  AudioRosePoint,
  DiagnosticReport,
  HealthEventLog,
  ControlsState,
} from './types';
import { Header } from './components/Header';
import { OcularPupilCanvas } from './components/OcularPupilCanvas';
import { GlucoseTelemetryChart } from './components/GlucoseTelemetryChart';
import { AudioRoseSpectrum } from './components/AudioRoseSpectrum';
import { TelemetryControlPanel } from './components/TelemetryControlPanel';
import { AIDiagnosticsModal } from './components/AIDiagnosticsModal';
import { EventLogTable } from './components/EventLogTable';

export default function App() {
  const [isLive, setIsLive] = useState(true);
  const [frameIndex, setFrameIndex] = useState(720);
  const [activeMode, setActiveMode] = useState<'all' | 'ocular' | 'glucose' | 'audio-tau'>('all');

  // Controls state
  const [controls, setControls] = useState<ControlsState>({
    isLive: true,
    simulationSpeed: 1,
    targetGlucose: 105,
    turbulenceBias: 0.18,
    pupilSensitivity: 1.0,
    tauCongestionLevel: 0.25,
    selectedMode: 'all',
  });

  // Pupil Scan State
  const [pupilData, setPupilData] = useState<PupilScanData>({
    frameIndex: 720,
    pupilDilation: 4.2,
    pupilAsymmetry: 4.1,
    gazeAngle: 42.5,
    gazeX: 10,
    gazeY: -5,
    pupilRadius: 18,
    pigmentIntensity: 84,
    turbulenceWeight: 0.18,
  });

  // Glucose Stream State
  const [glucoseHistory, setGlucoseHistory] = useState<GlucosePoint[]>(() => {
    const initial: GlucosePoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      const timeStr = t.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const val = 105 + Math.sin(i * 0.4) * 8 + (Math.random() - 0.5) * 4;
      initial.push({
        time: timeStr,
        timestamp: now - i * 3000,
        glucoseLevel: val,
        baseline: 105,
        turbulenceWeight: 0.18,
      });
    }
    return initial;
  });

  // Audio Rose Spectrum State
  const [rosePoints, setRosePoints] = useState<AudioRosePoint[]>(() => {
    const pts: AudioRosePoint[] = [];
    for (let angle = 0; angle < 360; angle += 10) {
      const rad = (angle * Math.PI) / 180;
      const baseR = 50 + Math.sin(rad * 4) * 20;
      pts.push({
        angle,
        radius: baseR,
        frequency: 440 + angle * 2,
        amplitude: baseR * 0.8,
        isSpike: angle === 90 || angle === 270,
      });
    }
    return pts;
  });

  // Health Event Logs
  const [eventLogs, setEventLogs] = useState<HealthEventLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      frameIndex: 720,
      eventType: 'Matched Health Event',
      description: 'System initialization handshake: GCU-concrete_octo-leashed block calibrated.',
      severity: 'info',
      value: 'Tau 0.25',
    },
  ]);

  // AI Diagnostic Modal state
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);

  // Live simulation ticker effect
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setFrameIndex((prevIdx) => (prevIdx >= 1080 ? 0 : prevIdx + 1));

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // 1. Update Pupil Data
      const tick = Date.now() / 1000;
      const calcDilation = 4.0 + Math.sin(tick * 1.5) * 1.2 * controls.pupilSensitivity;
      const calcAsymmetry = 3.5 + (Math.sin(tick * 0.8) > 0.7 ? 12 : 0) + controls.turbulenceBias * 8;
      const calcAngle = (Math.sin(tick * 0.5) * 60 + 180) % 360;
      const calcGazeX = Math.cos(tick) * 45;
      const calcGazeY = Math.sin(tick * 1.2) * 25;

      setPupilData({
        frameIndex: frameIndex,
        pupilDilation: Math.max(1.5, Math.min(8.0, calcDilation)),
        pupilAsymmetry: Math.min(100, Math.max(0, calcAsymmetry)),
        gazeAngle: calcAngle,
        gazeX: calcGazeX,
        gazeY: calcGazeY,
        pupilRadius: calcDilation * 4,
        pigmentIntensity: Math.round(80 + Math.sin(tick) * 10),
        turbulenceWeight: controls.turbulenceBias,
      });

      // 2. Update Glucose Telemetry
      setGlucoseHistory((prev) => {
        const lastVal = prev.length > 0 ? prev[prev.length - 1].glucoseLevel : controls.targetGlucose;
        const drift = (controls.targetGlucose - lastVal) * 0.1;
        const noise = (Math.random() - 0.48) * 3.5;
        const newVal = Math.max(50, Math.min(220, lastVal + drift + noise));

        let healthEvent: string | null = null;
        if (newVal > 140) healthEvent = 'Hyperglycemic Spike';
        if (newVal < 70) healthEvent = 'Hypoglycemic Dip';
        if (controls.turbulenceBias > 0.6) healthEvent = 'High Turbulence Match';

        const updatedPoint: GlucosePoint = {
          time: timeStr,
          timestamp: Date.now(),
          glucoseLevel: newVal,
          baseline: controls.targetGlucose,
          turbulenceWeight: controls.turbulenceBias,
          healthEvent,
        };

        // If health event detected, append to event log
        if (healthEvent) {
          setEventLogs((logs) => {
            if (logs.length > 0 && logs[0].description.includes(healthEvent!)) return logs;
            return [
              {
                id: `evt-${Date.now()}`,
                timestamp: timeStr,
                frameIndex: frameIndex,
                eventType: 'Matched Health Event',
                description: `Glucose & Turbulence trigger: ${healthEvent}`,
                severity: newVal > 150 || newVal < 65 ? 'alert' : 'warning',
                value: `${newVal.toFixed(1)} mg/dL`,
              },
              ...logs,
            ];
          });
        }

        const nextArr = [...prev.slice(1), updatedPoint];
        return nextArr;
      });

      // 3. Update Audio Rose Points
      setRosePoints(() => {
        const pts: AudioRosePoint[] = [];
        for (let angle = 0; angle < 360; angle += 10) {
          const rad = (angle * Math.PI) / 180;
          const noise = (Math.random() - 0.5) * 10;
          const baseR = Math.max(
            10,
            Math.min(
              95,
              45 + Math.sin(rad * 3 + tick * 2) * 25 + controls.tauCongestionLevel * 20 + noise
            )
          );
          const isSpike = angle === 90 || angle === 270 || (controls.turbulenceBias > 0.5 && angle === 180);
          pts.push({
            angle,
            radius: baseR,
            frequency: 440 + angle * 2,
            amplitude: baseR * 0.8,
            isSpike,
          });
        }
        return pts;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, frameIndex, controls]);

  // Light stimulus flash handler
  const handleStimulusFlash = () => {
    setPupilData((prev) => ({
      ...prev,
      pupilDilation: 1.8, // Instant constriction
      pupilAsymmetry: 18.5,
    }));

    setEventLogs((prev) => [
      {
        id: `flash-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        frameIndex: frameIndex,
        eventType: 'Pupil Asymmetry',
        description: 'High-intensity light stimulus applied. Pupil constricting.',
        severity: 'warning',
        value: '1.8mm Dilation',
      },
      ...prev,
    ]);
  };

  // Inject Simulated Health Event
  const handleInjectEvent = (type: 'glucose' | 'turbulence' | 'pupil' | 'tau') => {
    const timeStr = new Date().toLocaleTimeString([], { hour12: false });
    switch (type) {
      case 'glucose':
        setControls((prev) => ({ ...prev, targetGlucose: 155 }));
        setEventLogs((prev) => [
          {
            id: `inj-${Date.now()}`,
            timestamp: timeStr,
            frameIndex,
            eventType: 'Glucose Spike',
            description: 'Simulated acute glycemic surge injected into biosensor stream.',
            severity: 'alert',
            value: '155.0 mg/dL',
          },
          ...prev,
        ]);
        break;

      case 'pupil':
        handleStimulusFlash();
        break;

      case 'turbulence':
        setControls((prev) => ({ ...prev, turbulenceBias: 0.75 }));
        setEventLogs((prev) => [
          {
            id: `inj-${Date.now()}`,
            timestamp: timeStr,
            frameIndex,
            eventType: 'Acoustic Turbulence',
            description: 'CV2 turbulence kernel weight elevated to 0.75.',
            severity: 'alert',
            value: 'Wt: 0.750',
          },
          ...prev,
        ]);
        break;

      case 'tau':
        setControls((prev) => ({ ...prev, tauCongestionLevel: 0.85 }));
        setEventLogs((prev) => [
          {
            id: `inj-${Date.now()}`,
            timestamp: timeStr,
            frameIndex,
            eventType: 'Tau Congestion',
            description: 'Tau memory congestion well mu elevated to 85%.',
            severity: 'warning',
            value: 'μ: 85%',
          },
          ...prev,
        ]);
        break;
    }
  };

  // Run AI Diagnostics via Gemini Server API
  const handleRunAIDiagnostics = async () => {
    setIsDiagModalOpen(true);
    setIsAnalyzing(true);
    setDiagError(null);

    const currentGlucose = glucoseHistory.length > 0 ? glucoseHistory[glucoseHistory.length - 1].glucoseLevel : 105;

    const payload = {
      telemetry: {
        frameIndex,
        pupilDilation: pupilData.pupilDilation,
        pupilAsymmetry: pupilData.pupilAsymmetry,
        gazeAngle: pupilData.gazeAngle,
        glucoseLevel: currentGlucose,
        turbulenceWeight: controls.turbulenceBias,
        audioSpikeFrequency: 440 + pupilData.gazeAngle,
        audioAmplitude: 65.4,
        tauCongestion: controls.tauCongestionLevel,
        healthEvents: eventLogs.slice(0, 3).map((l) => l.description),
      },
    };

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch AI diagnostic response.');
      }

      setDiagnosticReport({
        ...json.diagnosis,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      });
    } catch (err: any) {
      console.error('AI Diagnostic call error:', err);
      setDiagError(err.message || 'An unexpected error occurred during AI evaluation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export CSV logs
  const handleExportLogs = () => {
    const headers = ['ID', 'Timestamp', 'FrameIndex', 'EventType', 'Severity', 'Description', 'Value'];
    const rows = eventLogs.map((log) => [
      log.id,
      log.timestamp,
      log.frameIndex,
      `"${log.eventType}"`,
      log.severity,
      `"${log.description.replace(/"/g, '""')}"`,
      `"${log.value}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bio_telemetry_logs_frame${frameIndex}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset telemetry stream
  const handleResetData = () => {
    setFrameIndex(720);
    setControls({
      isLive: true,
      simulationSpeed: 1,
      targetGlucose: 105,
      turbulenceBias: 0.18,
      pupilSensitivity: 1.0,
      tauCongestionLevel: 0.25,
      selectedMode: 'all',
    });
    setEventLogs([
      {
        id: `rst-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        frameIndex: 720,
        eventType: 'Matched Health Event',
        description: 'Telemetry stream reset to baseline state.',
        severity: 'info',
        value: 'Baseline 105',
      },
    ]);
  };

  const currentGlucose = glucoseHistory.length > 0 ? glucoseHistory[glucoseHistory.length - 1].glucoseLevel : 105;

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#D1D1D1] flex flex-col font-sans selection:bg-[#FF4E00] selection:text-black border-[12px] sm:border-[16px] border-[#1A1C1E]">
      {/* Header Bar */}
      <Header
        isLive={isLive}
        setIsLive={setIsLive}
        currentFrame={frameIndex}
        totalEvents={eventLogs.length}
        onRunDiagnostics={handleRunAIDiagnostics}
        isAnalyzing={isAnalyzing}
        onExportLogs={handleExportLogs}
        onResetData={handleResetData}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ocular Pupil Scanner Canvas */}
          {(activeMode === 'all' || activeMode === 'ocular') && (
            <div className={activeMode === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <OcularPupilCanvas
                pupilData={pupilData}
                onStimulusFlash={handleStimulusFlash}
                isLive={isLive}
                frameIndex={frameIndex}
                setFrameIndex={setFrameIndex}
                turbulenceWeight={controls.turbulenceBias}
                pupilAsymmetry={pupilData.pupilAsymmetry}
              />
            </div>
          )}

          {/* Continuous Glucose Telemetry Chart */}
          {(activeMode === 'all' || activeMode === 'glucose') && (
            <div className={activeMode === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'}>
              <GlucoseTelemetryChart
                data={glucoseHistory}
                currentGlucose={currentGlucose}
                baseline={controls.targetGlucose}
                turbulenceWeight={controls.turbulenceBias}
                healthEvents={eventLogs.filter((l) => l.eventType === 'Matched Health Event').map((l) => l.description)}
              />
            </div>
          )}
        </div>

        {/* Middle Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Audio-Rose Spectrum */}
          {(activeMode === 'all' || activeMode === 'audio-tau') && (
            <div className={activeMode === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <AudioRoseSpectrum
                rosePoints={rosePoints}
                tauCongestion={controls.tauCongestionLevel}
                audioSpikeFrequency={440 + pupilData.gazeAngle}
                audioAmplitude={62.5 + controls.turbulenceBias * 20}
                isLive={isLive}
              />
            </div>
          )}

          {/* Telemetry Controls Panel */}
          <div className={activeMode === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'}>
            <TelemetryControlPanel
              controls={controls}
              setControls={setControls}
              onInjectEvent={handleInjectEvent}
            />
          </div>
        </div>

        {/* Bottom Event Log Table */}
        <div className="w-full">
          <EventLogTable
            logs={eventLogs}
            onClearLogs={() => setEventLogs([])}
            onExportLogs={handleExportLogs}
          />
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="mt-8 py-5 px-8 border-t border-[#333538] flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-4 bg-[#0B0C0E]">
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest opacity-40">Frame Index</span>
            <span className="font-mono text-xs text-white">OS.099.{frameIndex}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest opacity-40">Socket Map</span>
            <span className="font-mono text-xs text-[#FF4E00]">GOLF_KERNEL_LOCAL</span>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white font-bold">
          Double Standardized Session // Active
        </div>
      </footer>

      {/* AI Diagnostics Modal */}
      <AIDiagnosticsModal
        isOpen={isDiagModalOpen}
        onClose={() => setIsDiagModalOpen(false)}
        report={diagnosticReport}
        isLoading={isAnalyzing}
        error={diagError}
      />
    </div>
  );
}
