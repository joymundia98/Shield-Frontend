import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

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

import logo from "../assets/headerlogo.png";
import heroImage from "../assets/heroImage.jpeg";
import churchImg from "../assets/church.jpg";
import ngoImg from "../assets/ngo.jpg";

import "./LandingPage.css";

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

export const LandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
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
      <header>
        <div className="logo">
          <Link to="/"><img src={logo} alt="Logo" /></Link>
        </div>

        <nav className="desktop-nav">
          {menuLinks.map((link, idx) => (
            <Link key={idx} to={link.path} className={location.pathname === link.path ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Single hamburger button for mobile */}
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          &#9776;
        </button>
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
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </button>
      )}

      {/* =================== HERO =================== */}
      <section id="home" className="landing-page" data-aos="fade-up">
        <div className="container">
          <div className="content">
            <div className="text-cont" data-aos="fade-right" data-aos-delay="200">
              <h1 className="header">
                <span className="first-clr">SCI-ELD</span> Church{" "}
                <span className="first-clr">Management</span> Platform
              </h1>

              <p className="description">
                SCI-ELD - Sustainable Church Initiative for Effective Leadership Development
              </p>

              <Link to="/register">
                <button className="btn btn-discover">Get Started</button>
              </Link>
            </div>

            <div className="img-cont" data-aos="fade-left" data-aos-delay="400">
              <img className="img" src={heroImage} alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      {/* =================== FEATURES =================== */}
      <section id="features" className="features-section" data-aos="fade-up">
        <h1 data-aos="fade-up" data-aos-delay="100">Discover SCI-ELD Features</h1>

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
                    <h2>Who We Serve</h2>
                  </div>

                  <div className="text">
                    <p>
                      The SCI-ELD platform is built for more than churches —
                      it’s designed for NGOs as well. It delivers structure and
                      efficiency while fully supporting faith-based missions,
                      values, and initiatives.
                    </p>
                  </div>

                  <ul className="list-style-one">
                    <li> 🛡️ &nbsp; Local Churches & Ministries</li>
                    <li> 🛡️ &nbsp; NGOs & Funders</li>
                  </ul>
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

      {/* =================== CONTACT =================== */}
      <section id="contact" data-aos="fade-up">
        <h2 data-aos="fade-up" data-aos-delay="100">Contact</h2>

        <form data-aos="fade-up" data-aos-delay="200">
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <textarea placeholder="Message" rows={5} required />
          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="site-footer" data-aos="fade-up">
        <div className="container">
          <p>
            © 2025 — Built by <strong>Computers for Africa Solutions Limited</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};
