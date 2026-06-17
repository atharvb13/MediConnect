import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiFile, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";
import EmptyState from "../../Common/EmptyState";
import Alert from "../../Common/Alert";
import { uploadFile, normalizeText } from "./api";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ patientId, onPatientIdChange, onReady, role = "patient" }) {
  const [files, setFiles] = useState([]);
  const [normalizing, setNormalizing] = useState(false);
  const [normalizeError, setNormalizeError] = useState("");

  const extractFile = useCallback(async (entry) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: "extracting" } : f))
    );
    try {
      const result = await uploadFile(entry.file, role);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, status: "ready", text: result.text } : f
        )
      );
    } catch (e) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: "error", error: e.message }
            : f
        )
      );
    }
  }, [role]);

  const handleDrop = useCallback(
    (accepted) => {
      const newEntries = accepted.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        status: "pending",
        text: "",
      }));

      setFiles((prev) => {
        const existing = new Set(prev.map((f) => `${f.file.name}-${f.file.size}`));
        const fresh = newEntries.filter(
          (e) => !existing.has(`${e.file.name}-${e.file.size}`)
        );
        return [...prev, ...fresh];
      });

      newEntries.forEach((entry) => extractFile(entry));
    },
    [extractFile]
  );

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    const readyFiles = files.filter((f) => f.status === "ready");
    if (readyFiles.length === 0) return;

    setNormalizing(true);
    setNormalizeError("");

    try {
      const combined = readyFiles
        .map((f) => `[SOURCE: ${f.file.name}]\n${f.text}`)
        .join("\n\n---\n\n");

      const result = await normalizeText(combined, patientId, role);
      await onReady(result.normalized_text, readyFiles.map((f) => f.file.name));
    } catch (e) {
      setNormalizeError(e.message);
    } finally {
      setNormalizing(false);
    }
  }, [files, patientId, onReady, role]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    onDropAccepted: handleDrop,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => {
        const msg =
          r.errors[0]?.code === "file-too-large"
            ? `${r.file.name}: too large (max 10 MB)`
            : r.errors[0]?.code === "file-invalid-type"
            ? `${r.file.name}: unsupported type`
            : r.errors[0]?.message ?? "Upload failed";
        setNormalizeError(msg);
      });
    },
  });

  const readyCount = files.filter((f) => f.status === "ready").length;
  const processingCount = files.filter((f) => f.status === "extracting").length;
  const canSend = readyCount > 0 && processingCount === 0 && !normalizing;

  return (
    <div className="cc-upload">
      <div className="cc-patientIdRow">
        <label className="cc-label" htmlFor="patient-id">Patient ID</label>
        <input
          id="patient-id"
          type="text"
          value={patientId}
          onChange={(e) => onPatientIdChange(e.target.value)}
          className="cc-input cc-input-sm"
          placeholder="PATIENT-001"
          disabled={normalizing}
          aria-describedby="patient-id-hint"
        />
        <span id="patient-id-hint" className="cc-muted cc-hint">Used to tag this analysis session</span>
      </div>

      <div
        {...getRootProps()}
        className={`cc-dropzone ${isDragActive ? "active" : ""} ${normalizing ? "disabled" : ""}`}
        role="button"
        aria-label="Upload clinical documents"
      >
        <input {...getInputProps()} aria-label="Choose files" />
        <div className="cc-dropzoneInner">
          <FiUploadCloud className="cc-dropzoneIconSvg" aria-hidden="true" />
          <p className="cc-dropzoneTitle">
            {isDragActive ? "Drop files here" : "Drop clinical documents here"}
          </p>
          <p className="cc-muted">or click to browse — PDF, DOCX, MD, TXT (max 10 MB each)</p>
          <div className="cc-formatTags">
            {["PDF", "DOCX", "MD", "TXT"].map((t) => (
              <span key={t} className="cc-formatTag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {normalizeError && (
        <Alert type="error" onDismiss={() => setNormalizeError("")}>{normalizeError}</Alert>
      )}

      {files.length === 0 && !normalizing && (
        <EmptyState
          icon="📋"
          title="No files uploaded yet"
          description="Drop clinical documents above to extract and analyze patient chart data."
        />
      )}

      {files.length > 0 && (
        <div className="cc-fileList">
          <div className="cc-fileListHeader">
            <span>Files ({files.length})</span>
            {readyCount > 0 && (
              <span className="cc-readyCount">
                {readyCount} ready
                {processingCount > 0 ? `, ${processingCount} processing` : ""}
              </span>
            )}
          </div>

          <ul className="cc-fileItems">
            {files.map((entry) => (
              <li key={entry.id} className="cc-fileItem">
                <span className="cc-fileStatus" aria-label={entry.status}>
                  {entry.status === "extracting" && <FiLoader className="cc-spin" />}
                  {entry.status === "ready" && <FiCheck className="cc-status-ok" />}
                  {entry.status === "error" && <FiAlertCircle className="cc-status-err" />}
                  {entry.status === "pending" && <FiFile />}
                </span>
                <div className="cc-fileMeta">
                  <p className="cc-fileName">{entry.file.name}</p>
                  <p className="cc-muted">
                    {formatBytes(entry.file.size)}
                    {entry.status === "extracting" && " — extracting text..."}
                    {entry.status === "ready" && entry.text &&
                      ` — ${entry.text.length.toLocaleString()} chars`}
                    {entry.status === "error" && (
                      <span className="cc-errorText"> — {entry.error}</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  className="cc-fileRemove"
                  onClick={() => removeFile(entry.id)}
                  disabled={normalizing}
                  aria-label={`Remove ${entry.file.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="cc-fileListFooter">
            {processingCount > 0 && (
              <span className="cc-muted">
                Waiting for {processingCount} file{processingCount > 1 ? "s" : ""}...
              </span>
            )}
            <button
              type="button"
              className="app-btn app-btn-primary"
              onClick={handleSend}
              disabled={!canSend}
              aria-busy={normalizing}
            >
              {normalizing ? "Normalizing & analyzing..." : "Send to InputAgent & Analyze →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
