import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const HQHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the HQ links
  const HQLinks = [
    { name: "Branch Directory", href: "/HQ/branchDirectory" },
    { name: "Reports", href: "/HQ/roles" },
    { name: "Admin Accounts", href: "/HQ/orgAdminAccounts" },
    { name: "To SCI-ELD ERP", href: "/HQ/to_SCI-ELD_ERP" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="HQ-header">
      {/* Pass HQLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={HQLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default HQHeader;
