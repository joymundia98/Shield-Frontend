import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';
import { useAuth } from '../../hooks/useAuth';  // Import useAuth to access hasPermission

const FinanceHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location
  const { hasPermission } = useAuth();  // Access the hasPermission function from the context
  
  // Define the finance links
  const financeLinks = [
    { name: "← Back to Main", href: "/dashboard", permission: "View Main Dashboard" },
    { name: "Dashboard", href: "/finance/dashboard", permission: "View Finance Dashboard" },
    { name: "Track Income", href: "/finance/incomeDashboard", permission: "View Income Dashboard" },
    { name: "Track Expenses", href: "/finance/expenseDashboard", permission: "View Expense Dashboard" },
    { name: "Budget", href: "/finance/budgets", permission: "View Budgets Summary" },
    { name: "Payroll", href: "/finance/payroll", permission: "Manage Payroll" },
    { name: "Finance Categories", href: "/finance/financeCategory", permission: "View Finance Categories" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout", permission: "logout" },  // Special case for logout
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  // Filter the links based on permissions
  const filteredLinks = financeLinks.filter(link => {
    // For logout link, we don't need permission check, just show it
    if (link.permission === "logout") return true;
    
    // For other links, check if the user has the required permission
    return hasPermission(link.permission);
  });

  return (
    <div className="finance-header">
      {/* Pass financeLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={filteredLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default FinanceHeader;
