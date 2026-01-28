import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';
import { useAuth } from '../../hooks/useAuth';  // Import useAuth to access hasPermission

const CongregationHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location
  const { hasPermission } = useAuth();  // Access the hasPermission function from the context

  // Define the Congregation links with their corresponding permission names
  const congregationLinks = [
    { name: "← Back to Main", href: "/dashboard", permission: "View Main Dashboard" },
    { name: "Dashboard", href: "/congregation/dashboard", permission: "view_dashboardView Congregation Dashboard" },
    { name: "Members", href: "/congregation/members", permission: "View Members Summary" },
    { name: "Attendance", href: "/congregation/attendance", permission: "Record Congregation Attendance" },
    //{ name: "Follow-ups", href: "/congregation/followups", permission: "View Congregation Follow-ups" },
    { name: "Visitors", href: "/congregation/visitors", permission: "View Visitor Dashboard" },
    { name: "New Converts", href: "/congregation/converts", permission: "View Converts Dashboard" },
    { name: "➜] Logout", href: "#logout", permission: "logout" },  // Special case for logout
  ];

  // Handle the logout functionality
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  // Filter the links based on permissions
  const filteredLinks = congregationLinks.filter(link => {
    // For logout link, we don't need permission check, just show it
    if (link.permission === "logout") return true;
    
    // For other links, check if the user has the required permission
    return hasPermission(link.permission);
  });

  return (
    <div className="congregation-header">
      {/* Pass filteredLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={filteredLinks}  // Use the filtered links here
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default CongregationHeader;
