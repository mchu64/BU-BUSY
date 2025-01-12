import React, { useState, useEffect } from 'react';
import { fetchDensityData } from './services/api'; // Import API service
import './App.css';

function App() {
    const [densityData, setDensityData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getDensityData = async () => {
            try {
                const data = await fetchDensityData();
                setDensityData(data); // Save floor-wise density data
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        getDensityData();
    }, []);

    const renderFloorBoxes = () => {
        // Create a box for each floor
        return Object.entries(densityData).map(([floor, density]) => (
            <div key={floor} className="gym-info-box">
                <h1>{`Floor ${floor.toUpperCase()}`}</h1>
                <p>{`Predicted Density: ${density.toFixed(2)}`}</p>
            </div>
        ));
    };

    return (
        <div className="app flex-container">
            {/* Header Section */}
            <div className="header">
                <h1>Busy-BU(BETA)</h1>
                <h2>This is where you can find how busy the FitRec is!</h2>
                <h2>
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfC59OBcIGHbxW38LdatOmalNIOiOT91RZl4vipeeygkDEQ3A/viewform"
                        style={{ color: 'lightblue' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Give us feedback on the site
                    </a>
                </h2>
            </div>

            {/* Box Container Section */}
            <div className="box-container">
                {loading ? (
                    <p>Loading data...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    renderFloorBoxes() // Render the floor boxes dynamically
                )}
            </div>
        </div>
    );
}

export default App;
