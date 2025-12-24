import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReusableHeader from '../../components/reusableHeader';

const FinanceHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Get the current location

  // Define the finance links
  const financeLinks = [
    { name: "← Back to Main", href: "/dashboard" },
    { name: "Dashboard", href: "/finance/dashboard" },
    { name: "Track Income", href: "/finance/incometracker" },
    { name: "Track Expenses", href: "/finance/expensetracker" },
    { name: "Budget", href: "/finance/budgets" },
    { name: "Payroll", href: "/finance/payroll" },
    { name: "Finance Categories", href: "/finance/financeCategory" },
    // Add logout link with a special href
    { name: "➜] Logout", href: "#logout" },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Clear localStorage (or any other logout logic)
    navigate('/'); // Navigate to the LandingPage ("/")
  };

  return (
    <div className="finance-header">
      {/* Pass financeLinks, location, and logout handler to ReusableHeader */}
      <ReusableHeader
        links={financeLinks}
        location={location}  // Pass location to check for active link
        onLogout={handleLogout}  // Pass handleLogout as a prop
      />
    </div>
  );
};

export default FinanceHeader;
