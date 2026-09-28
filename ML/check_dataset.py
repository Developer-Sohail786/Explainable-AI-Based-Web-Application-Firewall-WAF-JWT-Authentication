import pandas as pd

df = pd.read_csv("final_dataset.csv")

# IMPORTANT: count labels
print(df["label"].value_counts())

print("\nSample rows:\n")

# IMPORTANT: show random payloads
print(
    df.sample(20)
)