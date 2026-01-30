import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './success.css';

const HQOrganizationSuccessPage = () => {
  const location = useLocation();
  const [headquarters_account_id, setheadquarters_account_id] = useState<string | null>(null);
  const [headquarterId, setheadquarterId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use useEffect to retrieve the Account ID and headquarter ID from the navigation state
  useEffect(() => {
    const state = location.state;
    if (state && state.headquarters_account_id && state.headquarterId) {
      setheadquarters_account_id(state.headquarters_account_id);
      setheadquarterId(state.headquarterId);
    }
  }, [location]);

  // Copy Account ID to clipboard
  const copyToClipboard = () => {
    if (headquarters_account_id) {
      navigator.clipboard.writeText(headquarters_account_id)
        .then(() => {
          alert('Account ID copied to clipboard!');
        })
        .catch((error) => {
          console.error('Error copying text: ', error);
          alert('Failed to copy Account ID.');
        });
    }
  };

  // Display a loading state until the headquarters_account_id is available
  if (!headquarters_account_id || !headquarterId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="organization-success-container">
      <div className="main-content">
        <h1 className="success-h1">Your Headquarters was Registered Successfully!</h1>
        <p>Please ensure that your account ID is kept secure, as it will be necessary for logging this organization in.</p>

        <br />
        {/* Glassmorphic Card with Account ID and Copy Button */}
        <div className="glassmorphic-card">
          <button className="copy-btn" onClick={copyToClipboard}>Copy Account ID</button>
          <div className="account-id" id="headquarters_account_id">{headquarters_account_id}</div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <p><strong>Next Steps:</strong></p>
          <p>Check your email inbox or spam folder for the Organization Account ID...</p>
          <p>Login with your new credentials...</p>
        </div>

        {/* Button to navigate to OrgLogin */}
        <button className="create-account-btn" onClick={() => navigate('/org-login', { state: { headquarterId, headquarters_account_id } })}>
          Organization Login
        </button>
      </div>
    </div>
  );
};

export default HQOrganizationSuccessPage;
