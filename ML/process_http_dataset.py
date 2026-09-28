import pandas as pd

# Read dataset
df = pd.read_csv("../Datasets/csic_database.csv")

# IMPORTANT: keep useful columns only
df = df[["content","URL","classification"]]

# IMPORTANT: merge URL + content into one payload
df["payload"] = (
    df["URL"].fillna("") + " " +
    df["content"].fillna("")
)

# IMPORTANT: convert labels
df["label"] = df["classification"].replace({
    0:"normal",
    1:"attack"
})

# Keep final columns only
df = df[["payload","label"]]

# Remove empty rows
df = df.dropna()

# Save
df.to_csv(
    "http_dataset_clean.csv",
    index=False
)

print(df["label"].value_counts())
print("Done")