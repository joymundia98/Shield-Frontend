import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const OrganizationHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the organization links
  const organizationLinks = [
    { name: "Profile", href: "/Organization/edittableProfile" },
    { name: "The Lobby", href: "/Organization/orgLobby" },
    { name: "Admin Accounts", href: "/Organization/orgAdminAccounts" },
    { name: "Manage Accounts", href: "/Organization/ListedAccounts" },
    { name: "Roles", href: "/Organization/roles" },
    { name: "Permissions", href: "/Organization/permissions" },
    { name: "To SCI-ELD ERP", href: "/Organization/to_SCI-ELD_ERP" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="organization-header">
      {/* Pass organizationLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={organizationLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default OrganizationHeader;
