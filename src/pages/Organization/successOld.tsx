import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './success.css';

const OrganizationSuccessPage = () => {
  const location = useLocation();
  const [accountID, setAccountID] = useState<string | null>(null);
  const [organizationID, setOrganizationID] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use useEffect to retrieve the Account ID and Organization ID from the navigation state
  useEffect(() => {
    const state = location.state;
    if (state && state.accountID && state.organizationID) {
      setAccountID(state.accountID);
      setOrganizationID(state.organizationID);
    }
  }, [location]);

  // Copy Account ID to clipboard
  const copyToClipboard = () => {
    if (accountID) {
      navigator.clipboard.writeText(accountID)
        .then(() => {
          alert('Account ID copied to clipboard!');
        })
        .catch((error) => {
          console.error('Error copying text: ', error);
          alert('Failed to copy Account ID.');
        });
    }
  };

  // Display a loading state until the accountID is available
  if (!accountID || !organizationID) {
    return <div>Loading...</div>;
  }

  return (
    <div className="organization-success-container">
      <div className="main-content">
        <h1 className="success-h1">Your Organization was Registered Successfully!</h1>
        <p>Please ensure that your account ID is kept secure, as it will be necessary for logging this organization in.</p>

        <br />
        {/* Glassmorphic Card with Account ID and Copy Button */}
        <div className="glassmorphic-card">
          <button className="copy-btn" onClick={copyToClipboard}>Copy Account ID</button>
          <div className="account-id" id="accountID">{accountID}</div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <p><strong>Next Steps:</strong></p>
          <p>Create an admin account to login to the Shield software.</p>
        </div>

        {/* Button to navigate to Admin Account Creation */}
        <button className="create-account-btn" onClick={() => navigate('/admin/create-account', { state: { organizationID, accountID } })}>
          + Create Admin Account
        </button>
      </div>
    </div>
  );
};

export default OrganizationSuccessPage;
