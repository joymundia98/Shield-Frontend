import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import './Landing.css'; // Importing the CSS file
import logo from "../../assets/headerlogo.png";

const SignUpGuide: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  const menuLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign In / Sign Up", path: "/SignUp" },
    { label: "Contact", path: "/contact" },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="landing-page-wrapper">
      {/* =================== HEADER =================== */}
      <header className="landingHeader">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <nav className="New-desktop-nav">
          {menuLinks.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={location.pathname === link.path ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* =================== SIDEBAR =================== */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        <h2>Menu</h2>

        {/* STATIC-STYLE CLOSE BUTTON */}
        {sidebarOpen && (
          <div className="close-wrapper">
            <div className="toggle close-btn">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    closeSidebar();
                    e.target.checked = false; // reset animation same as static
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
        <button className="new-hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </button>
      )}

      <div className="SignUpGuideParentContainer">
        <div className="signUpGuideContainer">
          <h1>Welcome to the SCI-ELD Portal</h1>

          {/* ==================== "HOW WOULD YOU LIKE TO PROCEED?" SECTION ==================== */}
          
          <div className="signUpGuideCard">
            <h2>How would you like to proceed?</h2>
            <div className="signUpGuideRow">
              {/* Headquarter and organization Registration */}
              <div>
                <button
                  onClick={() => window.location.href = '/Register-org'}
                  className='register-org'
                >
                  Register Your Organization/Church
                </button>
                <p>
                  <a href="/org-register" className="signUpGuideLinkText">
                    If you are new to the portal, click here to register your organization/church.
                  </a>
                </p>
              </div>


              <div>
                <button
                  onClick={() => window.location.href = '/register'}
                  className='register-user'
                >
                  Register as a User
                </button>
                <p>
                  <a href="/register" className="signUpGuideLinkText">
                    Sign up as a User under an existing organization/church.
                  </a>
                </p>
              </div>

              <div>
                <button
                  onClick={() => window.location.href = '/login'}
                  className='login-user'
                >
                  Login as a User
                </button>
                <p>
                  <a href="/login" className="signUpGuideLinkText">
                    If you're already a user, login here to access your account.
                  </a>
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <footer>
          <p>&copy; 2026 SCI-ELD | All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default SignUpGuide;
