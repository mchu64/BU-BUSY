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
    X_vars = df[['real_time_hour', 'building_floor_2', 'building_floor_3', 'building_floor_1']]
    df['real_time_density_cnt'] = model.predict(X_vars)
    return jsonify(df[['date', 'hour', 'real_time_density_cnt']].to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
