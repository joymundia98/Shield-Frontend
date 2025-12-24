import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import headerLogo from "../../assets/headerlogo.png";

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;


// Validation schema for admin registration
const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const AdminAccount = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Get the organization_id from the location state (passed from OrgRegister)
  const organization_id = location.state?.organizationID;

  // If there's no organization_id, show an error
  if (!organization_id) {
    return <div>Organization ID not found. Please try again.</div>;
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Submit the admin registration data with the organization_id
      await axios.post(`${baseURL}/api/auth/register`, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        position: "System Administrator", // Set position to System Administrator by default
        role_id: 1, // Set role to Admin (assuming 1 is the ID for Admin role)
        password: data.password,
        status: "active", // Set status to active
        organization_id: organization_id, // Pass the organization_id to associate the admin with the organization
      });

      // Show success message and open the modal to ask for redirection
      setShowSuccessCard(true);
      setTimeout(() => {
        setShowSuccessCard(false);
        setShowModal(true); // Show modal after success
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Registration failed");
    }
  };

  // Handle modal choice for redirection
  const handleRedirect = (choice: string) => {
    setShowModal(false); // Close the modal
    if (choice === "profile") {
      navigate("/Organization/edittableProfile", { state: { organizationID: organization_id } }); // Redirect to the Organization Profile
    } else if (choice === "dashboard") {
      navigate("/dashboard"); // Redirect to the SCI-ELD ERP Platform Dashboard
    }
  };

  return (
    <div className="login-parent-container">
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
            <button type="submit">Register</button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Registration Successful!</h3>
          <p>Redirecting...</p>
        </div>
      )}

      {/* Success Modal */}
      {showModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <h2>You have successfully created an account! How would you like to proceed?</h2>
            <div className="modal-buttons">
              <button className="modal-btn" onClick={() => handleRedirect("profile")}>
                Go to Organization Profile
              </button>&emsp;
              <button className="modal-btn" onClick={() => handleRedirect("dashboard")}>
                Go to SCI-ELD ERP Platform
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
