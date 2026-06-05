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
  const [normalizedText, setNormalizedText] = useState("");
  const [filenames, setFilenames] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileReady = useCallback((text, names) => {
    setNormalizedText(text);
    setFilenames(names);
    setStep("preview");
    setError("");
    setShowPreview(false);
    setIsEditing(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!normalizedText.trim()) return;
    setStep("analyzing");
    setError("");
    try {
      const data = await analyzeChart(normalizedText, patientId, role);
      setResult(data);
      setStep("results");
    } catch (e) {
      setError(e.message);
      setStep("preview");
    }
  }, [normalizedText, patientId, role]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setNormalizedText("");
    setFilenames([]);
    setResult(null);
    setError("");
    setShowPreview(false);
    setIsEditing(false);
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

          {(step === "upload" || step === "preview") && (
            <div className="cc-card">
              <h2 className="cc-sectionTitle">Upload Clinical Document</h2>
              <FileUpload
                patientId={patientId}
                onPatientIdChange={setPatientId}
                onReady={handleFileReady}
                role={role}
              />
            </div>
          )}

          {step === "preview" && normalizedText && (
            <div className="cc-card cc-previewCard">
              <div className="cc-previewHeader">
                <div>
                  <h2 className="cc-sectionTitle">Structured Clinical Text</h2>
                  <p className="cc-muted">
                    Normalized from {filenames.join(", ")} by InputAgent — review before analysis
                  </p>
                </div>
                <div className="cc-previewActions">
                  <button
                    type="button"
                    className="cc-btn"
                    onClick={() => setIsEditing((v) => !v)}
                  >
                    {isEditing ? "Done editing" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="cc-btn"
                    onClick={() => setShowPreview((v) => !v)}
                  >
                    {showPreview ? "Hide" : "Preview"}
                  </button>
                </div>
              </div>

              {showPreview && (
                <div className="cc-previewBody">
                  {isEditing ? (
                    <textarea
                      className="cc-textarea"
                      value={normalizedText}
                      onChange={(e) => setNormalizedText(e.target.value)}
                      rows={16}
                    />
                  ) : (
                    <pre className="cc-previewText">{normalizedText}</pre>
                  )}
                </div>
              )}

              <div className="cc-previewFooter">
                {error && <p className="cc-errorText">{error}</p>}
                <button
                  type="button"
                  className="cc-btnPrimary"
                  onClick={handleAnalyze}
                >
                  Run Full Analysis
                </button>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="cc-card cc-loadingCard">
              <div className="cc-spinner" />
              <div className="cc-loadingText">
                <p className="cc-loadingTitle">Running 5 parallel agents</p>
                <p className="cc-muted">
                  Ingestion · Medication · Timeline · Risk · Synthesis
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
