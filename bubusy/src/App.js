import React, { useState, useEffect } from "react";

function App() {
  const [showWarning, setShowWarning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180); // Initial time in seconds (60 minutes)
  const [data, setData] = useState([]); // For density predictions

  // Handle warning close
  const handleClose = () => {
    setShowWarning(false);
  };

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, []);

  // Function to fetch predictions from the backend
  const fetchPredictions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", { //change when uploading to heroku
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result); // Set the data in the state
    } catch (error) {
      console.error("Error fetching predictions:", error);
    }
  };

  // Fetch data when the component mounts
  // refetchs the data every 3 minutes 
  useEffect(() => {
    const fetchAtAlignedTime = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 180000); // add 3 minutes to the clock
      const timeUntilNextHour = nextHour - now;
  
      // Fetch predictions in the next 3 minutes
      setTimeout(() => { // only runs once setInterval causes reoccuring fetchs 
        fetchPredictions(); // Fetch at next 3 minute interva;
        // Set regular interval after the first aligned fetch
        const interval = setInterval(fetchPredictions, 180000); // Fetch every 3 minutes
        return () => clearInterval(interval); // Cleanup on component unmount
      }, timeUntilNextHour);
    };
  
    // Fetch immediately and schedule aligned fetches
    fetchPredictions();
    fetchAtAlignedTime();
  
    return () => clearTimeout(fetchAtAlignedTime); // Cleanup timeout
    
  }, []);

   // Log new data when `data` is updated
   useEffect(() => {
    if (data.length > 0) {
      console.log("New data fetched:", data);
    }
  }, [data]); 

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Map density count to a descriptive string
  const getDensityDescription = (density) => {
    if (density <= 50) {
      return "Not Busy";
    } else if (density <= 100) {
      return "Somewhat Busy";
    } else if (density <= 150) {
      return "Busy";
    } else {
      return "Very Busy";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Dimming overlay */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}

      {/* Warning alert */}
      {showWarning && (
        <div
          className="alert alert-warning fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 shadow-lg max-w-md p-6 rounded-lg"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="ml-2">
                Warning: BU Busy is still in beta! Predictions may not be 100%
                accurate
              </span>
            </div>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="btn btn-circle btn-outline border-black text-black hover:bg-black hover:text-yellow-500 hover:border-yellow-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mt-16 p-4 flex justify-center">
        {/* Card Container */}
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          {/* Center Name and Address */}
          <h1 className="text-2xl font-bold text-red-500">
            BU Fitness and Recreation Center
          </h1>
          <p className="text-gray-600 mt-2">
            915 Commonwealth Ave, Boston, MA 02215
          </p>

          {/* Real-Time Predictions */}
          <div className="relative mt-6">
            <h2 className="text-lg font-bold text-gray-700">
              Real-Time Density Predictions
            </h2>
            <div className="mt-4 space-y-4">
              {data.length === 0 ? (
                <p>Loading predictions...</p>
              ) : (
                data.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600 font-bold">
                      Floor {item.building_floor}:
                    </span>
                    <span className="text-red-500 font-semibold">
                      {/*getDensityDescription(item.real_time_density_cnt)*/}
                      {item.density_cnt}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-700">
              Time Till Next Update
            </h2>
            <div className="font-mono text-5xl mt-2">{formatTime(timeLeft)}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
