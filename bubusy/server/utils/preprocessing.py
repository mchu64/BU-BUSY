import pandas as pd

def preprocess_data(df):
    # Using One Hot Encoding to use the buidling_floor feature in ML models
    df_mod = pd.get_dummies(df, columns=['building_floor'], drop_first=True, dtype=int)

    # Adding a real time hour feature to use for ML modeling
    df_mod['real_time_hour'] = df_mod['hour'] + 1

    # Adding back the original buidling floor column for the json 
    df_mod['building_floor'] = df['building_floor']

    # Renaming columns so they can be passed through xgboost model
    df_mod = df_mod.rename(columns={'hour':'past_hour', 'density_cnt':'past_hour_density_cnt', 'real_time_hour':'hour'})

    return df_mod
