import './LoginForm.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  // ✅ FIXED FULL LOGIN LOGIC
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email: data.email,
        password: data.password,
      });

      console.log("Login response full:", response.data);

      // Save the access token
      const token = response.data.accessToken;
      if (!token) throw new Error("No accessToken returned from backend");
      localStorage.setItem("token", token);

      // Save the user object
      const user = response.data.user;
      if (!user) throw new Error("No user object returned from backend");
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Saved user:", user);

      setError('');
      setShowSuccessCard(true);

      setTimeout(() => {
        setShowSuccessCard(false);
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
      setShowSuccessCard(false);
    }
  };

  const handleOrgLogin = () => {
    navigate('/org-login');
  };

  return (
    <div className="login-parent-container">
      <div className="loginContainer">
        <div className="header">
          <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div className="field input-field">
            <input type="email" required {...register('email')} />
            <label>Email Address</label>
          </div>

          {/* Password Field */}
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

          <div className="form-link">
            <a href="#" className="forgot-pass">Forgot password?</a>
          </div>

          <div className="field button-field">
            <button type="submit">Login</button>
          </div>

          <div className="form-link sign-up">
            <span>Don't have an account?</span>
            <a href="/register"> Sign up now</a>
          </div>
        </form>
      </div>

      <div className="switchLogin">
        <button className="orgLogin" onClick={handleOrgLogin}>
          <div className="orgLogin-outer">
            <div className="orgLogin-inner">
              <span>Login as Organization 🏛️</span>
            </div>
          </div>
        </button>
      </div>

      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Login Successful!</h3>
          <p>Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
};
