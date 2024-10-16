// App.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css'; // Importing the CSS file

function App() {
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
        
        {/* Static Boxes */}
        <div className="evaluate">
          <h1>Rate Busyness</h1>
          <p>Please give us a rating on the population of the gym!</p>
        </div>

        <div className="gym-info-box">
          <h1>Upper Weight Room</h1>
          <p>This is how you can check the busyness of the upper weight room!</p>
        </div>

        <div className="gym-info-box">
          <h1>Lower Weight Room</h1>
          <p>This is how you can check the busyness of the bottom weight room!</p>
        </div>

        <div className="courts">
          <h1>Upper Courts</h1>
          <p>This is how you can check the busyness of the upper courts!</p>
        </div>

        <div className="courts">
          <h1>Lower Courts</h1>
          <p>This is how you can check the busyness of the lower courts!</p>
        </div>
      </div>

      {/* Router Views */}
      <Outlet />
    </div>
  );
}

export default App;
