from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "disease_model.joblib"))
cols = joblib.load(os.path.join(BASE_DIR, "symptom_columns.joblib"))
le = joblib.load(os.path.join(BASE_DIR, "label_encoder.joblib"))

class PredictRequest(BaseModel):
    symptoms: list[str]
    top_k: int = 5

@app.post("/predict")
def predict(req: PredictRequest):
    # Create an empty row with zeros for all symptom columns
    row = pd.DataFrame(np.zeros((1, len(cols))), columns=cols)
    
    # Fill 1 for the symptoms provided in the request
    for s in req.symptoms:
        s = s.strip()
        if s in row.columns:
            row.at[0, s] = 1

    # Get prediction probabilities
    probs = model.predict_proba(row)[0]
    
    # Select the top_k results
    top_k = max(1, min(req.top_k, len(probs)))
    idxs = np.argsort(probs)[-top_k:][::-1]

    # Map indices back to disease names using the LabelEncoder
    results = [
        {"disease": le.inverse_transform([i])[0], "confidence": round(float(probs[i]), 4)} 
        for i in idxs
    ]
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)