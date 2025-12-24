import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HeaderNav.css';

type NavLink = {
  name: string;
  href: string;
};

type NavItem = {
  label: string;
  links: NavLink[];
};

const HeaderNav: React.FC = () => {
  const navItems: NavItem[] = [
    {
      label: "Congregation",
      links: [
        { name: "Dashboard", href: "/congregation/dashboard" },
        { name: "Members", href: "/congregation/members" },
        { name: "Attendance", href: "/congregation/attendance" },
        { name: "Follow-ups", href: "/congregation/followups" },
        { name: "Visitors", href: "/congregation/visitors" },
        { name: "New Converts", href: "/congregation/converts" },
      ],
    },
    {
      label: "Finance",
      links: [
        { name: "Dashboard", href: "/finance/dashboard" },
        { name: "Track Income", href: "/finance/incometracker" },
        { name: "Track Expenses", href: "/finance/expensetracker" },
        { name: "Budget", href: "/finance/budgets" },
        { name: "Payroll", href: "/finance/payroll" },
        { name: "Finance Categories", href: "/finance/financeCategory" },
      ],
    },
    {
      label: "HR",
      links: [
        { name: "Dashboard", href: "/hr/dashboard" },
        { name: "Staff Directory", href: "/hr/staffDirectory" },
        { name: "Payroll", href: "/hr/payroll" },
        { name: "Leave Management", href: "/hr/leave" },
        { name: "Leave Applications", href: "/hr/leaveApplications" },
        { name: "Departments", href: "/hr/departments" },
      ],
    },
    {
      label: "Assets",
      links: [
        { name: "Dashboard", href: "/assets/dashboard" },
        { name: "Assets", href: "/assets/assets" },
        { name: "Depreciation Info", href: "/assets/depreciation" },
        { name: "Maintenance", href: "/assets/maintenance" },
        { name: "Categories", href: "/assets/categories" },
      ],
    },
    {
      label: "Programs",
      links: [
        { name: "Dashboard", href: "/programs/dashboard" },
        { name: "Registered Programs", href: "/programs/RegisteredPrograms" },
        { name: "Attendance Management", href: "/programs/attendeeManagement" },
      ],
    },
    {
      label: "Donors",
      links: [
        { name: "Dashboard", href: "/donor/dashboard" },
        { name: "Donors", href: "/donor/donors" },
        { name: "Add Donor", href: "/donor/add-donor" },
        { name: "Donations", href: "/donor/donations" },
        { name: "Donor Categories", href: "/donor/donorCategories" },
      ],
    },
    {
      label: "Governance",
      links: [
        { name: "Dashboard", href: "/governance/dashboard" },
        { name: "Policies", href: "/governance/policies" },
        { name: "Audit Reports", href: "/governance/audit-reports" },
        { name: "Compliance Logs", href: "/governance/compliance-logs" },
        { name: "Church Documentation", href: "/governance/documentation" },
        { name: "Certificates for Members", href: "/governance/certificates" },
      ],
    },
  ];

  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string>(location.pathname);

  const handleClick = (to: string) => {
    setActiveItem(to);
  };

  const renderMenu = (items: NavItem[]) => {
    return (
      <ul className="header-nav">
        {items.map((item, index) => (
          <li
            key={index}
            className={activeItem.includes(item.links[0].href) ? 'active' : ''}
          >
            <span>{item.label}</span>
            <ul>
              {item.links.map((link, idx) => (
                <li
                  key={idx}
                  className={activeItem === link.href ? 'active' : ''}
                >
                  <Link to={link.href} onClick={() => handleClick(link.href)}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
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
