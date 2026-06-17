import React, { useState } from "react";
import FlagBadge from "./FlagBadge";
import ReportPanel from "./ReportPanel";

export default function ResultsDashboard({ result, onNewAnalysis }) {
  const [showMeds, setShowMeds] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState("doctor");

  const highFlags = (result.risk_flags || []).filter((f) => f.severity === "HIGH");
  const otherFlags = (result.risk_flags || []).filter((f) => f.severity !== "HIGH");

  return (
    <div className="cc-results">
      <div className="cc-resultsHeader">
        <h2 className="cc-sectionTitle">Analysis Results</h2>
        {onNewAnalysis && (
          <button type="button" className="app-btn" onClick={onNewAnalysis}>
            New analysis
          </button>
        )}
      </div>

      {highFlags.length > 0 && (
        <div className="cc-alertBox">
          <h2 className="cc-sectionTitle">
            {highFlags.length} Critical Flag{highFlags.length > 1 ? "s" : ""}
          </h2>
          <div className="cc-flagRow">
            {highFlags.map((f, i) => (
              <FlagBadge key={i} flag={f} showEvidence />
            ))}
          </div>
        </div>
      )}

      {otherFlags.length > 0 && (
        <div className="cc-card">
          <h2 className="cc-sectionTitle cc-sectionTitle-muted">Additional Findings</h2>
          <div className="cc-flagRow">
            {otherFlags.map((f, i) => (
              <FlagBadge key={i} flag={f} />
            ))}
          </div>
        </div>
      )}

      <div className="cc-reportTabs">
        <button
          type="button"
          className={`cc-tab ${activeTab === "doctor" ? "active" : ""}`}
          onClick={() => setActiveTab("doctor")}
        >
          Doctor Report
        </button>
        <button
          type="button"
          className={`cc-tab ${activeTab === "patient" ? "active" : ""}`}
          onClick={() => setActiveTab("patient")}
        >
          Patient Report
        </button>
      </div>

      <div className="cc-reportGrid">
        <div className={activeTab === "patient" ? "cc-reportHiddenMobile" : ""}>
          <ReportPanel
            title="Clinical Report"
            subtitle="Technical summary for care team"
            content={result.doctor_report}
            accentClass="cc-accent-doctor"
          />
        </div>
        <div className={activeTab === "doctor" ? "cc-reportHiddenMobile" : ""}>
          <ReportPanel
            title="Patient Summary"
            subtitle="Plain-language explanation for the patient"
            content={result.patient_report}
            accentClass="cc-accent-patient"
          />
        </div>
      </div>

      <div className="cc-card cc-collapsible">
        <button
          type="button"
          className="cc-collapsibleHeader"
          onClick={() => setShowMeds((v) => !v)}
        >
          <span>Medications ({(result.medications || []).length})</span>
          <span>{showMeds ? "▲" : "▼"}</span>
        </button>
        {showMeds && (
          <div className="cc-collapsibleBody">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Drug</th>
                  <th>Dose</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {(result.medications || []).map((m, i) => (
                  <tr key={i}>
                    <td>{m.name}</td>
                    <td>{m.dose || "—"}</td>
                    <td>{m.frequency || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(result.interactions || []).length > 0 && (
              <div className="cc-interactions">
                <p className="cc-sectionTitle">Drug Interactions (OpenFDA)</p>
                {(result.interactions || []).map((interaction, idx) => (
                  <p key={idx} className="cc-interactionItem">
                    <strong>{interaction.drug}:</strong>{" "}
                    {interaction.warnings.slice(0, 200)}…
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(result.timeline_events || []).length > 0 && (
        <div className="cc-card cc-collapsible">
          <button
            type="button"
            className="cc-collapsibleHeader"
            onClick={() => setShowTimeline((v) => !v)}
          >
            <span>Medical Timeline ({result.timeline_events.length} events)</span>
            <span>{showTimeline ? "▲" : "▼"}</span>
          </button>
          {showTimeline && (
            <div className="cc-collapsibleBody cc-timeline">
              {result.timeline_events.map((e, i) => (
                <div key={i} className="cc-timelineItem">
                  <span className="cc-timelineDate">{e.date}</span>
                  <div>
                    <p>{e.event}</p>
                    <span className="cc-timelineCategory">{e.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="cc-trace">
        <p className="cc-muted">Analysis trace</p>
        <p className="cc-traceId">{result.trace_id}</p>
      </div>
    </div>
  );
}
