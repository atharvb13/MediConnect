import React, { useCallback, useState } from "react";
import PageLayout from "../../Common/PageLayout";
import StepIndicator from "../../Common/StepIndicator";
import Alert from "../../Common/Alert";
import FileUpload from "./FileUpload";
import ResultsDashboard from "./ResultsDashboard";
import { analyzeChart } from "./api";
import "./ClinicalCopilot.css";

const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "analyzing", label: "Analyze" },
  { id: "results", label: "Results" },
];

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
    <PageLayout role={role}>
      <div className="cc-page">
        <div className="cc-container">
          <header className="cc-header">
            <div className="cc-headerRow">
              <div className="cc-logo" aria-hidden="true">AI</div>
              <div>
                <h1 className="cc-title">Clinical Copilot</h1>
                <p className="cc-subtitle">Multi-agent chart analysis for clinical decision support</p>
              </div>
            </div>
            <div className="cc-headerActions">
              {step !== "upload" && (
                <button type="button" className="app-btn" onClick={handleReset}>
                  Start over
                </button>
              )}
              <span className="cc-badge">5 agents</span>
            </div>
          </header>

          <StepIndicator steps={STEPS} currentStep={step} />

          <Alert type="warning">
            For informational purposes only — does not replace professional medical advice.
          </Alert>

          {step === "upload" && (
            <div className="cc-card">
              <h2 className="cc-sectionTitle">Upload Clinical Document</h2>
              <p className="cc-muted cc-cardDesc">
                Upload patient charts, lab results, or clinical notes. Analysis begins automatically after normalization.
              </p>
              {error && (
                <div style={{ marginBottom: 14 }}>
                  <Alert type="error" onDismiss={() => setError("")}>{error}</Alert>
                </div>
              )}
              <FileUpload
                patientId={patientId}
                onPatientIdChange={setPatientId}
                onReady={handleFileReady}
                role={role}
              />
            </div>
          )}

          {step === "analyzing" && (
            <div className="cc-card cc-loadingCard" role="status" aria-live="polite" aria-busy="true">
              <div className="app-spinner" />
              <div className="cc-loadingText">
                <p className="cc-loadingTitle">Running 5 parallel agents</p>
                <p className="cc-muted">
                  {filenames.length > 0
                    ? `Analyzing ${filenames.join(", ")}`
                    : "Ingestion · Medication · Timeline · Risk · Synthesis"}
                </p>
                <p className="cc-muted cc-loadingHint">This may take 15–60 seconds depending on chart size.</p>
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

          {step === "results" && result && (
            <>
              <Alert type="success">Analysis complete — review reports and risk flags below.</Alert>
              <ResultsDashboard result={result} onNewAnalysis={handleReset} />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
