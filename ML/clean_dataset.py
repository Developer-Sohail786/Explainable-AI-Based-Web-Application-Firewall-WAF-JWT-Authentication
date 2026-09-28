import pandas as pd

df = pd.read_csv("final_dataset.csv")

# IMPORTANT: unify labels
df["label"] = df["label"].replace({
    "norm":"normal",
    "sql-syntax":"sqli",
    "js-syntax":"xss",
    "path-traversal":"path_traversal"
})

# IMPORTANT: remove unknown rows
df = df[df["label"] != "Unknown"]

print(df["label"].value_counts())

# Save cleaned dataset
df.to_csv(
    "clean_dataset.csv",
    index=False
)

print("Clean dataset created")