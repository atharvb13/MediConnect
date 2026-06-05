import React from "react";

const SEVERITY_CLASS = {
  HIGH: "cc-flag-high",
  MEDIUM: "cc-flag-medium",
  LOW: "cc-flag-low",
};

export default function FlagBadge({ flag, showEvidence = false }) {
  const severity = flag.severity || "LOW";
  const cls = SEVERITY_CLASS[severity] || SEVERITY_CLASS.LOW;

  return (
    <span className={`cc-flag ${cls}`} title={flag.evidence || flag.flag}>
      {flag.flag}
      {showEvidence && flag.evidence && (
        <span className="cc-flag-evidence"> — {flag.evidence}</span>
      )}
    </span>
  );
}
