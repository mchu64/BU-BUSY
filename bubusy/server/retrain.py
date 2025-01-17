import joblib
import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import xgboost as xgb
import numpy as np
from utils.preprocessing import preprocess_data

# Retrain model function
def retrain_model():
    print("Fetching data for retraining...")
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
    df = pd.read_sql(query, engine)
    df = preprocess_data(df)

    # Prepare data
    X = df[['hour', 'building_floor_2', 'building_floor_3', 'building_floor_l']]
    y = df['density_cnt']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Retrain the model
    print("Retraining the model...")
    new_model = xgb.XGBRegressor(random_state=42, n_estimators=100, max_depth=3, learning_rate=0.1, subsample=0.8)
    new_model.fit(X_train, y_train)

    # Evaluate and save model
    y_pred = new_model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"Model retrained. RMSE: {rmse}")

    joblib.dump(new_model, './models/xgboost_model.pkl')
    print("Model saved.")

    return new_model
