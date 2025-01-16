from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
import pandas as pd
import joblib
from utils.preprocessing import preprocess_data
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
from retrain import retrain_model
import logging
from apscheduler.triggers.cron import CronTrigger

app = Flask(__name__)
#app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

CORS(app)

# Load model
model = joblib.load('./models/xgboost_model.pkl')

predictions = []


#this function is for retraining the data
def retrain_and_update():
    global model
    try:
        model = retrain_model()  # Update the global model
        logging.info("Model successfully retrained and updated.")
    except Exception as e:
        logging.error(f"Error during model retraining: {e}")


# Database connection
def load_data():
    try:
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
    except Exception as e:
        logging.error(f"Error loading data from the database: {e}")
        return pd.DataFrame()


#this function is for repredicting the data every hour
def predict_and_update_density():
    global predictions
    try:
        df = load_data()
        df = preprocess_data(df)
        X_vars = df[['hour', 'building_floor_2', 'building_floor_3', 'building_floor_l']]
        df['real_time_density_cnt'] = model.predict(X_vars).round(0)
        most_recent_date = df[df['date'] == df.iloc[-1]['date']]
        print(most_recent_date)
        most_recent_hour = most_recent_date[most_recent_date['hour'] == df.iloc[-1]['hour']]
        predictions = most_recent_hour[['hour', 'building_floor', 'real_time_density_cnt']].to_dict(orient='records')
        print("Hourly predictions updated:", predictions)
        return predictions
    except Exception as e:
        logging.error(f"Error during prediction update: {e}")
        return []


# Schedule the retraining process
scheduler = BackgroundScheduler()
#this also should rerun the model every hour 
# Run the model update exactly on the hour, every hour
scheduler.add_job(func=predict_and_update_density, trigger=CronTrigger(minute=0))
# Run the retraining every 4 weeks (e.g., Sunday at midnight)
scheduler.add_job(func=retrain_and_update, trigger=CronTrigger(day_of_week="sun", hour=0, minute=0, week="4"))
scheduler.start()
# Shut down the scheduler when the app exits
atexit.register(lambda: scheduler.shutdown())


@app.route('/predict', methods=['POST'])
def predict_density():
    global predictions
    if not predictions:  # Dynamically compute if predictions are empty
        logging.info("Predictions cache is empty. Calculating dynamically.")
        predictions = predict_and_update_density()
    if not predictions:  # If still empty after dynamic calculation
        return jsonify({"error": "Unable to calculate predictions. Please try again later."}), 503
    return jsonify(predictions)


if __name__ == '__main__':
    logging.info("Initializing predictions...")
    try:
        predict_and_update_density()  # Initial update
    except Exception as e:
        logging.error(f"Error during initial prediction update: {e}")
    app.run(debug=True)
