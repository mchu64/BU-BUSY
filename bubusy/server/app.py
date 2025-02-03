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
from datetime import datetime 

app = Flask(__name__)
#app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

CORS(app)


# Database connection
#getdensitymap_data_noarg() returns all the relevant rows for the current minute
#including all active guilding floor entries for the given building code
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
        query = """SELECT date, building_code, building_floor, density_cnt
                FROM cov_density.public.getdensitymap_data_noarg()
                WHERE building_code = '619';
                """
        return pd.read_sql(query, engine)
    except Exception as e:
        logging.error(f"Error loading data from the database: {e}")
        return pd.DataFrame()


@app.route('/predict', methods=['POST'])
def predict_density():
    try:
        df = load_data()
        if df.empty:
            return jsonify({"error": "No data available"}), 404
        # Format the data to return the current density counts for each floor
        response = df[['date','building_code','building_floor', 'density_cnt']].to_dict(orient='records')
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"response updated at {current_time}: response") #tells us date it was updated
        return jsonify(response)
    except Exception as e:
        logging.error(f"Error fetching density data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500


if __name__ == '__main__':
    logging.info("Initializing predictions...")
    app.run(debug=True)
