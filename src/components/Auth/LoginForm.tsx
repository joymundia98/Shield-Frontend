import './LoginForm.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';
import { useAuth } from '../../hooks/useAuth'; // Access the Auth context
import { fetchPermissionsForRole } from '../../context/AuthContext';  // Adjust the import path if necessary
import { permissionsMap } from '../../context/permissionsMap'; // Import the permissions map

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
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'pending' | 'inactive' | null>(null);


  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();
  const { login } = useAuth(); // Access the login function and loading state from context

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

      
      // 🔐 STATUS CHECK BEFORE ANYTHING ELSE
        
        if (user.status !== "active") {
          setShowSuccessCard(false); // hide success card if visible

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

          return; // stop login flow
        }

      // Log user roles and role_id
      
        console.log("User Roles:", user.role);
        console.log("User role_id:", user.role_id);

        // Fetch permissions only if role_id exists
        let permissions: Permission[] = [];
        if (user.role_id) {
          const roleId = user.role_id;
          console.log("Fetching permissions for role ID:", roleId);
          permissions = await fetchPermissionsForRole(roleId.toString(), token) || [];
        } else {
          console.log("User has no role assigned. Assigning default dashboard permission only.");
        }

        // Merge default "View Programs Dashboard" permission
        const DEFAULT_DASHBOARD_PERMISSION: Permission = {
          name: 'View Programs Dashboard',
          path: '/dashboard',
          method: 'GET',
        };

        user.permissions = [
          DEFAULT_DASHBOARD_PERMISSION,
          ...permissions
        ].filter((perm, index, self) => index === self.findIndex(p => p.name === perm.name));

        console.log("User permissions after adding default:", user.permissions);


      // Update context with login
      await login(token, user, response.data.organization, null); 

      console.log("Permissions after login:", user.permissions);

      // Find the first accessible route based on permissions
      const firstAccessibleRoute = findFirstAccessibleRoute(user.permissions);
      console.log("First accessible route:", firstAccessibleRoute);

      if (firstAccessibleRoute) {
        setTimeout(() => {
          setShowSuccessCard(false);

          // ✅ If Administrator → always go to main dashboard
          if (user.role === "Administrator") {
            navigate("/dashboard");
            return;
          }

          // Otherwise → go to first accessible route
          const firstAccessibleRoute = findFirstAccessibleRoute(user.permissions);

          console.log("First accessible route:", firstAccessibleRoute);

          if (firstAccessibleRoute) {
            navigate(firstAccessibleRoute[0]);
          } else {
            navigate("/dashboard");
          }

        }, 2000);

      }

      setError('');
      setShowSuccessCard(true);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      setShowSuccessCard(false);
    }
  };

  const handleOrgLogin = () => {
    navigate('/org-login');
  };

  return (
    <div className={`login-parent-container ${statusMessage ? 'blurred' : ''}`}>
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

      {statusMessage && (
        <div className={`status-card ${statusType}`}>
          <h3>⚠️ Account Status Notice</h3>
          <p>{statusMessage}</p>
        </div>
      )}


    </div>
  );
};

// Function to map permissions to routes
const findFirstAccessibleRoute = (permissions: Permission[]) => {
  if (!permissions || permissions.length === 0) {
    console.log('No permissions found');
    return null;
  }

  for (let route in permissionsMap) {
    const requiredPermissions = permissionsMap[route];

    for (let perm of permissions) {
      if (requiredPermissions.includes(perm.name)) {
        console.log(`Accessible route found for permission: ${perm.name} -> ${route}`);
        return [route];
      }
    }
  }

  console.log('No accessible route found');
  return null;
};
