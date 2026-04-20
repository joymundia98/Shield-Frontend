import './LoginForm.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';
import { useAuth } from '../../hooks/useAuth';
import { fetchPermissionsForRole } from '../../context/AuthContext';

const baseURL = import.meta.env.VITE_BASE_URL;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

type Permission = {
  name: string;
  path: string;
  method: string;
};

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

  // ===============================
  // RBAC ROUTE RESOLVER (optional use)
  // ===============================
  const findFirstAccessibleRoute = (permissions: Permission[]): string | null => {
    const routePermissionMap: Record<string, string> = {
      "/SuperAdmin/dashboard": "View Super Admin Dashboard",
      "/dashboard": "View Programs Dashboard",
    };

    for (const route in routePermissionMap) {
      const required = routePermissionMap[route];

      if (permissions.some(p => p.name === required)) {
        return route;
      }
    }

    return null;
  };

  // ===============================
  // LOGIN HANDLER
  // ===============================
  const onSubmit = async (data: LoginFormData) => {
    try {
      const apiUrl = `${baseURL}/api/platform/login`;

      const response = await axios.post(apiUrl, {
        email: data.email,
        password: data.password,
      });

      const token = response.data.accessToken;
      const admin = response.data.admin;

      if (!token) throw new Error("No accessToken returned from backend");
      if (!admin) throw new Error("No admin object returned from backend");

      localStorage.setItem("authToken", token);
      window.dispatchEvent(new Event("tokenChanged"));
      localStorage.setItem("user", JSON.stringify(admin));

      // ===============================
      // STATUS CHECK
      // ===============================
      if (admin.status !== "active") {
        setShowSuccessCard(false);

        if (admin.status === "pending" || admin.status === null) {
          setStatusMessage(
            "Your account is currently pending activation. Please contact your administrator for approval."
          );
          setStatusType("pending");
        } else if (admin.status === "inactive") {
          setStatusMessage(
            "This account has been deactivated. Please contact your administrator for assistance."
          );
          setStatusType("inactive");
        }

        return;
      }

      // ===============================
      // FETCH PERMISSIONS
      // ===============================
      let permissions: Permission[] = [];

      if (admin.role_id) {
        permissions =
          (await fetchPermissionsForRole(admin.role_id.toString(), token)) || [];
      }

      const DEFAULT_DASHBOARD_PERMISSION: Permission = {
        name: "View Programs Dashboard",
        path: "/dashboard",
        method: "GET",
      };

      admin.permissions = [
        DEFAULT_DASHBOARD_PERMISSION,
        ...permissions,
      ].filter(
        (perm, index, self) =>
          index === self.findIndex(p => p.name === perm.name)
      );

      // ===============================
      // AUTH CONTEXT LOGIN
      // ===============================
      await login(token, admin, response.data.organization, null);

      setError('');
      setShowSuccessCard(true);

      // ===============================
      // ROUTING
      // ===============================
      setTimeout(() => {
        setShowSuccessCard(false);

        // 🔥 SUPERADMIN OVERRIDE RULE
        if (admin.is_super_admin) {
          navigate("/SuperAdmin/dashboard");
          return;
        }

        // fallback RBAC routing (optional future use)
        const route = findFirstAccessibleRoute(admin.permissions);

        if (route) {
          navigate(route);
        } else {
          navigate("/dashboard");
        }

      }, 2000);

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
      setShowSuccessCard(false);
    }
  };

  return (
    <div className={`login-parent-container ${statusMessage ? 'blurred' : ''}`}>
      <div className="loginContainer">

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