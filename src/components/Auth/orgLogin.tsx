import './LoginForm.css';
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import headerLogo from '../../assets/headerlogo.png';
import { AuthContext } from '../../context/AuthContext';

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

const orgLoginSchema = z.object({
  organization_account_id: z.string().min(1, 'Account ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type OrgLoginFormData = z.infer<typeof orgLoginSchema>;

export const OrgLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const { register, handleSubmit } = useForm<OrgLoginFormData>({
    resolver: zodResolver(orgLoginSchema),
  });

  const navigate = useNavigate();

  // 🔐 Auth context
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('AuthContext not found');
  }
  const { login } = auth;

  // Inside the onSubmit function in your login page
const onSubmit = async (data: OrgLoginFormData) => {
  setError('');
  try {
    const response = await axios.post(
      `${baseURL}/api/organizations/login`,
      {
        organization_account_id: data.organization_account_id.trim(),
        password: data.password.trim(),
      }
    );

    console.log('📡 Login response:', response.data);

    if (response.data.message === 'Organization login successful') {
      const { accessToken, organization } = response.data;

      // 🧠 Map ORGANIZATION → User shape (required by AuthContext)
      const orgAsUser = {
        id: organization.id,
        full_name: organization.name,
        email: organization.organization_email || '', // Added optional email
        org_id: organization.id, // ✅ Organization ID for EditableProfile
        org_type: organization.denomination, // Using denomination or type as org type
        roles: ['organization'],
        role_id: 1,
      };

      // 🔥 Save JWT + org info via AuthContext
      login(accessToken, orgAsUser, {
        id: organization.id,
        name: organization.name,
        denomination: organization.denomination,
        address: organization.address,
        region: organization.region,
        district: organization.district,
        status: organization.status || 'active', // Default to 'active' if missing
        created_at: organization.created_at,
        organization_email: organization.organization_email,
        organization_account_id: organization.organization_account_id,
        org_type_id: organization.org_type_id,
      });

      console.log('✅ Organization login successful');
      console.log('🔐 JWT:', accessToken);
      console.log('🏢 Organization object:', organization);
      console.log('🆔 Organization ID:', organization.id);

      // Show success card and navigate after a small delay
      setShowSuccessCard(true);
      setTimeout(() => {
        setShowSuccessCard(false);
        console.log('➡️ Navigating to /Organization/orgAdminAccounts');
        navigate('/Organization/orgAdminAccounts');
      }, 2000); // Adjust timeout as necessary
    } else {
      setError(response.data.message || 'Invalid credentials.');
      setShowSuccessCard(false);
    }
  } catch (err: any) {
    console.error('❌ Login error:', err);
    setError(err.response?.data?.message || 'Organization login failed.');
    setShowSuccessCard(false);
  }
};


  const handleUserLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-parent-container">
      <div className="loginContainer">
        <div className="header">
          <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Account ID */}
          <div className="field input-field">
            <input type="text" required {...register('organization_account_id')} />
            <label>Account ID</label>
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
            <span>Register Organization instead?</span>
            <a href="/org-register"> Register now!</a>
          </div>
        </form>
      </div>

      {/* Switch to User Login */}
      <div className="switchLogin">
        <button type="button" className="orgLogin" onClick={handleUserLogin}>
          <div className="orgLogin-outer">
            <div className="orgLogin-inner">
              <span>Login as User 👤</span>
            </div>
          </div>
        </button>
      </div>

      {/* Success Card */}
      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Login Successful!</h3>
          <p>Redirecting to Admin Accounts...</p>
        </div>
      )}
    </div>
  );
};
