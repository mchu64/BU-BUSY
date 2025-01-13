from flask import Flask, jsonify
from sqlalchemy import create_engine
import pandas as pd
import joblib
from utils.preprocessing import preprocess_data

app = Flask(__name__)

# Load model
model = joblib.load('./models/xgboost_model.pkl')

# Database connection
def load_data():
    conn_params = {
        "host": "10.231.32.104",
        "port": "5432",
        "dbname": "cov_density",
        "user": "webuser",
        "password": "webuser"
    }
    engine = create_engine(f"postgresql://{conn_params['user']}:{conn_params['password']}@{conn_params['host']}:{conn_params['port']}/{conn_params['dbname']}")
    query = """SELECT date, hour, building_floor, density_cnt, building_name 
               FROM public.densitymap_hourly 
               WHERE building_desc = '915 COMMONWEALTH AVENUE' AND hour >= 6 AND hour <=23 
               AND date >= '2024-09-03' 
               ORDER BY date ASC;"""
    return pd.read_sql(query, engine)

@app.route('/predict', methods=['POST'])
def predict_density():
    df = load_data()
    df = preprocess_data(df)
    most_recent = df.iloc[-1]['date'] 
    best_df = best_df.rename(columns={'hour':'past_hour', 'density_cnt':'past_hour_density_cnt', 'real_time_hour':'hour'})
    X_vars = best_df[['hour', 'building_floor_2', 'building_floor_3', 'building_floor_l']]
    best_df['real_time_density_cnt'] = best_model.predict(X_vars).round(0)
    best_df  
    predictions = df[['real_time_hour', 'buidling_floor', 'real_time_density_cnt']].to_dict(orient='records')
    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
