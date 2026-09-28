import sys
import os
import joblib

from lime.lime_text import LimeTextExplainer

# Load model
BASE_DIR = os.path.dirname(__file__)

model = joblib.load(
    os.path.join(BASE_DIR, "waf_model.pkl")
)

vectorizer = joblib.load(
    os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")
)

# LIME wrapper
def predict_proba(texts):

    vectors = vectorizer.transform(texts)

    return model.predict_proba(vectors)

# Load class names
class_names = list(model.classes_)

explainer = LimeTextExplainer(
    class_names=class_names
)

# Payload from Node.js
payload = sys.argv[1]

# Prediction
payload_vector = vectorizer.transform([payload])

prediction = model.predict(payload_vector)[0]

confidence = max(
    model.predict_proba(payload_vector)[0]
)

# Generate explanation
exp = explainer.explain_instance(
    payload,
    predict_proba,
    num_features=5
)

keywords = []

for feature, weight in exp.as_list():
    keywords.append(feature)

# Human-readable explanation
if prediction == "sqli":

    explanation = (
        f"The payload was classified as SQL Injection because it contains "
        f"SQL-related patterns such as {', '.join(keywords)}. "
        f"These terms are commonly associated with database manipulation "
        f"and unauthorized data access attempts."
    )

elif prediction == "xss":

    explanation = (
        f"The payload was classified as Cross-Site Scripting (XSS) because it contains "
        f"script-related patterns such as {', '.join(keywords)}. "
        f"These patterns are commonly used to inject malicious client-side code."
    )

elif prediction == "path_traversal":

    explanation = (
        f"The payload was classified as Path Traversal because it contains "
        f"file-path manipulation patterns such as {', '.join(keywords)}."
    )

elif prediction == "cmdi":

    explanation = (
        f"The payload was classified as Command Injection because it contains "
        f"command execution patterns such as {', '.join(keywords)}."
    )

else:

    explanation = (
        "The payload was classified as normal because no significant attack-related "
        "patterns were detected."
    )

print(f"{prediction}|{confidence}|{explanation}")