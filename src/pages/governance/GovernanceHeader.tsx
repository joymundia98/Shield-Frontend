import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const GovernanceHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the Governance links
  const governanceLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/governance/dashboard" },
    { name: "Policies", href: "/governance/policies" },
    { name: "Audit Reports", href: "/governance/audit-reports" },
    { name: "Compliance Logs", href: "/governance/compliance-logs" },
    { name: "Church Documentation", href: "/governance/documentation" },
    { name: "Certificates for Members", href: "/governance/certificates" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="governance-header">
      {/* Pass governanceLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={governanceLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default GovernanceHeader;
