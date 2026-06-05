const COPILOT_API = process.env.COPILOT_API_URL || "http://localhost:8000";

async function proxyJson(res, url, options) {
  const r = await fetch(url, options);
  const data = await r.json();
  res.status(r.status).json(data);
}

exports.analyzeChart = async (req, res) => {
  try {
    const { text, patient_id } = req.body;
    await proxyJson(res, `${COPILOT_API}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, patient_id: patient_id || "PATIENT-001" }),
    });
  } catch (e) {
    res.status(500).json({ error: "Clinical analysis failed" });
  }
};

exports.normalizeChart = async (req, res) => {
  try {
    const { text, patient_id } = req.body;
    await proxyJson(res, `${COPILOT_API}/normalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, patient_id: patient_id || "PATIENT-001" }),
    });
  } catch (e) {
    res.status(500).json({ error: "Chart normalization failed" });
  }
};

exports.uploadChart = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const form = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    form.append("file", blob, req.file.originalname);

    const r = await fetch(`${COPILOT_API}/upload`, {
      method: "POST",
      body: form,
    });

    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "File upload failed" });
  }
};
