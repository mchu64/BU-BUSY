import joblib
import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import IsolationForest
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

    # Cleaning out outliers - Two methods
        
    # Method 1: IQR
    Q1 = df['density_cnt'].quantile(0.25)
    Q3 = df['density_cnt'].quantile(0.75)
    IQR = Q3 - Q1

    lower_bound = Q1 - (1.5 * IQR)
    upper_bound = Q3 + (1.5 * IQR)

    IQR_df = df[(df['density_cnt'] >= lower_bound) & (df['density_cnt'] <= upper_bound)]

    # Method 2: Isolation Forest
    iso = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = iso.fit_predict(df[['hour', 'density_cnt', 'building_floor_2', 'building_floor_3', 'building_floor_l']])

    iso_df = df[df['anomaly'] == 1]
    df = df.drop('anomaly', axis=1)

    # Creating a list of the dfs
    dfs = [df, IQR_df, iso_df]
    comparisons = {}

    # Define parameter grid
    param_grid = {
        'n_estimators': [50, 100, 150],
        'max_depth': [2, 3, 5],
        'learning_rate': [0.01, 0.1, 0.2],
        'subsample': [0.6, 0.8, 1.0]
    }

    def run_grid_search(df):

        # Initializing X and Y variables
        X = df[['hour', 'building_floor_2', 'building_floor_3', 'building_floor_l']]
        Y = df['density_cnt']

        # Splitting into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

        # Initialize model
        xgb_model = xgb.XGBRegressor(random_state=42)

        # Perform Grid Search - CV argument handles cross validation
        grid_search = GridSearchCV(estimator=xgb_model, param_grid=param_grid, cv=5, scoring='neg_mean_squared_error', verbose=1)
        grid_search.fit(X_train, y_train)

        # Best Model and Score for the dataframe
        best_model = grid_search.best_estimator_
        best_score = grid_search.best_score_

        return [best_score, best_model, X_test, y_test]

    for i, df in enumerate(dfs):
        comparisons[run_grid_search(df)[0]] = [i, run_grid_search(df)[1], run_grid_search(df)[2], run_grid_search(df)[3]]

    # Using max because the scoring is the negative mean squared error
    new_model = comparisons[max(comparisons)][1]

    # Evaluate and save model
    X_test = comparisons[max(comparisons)][2]
    y_test = comparisons[max(comparisons)][3]
    y_pred = new_model.predict(X_test)
    
    y_pred = new_model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"Model retrained. RMSE: {rmse}")

    joblib.dump(new_model, './models/xgboost_model.pkl')
    print("Model saved.")

    return new_model
