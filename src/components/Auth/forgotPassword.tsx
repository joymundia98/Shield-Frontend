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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Modal + countdown state
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const location = useLocation();

  const { register, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  // ✅ Countdown logic
  useEffect(() => {
    if (!showModal) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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

    try {
      await axios.post(`${baseURL}/api/auth/forgot-password`, {
        email: data.email,
      });

      // ✅ Show modal + reset timer
      setTimeLeft(15 * 60);
      setShowModal(true);

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

      {/* Form */}
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

            <div className="field button-field">
              <button type="submit" disabled={loading || showModal}>
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

      {/* ✅ Embedded Glass Modal */}
      {showModal && (
        <>
          <style>{`
            .glass-modal {
              padding: 40px;
              width: 440px;
              border-radius: 24px;
              text-align: center;
              color: white;
              border: 1px solid rgba(255,255,255,0.3);

              background: linear-gradient(
                135deg,
                rgba(255,255,255,0.25),
                rgba(255,255,255,0.08),
                rgba(255,255,255,0.03)
              );

              backdrop-filter: blur(10px);
              box-shadow: 0 20px 50px rgba(0,0,0,0.4);
              animation: popIn 0.4s ease;
            }

            .glass-modal p {
              opacity: 0.95;
              line-height: 1.6;
              margin-bottom: 18px;
              color: white;
            }

            .timer {
              font-size: 18px;
              font-weight: 600;
              margin-top: 10px;
              color: #00ffcc;
            }

            .glass-button {
              cursor: pointer;
              margin-top: 20px;
              padding: 14px 28px;
              border-radius: 999px;

              border: 1px solid rgba(255,255,255,0.3);

              background: linear-gradient(
                135deg,
                rgba(255,255,255,0.3),
                rgba(255,255,255,0.05)
              );

              color: white;
              font-size: 16px;
              font-weight: 600;

              backdrop-filter: blur(8px);
              transition: all 0.4s ease;
            }

            .glass-button:hover {
              transform: scale(1.05);
            }

            .disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            @keyframes popIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>

          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}>
            <div className="glass-modal">
              <h2>Password Reset Email Sent</h2>

              <p>
                If an account with the provided email exists, a password reset link
                has been sent.
              </p>

              <p>
                Please check your inbox as well as your spam or junk folder.
                For security reasons, this link will expire in <strong>15 minutes</strong>.
              </p>

              <div className="timer">
                {timeLeft > 0
                  ? `You can request another link in ${formatTime(timeLeft)}`
                  : "You may now request a new reset link."}
              </div>

              <button
                className={`glass-button ${timeLeft > 0 ? "disabled" : ""}`}
                disabled={timeLeft > 0}
                onClick={() => setShowModal(false)}
              >
                {timeLeft > 0 ? "Please wait..." : "Request Again"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};