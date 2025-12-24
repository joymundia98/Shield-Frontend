import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const AssetsHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the Assets links
  const assetsLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/assets/dashboard" },
    { name: "Assets", href: "/assets/assets" },
    { name: "Depreciation Info", href: "/assets/depreciation" },
    { name: "Maintenance", href: "/assets/maintenance" },
    { name: "Categories", href: "/assets/categories" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="assets-header">
      {/* Pass assetsLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={assetsLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default AssetsHeader;
