const API_BASES = {
  patient: "http://localhost:5001/api/patient/copilot",
  doctor: "http://localhost:5001/api/doctor/copilot",
};

export function getCopilotApiBase(role = "patient") {
  return API_BASES[role] || API_BASES.patient;
}

async function handleResponse(res) {
  const body = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(body.error || body.detail || `HTTP ${res.status}`);
  }
  return body;
}

export async function uploadFile(file, role = "patient") {
  const apiBase = getCopilotApiBase(role);
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${apiBase}/upload`, { method: "POST", body: form });
  return handleResponse(res);
}

export async function normalizeText(text, patientId, role = "patient") {
  const apiBase = getCopilotApiBase(role);
  const res = await fetch(`${apiBase}/normalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, patient_id: patientId }),
  });
  return handleResponse(res);
}

export async function analyzeChart(text, patientId, role = "patient") {
  const apiBase = getCopilotApiBase(role);
  const res = await fetch(`${apiBase}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, patient_id: patientId }),
  });
  return handleResponse(res);
}
