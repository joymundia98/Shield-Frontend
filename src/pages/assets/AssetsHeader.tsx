import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth

const AssetsHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth(); // Access permission checker

  // Define links with required permissions
  const assetsLinks = [
    { name: "← Back to Main", href: "/dashboard", permission: "View Main Dashboard" },
    { name: "Dashboard", href: "/assets/dashboard", permission: "View Asset Dashboard" },
    { name: "Assets", href: "/assets/assets", permission: "View All Assets" },
    { name: "Depreciation Info", href: "/assets/depreciation", permission: "View Asset Depreciation" },
    { name: "Maintenance", href: "/assets/maintenance", permission: "Manage Asset Maintenance" },
    { name: "Categories", href: "/assets/categories", permission: "View Categories" },
    { name: "➜] Logout", href: "#logout", permission: "logout" }, // Special case
  ];

  // Handle logout
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    navigate('/');
  };

  // Filter links based on permissions
  const filteredLinks = assetsLinks.filter(link => {
    if (link.permission === "logout") return true; // Always show logout
    return hasPermission(link.permission);
  });

  return (
    <div className="assets-header">
      <ReusableHeader
        links={filteredLinks}
        location={location}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default AssetsHeader;