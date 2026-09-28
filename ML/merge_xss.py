import pandas as pd

main_df = pd.read_csv("clean_dataset.csv")
xss_df = pd.read_csv("clean_xss_dataset.csv")

final_df = pd.concat([main_df, xss_df])

final_df = final_df.drop_duplicates()
final_df = final_df.dropna()

print(final_df["label"].value_counts())

final_df.to_csv(
    "final_training_dataset.csv",
    index=False
)

print("Final dataset created")