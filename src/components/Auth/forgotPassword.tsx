import './LoginForm.css';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';

const baseURL = import.meta.env.VITE_BASE_URL;

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const { register, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  const menuLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign In / Sign Up", path: "/signUp" },
    { label: "Contact", path: "/contact" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');
    setStatusMessage('');

    try {
      await axios.post(`${baseURL}/api/auth/forgot-password`, {
        email: data.email,
      });

      setStatusMessage(
        '✅ If this email exists, a password reset link has been sent.'
      );
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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

      {/* Forgot Password Form */}
      <div className="login-parent-container">
        <div className="loginContainer">
          <div className="header">
            <img src={headerLogo} alt="Logo" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field input-field">
              <input type="email" required {...register('email')} />
              <label>Email Address</label>
            </div>

            {error && <div className="form-error">{error}</div>}
            {statusMessage && <div className="success-card">{statusMessage}</div>}

            <div className="field button-field">
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="form-link sign-up">
              <span>Remembered your password?</span>
              <Link to="/login"> Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};