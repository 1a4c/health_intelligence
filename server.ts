import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Telemetry Diagnostics Endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { telemetry } = req.body;
    if (!telemetry) {
      return res.status(400).json({ error: "Telemetry snapshot data is required." });
    }

    const ai = getGenAI();

    const prompt = `Analyze the following bio-optic, glucose, and acoustic tau telemetry stream snapshot:
- Pupil Scan & Gaze Index: Frame ${telemetry.frameIndex || 720}, Dilation: ${telemetry.pupilDilation?.toFixed(2)}mm, Asymmetry: ${telemetry.pupilAsymmetry?.toFixed(2)}%, Vector Angle: ${telemetry.gazeAngle?.toFixed(1)}°
- Glucose Level: ${telemetry.glucoseLevel?.toFixed(1)} mg/dL (Baseline target: 90-120 mg/dL)
- Turbulence Weight: ${telemetry.turbulenceWeight?.toFixed(3)}
- Audio Rose Spectral Spike: ${telemetry.audioSpikeFrequency?.toFixed(0)} Hz, Amplitude: ${telemetry.audioAmplitude?.toFixed(2)} dB
- Tau Memory Congestion (mu): ${telemetry.tauCongestion?.toFixed(3)}
- Active Health Events Flagged: ${JSON.stringify(telemetry.healthEvents || [])}

Provide a structured clinical & signal diagnostic analysis:
1. "diagnosisTitle": Concise summary title of current physiological & bio-optic state
2. "riskLevel": One of "Normal", "Low", "Moderate", "Elevated", "Critical"
3. "summary": A clear 2-3 sentence clinical explanation of the interplay between the pupil scan, glucose turbulence, and tau congestion values.
4. "keyObservations": Array of 3 key observations.
5. "recommendations": Array of 3 actionable protocol recommendations (e.g. recalibrating light response, glucose stabilization, acoustic damping).
6. "neuralStabilityScore": A number from 0 to 100 representing signal coherence and neural stability.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Bio-Optic & Physiological Telemetry AI Diagnostic Specialist. Analyze ocular pupil dynamics, continuous glucose spikes, and tau signal turbulence objectively with scientific precision.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosisTitle: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyObservations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            neuralStabilityScore: { type: Type.NUMBER },
          },
          required: [
            "diagnosisTitle",
            "riskLevel",
            "summary",
            "keyObservations",
            "recommendations",
            "neuralStabilityScore",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini API.");
    }

    const diagnosis = JSON.parse(resultText);
    return res.json({ success: true, diagnosis });
  } catch (error: any) {
    console.error("Diagnostic endpoint error:", error);
    return res.status(500).json({
      error: error.message || "Failed to run AI diagnostic analysis.",
    });
  }
});

// Vite middleware for development vs static production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
