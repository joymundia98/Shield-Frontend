import './LoginForm.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';
import { useAuth } from '../../hooks/useAuth'; // Access the Auth context
import { fetchRoleId, fetchPermissionsForRole } from '../../context/AuthContext';  // Adjust the import path if necessary
import { permissionsMap } from '../../context/permissionsMap'; // Import the permissions map

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Permission = {
  name: string;
  path: string;
  method: string;
};


type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login function from context

  const onSubmit = async (data: LoginFormData) => {
    try {
      const apiUrl = `${baseURL}/api/auth/login`;
      console.log('Making request to:', apiUrl);

      // Send login request
      const response = await axios.post(apiUrl, {
        email: data.email,
        password: data.password,
      });

      console.log("Login response full:", response.data);

      const token = response.data.accessToken;
      if (!token) throw new Error("No accessToken returned from backend");
      localStorage.setItem("token", token);

      const user = response.data.user;
      if (!user) throw new Error("No user object returned from backend");
      localStorage.setItem("user", JSON.stringify(user));

      // Log user roles
      console.log("User Roles:", user.role);
      console.log("User role_id:", user.role_id);

      // Fetch role_id based on the role name(s)
      if (user.role && user.role[0]) {
        const roleId = await fetchRoleId(user.role[0], token);
        if (roleId) {
          // Now that we have roleId, let's fetch permissions
          const permissions = await fetchPermissionsForRole(roleId.toString(), token); // Pass role_id as string
          
          if (!permissions || permissions.length === 0) {
            throw new Error("User has no permissions");
          }

          // Attach permissions and role_id to the user object
          user.permissions = permissions; 
          user.role_id = roleId;

          console.log("User permissions:", user.permissions);
        }
      }

      // Use the login function from context to set user, token, and permissions
      login(token, user, response.data.organization);

      const firstAccessibleRoute = findFirstAccessibleRoute(user.permissions);

      if (firstAccessibleRoute) {
        setTimeout(() => {
          setShowSuccessCard(false);
          navigate(firstAccessibleRoute[0]); // Redirect to the first accessible route
        }, 2000);
      } else {
        setTimeout(() => {
          setShowSuccessCard(false);
          navigate('/dashboard'); // Fallback route
        }, 2000);
      }

      setError('');
      setShowSuccessCard(true); // Show success card
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      setShowSuccessCard(false); // Hide success card on error
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

// Function to map permissions to routes
const findFirstAccessibleRoute = (permissions: Permission[]) => {
  // Ensure permissions are available before iterating over them
  if (!permissions || permissions.length === 0) {
    return null;  // No permissions, return null
  }

  // Iterate through permissions and return the first valid route from permissionsMap
  for (let perm of permissions) {
    if (permissionsMap[perm.name]) {
      return permissionsMap[perm.name];  // Return the first accessible route from permissionsMap
    }
  }

  return null;  // If no accessible route, return null
};
