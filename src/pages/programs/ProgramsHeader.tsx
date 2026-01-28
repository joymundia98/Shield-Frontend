import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';
import { useAuth } from '../../hooks/useAuth';  // Import useAuth to access hasPermission

const ProgramsHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location
  const { hasPermission } = useAuth();  // Access the hasPermission function from the context
  
  // Define the Programs links
  const programsLinks = [
    { name: "← Back to Main", href: "/dashboard", permission: "View Main Dashboard"  },
    { name: "Dashboard", href: "/programs/dashboard", permission: "View Programs Dashboard"  },
    { name: "Registered Programs", href: "/programs/RegisteredPrograms", permission: "View Registered Programs"  },
    { name: "Attendance Management", href: "/programs/attendeeManagement", permission: "Manage Attendees"  },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout", permission: "logout" },  // Special case for logout
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  // Filter the links based on permissions
  const filteredLinks = programsLinks.filter(link => {
    // For logout link, we don't need permission check, just show it
    if (link.permission === "logout") return true;
    
    // For other links, check if the user has the required permission
    // Check if the link has permission and it's a string, otherwise return false
    return hasPermission(link.permission);
  });

  return (
    <div className="programs-header">
      {/* Pass programsLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={filteredLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default ProgramsHeader;
