import "./LoginForm.css";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import headerLogo from "../../assets/headerlogo.png";

// Importing the orgFetch function to fetch data
import { orgFetch } from "../../utils/api";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Validation schema
const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number is required"),
    position: z.string().min(1, "Position is required"),
    role: z.string().min(1, "Role is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface Role {
  id: number;
  name: string;
}

const InternalAccountCreation = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]); // Role dropdown state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch roles on mount using orgFetch
  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("No authToken found, please log in.");
        return;
      }

      try {
        const response = await orgFetch(`${baseURL}/api/roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setErrorMessage("Login Required");
          setTimeout(() => {
            navigate("/home");
          }, 1500);
          return;
        }

        if (Array.isArray(response)) {
          // Sort roles alphabetically by name
          setRoles(response.sort((a: Role, b: Role) => a.name.localeCompare(b.name)));
        } else {
          setErrorMessage("Received invalid data structure for roles.");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setErrorMessage("There was an error fetching roles.");
      }
    };

    fetchRoles();
  }, [navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Retrieve the organization from localStorage
      const storedOrganization = localStorage.getItem("organization");
      if (!storedOrganization) {
        setErrorMessage("Organization data not found in local storage.");
        return;
      }

      const organization = JSON.parse(storedOrganization);
      const organizationId = organization?.id;
      if (!organizationId) {
        setErrorMessage("Organization ID is missing.");
        return;
      }

      // Submit registration data to the backend, with status set to "pending"
      await axios.post(`${baseURL}/api/auth/register`, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        role_id: data.role, // Send selected role id
        status: "pending",  // Set status to "pending" by default
        password: data.password,
        organization_id: organizationId, // Include organization_id in the payload
      });

      // Show success message and redirect to lobby
      setShowSuccessCard(true);
      setTimeout(() => {
        setShowSuccessCard(false);
        navigate("/Organization/ListedAccounts"); // Redirect to lobby page
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message || "Registration failed");
      } else {
        setErrorMessage("An unknown error occurred");
      }
    }
  };

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>ORG MANAGER</h2>
        <a href="/Organization/edittableProfile">Profile</a>
        <a href="/Organization/orgLobby">The Lobby</a>
        <a href="/Organization/ListedAccounts" className="active">Manage Accounts</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions">Permissions</a>
        <hr className="sidebar-separator" />
        <a href="/Organization/to_SCI-ELD_ERP" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      <div className="login-parent-container">

        <p className="accountActivationPrompt">Please remember to activate the account in the Lobby</p>

        <div className="loginContainer">
          <div className="header">
            <img src={headerLogo} alt="Logo" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <div className="field input-field">
              <input type="text" {...register("first_name")} />
              <label>First Name</label>
              {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
            </div>

            {/* Last Name */}
            <div className="field input-field">
              <input type="text" {...register("last_name")} />
              <label>Last Name</label>
              {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
            </div>

            {/* Email */}
            <div className="field input-field">
              <input type="email" {...register("email")} />
              <label>Email Address</label>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="field input-field">
              <input type="text" {...register("phone")} />
              <label>Phone</label>
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>

            {/* Position */}
            <div className="field input-field">
              <input type="text" {...register("position")} />
              <label>Position</label>
              {errors.position && <p className="form-error">{errors.position.message}</p>}
            </div>

            {/* Role Dropdown */}
            <div className="field input-field select-field">
              <select {...register("role")}>
                <option value="">Select Role</option>
                {roles.map((role: Role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.role && <p className="form-error">{errors.role.message}</p>}
            </div>

            {/* Password */}
            <div className="field input-field">
              <input type={showPassword ? "text" : "password"} {...register("password")} />
              <label>Password</label>
              <span className="showPassword" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "🙈"}
              </span>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="field input-field">
              <input type={showConfirmPassword ? "text" : "password"} {...register("confirm_password")} />
              <label>Confirm Password</label>
              <span className="showPassword" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "👁️" : "🙈"}
              </span>
              {errors.confirm_password && <p className="form-error">{errors.confirm_password.message}</p>}
            </div>

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            {/* Submit Button */}
            <div className="field button-field">
              <button type="submit">Create Account</button>
            </div>

            {/* Login link */}
            <div className="form-link sign-up">
              <span>Already have an account?</span>
              <a href="/login"> Login here</a>
            </div>
          </form>
        </div>

        {/* Success Popup */}
        {showSuccessCard && (
          <div className="success-card">
            <h3>✅ Registration Successful!</h3>
            <p>Redirecting to Accounts Manager...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalAccountCreation;
