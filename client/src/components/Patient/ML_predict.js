import React, { useEffect, useMemo, useState } from "react";
import "./SymptomChecker.css";
import Sidebar from '../Common/Sidebar';


const Symptoms_List = [
  { key: "abdominal_pain", label: "Abdominal Pain" },
  { key: "anxiety", label: "Anxiety" },
  { key: "appetite_changes", label: "Appetite Changes" },
  { key: "blurred_vision", label: "Blurred Vision" },
  { key: "body_aches", label: "Body Aches" },
  { key: "burning_urination", label: "Burning Urination" },
  { key: "chest_discomfort", label: "Chest Discomfort" },
  { key: "chest_pain", label: "Chest Pain" },
  { key: "chest_tightness", label: "Chest Tightness" },
  { key: "chills", label: "Chills" },
  { key: "cloudy_urine", label: "Cloudy Urine" },
  { key: "cold_hands_feet", label: "Cold Hands Feet" },
  { key: "cold_sensitivity", label: "Cold Sensitivity" },
  { key: "constipation", label: "Constipation" },
  { key: "cough", label: "Cough" },
  { key: "dehydration", label: "Dehydration" },
  { key: "depression", label: "Depression" },
  { key: "diarrhea", label: "Diarrhea" },
  { key: "difficulty_breathing", label: "Difficulty Breathing" },
  { key: "difficulty_concentrating", label: "Difficulty Concentrating" },
  { key: "difficulty_sleeping", label: "Difficulty Sleeping" },
  { key: "dizziness", label: "Dizziness" },
  { key: "dry_cough", label: "Dry Cough" },
  { key: "dry_skin", label: "Dry Skin" },
  { key: "excessive_thirst", label: "Excessive Thirst" },
  { key: "excessive_worry", label: "Excessive Worry" },
  { key: "facial_pain", label: "Facial Pain" },
  { key: "fatigue", label: "Fatigue" },
  { key: "fever", label: "Fever" },
  { key: "frequent_urination", label: "Frequent Urination" },
  { key: "headache", label: "Headache" },
  { key: "heat_sensitivity", label: "Heat Sensitivity" },
  { key: "high_fever", label: "High Fever" },
  { key: "itchy_eyes", label: "Itchy Eyes" },
  { key: "joint_pain", label: "Joint Pain" },
  { key: "light_sensitivity", label: "Light Sensitivity" },
  { key: "loss_of_interest", label: "Loss Of Interest" },
  { key: "loss_of_smell", label: "Loss Of Smell" },
  { key: "loss_of_taste", label: "Loss Of Taste" },
  { key: "mild_fever", label: "Mild Fever" },
  { key: "mucus_production", label: "Mucus Production" },
  { key: "muscle_pain", label: "Muscle Pain" },
  { key: "muscle_weakness", label: "Muscle Weakness" },
  { key: "nasal_congestion", label: "Nasal Congestion" },
  { key: "nausea", label: "Nausea" },
  { key: "nosebleeds", label: "Nosebleeds" },
  { key: "pale_skin", label: "Pale Skin" },
  { key: "pelvic_pain", label: "Pelvic Pain" },
  { key: "persistent_cough", label: "Persistent Cough" },
  { key: "persistent_sadness", label: "Persistent Sadness" },
  { key: "rapid_breathing", label: "Rapid Breathing" },
  { key: "rapid_heartbeat", label: "Rapid Heartbeat" },
  { key: "redness", label: "Redness" },
  { key: "reduced_mobility", label: "Reduced Mobility" },
  { key: "reduced_smell", label: "Reduced Smell" },
  { key: "restlessness", label: "Restlessness" },
  { key: "runny_nose", label: "Runny Nose" },
  { key: "severe_headache", label: "Severe Headache" },
  { key: "shortness_of_breath", label: "Shortness Of Breath" },
  { key: "skin_rash", label: "Skin Rash" },
  { key: "sleep_problems", label: "Sleep Problems" },
  { key: "slow_healing", label: "Slow Healing" },
  { key: "sneezing", label: "Sneezing" },
  { key: "sore_throat", label: "Sore Throat" },
  { key: "stiffness", label: "Stiffness" },
  { key: "strong_urine_odor", label: "Strong Urine Odor" },
  { key: "sweating", label: "Sweating" },
  { key: "swelling", label: "Swelling" },
  { key: "trembling", label: "Trembling" },
  { key: "tremors", label: "Tremors" },
  { key: "unexplained_weight_loss", label: "Unexplained Weight Loss" },
  { key: "vision_problems", label: "Vision Problems" },
  { key: "visual_disturbances", label: "Visual Disturbances" },
  { key: "vomiting", label: "Vomiting" },
  { key: "warmth_in_joints", label: "Warmth In Joints" },
  { key: "watery_eyes", label: "Watery Eyes" },
  { key: "weakness", label: "Weakness" },
  { key: "weight_gain", label: "Weight Gain" },
  { key: "weight_loss", label: "Weight Loss" },
  { key: "wheezing", label: "Wheezing" }
];


