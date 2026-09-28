import joblib

# Load saved model
model = joblib.load("waf_model.pkl")

# Load TF-IDF vectorizer
vectorizer = joblib.load("tfidf_vectorizer.pkl")

while True:

    payload = input("\nEnter Payload: ")

    if payload.lower() == "exit":
        break

    # Convert payload to TF-IDF
    payload_tfidf = vectorizer.transform([payload])

    # Predict attack type
    prediction = model.predict(payload_tfidf)

    # Prediction confidence
    confidence = model.predict_proba(payload_tfidf)

    print("Prediction:", prediction[0])
    print("Confidence:", max(confidence[0]))