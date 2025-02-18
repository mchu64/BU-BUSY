import React, { useState, useEffect } from "react";

function App() {
  const [showWarning, setShowWarning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0); // Time until next update in seconds
  const [floorData, setFloorData] = useState({
    1: null,
    2: null,
    3: null,
    4: null
  }); // Object to store the latest data for floors 1 through 4

  // Handle warning close
  const handleClose = () => {
    setShowWarning(false);
  };

  // Function to fetch predictions from the backend
  const fetchPredictions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newFloorData = { ...floorData }; // Start with the current floor data
      result.forEach(item => {
        if (item.building_floor >= 1 && item.building_floor <= 4 && item.density_cnt != null) {
          newFloorData[item.building_floor] = item.density_cnt; // Update only with new data
        }
      });
      setFloorData(newFloorData); // Update state with new data
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  useEffect(() => {
    const calculateTimeToNextInterval = () => {
      const now = new Date();
      const secondsPastMinute = now.getSeconds() + (now.getMinutes() * 60);
      const secondsToNextInterval = 180 - (secondsPastMinute % 180);
      setTimeLeft(secondsToNextInterval);
      return secondsToNextInterval * 1000;
    };

    const timeToNextInterval = calculateTimeToNextInterval();

    // Fetch immediately at the next interval, then set to fetch every 3 minutes
    setTimeout(() => {
      fetchPredictions();
      setInterval(fetchPredictions, 180000);
    }, timeToNextInterval);

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 180);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}
      {showWarning && (
        <div
          className="alert alert-warning fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 shadow-lg max-w-md p-6 rounded-lg"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="ml-2">
                Warning: BU Busy is still in beta! Predictions may not be 100%
                accurate
              </span>
            </div>
            <button onClick={handleClose} className="btn btn-circle btn-outline">
              Close
            </button>
          </div>
        </div>
      )}
      <main className="mt-16 p-4 flex justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-500">BU Mugar Library</h1>
          <p className="text-gray-600 mt-2">915 Commonwealth Ave, Boston, MA 02215</p>
          <div className="relative mt-6">
            <h2 className="text-lg font-bold text-gray-700">Real-Time Density</h2>
            <div className="mt-4 space-y-4">
              {Object.entries(floorData).map(([floor, density]) => (
                <div key={floor} className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold">Floor {floor}:</span>
                  <span className="text-red-500 font-semibold">{density !== null ? density : "Loading..."}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-700">Time Till Next Update</h2>
            <div className="font-mono text-5xl mt-2">{formatTime(timeLeft)}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
