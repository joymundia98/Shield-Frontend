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
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roles, setRoles] = useState<any[]>([]); // To store roles fetched from API
  const [permissions, setPermissions] = useState<any[]>([]); // To store all permissions

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const navigate = useNavigate();

  // Fetch organization data from localStorage
  useEffect(() => {
    const storedOrganization = localStorage.getItem("organization");
    if (storedOrganization) {
      try {
        const organization = JSON.parse(storedOrganization);
        if (organization?.id) {
          setOrganizationId(organization.id); // Set organization ID
        } else {
          setErrorMessage("Organization ID not found in local storage.");
        }
      } catch (error) {
        setErrorMessage("Error parsing organization data.");
      }
    } else {
      setErrorMessage("Organization data not found in local storage.");
    }
  }, []);

  // Fetch roles when component is mounted
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
          const sortedRoles = response.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setRoles(sortedRoles);
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

  // Fetch permissions after role data is loaded
  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("No authToken found, please log in.");
        return;
      }

      try {
        const response = await orgFetch(`${baseURL}/api/permissions`, {
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
          setPermissions(response); // Store all permissions
        } else {
          setErrorMessage("Received invalid data structure for permissions.");
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setErrorMessage("There was an error fetching permissions.");
      }
    };

    if (roles.length > 0) {
      fetchPermissions(); // Fetch permissions if roles are available
    }
  }, [roles, navigate]);

  // Find the Administrator role ID from the fetched roles
  useEffect(() => {
    if (roles.length > 0) {
      const adminRole = roles.find((role) => role.name === "Administrator");
      if (adminRole) {
        setRoleId(adminRole.id); // Set role ID
      } else {
        setErrorMessage("Administrator role not found.");
      }
    }
  }, [roles]);

  // If there's no organization_id or role_id, show an error
  if (organizationId === null || roleId === null) {
    return <div>{errorMessage || "Organization ID or Role ID not found. Please log in again."}</div>;
  }

  const onSubmit = async (data: RegisterFormData) => {
  // Retrieve the token from localStorage
  const token = localStorage.getItem("authToken");
  if (!token) {
    setErrorMessage("No authToken found, please log in.");
    return;
  }

  try {
    // Submit the admin registration data with the organization_id and role_id
    const response = await axios.post(`${baseURL}/api/auth/register`, {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      position: "System Administrator", // Set position to System Administrator by default
      role_id: roleId, // Use the dynamic role_id for Administrator
      password: data.password,
      status: "active", // Set status to active
      organization_id: organizationId, // Pass the organization_id to associate the admin with the organization
    });

    if (response.status === 201) {
      // After successful registration, assign all permissions to the role
      const allPermissionIds = permissions.map((permission) => permission.id);

      // Assign permissions to the Administrator role
      const permissionResponse = await orgFetch(`${baseURL}/api/role_permissions/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Make sure the token is passed in the header
        },
        body: JSON.stringify({
          role_id: roleId,
          permission_ids: allPermissionIds, // Grant all permissions
        }),
      });

      // Check for successful permission assignment based on status code and message
      if (permissionResponse.status === 200 || permissionResponse.status === 201 || permissionResponse.status === 204) {
        const result = await permissionResponse.json(); // Assuming the response is JSON

        if (result.message === "Permissions successfully assigned to role") {
          // Permissions were successfully assigned
          setShowSuccessCard(true);
          setTimeout(() => {
            setShowSuccessCard(false);
            setShowModal(true); // Show modal after success
          }, 2000);
        } else {
          // If the response message is not the success message
          setErrorMessage("Failed to assign permissions.");
        }
      } else {
        // In case the status is not 200 but still response body has a message
        setErrorMessage("Failed to assign permissions.");
      }
    }
  } catch (err: any) {
    console.error(err);
    setErrorMessage(err.response?.data?.message || "Registration failed");
  }
};


  // Handle modal choice for redirection
  const handleRedirect = (choice: string) => {
    setShowModal(false); // Close the modal
    if (choice === "profile") {
      navigate("/Organization/edittableProfile", { state: { organizationID: organizationId } }); // Redirect to the Organization Profile
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
