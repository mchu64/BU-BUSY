from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
import pandas as pd
import joblib
from utils.preprocessing import preprocess_data
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from retrain import retrain_model

app = Flask(__name__)
#app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

CORS(app)

# Load model
model = joblib.load('./models/xgboost_model.pkl')
def retrain_and_update():
    global model
    model = retrain_model()  # Update the global model
    print("Model updated in Flask app.")

# Schedule the retraining process
#this should retrain the model every 4 weeks 
scheduler = BackgroundScheduler()
scheduler.add_job(func=retrain_and_update, trigger='interval', weeks=4)  # Runs every 4 weeks
scheduler.start()

# Shut down the scheduler when the app exits
atexit.register(lambda: scheduler.shutdown())

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
               ORDER BY date ASC, hour ASC;"""
    return pd.read_sql(query, engine)

@app.route('/predict', methods=['POST'])
def predict_density():
    df = load_data()
    df = preprocess_data(df)
    X_vars = df[['hour', 'building_floor_2', 'building_floor_3', 'building_floor_l']]
    df['real_time_density_cnt'] = model.predict(X_vars).round(0)
    most_recent_date = df[df['date'] == df.iloc[-1]['date']]
    most_recent_hour = most_recent_date[most_recent_date['hour'] == df.iloc[-1]['hour']]
    predictions = most_recent_hour[['hour', 'building_floor', 'real_time_density_cnt']].to_dict(orient='records')
    print(predictions)
    return jsonify(predictions)


if __name__ == '__main__':
    app.run(debug=True)
