import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './HeaderNav.css';
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook

type NavLink = {
  name: string;
  href: string;
  permission: string; // Add permission field to each link
};

type NavItem = {
  label: string;
  links: NavLink[];
};

const HeaderNav: React.FC = () => {
  const { hasPermission } = useAuth();  // Access hasPermission from context or hook
  const navigate = useNavigate();  // To programmatically navigate after logout
  const navItems: NavItem[] = [
    {
      label: "Congregation",
      links: [
        { name: "Dashboard", href: "/congregation/dashboard", permission: "View Congregation Dashboard" },
        { name: "Members", href: "/congregation/members", permission: "View Members Summary" },
        { name: "Attendance", href: "/congregation/attendance", permission: "Record Congregation Attendance" },
        { name: "Visitors", href: "/congregation/visitors", permission: "View Visitor Dashboard" },
        { name: "New Converts", href: "/congregation/converts", permission: "View Converts Dashboard" },
      ],
    },
    {
      label: "Finance",
      links: [
        { name: "Dashboard", href: "/finance/dashboard", permission: "View Finance Dashboard" },
        { name: "Track Income", href: "/finance/incometracker", permission: "Track Income" },
        { name: "Track Expenses", href: "/finance/expensetracker", permission: "Track Expenses" },
        { name: "Budget", href: "/finance/budgets", permission: "Manage Budget" },
        { name: "Payroll", href: "/finance/payroll", permission: "Manage Payroll" },
        { name: "Finance Categories", href: "/finance/financeCategory", permission: "Manage Finance Categories" },
      ],
    },
    {
      label: "HR",
      links: [
        { name: "Dashboard", href: "/hr/dashboard", permission: "View HR Dashboard" },
        { name: "Staff Directory", href: "/hr/staffDirectory", permission: "View Staff Directory" },
        { name: "Payroll", href: "/hr/payroll", permission: "Manage HR Payroll" },
        { name: "Leave Management", href: "/hr/leave", permission: "Manage Leave" },
        { name: "Leave Applications", href: "/hr/leaveApplications", permission: "View Leave Applications" },
        { name: "Departments", href: "/hr/departments", permission: "View Departments" },
      ],
    },
    {
      label: "Assets",
      links: [
        { name: "Dashboard", href: "/assets/dashboard", permission: "View Asset Dashboard" },
        { name: "Assets", href: "/assets/assets", permission: "View All Assets" },
        { name: "Depreciation Info", href: "/assets/depreciation", permission: "View Asset Depreciation" },
        { name: "Maintenance", href: "/assets/maintenance", permission: "Manage Asset Maintenance" },
        { name: "Categories", href: "/assets/categories", permission: "View Categories" },
      ],
    },
    {
      label: "Programs",
      links: [
        { name: "Dashboard", href: "/programs/dashboard", permission: "View Programs Dashboard" },
        { name: "Registered Programs", href: "/programs/RegisteredPrograms", permission: "View Registered Programs" },
        { name: "Attendance Management", href: "/programs/attendeeManagement", permission: "Manage Attendees" },
      ],
    },
    {
      label: "Donors",
      links: [
        { name: "Dashboard", href: "/donor/dashboard", permission: "View Donor Dashboard" },
        { name: "Donors", href: "/donor/donors", permission: "View All Donors" },
        { name: "Add Donor", href: "/donor/add-donor", permission: "Add Donor" },
        { name: "Donations", href: "/donor/donations", permission: "View All Donations" },
        { name: "Donor Categories", href: "/donor/donorCategories", permission: "View Donor Categories" },
      ],
    },
    {
      label: "Governance",
      links: [
        { name: "Dashboard", href: "/governance/dashboard", permission: "View Governance Dashboard" },
        { name: "Policies", href: "/governance/policies", permission: "View Policies" },
        { name: "Audit Reports", href: "/governance/audit-reports", permission: "View Audit Reports" },
        { name: "Compliance Logs", href: "/governance/compliance-logs", permission: "View Compliance Logs" },
        { name: "Church Documentation", href: "/governance/documentation", permission: "View Documentation" },
        { name: "Certificates for Members", href: "/governance/certificates", permission: "View Certificates" },
      ],
    },
  ];

  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string>(location.pathname);

  const handleClick = (to: string) => {
    setActiveItem(to);
  };

  // Handle logout
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default anchor behavior
    localStorage.clear(); // Replace with actual logout logic (e.g., clearing auth tokens)
    navigate('/'); // Redirect to the login page after logout
  };

  // Render the menu by filtering links based on permission
  const renderMenu = (items: NavItem[]) => {
    return (
      <ul className="header-nav">
        {items.map((item, index) => {
          // Filter links based on permissions
          const visibleLinks = item.links.filter(link => hasPermission(link.permission));
          
          // If no links are visible, don't render the category
          if (visibleLinks.length === 0) return null;

          return (
            <li key={index} className={activeItem.includes(item.links[0].href) ? 'active' : ''}>
              <span>{item.label}</span>
              <ul>
                {visibleLinks.map((link, idx) => (
                  <li key={idx} className={activeItem === link.href ? 'active' : ''}>
                    <Link to={link.href} onClick={() => handleClick(link.href)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
        {/* Always visible logout link */}
        <li className="logout">
          <a href="#logout" onClick={handleLogout}>
            ➜] &nbsp; Logout
          </a>
        </li>
      </ul>
    );
  };

  return (
    <nav>
      <div className="nav-wrapper">
        {renderMenu(navItems)}
      </div>
    </nav>
  );
};

export default HeaderNav;
