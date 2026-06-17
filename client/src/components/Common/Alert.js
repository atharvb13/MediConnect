import React from "react";

const ICONS = {
  error: "⚠",
  success: "✓",
  warning: "!",
  info: "i",
};

export default function Alert({ type = "info", children, onDismiss }) {
  return (
    <div className={`app-alert app-alert-${type}`} role="alert">
      <span aria-hidden="true">{ICONS[type]}</span>
      <div style={{ flex: 1 }}>{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="app-btn app-btn-ghost"
          style={{ padding: "2px 8px", fontSize: 18 }}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
