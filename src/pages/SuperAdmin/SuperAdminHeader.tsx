import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReusableHeader from "../../components/reusableHeader";
import { useAuth } from "../../hooks/useAuth";

const SuperAdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const superAdminLinks = [
    {
      name: "← To Demo Environment",
      href: "/dashboard",
      permission: "View Main Dashboard",
    },

    {
      name: "Dashboard",
      href: "/SuperAdmin/dashboard",
      permission: "View Super Admin Dashboard",
    },

    {
      name: "Organizations",
      href: "/SuperAdmin/RegisteredOrganizations",
      permission: "View Registered Organizations",
    },

    {
      name: "Admins",
      href: "/SuperAdmin/RegisteredAdmins",
      permission: "View Registered Admins",
    },

    {
      name: "Subscriptions",
      href: "/SuperAdmin/Subscriptions",
      permission: "View Subscriptions",
    },

    {
      name: "Payments",
      href: "/SuperAdmin/Payments",
      permission: "View Payments",
    },

    /*{
      name: "Reports",
      href: "/SuperAdmin/reports",
      permission: "System Overview Reports",
    },

    {
      name: "Settings",
      href: "/SuperAdmin/settings",
      permission: "Manage System Settings",
    },*/

    {
      name: "➜ Logout",
      href: "#logout",
      permission: "logout",
    },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    navigate("/");
  };

  const filteredLinks = superAdminLinks.filter((link) => {
    if (link.permission === "logout") return true;
    return hasPermission(link.permission);
  });

  return (
    <div className="superadmin-header">
      <ReusableHeader
        links={filteredLinks}
        location={location}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default SuperAdminHeader;