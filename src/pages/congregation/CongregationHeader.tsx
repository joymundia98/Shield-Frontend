import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const CongregationHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the Congregation links
  const congregationLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/congregation/dashboard" },
    { name: "Members", href: "/congregation/members" },
    { name: "Attendance", href: "/congregation/attendance" },
    //{ name: "Follow-ups", href: "/congregation/followups" },
    { name: "Visitors", href: "/congregation/visitors" },
    { name: "New Converts", href: "/congregation/converts" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="congregation-header">
      {/* Pass congregationLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={congregationLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default CongregationHeader;
