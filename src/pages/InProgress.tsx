import React from 'react';
import "./InProgress.css";

const UnderConstructionPage: React.FC = () => {
  return (
    <div className="Under-contruction-parent-container">
      <div className="Under-contruction-container">
        {/* Text Div */}
        <div className="Under-contruction-text-container">
          <h1>Oops ... Under Construction</h1>
          <p>SCI-ELD</p>
        </div>

        {/* Example Div */}
        <div className="Under-contruction-example">
          <div className="Under-contruction-block">
            <div className="side -main"></div>
            <div className="side -left"></div>
          </div>
          <div className="Under-contruction-block">
            <div className="side -main"></div>
            <div className="side -left"></div>
          </div>
          <div className="Under-contruction-block">
            <div className="side -main"></div>
            <div className="side -left"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstructionPage;
