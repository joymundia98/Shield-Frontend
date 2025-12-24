import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const ProgramsHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the Programs links
  const programsLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/programs/dashboard" },
    { name: "Registered Programs", href: "/programs/RegisteredPrograms" },
    { name: "Attendance Management", href: "/programs/attendeeManagement" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="programs-header">
      {/* Pass programsLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={programsLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default ProgramsHeader;
