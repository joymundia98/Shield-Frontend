import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './success.css';

const OrganizationSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [accountID, setAccountID] = useState<string | null>(null);
  const [organizationID, setOrganizationID] = useState<number | null>(null);
  const [_hqID, setHqID] = useState<number | null>(null);
  const [isHQ, setIsHQ] = useState<boolean>(false);

  // Retrieve navigation state
  useEffect(() => {
    const state = location.state;
    if (state) {
      setAccountID(state.accountID || null);
      setOrganizationID(state.organizationID || null);
      setHqID(state.hqID || null);
      setIsHQ(state.isHQ || false);
    }
  }, [location]);

  // Copy Account ID
  const copyToClipboard = () => {
    if (accountID) {
      navigator.clipboard.writeText(accountID)
        .then(() => alert('Account ID copied to clipboard!'))
        .catch(() => alert('Failed to copy Account ID.'));
    }
  };

  if (!accountID || !organizationID) {
    return <div>Loading...</div>;
  }

  {/*const handleCreateAdmin = () => {
    navigate(
      isHQ ? "/admin/create-account" : "/org/admin/create-account",
      {
        state: {
          organizationID,
          hqID,        // 👈 always passed (null if not HQ)
          accountID,
          isHQ
        }
      }
    );
  };*/}

  return (
    <div className="organization-success-container">
      <div className="main-content">

        <h1 className="success-h1">
          {isHQ
            ? "Your Headquarters Was Registered Successfully!"
            : "Your Organization Was Registered Successfully!"}
        </h1>

        <p>
          An Administrator account is required to manage and operate this{" "}
          {isHQ ? "Headquarters" : "organization"}.
          Please proceed to create an Administrator account to complete the setup process.
        </p>

        <br />

        {/* Account ID Card */}
        <div className="glassmorphic-card">
          <button className="copy-btn" onClick={copyToClipboard}>
            Copy Account ID
          </button>
          <div className="account-id">
            {accountID}
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <p><strong>Next Steps:</strong></p>
          <p>1. Authenticate this organization by logging in using the above Account ID and password created during registration.</p>
          <p>2. Create an Administrator account linked to this {isHQ ? "Headquarters" : "organization"}.</p>
          <p>3. Begin management.</p>
        </div>

        {/* Button to navigate to OrgLogin */}
        <button className="create-account-btn" onClick={() => navigate('/org-login')}>
          Login Organization
        </button>

      </div>
    </div>
  );
};

export default OrganizationSuccessPage;
