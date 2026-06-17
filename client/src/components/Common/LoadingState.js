import React from "react";
import "./LoadingState.css";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="app-spinner" />
      <p>{message}</p>
    </div>
  );
}
