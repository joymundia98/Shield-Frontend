import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const HRHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the HR links
  const hrLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/hr/dashboard" },
    { name: "Staff Directory", href: "/hr/staffDirectory" },
    { name: "Payroll", href: "/hr/payroll" },
    { name: "Leave Management", href: "/hr/leave" },
    { name: "Leave Applications", href: "/hr/leaveApplications" },
    { name: "Departments", href: "/hr/departments" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="hr-header">
      {/* Pass hrLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={hrLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default HRHeader;