function Pill({ label, onRemove }) {
  return (
    <div className="sc-pill">
      <span>{label}</span>
      <button type="button" className="sc-pillRemove" onClick={onRemove}>
        ×
      </button>
    </div>
  );
}

function ResultCard({ disease, confidence }) {
  const pct = Math.round(confidence * 1000) / 10; // 1 decimal
  return (
    <div className="sc-resultCard">
      <div className="sc-resultTitle">{disease}</div>
      <div className="sc-barOuter">
        <div className="sc-barInner" style={{ width: `${pct}%` }} />
      </div>
      <div className="sc-resultMeta">
        Confidence: <b>{pct}%</b>
      </div>
    </div>
  );
}

export default function SymptomChecker() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [results, setResults] = useState([]);


  const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  const selectedSet = new Set(selected); 
  const base = Symptoms_List.filter((s) => !selectedSet.has(s.key));
  if (!q) return base.slice(0, 60);
  return base.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 60);
}, [query, selected]);


  const canSubmit = selected.length > 0 && !loading;

  function toggleSymptom(symObj) {
  setSelected((prev) =>
    prev.includes(symObj.key) ? prev.filter((k) => k !== symObj.key) : [...prev, symObj.key]
  );
}


  function removeSelected(sym) {
    setResults([]);
    setApiError("");
    setSelected((prev) => prev.filter((x) => x !== sym));
  }

  function clearAll() {
    setResults([]);
    setApiError("");
    setSelected([]);
  }

  async function submit() {
    setLoading(true);
    setApiError("");
    setResults([]);

    try {
      const r = await fetch("http://localhost:5001/api/patient/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selected, top_k:2 }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Prediction failed.");

      const res = Array.isArray(data?.results) ? data.results : [];
      setResults(res);
      if (!res.length) setApiError("No results returned by the API.");
    } catch (e) {
      setApiError(e?.message || "Something went wrong calling the API.");
    } finally {
      setLoading(false);
    }
  }
  const labelByKey = useMemo(() => {
    const map = new Map();
    Symptoms_List.forEach((s) => map.set(s.key, s.label));
    return map;
    }, [Symptoms_List]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar role='patient' />
    <div className="sc-page">
      <div className="sc-container">
        <div className="sc-header">
          <div className="sc-headerRow">
            <div className="sc-logo">ML</div>
            <div>
              <div className="sc-title">Symptom Checker</div>
              <div className="sc-subtitle">
                Select symptoms, submit, and get top predicted diseases from this ML model.
              </div>
            </div>
          </div>

          <div className="sc-disclaimer">
            ⚠️ This tool is for demo purposes and does not replace medical advice.
          </div>
        </div>

        <div className="sc-grid">
          {/* Left */}
          <div className="sc-card">
            <div className="sc-controls">
              <input
                className="sc-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symptoms (e.g., cough, fever, headache)..."
              />
              <button type="button" className="sc-btn" onClick={clearAll}>
                Clear
              </button>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="sc-sectionTitle">Selected symptoms ({selected.length})</div>
              {selected.length === 0 ? (
                <div className="sc-muted">No symptoms selected yet. Pick from the list below.</div>
              ) : (
                <div className="sc-pillRow">
                  {selected.map((k) => (
                    <Pill key={k} label={labelByKey.get(k) || k} onRemove={() => removeSelected(k)} />
                    ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="sc-sectionTitle">Available symptoms</div>

              <div className="sc-symptomGrid">
                {filtered.map((s) => (
                <button key={s.key} className="sc-symptomBtn" onClick={() => toggleSymptom(s)}>
                    {s.label}
                </button>
                ))}
              </div>

              <div style={{ marginTop: 10 }} className="sc-footnote">
                Showing up to 60 results. Use search to find symptoms quickly.
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="sc-card" style={{ height: "fit-content" }}>
            <div className="sc-rightTitle">Get prediction</div>

            <div className="sc-topkRow">

              <div className="sc-submitWrap">
                <button type="button" className="sc-btnPrimary" onClick={submit} disabled={!canSubmit}>
                  {loading ? "Predicting..." : "Submit"}
                </button>
              </div>
            </div>

            {apiError ? <div className="sc-error">{apiError}</div> : null}

            <div style={{ marginTop: 14 }}>
              <div className="sc-sectionTitle">Results</div>
              {results.length === 0 ? (
                <div className="sc-muted">Submit symptoms to see predictions.</div>
              ) : (
                <div className="sc-resultsGrid">
                  {results.map((r, idx) => (
                    <ResultCard key={`${r.disease}-${idx}`} disease={r.disease} confidence={r.confidence} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
