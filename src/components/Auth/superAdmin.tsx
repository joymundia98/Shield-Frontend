import './LoginForm.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';
import { useAuth } from '../../hooks/useAuth';

const baseURL = import.meta.env.VITE_BASE_URL;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

const SuperAdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'pending' | 'inactive' | null>(null);

  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const apiUrl = `${baseURL}/api/auth/login`;

      const response = await axios.post(apiUrl, {
        email: data.email,
        password: data.password,
      });

      const token = response.data.accessToken;
      if (!token) throw new Error("No accessToken returned from backend");
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("tokenChanged"));

      const user = response.data.user;
      if (!user) throw new Error("No user object returned from backend");
      localStorage.setItem("user", JSON.stringify(user));

      // STATUS CHECK
      if (user.status !== "active") {
        setShowSuccessCard(false);
        if (user.status === "pending" || user.status === null) {
          setStatusMessage(
            "Your account is currently pending activation. Please contact your administrator for approval."
          );
          setStatusType('pending');
        } else if (user.status === "inactive") {
          setStatusMessage(
            "This account has been deactivated. Please contact your administrator for assistance."
          );
          setStatusType('inactive');
        }
        return;
      }

      // Update auth context
      await login(token, user, response.data.organization, null);

      setError('');
      setShowSuccessCard(true);

      // Navigate to dashboard after login
      setTimeout(() => {
        setShowSuccessCard(false);
        navigate("/SuperAdmin/dashboard");
      }, 2000);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      setShowSuccessCard(false);
    }
  };

  return (
    <div className={`login-parent-container ${statusMessage ? 'blurred' : ''}`}>
      <div className="loginContainer">
        {/* Ribbon using the provided CSS */}
        <div className="ribbon">SUPER ADMIN</div>

        <div className="header">
            <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="field input-field">
            <input type="email" required {...register('email')} />
            <label>Email Address</label>
            </div>

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

            {error && <div className="form-error">{error}</div>}

            <div className="field button-field">
            <button type="submit">Login</button>
            </div>
        </form>
        </div>

      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Login Successful!</h3>
          <p>Redirecting to Dashboard...</p>
        </div>
      )}

      {statusMessage && (
        <div className={`status-card ${statusType}`}>
          <h3>⚠️ Account Status Notice</h3>
          <p>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLoginForm;