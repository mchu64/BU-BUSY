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
                accurate.
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
      <div className={`relative ${showWarning ? "blur-sm" : ""}`}>
        <header className="text-center py-4">
          <h1 className="text-4xl font-bold text-blue-500">Busy BU</h1>
          <p className="text-lg text-gray-600">
            Real-time and predictive occupancy data for BU's facilities
          </p>
        </header>

        <main className="mt-8">
          <p className="text-center text-gray-700">
            Welcome to Busy BU! Check real-time data on facility usage.
          </p>
        </main>
      </div>
    </div>
  );
}

export default App;
