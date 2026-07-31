export interface PupilScanData {
  frameIndex: number;
  pupilDilation: number; // in mm (e.g. 2.0 to 8.0)
  pupilAsymmetry: number; // percentage
  gazeAngle: number; // in degrees
  gazeX: number;
  gazeY: number;
  pupilRadius: number;
  pigmentIntensity: number; // 0 - 100
  turbulenceWeight: number; // calculated cv2 turbulence weight
}

export interface GlucosePoint {
  time: string;
  timestamp: number;
  glucoseLevel: number; // in mg/dL
  baseline: number;
  turbulenceWeight: number;
  healthEvent?: string | null;
}

export interface AudioRosePoint {
  angle: number; // in degrees
  radius: number;
  frequency: number;
  amplitude: number;
  isSpike: boolean;
}

export interface DiagnosticReport {
  diagnosisTitle: string;
  riskLevel: 'Normal' | 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  summary: string;
  keyObservations: string[];
  recommendations: string[];
  neuralStabilityScore: number;
  timestamp: string;
}

export interface HealthEventLog {
  id: string;
  timestamp: string;
  frameIndex: number;
  eventType: 'Glucose Spike' | 'Acoustic Turbulence' | 'Pupil Asymmetry' | 'Tau Congestion' | 'Matched Health Event';
  description: string;
  severity: 'info' | 'warning' | 'alert';
  value: string;
}

export interface ControlsState {
  isLive: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  targetGlucose: number; // e.g. 105 mg/dL
  turbulenceBias: number; // 0 to 1
  pupilSensitivity: number; // 0.1 to 2.0
  tauCongestionLevel: number; // 0 to 1
  selectedMode: 'all' | 'ocular' | 'glucose' | 'audio-tau';
}
