import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib  
import warnings
import os

warnings.filterwarnings('ignore')

def prepare_data(filepath):
    df = pd.read_csv(filepath)
    # Identify symptoms 
    symptoms = [col for col in df.columns if col != 'disease']
    
    X = df[symptoms].values
    y = df['disease'].values
    
    # Encode disease names to numbers
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    return X_train, X_test, y_train, y_test, le, symptoms

if __name__ == "__main__":
    # Load data 
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(BASE_DIR,"disease_symptom_dataset.csv" )
    X_train, X_test, y_train, y_test, le, symptom_list = prepare_data(data_path)

    # Train Random Forest
    print("Training Random Forest model...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=20, random_state=42)
    rf.fit(X_train, y_train)

    # Evaluate
    y_pred = rf.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2%}")
    print("\nDetailed Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))

    # 3. Save components using joblib (required for your API)
    joblib.dump(rf, "./disease_model.joblib")
    joblib.dump(symptom_list, "./symptom_columns.joblib")
    joblib.dump(le, "./label_encoder.joblib")
    
    print("\nModel components saved successfully:")
    print("- disease_model.joblib")
    print("- symptom_columns.joblib")
    print("- label_encoder.joblib")

    # 4. Local Test Prediction (matches API logic)
    example_symptoms = ['high_fever', 'cough', 'fatigue']
    print(f"\nTesting symptoms: {example_symptoms}")
    
    # Create the row as a DataFrame (just like the API does)
    test_row = pd.DataFrame(np.zeros((1, len(symptom_list))), columns=symptom_list)
    for s in example_symptoms:
        if s in test_row.columns:
            test_row.at[0, s] = 1
            
    # Predict
    probs = rf.predict_proba(test_row)[0]
    idxs = np.argsort(probs)[-3:][::-1]
    
    print("Results:")
    for i in idxs:
        disease_name = le.inverse_transform([i])[0]
        print(f" - {disease_name}: {probs[i]:.1%}")