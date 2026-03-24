import './LoginForm.css';
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';

const baseURL = import.meta.env.VITE_BASE_URL;

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token"); // token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const menuLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign In / Sign Up", path: "/signUp" },
    { label: "Contact", path: "/contact" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!token) {
      setError("Invalid or missing reset link");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${baseURL}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });

      setStatusMessage("✅ Password reset successful. Redirecting to login...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);

    } catch (err: unknown) {
      console.error("Reset error:", err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to reset password");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
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

      {/* Reset Password Form */}
      <div className="login-parent-container">
        <div className="loginContainer">
          <div className="header">
            <img src={headerLogo} alt="Logo" />
          </div>

          <form onSubmit={handleSubmit}>
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
              Reset Password
            </h3>

            {/* Invalid token message */}
            {!token && (
              <div className="form-error">
                Invalid or broken reset link.
              </div>
            )}

            {/* New Password */}
            <div className="field input-field">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>New Password</label>
            </div>

            {/* Confirm Password */}
            <div className="field input-field">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label>Confirm Password</label>
            </div>

            {/* Messages */}
            {error && <div className="form-error">{error}</div>}
            {statusMessage && <div className="success-card">{statusMessage}</div>}

            <div className="field button-field">
              <button type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

            <div className="form-link sign-up">
              <Link to="/login">Back to login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};