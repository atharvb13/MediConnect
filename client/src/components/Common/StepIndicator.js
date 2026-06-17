import React from "react";
import "./StepIndicator.css";

export default function StepIndicator({ steps, currentStep }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="step-indicator" aria-label="Progress">
      <ol className="step-list">
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = step.id === currentStep;
          return (
            <li
              key={step.id}
              className={`step-item ${isComplete ? "complete" : ""} ${isCurrent ? "current" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="step-dot">{isComplete ? "✓" : i + 1}</span>
              <span className="step-label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
