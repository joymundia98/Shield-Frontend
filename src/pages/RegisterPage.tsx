import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RegisterForm } from "../components/Auth/RegisterForm";

export const RegisterPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  const menuLinks = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/#features" },
    { label: "Who we serve", path: "/#who-we-serve" },
    { label: "Sign In / Sign Up", path: "/login" },
    { label: "Contact", path: "/#contact" },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        <h2>Menu</h2>

        {sidebarOpen && (
          <div className="close-wrapper">
            <div className="toggle close-btn">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    closeSidebar();
                    e.target.checked = false;
                  }
                }}
              />
              <span className="button"></span>
              <span className="label">X</span>
            </div>
          </div>
        )}

        {menuLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.path}
            className={location.pathname === link.path ? "active" : ""}
            onClick={closeSidebar}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Hamburger */}
      {!sidebarOpen && (
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </button>
      )}

      {/* Register Form */}
      <div className="login-parent-container">
        <RegisterForm />
      </div>
    </>
  );
};
