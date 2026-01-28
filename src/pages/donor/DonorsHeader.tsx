import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';
import { useAuth } from '../../hooks/useAuth';  // Import useAuth to access hasPermission

const DonorsHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location
  const { hasPermission } = useAuth();  // Access the hasPermission function from the context
  
  // Define the Donors links
  const donorsLinks = [
    { name: "← Back to Main", href: "/dashboard", permission: "View Main Dashboard" },
    { name: "Dashboard", href: "/donor/dashboard", permission: "View Donor Dashboard" },
    { name: "Donors", href: "/donor/donors", permission: "View All Donors" },
    { name: "Add Donor", href: "/donor/addDonor", permission: "Add Donor" },
    { name: "Donations", href: "/donor/donations", permission: "View All Donations" },
    { name: "Donor Categories", href: "/donor/donorCategories", permission: "View Donor Categories" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout", permission: "logout" },  // Special case for logout
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  // Filter the links based on permissions
  const filteredLinks = donorsLinks.filter(link => {
    // For logout link, we don't need permission check, just show it
    if (link.permission === "logout") return true;
    
    // For other links, check if the user has the required permission
    return hasPermission(link.permission);
  });

  return (
    <div className="donors-header">
      {/* Pass donorsLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={filteredLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default DonorsHeader;
