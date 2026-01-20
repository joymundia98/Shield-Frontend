import React, {useState, useEffect} from 'react';
import { Link, useLocation } from "react-router-dom";
import './Landing.css'; // You can put the styles into a separate CSS file
import heroImage from '../../assets/heroImage.jpeg';
import logo from "../../assets/headerlogo.png";
import 'font-awesome/css/font-awesome.min.css';

const AboutPage: React.FC = () => {
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
        { label: "Sign In / Sign Up", path: "/login" },
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
              <Link to="/home">
                <Link to="/"><img src={logo} alt="Logo" /></Link>
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
    <div>
    
    <div className='about-body'>
      {/* =================== LANDING PAGE =================== */}
      <section className="aboutUsHero" id="landing">
        <div className="container">
          <div className="content">
            <div className="text-cont">
              <h1 className="header">
                <span className="first-clr">What</span> is <span className="first-clr">SCI-ELD</span>?
              </h1>
              <p className="description">
                Strengthening Church Institutions with Effective Leadership and Digital Financial Systems
              </p>
            </div>
            <div className="img-cont">
              <img className="img" src={heroImage} alt="Hero Image" />
            </div>
          </div>
        </div>
      </section>

      <div className="definition">
        <p>
          SCI-ELD is a digital governance and financial management system created by Computers for Africa Solutions Limited (CFAS). 
          It helps churches and faith-based organizations manage leadership oversight, financial stewardship, discipleship records, reporting, and compliance, 
          all in one platform. 
          The system aims to promote clarity, integrity, and trust, 
          supporting organizations in strengthening governance and accountability while aligning with faith-based values.
        </p>
      </div>

      <ul className='about-ul'>
        <li className="about-Card" style={{ '--accent-color': '#5C4736' } as React.CSSProperties}>
          <div className="icon">
            <i className="fa fa-eye"></i>
          </div>
          <div className="title">Our Vision</div>
          <div className="content">
            To see churches and faith-based institutions operate with transparency, accountability, and confidence, enabling them to focus fully on their spiritual mission.
          </div>
        </li>
        <li className="about-Card" style={{ '--accent-color': '#EC9E38' } as React.CSSProperties}>
          <div className="icon">
            <i className="fa fa-rocket"></i>
          </div>
          <div className="title">Our Mission</div>
          <div className="content">
            To provide secure, accessible digital systems that strengthen leadership oversight, financial accountability, discipleship tracking, and institutional governance across churches and faith-based organisations.
          </div>
        </li>
        <li className="about-Card" style={{ '--accent-color': '#486684' } as React.CSSProperties}>
          <div className="icon">
            <i className="fa fa-diamond"></i>
          </div>
          <div className="title">Our Values</div>
          <div className="content">
            <ul className="values">
              <li>Integrity in leadership</li>
              <li>Faithful stewardship of resources</li>
              <li>Transparency and accountability</li>
              <li>Respect for church autonomy</li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
    </div>
    {/* Footer */}
        <footer>
          <p>&copy; 2026 SCI-ELD | All rights reserved.</p>
        </footer>
    </div>
  );
};

export default AboutPage;
