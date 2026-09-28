import pandas as pd

# Read XSS dataset
df = pd.read_csv("../Datasets/XSS_dataset.csv")

# Check labels
print(df["Label"].value_counts())

# Keep only XSS rows
xss_df = df[df["Label"] == 1]

# IMPORTANT: keep only payload column
xss_df = xss_df[["Sentence"]]

# Add label
xss_df["label"] = "xss"

# Rename column
xss_df.columns = ["payload", "label"]

# Remove duplicates
xss_df = xss_df.drop_duplicates()

# Remove empty rows
xss_df = xss_df.dropna()

print(xss_df.head())
print("Total XSS samples:", len(xss_df))

# Save cleaned dataset
xss_df.to_csv(
    "clean_xss_dataset.csv",
    index=False
)

print("XSS dataset cleaned")