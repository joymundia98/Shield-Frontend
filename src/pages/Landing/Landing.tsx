import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Landing.css"; // Assuming the CSS is in Landing.css

import heroBackground from "../../assets/kenburnsbackground.jpeg"; // Adjust the path as necessary
import shieldImage from "../../assets/shield.png"; // Adjust the path as necessary
import shieldBullet from "../../assets/shield_bullet.png";
import logo from "../../assets/headerlogo.png";
import churchImg from "../../assets/church.jpg";
import ngoImg from "../../assets/ngo.jpg";

import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import AOS from "aos";
import "aos/dist/aos.css";

// Register chart components
ChartJS.register(
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Landing: React.FC = () => {
  const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [activeCard, setActiveCard] = useState<number | null>(null);
    
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

  // ============================
    // 📊 MEMOIZED CHART DATA
    // ============================
  
    const attendanceData = useMemo(
      () => ({
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Weekly Attendance",
            data: [520, 560, 580, 600],
            borderColor: "#1A3D7C",
            backgroundColor: "rgba(26, 61, 124, 0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      }),
      []
    );
  
    const givingData = useMemo(
      () => ({
        labels: ["General Fund", "Missions", "Building Fund", "Outreach"],
        datasets: [
          {
            data: [15000, 8000, 5000, 6000],
            backgroundColor: ["#5C4736", "#817E7A", "#AF907A", "#20262C"],
          },
        ],
      }),
      []
    );
  
    // ============================
    // 🌟 AOS INITIALIZATION
    // ============================
    useEffect(() => {
      AOS.init({
        duration: 1000,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }, []);

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

      {/* =================== LANDING PAGE CONTENT =================== */}
      
        <section className="hero">
            <div className="background">
            <img
                src={heroBackground}
                alt="Background"
                className="background-img"
            />
            </div>
            <div className="content">
            <div className="card">
                <h1>SCI-ELD</h1>
                <h3>
                    (Strengthening Churches Through Integrity, Accountability &
                    Digital Stewardship)
                </h3>
                <p>
                    SCI-ELD (Strengthening Church Institutions with Effective
                    Leadership and Digital Financial Systems) is a secure digital
                    platform designed to help churches, church networks, and
                    faith-based organisations manage leadership oversight, finances,
                    discipleship, and accountability — all in one place.
                    
                    <br/><br/>

                    <Link to="/register">
                        <button className="btn-get-started">Get Started</button>
                    </Link>

                    &emsp; 

                    <Link to="/contact">
                        <button className="btn-demo">Request Demo </button>
                    </Link>
                </p>
            </div>
            <div className="empty-right"></div>
            <div className="center-image">
                <img src={shieldImage} alt="Center Image" />
            </div>
            </div>
        </section>

        {/* =================== FEATURES =================== */}
              <section id="features" className="features-section" data-aos="fade-up">
                <h1 data-aos="fade-up" data-aos-delay="100">Why SCI-ELD?</h1>
                <p data-aos="fade-up" data-aos-delay="50">
                    SCI-ELD was designed to tackle the key challenges churches face—lack of financial clarity, 
                    inconsistent records, complex reporting, and rising administrative burdens—while offering real-time KPIs at your fingertips. 
                    It’s the perfect balance of transparency, accountability, and governance, 
                    all without compromising the Church’s spiritual mission.
                </p>
        
                <div className="feature-cards">
                  {/* Attendance Trends 
                    data-aos="zoom-in"
                    data-aos-delay="100"
                  */}
                  <div
                    className={`feature-card feature-card--purple ${activeCard === 0 ? "active" : ""}`}
                    onMouseEnter={() => setActiveCard(0)}
                  >
                    <div className="feature-card__outer">
                      <div className="feature-card__inner">
                        <div className="chart-box">
                          <h3 className="section-title">Attendance Trends</h3>
                          <Line data={attendanceData} />
                        </div>
        
                        <ul>
                          <li>Track the growth of your church</li>
                        </ul>
                      </div>
        
                      <a href="#">Growth Visibility</a>
                    </div>
                  </div>
        
                  {/* Prayer Requests 
                    data-aos="zoom-in"
                    data-aos-delay="200"
                  */}
                  <div
                    className={`feature-card feature-card--red ${activeCard === 1 ? "active" : ""}`}
                    onMouseEnter={() => setActiveCard(1)}
                  >
                    <div className="feature-card__outer">
                      <div className="feature-card__inner">
                        <div className="kpi-card">
                          <h3>Prayer Requests</h3>
                          <p>45</p>
                        </div>
        
                        <ul>
                          <li>Tend to the sheep by keeping up with their prayer requests</li>
                        </ul>
                      </div>
        
                      <a href="#">Pastoral Care</a>
                    </div>
                  </div>
        
                  {/* Donations by Fund 
                    data-aos="zoom-in" --> Removed because of temporary glitches
                    data-aos-delay="300"
                  */}
                  <div
                    className={`feature-card feature-card--green ${activeCard === 2 ? "active" : ""}`}
                    onMouseEnter={() => setActiveCard(2)}
                  >
                    <div className="feature-card__outer">
                      <div className="feature-card__inner">
                        <div className="chart-box">
                          <h3 className="section-title">Donations by Fund</h3>
                          <Pie data={givingData} />
                        </div>
        
                        <ul>
                          <li>Have a better understanding of Church Funds</li>
                        </ul>
                      </div>
        
                      <a href="#">Finance</a>
                    </div>
                  </div>
                </div>
              </section>

            {/* =================== WHO WE SERVE =================== */}
                  <section id="who-we-serve" data-aos="fade-right">
                    <section className="serve-section">
                      <div className="container">
                        <div className="row">
                          <div className="content-column col-lg-6 col-md-12 col-sm-12 order-2" data-aos="fade-up" data-aos-delay="100">
                            <div className="inner-column">
                              <div className="sec-title">
                                <h2>Who SCI-ELD is For</h2>
                              </div>
            
                              <ul className="list-style-one">
                                <li>
                                    <img src={shieldBullet} alt="Shield" className="shield-icon" />
                                    &nbsp; Individual churches
                                </li>
                                <li>
                                    <img src={shieldBullet} alt="Shield" className="shield-icon" />
                                    &nbsp; Churches with branches
                                </li>
                                <li>
                                    <img src={shieldBullet} alt="Shield" className="shield-icon" />
                                    &nbsp; Church networks and umbrella bodies
                                </li>
                                <li>
                                    <img src={shieldBullet} alt="Shield" className="shield-icon" />
                                    &nbsp; Faith-based NGOs and donor-funded projects
                                </li>
                              </ul>

                              <div className="text">
                                <p>
                                  Each entity operates independently, 
                                  while authorised leadership and 
                                  oversight bodies can securely access reports.
                                </p>
                              </div>

                            </div>
                          </div>
            
                          <div className="image-column col-lg-6 col-md-12 col-sm-12" data-aos="fade-left" data-aos-delay="200">
                            <div className="inner-column">
                              <figure className="image-1">
                                <img src={churchImg} alt="Church" />
                              </figure>
            
                              <figure className="image-2">
                                <img src={ngoImg} alt="NGO" />
                              </figure>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </section>

                  <section className=" offering min-h-screen bg-gray-900 text-center py-20 px-8 xl:px-0 flex flex-col justify-center">
  
  <h1 className="text-white text-4xl md:text-5xl xl:text-6xl font-semibold max-w-3xl mx-auto mb-16 leading-snug">SCI-ELD Features</h1>
  <div className="grid-offer text-left grid sm:grid-cols-2 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
    <div className="card bg-gray-800 p-10 relative">
      <div className="circle">
      </div>
      <div className="relative lg:pr-52">
        <h2 className="capitalize text-white mb-4 text-2xl xl:text-3xl left-aligned-h2">Seamless Church Onboarding <br/> & Management</h2>
        <p className="text-gray-400 left-aligned-paragraph">
            <li className="left-aligned-point">Effortlessly onboard new churches <br/> with secure registration and document verification.</li>
            <li className="left-aligned-point">Tailor role-based access for staff and volunteers to ensure smooth operations.</li>
        </p>
      </div>
      <div className="icon"></div>
    </div>
    <div className="card bg-gray-800 p-10 relative">
      <div className="circle">
      </div>
      <div className="relative lg:pl-48">
        <h2 className="capitalize text-white mb-4 text-2xl xl:text-3xl right-aligned-h2">Real-Time Leadership Insights <br/> & Oversight</h2>
        <p className="text-gray-400 right-aligned-paragraph">
            <li className="right-aligned-point">Keep leadership in the loop with intuitive dashboards, even for multi-location churches.</li>
            <li className="right-aligned-point">Get real-time reports, ensuring timely, informed decisions for effective governance.</li>
        </p>
      </div>
    </div>
    <div className="card bg-gray-800 p-10 relative">
      <div className="circle">
      </div>
      <div className="relative lg:pr-44">
        <h2 className="capitalize text-white mb-4 text-2xl xl:text-3xl left-aligned-h2">Financial Transparency <br/> & Accountability</h2>
        <p className="text-gray-400 left-aligned-paragraph">
            <li className="left-aligned-point">Streamline tithes, offerings, pledges, and fund management—all in one place.</li>
            <li className="left-aligned-point">Track budgets, expenses, and generate audit-ready financials for transparency and trust.</li>
        </p>
      </div>
    </div>
    <div className="card bg-gray-800 p-10 relative">
      <div className="circle">
      </div>
      <div className="relative lg:pl-48">
        <h2 className="capitalize text-white mb-4 text-2xl xl:text-3xl right-aligned-h2">Holistic Discipleship <br/> & Member Care</h2>
        <p className="text-gray-400 right-aligned-paragraph">
            <li className="right-aligned-point">Track and engage members with personalized records, from first-time visitors to baptisms.</li>
            <li className="right-aligned-point">Manage classes, events, and progress, ensuring every member’s spiritual journey is nurtured.</li>
        </p>
      </div>
    </div>
  </div>
</section>


      {/* You can add additional sections here for the landing page */}

      {/* Footer */}
        <footer>
          <p>&copy; 2026 SCI-ELD | All rights reserved.</p>
        </footer>
      
    </div>
  );
};

export default Landing;
