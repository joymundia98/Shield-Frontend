import './LoginForm.css';
import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';
import { AuthContext } from '../../context/AuthContext';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const hqLoginSchema = z.object({
  headquarters_account_id: z.string().min(1, 'Account ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type HqLoginFormData = z.infer<typeof hqLoginSchema>;

export const HqLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const { register, handleSubmit } = useForm<HqLoginFormData>({
    resolver: zodResolver(hqLoginSchema),
  });

  const navigate = useNavigate();

  // 🔐 Auth context
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('AuthContext not found');
  }
  const { login } = auth;

  // Handle the form submission
  const onSubmit = async (data: HqLoginFormData) => {
    setError('');
    try {
      const response = await axios.post(
        `${baseURL}/api/auth/hq/login`,
        {
          headquarters_account_id: data.headquarters_account_id.trim(),
          password: data.password.trim(),
        }
      );

      console.log('📡 Login response:', response.data);

      if (response.data.message === 'Headquarters login successful') {
        const { accessToken, headquarters } = response.data;

        // 🧠 Map HQ → User shape (required by AuthContext)
        const hqAsUser = {
          id: headquarters.id,
          full_name: headquarters.name,
          email: headquarters.email || '', // Added optional email
          hq_id: headquarters.id, // HQ ID for EditableProfile
          hq_type: headquarters.type, // Using type as HQ type
          roles: ['hq'],
          role_id: 1,
        };

        // 🔥 Save JWT + HQ info via AuthContext
        login(accessToken, hqAsUser, null, {
          id: headquarters.id,
          name: headquarters.name,
          address: headquarters.address,
          region: headquarters.region,
          country: headquarters.country,
          hq_status: headquarters.hq_status || 'active', // Default to 'active' if missing
          created_at: headquarters.created_at,
          email: headquarters.email,
          headquarters_account_id: headquarters.headquarters_account_id,
        });

        console.log('✅ HQ login successful');
        console.log('🔐 JWT:', accessToken);
        console.log('🏢 HQ object:', headquarters);
        console.log('🆔 HQ ID:', headquarters.id);

        // Show success card and navigate after a small delay
        setShowSuccessCard(true);
        setTimeout(() => {
          setShowSuccessCard(false);
          console.log('➡️ Navigating to /HQ/branchDirectory');
          navigate('/HQ/branchDirectory');
        }, 2000); // Adjust timeout as necessary
      } else {
        setError(response.data.message || 'Invalid credentials.');
        setShowSuccessCard(false);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'HQ login failed.');
      setShowSuccessCard(false);
    }
  };

  const handleUserLogin = () => {
    navigate('/login');
  };

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
    { label: "About Us", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign In / Sign Up", path: "/signUp" },
    { label: "Contact", path: "/contact" },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="login-parent-container">
        {/* Sidebar */}
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

      <div className="loginContainer">
        <div className="header">
          <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Headquarters Account ID */}
          <div className="field input-field">
            <input type="text" required {...register('headquarters_account_id')} />
            <label>Headquarters Account ID</label>
          </div>

          {/* Password */}
          <div className="field input-field">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              {...register('password')}
            />
            <label>Password</label>
            <span
              className="showPassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '🙈'}
            </span>
          </div>

          {/* Error Message */}
          {error && <div className="form-error">{error}</div>}

          {/* Forgot Password */}
          <div className="form-link">
            <a href="#" className="forgot-pass">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <div className="field button-field">
            <button type="submit">Login</button>
          </div>

          {/* Registration Link */}
          <div className="form-link sign-up">
            <span>Register Headquarters instead?</span>
            <a href="/HQ/new_Account"> Register now!</a>
          </div>
        </form>
      </div>

      {/* Switch to User Login */}
      <div className="switchLogin">
        <button type="button" className="hqLogin" onClick={handleUserLogin}>
          <div className="hqLogin-outer">
            <div className="hqLogin-inner">
              <span>Login as User 👤</span>
            </div>
          </div>
        </button>
      </div>

      {/* Success Card */}
      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Login Successful!</h3>
          <p>Redirecting to Branch Directory...</p>
        </div>
      )}
    </div>
  );
};

// Default export (if needed)
export default HqLoginForm;
