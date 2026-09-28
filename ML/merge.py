import pandas as pd
import os
import json

# IMPORTANT: dataset folder path
folder = "../Datasets"

# IMPORTANT: stores all processed datasets
all_data = []

# Loop through every file inside Datasets folder
for file in os.listdir(folder):

    print("Processing:", file)

    #  CSV DATASETS 
    if file.endswith(".csv"):

        # Read csv file
        df = pd.read_csv(
            os.path.join(folder, file)
        )

        # IMPORTANT: keep only useful columns
        temp = df[["payload", "attack_type"]]

        # IMPORTANT: rename column for consistency
        temp.columns = ["payload", "label"]

        # Store in list
        all_data.append(temp)



    #  WAF DATASET
    elif file == "WAF_DETECTION_DATASET.jsonl":

        data = []

        with open(
            os.path.join(folder, file),
            "r",
            encoding="utf-8"
        ) as f:

            # IMPORTANT: read line by line
            for line in f:

                line = line.strip()

                if line:

                    try:
                        data.append(
                            json.loads(line)
                        )

                    except:
                        pass


        df = pd.DataFrame(data)

        # IMPORTANT: only payload exists
        temp = df[["payload"]]

        # IMPORTANT: custom label
        temp["label"] = "Unknown"

        all_data.append(temp)



    #  WEB PAYLOAD DATASET 
    elif file == "WEB_APPLICATION_PAYLOADS.jsonl":

        data = []

        with open(
            os.path.join(folder, file),
            "r",
            encoding="utf-8"
        ) as f:

            content = f.read()

            try:
                data = json.loads(content)

            except Exception as e:

                print("JSON Error:", e)

                # IMPORTANT: skip broken file
                continue


        df = pd.DataFrame(data)

        temp = df[["payload", "type"]]

        # IMPORTANT: rename to common format
        temp.columns = ["payload", "label"]

        all_data.append(temp)



# IMPORTANT: merge all datasets together
final_df = pd.concat(all_data)

# Remove empty rows
final_df = final_df.dropna()

# Remove duplicate rows
final_df = final_df.drop_duplicates()


# Show first 5 rows
print(final_df.head())


# IMPORTANT: save final dataset
final_df.to_csv(
    "final_dataset.csv",
    index=False
)

print("Dataset created successfully")