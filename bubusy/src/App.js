import React, { useState } from "react";

function App() {
  // State to manage the visibility of the warning
  const [showWarning, setShowWarning] = useState(true);

  // Function to close the warning
  const handleClose = () => {
    setShowWarning(false);
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
    <h1 className="text-2xl font-bold text-blue-500">BU Fitness and Recreation Center</h1>
    <p className="text-gray-600 mt-2">915 Commonwealth Ave, Boston, MA 02215</p>

    {/* Carousel */}
    <div className="relative mt-6">
      {/* Carousel Content */}
      <div className="carousel w-full">
        {/* Current Occupancy */}
        <div className="carousel-item flex flex-col items-center justify-center w-full">
          <h2 className="text-lg font-bold text-gray-700">Current Occupancy</h2>
          <p className="text-3xl font-bold text-blue-500 mt-4">70%</p>
          <div className="w-3/4 h-2 bg-gray-200 rounded mt-4">
            <div className="h-2 bg-blue-500 rounded" style={{ width: "70%" }}></div>
          </div>
        </div>

        {/* Predicted Occupancy */}
        <div className="carousel-item flex flex-col items-center justify-center w-full">
          <h2 className="text-lg font-bold text-gray-700">Predicted Occupancy</h2>
          <ul className="mt-4 space-y-2">
            <li className="text-gray-600">4 PM - 60%</li>
            <li className="text-gray-600">5 PM - 50%</li>
            <li className="text-gray-600">6 PM - 40%</li>
          </ul>
        </div>

        {/* Peak Hours */}
        <div className="carousel-item flex flex-col items-center justify-center w-full">
          <h2 className="text-lg font-bold text-gray-700">Peak Hours</h2>
          <p className="text-gray-600 mt-4">Peak hours are typically 5 PM - 7 PM.</p>
          <p className="text-gray-600">Visit during non-peak hours for a quieter experience.</p>
        </div>
      </div>

      {/* Arrows */}
      <button className="absolute left-0 top-1/2 transform -translate-y-1/2 btn btn-circle btn-sm z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button className="absolute right-0 top-1/2 transform -translate-y-1/2 btn btn-circle btn-sm z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</main>


    </div>
  );
}

export default App;
