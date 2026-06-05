import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
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
  }, []);

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
      onReady(result.normalized_text, readyFiles.map((f) => f.file.name));
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
        <label className="cc-label">Patient ID</label>
        <input
          type="text"
          value={patientId}
          onChange={(e) => onPatientIdChange(e.target.value)}
          className="cc-input cc-input-sm"
          placeholder="PATIENT-001"
          disabled={normalizing}
        />
      </div>

      <div
        {...getRootProps()}
        className={`cc-dropzone ${isDragActive ? "active" : ""} ${normalizing ? "disabled" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="cc-dropzoneInner">
          <div className="cc-dropzoneIcon">📄</div>
          <p className="cc-dropzoneTitle">
            {isDragActive ? "Drop files here" : "Drop clinical documents here"}
          </p>
          <p className="cc-muted">or click to browse — PDF, DOCX, MD, TXT</p>
          <div className="cc-formatTags">
            {["PDF", "DOCX", "MD", "TXT"].map((t) => (
              <span key={t} className="cc-formatTag">{t}</span>
            ))}
          </div>
          <p className="cc-muted">Upload multiple files — radiology reports, lab results, clinical notes</p>
        </div>
      </div>

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
                <span className="cc-fileStatus">
                  {entry.status === "extracting" && "⏳"}
                  {entry.status === "ready" && "✓"}
                  {entry.status === "error" && "✕"}
                  {entry.status === "pending" && "○"}
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
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="cc-fileListFooter">
            {normalizeError && <p className="cc-errorText">{normalizeError}</p>}
            {processingCount > 0 && (
              <span className="cc-muted">
                Waiting for {processingCount} file{processingCount > 1 ? "s" : ""}...
              </span>
            )}
            <button
              type="button"
              className="cc-btnPrimary"
              onClick={handleSend}
              disabled={!canSend}
            >
              {normalizing ? "Normalizing..." : "Send to InputAgent →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
