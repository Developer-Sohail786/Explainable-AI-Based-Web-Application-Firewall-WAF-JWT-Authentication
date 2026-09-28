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

# Wrapper for LIME
def predict_proba(texts):

    vectors = vectorizer.transform(texts)

    return model.predict_proba(vectors)

# Class names from model
class_names = list(model.classes_)

explainer = LimeTextExplainer(
    class_names=class_names
)

payload = "' UNION SELECT username,password FROM users --"

exp = explainer.explain_instance(
    payload,
    predict_proba,
    num_features=5
)

prediction = model.predict(
    vectorizer.transform([payload])
)[0]

print("Prediction:", prediction)

print("\nImportant Features:")

for feature, weight in exp.as_list():
    print(feature, ":", round(weight, 4))