import React, { useCallback, useState } from "react";
import Sidebar from "../../Common/Sidebar";
import FileUpload from "./FileUpload";
import ResultsDashboard from "./ResultsDashboard";
import { analyzeChart } from "./api";
import "./ClinicalCopilot.css";

const ANALYSIS_STEPS = [
  "Extracting clinical sections...",
  "Identifying medications + OpenFDA lookup...",
  "Building medical timeline...",
  "Detecting risk flags...",
  "Generating reports...",
];

export default function ClinicalCopilot({ role = "patient" }) {
  const [step, setStep] = useState("upload");
  const [patientId, setPatientId] = useState("PATIENT-001");
  const [filenames, setFilenames] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileReady = useCallback(async (text, names) => {
    if (!text.trim()) return;

    setFilenames(names);
    setStep("analyzing");
    setError("");
    setResult(null);

    try {
      const data = await analyzeChart(text, patientId, role);
      setResult(data);
      setStep("results");
    } catch (e) {
      setError(e.message);
      setStep("upload");
    }
  }, [patientId, role]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFilenames([]);
    setResult(null);
    setError("");
  }, []);

  return (
    <div className="cc-layout">
      <Sidebar role={role} />
      <div className="cc-page">
        <div className="cc-container">
          <header className="cc-header">
            <div className="cc-headerRow">
              <div className="cc-logo">AI</div>
              <div>
                <h1 className="cc-title">Clinical Copilot</h1>
                <p className="cc-subtitle">Multi-agent chart analysis</p>
              </div>
            </div>
            <div className="cc-headerActions">
              {step !== "upload" && (
                <button type="button" className="cc-btn" onClick={handleReset}>
                  Start over
                </button>
              )}
              <span className="cc-muted">5 parallel agents</span>
            </div>
          </header>

          <div className="cc-disclaimer">
            This tool is for informational purposes only and does not replace professional medical advice.
          </div>

          {step === "upload" && (
            <div className="cc-card">
              <h2 className="cc-sectionTitle">Upload Clinical Document</h2>
              {error && <p className="cc-errorText" style={{ marginBottom: 12 }}>{error}</p>}
              <FileUpload
                patientId={patientId}
                onPatientIdChange={setPatientId}
                onReady={handleFileReady}
                role={role}
              />
            </div>
          )}

          {step === "analyzing" && (
            <div className="cc-card cc-loadingCard">
              <div className="cc-spinner" />
              <div className="cc-loadingText">
                <p className="cc-loadingTitle">Running 5 parallel agents</p>
                <p className="cc-muted">
                  {filenames.length > 0
                    ? `Analyzing ${filenames.join(", ")}`
                    : "Ingestion · Medication · Timeline · Risk · Synthesis"}
                </p>
              </div>
              <div className="cc-loadingSteps">
                {ANALYSIS_STEPS.map((label, i) => (
                  <div key={i} className="cc-loadingStep">
                    <span className="cc-loadingDot" style={{ animationDelay: `${i * 200}ms` }} />
                    <span className="cc-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "results" && result && <ResultsDashboard result={result} />}
        </div>
      </div>
    </div>
  );
}
