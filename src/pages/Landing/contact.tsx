import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/headerlogo.png";

const ContactUs: React.FC = () => {

  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    contactReason: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the mailto link with form data
    const subject = 'New Contact Form Submission';
    const body = `
      Reason for Contact: ${formData.contactReason}\n
      Name: ${formData.name}\n
      Email: ${formData.email}\n
      Phone: ${formData.phone}\n
      Message: ${formData.message}
    `;

    const mailtoLink = `mailto:info@sci-eld.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Redirect to mailto link to open the user's email client
    window.location.href = mailtoLink;
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

      <div></div>
      <div className="contact-wrapper">
        <div className="container">
          {/* Contact Information */}
          <div className="contact-info">
            <br />
            <p>📧 Email: <a href="mailto:info@sci-eld.org">info@sci-eld.org</a></p>
            <p>🌐 Website: <a href="https://sci-eld.org/org-login" target="_blank" rel="noopener noreferrer">sci-eld.org</a></p>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <h2>We'd Love to Hear From You!</h2>
            <form onSubmit={handleSubmit}>
              {/* Reason for Contact Dropdown */}
              <div className="form-group">
                <label htmlFor="contact-reason">Reason for Contact</label>
                <select
                  id="contact-reason"
                  name="contactReason"
                  value={formData.contactReason}
                  onChange={handleChange}
                  required
                >
                  <option value="">Please Select...</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Requesting a Demo">Requesting a Demo</option>
                  <option value="Pricing Enquiry">Pricing Enquiry</option>
                  <option value="Complaints">Complaints</option>
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Support">Support</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Job Inquiry">Job Inquiry</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>

              {/* Name Input */}
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone Input */}
              <div className="form-group">
                <label htmlFor="phone">Your Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Message Textarea */}
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Enter your message here..."
                ></textarea>
              </div>

              <button type="submit">Submit</button>
            </form>
          </div>

          {/* Partner With Us Section */}
          <div className="partner-section">
            <h2>Partner With Us</h2>
            <p>Sci-ELD partners with:</p>
            <ul>
              <li>Church mother bodies</li>
              <li>Faith-based NGOs</li>
              <li>Training institutions</li>
              <li>Donors and development partners</li>
            </ul>
            <p>Partnerships focus on strengthening governance, accountability, and sustainable ministry growth.</p>
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

export default ContactUs;
