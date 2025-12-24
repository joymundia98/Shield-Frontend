import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const DonorsHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the Donors links
  const donorsLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/donor/dashboard" },
    { name: "Donors", href: "/donor/donors" },
    { name: "Add Donor", href: "/donor/addDonor" },
    { name: "Donations", href: "/donor/donations" },
    { name: "Donor Categories", href: "/donor/donorCategories" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="donors-header">
      {/* Pass donorsLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={donorsLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default DonorsHeader;
