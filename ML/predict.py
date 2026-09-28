import sys
import os
import joblib

# Get current file location
BASE_DIR = os.path.dirname(__file__)

# Load model and vectorizer
model = joblib.load(
    os.path.join(BASE_DIR, "waf_model.pkl")
)

vectorizer = joblib.load(
    os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")
)

# Payload from Node.js
payload = sys.argv[1]

# Convert payload to TF-IDF
payload_tfidf = vectorizer.transform([payload])

# Predict attack type
prediction = model.predict(payload_tfidf)[0]

# Prediction confidence
confidence = max(
    model.predict_proba(payload_tfidf)[0]
)

# Return result to Node.js
print(f"{prediction}|{confidence}")