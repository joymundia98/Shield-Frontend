import React from "react";

interface SessionExpiredModalProps {
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Session Expired</h2>
        <p>Your session has expired for security purposes. Please sign in again.</p>
        <button onClick={onClose}>Sign In Again</button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
