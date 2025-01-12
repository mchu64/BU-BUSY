import pandas as pd

def preprocess_data(df):
    # Using One Hot Encoding to use the buidling_floor feature in ML models
    df_mod = pd.get_dummies(df, columns=['building_floor'], drop_first=True, dtype=int)

    # Adding back the original buidling floor column for consistency 
    df_mod['buidling_floor'] = df['building_floor']


    # Adding a real time hour feature to use for ML modeling
    df_mod['real_time_hour'] = df_mod['hour'] + 1

    return df