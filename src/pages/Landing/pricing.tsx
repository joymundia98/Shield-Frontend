import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Landing.css';

// Import assets
import logo from '../../assets/headerlogo.png';

const Pricing = () => {
  const [activeCard, setActiveCard] = useState<number | null>(1); // Default to second card
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleMouseOver = (index: number) => {
    setActiveCard(index);
  };

  const menuLinks = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/#features" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign In / Sign Up", path: "/login" },
    { label: "Contact", path: "/contact" },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [sidebarOpen]);

  return (
    <div className="pricing-page-wrapper">
      {/* =================== HEADER =================== */}
      <header className="landingHeader">
        <div className="logo">
          <Link to="/home">
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

      {/* =================== PRICE SECTION =================== */}
      <section className="Price-section">
        <h1>SCI-ELD Pricing Plans</h1>
        <div className="Price_cards">
          {/* Single Church Plan */}
          <div
            className={`Price_card Price_card--purple ${activeCard === 0 ? 'active' : ''}`}
            onMouseOver={() => handleMouseOver(0)}
          >
            <div className="Price_card__outer">
              <div className="Price_card__inner">
                <p className="Price_category">Single Church Plan</p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">K</span>500
                  </span>
                </p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">per month</span>
                  </span>
                </p>
                <ul>
                  <li>Financial Management</li>
                  <li>Discipleship & Membership</li>
                  <li>Leadership and Finance Roles</li>
                  <li>Automated Reports</li>
                </ul>
              </div>
              <a href="#">get started now</a>
            </div>
          </div>

          {/* Multiple Church Plan */}
          <div
            className={`Price_card Price_card--red ${activeCard === 1 ? 'active' : ''}`}
            onMouseOver={() => handleMouseOver(1)}
          >
            <div className="Price_card__outer">
              <div className="Price_card__inner">
                <p className="Price_category">Multiple Church (Head Office) Plan</p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">K</span>800
                  </span>
                </p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">per month</span>
                  </span>
                </p>
                <ul>
                  <li>Head Office Dashboard</li>
                  <li>Consolidated Branch Reports</li>
                  <li>Oversight Analytics</li>
                </ul>
              </div>
              <a href="#">get started now</a>
            </div>
          </div>

          {/* Branch Church Plan */}
          <div
            className={`Price_card Price_card--green ${activeCard === 2 ? 'active' : ''}`}
            onMouseOver={() => handleMouseOver(2)}
          >
            <div className="Price_card__outer">
              <div className="Price_card__inner">
                <p className="Price_category">Branch Church Plan</p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">K</span>500
                  </span>
                </p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">per month</span>
                  </span>
                </p>
                <ul>
                  <li>Independent Branch Operations</li>
                  <li>Automated Reporting to Head Office</li>
                </ul>
              </div>
              <a href="#">get started now</a>
            </div>
          </div>

          {/* Mother Body Plan */}
          <div
            className={`Price_card Price_card--blue ${activeCard === 3 ? 'active' : ''}`}
            onMouseOver={() => handleMouseOver(3)}
          >
            <div className="Price_card__outer">
              <div className="Price_card__inner">
                <p className="Price_category">Mother Body / Oversight Plan</p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">Custom Pricing</span>
                  </span>
                </p>
                <ul>
                  <li>National or Regional Dashboards</li>
                  <li>Read-only Oversight Access</li>
                  <li>Compliance Reporting</li>
                </ul>
              </div>
              <a href="#">get started now</a>
            </div>
          </div>

          {/* NGO Plan */}
          <div
            className={`Price_card Price_card--brown ${activeCard === 4 ? 'active' : ''}`}
            onMouseOver={() => handleMouseOver(4)}
          >
            <div className="Price_card__outer">
              <div className="Price_card__inner">
                <p className="Price_category">NGO & Donor-Funded Projects</p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">K</span>1,200
                  </span>
                </p>
                <p className="price">
                  <span className="price price--number">
                    <span className="price price--dolar">per month</span>
                  </span>
                </p>
                <ul>
                  <li>Project Finance Management</li>
                  <li>Donor Dashboards</li>
                  <li>M&E and Audit Reports</li>
                </ul>
              </div>
              <a href="#">get started now</a>
            </div>
          </div>
        </div>

        <div className="disclaimer-section">
          {/* Rural Church Discount Policy */}
          <section className="discount-policy">
            <h3>Rural Church Discount Policy</h3>
            <p>
              We understand that every church has unique financial needs. That’s why we offer discounted rates for rural or
              low-income churches. Our team reviews each request with compassion and fairness, ensuring your church gets
              the support it needs. Get in touch with us to learn more about how we can assist you!
            </p>
          </section>

          {/* Free Trial Section */}
          <section className="free-trial">
            <h3>Free Trial</h3>
            <p>
              We offer a <span className="trial-highlight">21 Day Free Trial</span> with full access to all features.
              Explore every tool and feature with no commitment. No credit card required—just sign up and dive in! You can
              test everything before making any decisions. We believe in our software, and we want you to experience it
              risk-free.
            </p>
          </section>
        </div>

        {/* FAQ Section */}
        <div className="FAQ-section">
          <section>
            <h2>Frequently Asked Questions</h2>

            {/* FAQ Accordion */}
            <details>
              <summary>What is included in the Free Trial?</summary>
              <p>During the trial, you get full access to all features, including financial management, discipleship tools, and reporting dashboards. There are no limitations during the trial period!</p>
            </details>

            <details>
              <summary>Do you offer a money-back guarantee?</summary>
              <p>We do not offer a money-back guarantee because we believe in giving you ample time to explore everything through our 21-day free trial. It's completely risk-free and lets you evaluate the software without any commitment.</p>
            </details>

            <details>
              <summary>Can I switch plans later?</summary>
              <p>Absolutely! If your needs change, you can upgrade or downgrade your plan at any time. We make it easy to scale as your church grows.</p>
            </details>

            <details>
              <summary>How do I get the Rural Church Discount?</summary>
              <p>Simply reach out to us via the contact form, and we’ll review your case with compassion. We're committed to supporting rural and low-income churches in the best way possible.</p>
            </details>

            <details>
              <summary>What happens after the Free Trial ends?</summary>
              <p>At the end of your free trial, you'll be prompted to choose a plan that fits your needs. If you choose not to subscribe, your account will be deactivated, and no charges will be made.</p>
            </details>
          </section>
        </div>
      </section>

      {/* Footer moved outside of Price-section */}
      <footer>
        <p>&copy; 2026 SCI-ELD | <a href="#">Contact Us</a> | <a href="#">Start your digital stewardship journey today.</a></p>
      </footer>
    </div>
  );
};

export default Pricing;
