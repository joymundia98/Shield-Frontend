import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import headerLogo from "../../assets/headerlogo.png";

const baseURL = import.meta.env.VITE_BASE_URL;

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Confirm Password is required"),
    photo_url: z
      .string()
      .optional()
      .refine((val) => !val || /^https?:\/\/\S+$/.test(val), {
        message: "Invalid photo URL",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const SuperAdminRegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [_roles, setRoles] = useState<any[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);

  // ✅ ADDED: permissions state (same as AdminAccount)
  const [permissions, setPermissions] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors } } =
    useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
    });

  const navigate = useNavigate();

  // -----------------------------
  // FETCH ROLES
  // -----------------------------
  useEffect(() => {
    const fetchRoles = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return setErrorMessage("No auth token found");

      try {
        const response = await axios.get(`${baseURL}/api/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRoles(response.data);

        const adminRole = response.data.find(
          (r: any) => r.name === "SuperAdmin"
        );

        if (adminRole) {
          setRoleId(adminRole.id);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch roles");
      }
    };

    fetchRoles();
  }, []);

  // -----------------------------
  // ✅ ADDED: FETCH ALL PERMISSIONS
  // -----------------------------
  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return setErrorMessage("No auth token found");

      try {
        const response = await axios.get(`${baseURL}/api/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setPermissions(response.data);
        } else {
          setErrorMessage("Invalid permissions response");
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch permissions");
      }
    };

    fetchPermissions();
  }, []);

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const onSubmit = async (data: RegisterFormData) => {
    if (!roleId) {
      setErrorMessage("Administrator role not found");
      return;
    }

    try {
      // STEP 1: Create Super Admin
      const response = await axios.post(
        `${baseURL}/api/platform/register`,
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          photo_url: data.photo_url || null,
          role_id: roleId,
          status: "active",
          is_super_admin: true,
        }
      );

      if (response.status !== 201) {
        setErrorMessage("Registration failed");
        return;
      }

      // STEP 2: Assign ALL permissions to Super Admin role
      const token = localStorage.getItem("authToken");

      const allPermissionIds = permissions.map((p) => p.id);

      await axios.post(
        `${baseURL}/api/role_permissions/assign`,
        {
          role_id: roleId,
          permission_ids: allPermissionIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Super Admin created with full permissions!");

      navigate("/SuperAdmin/dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="login-parent-container">
      <div className="loginContainer">
        <div className="header">
          <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field input-field">
            <input type="text" {...register("first_name")} />
            <label>First Name</label>
            {errors.first_name && (
              <p className="form-error">{errors.first_name.message}</p>
            )}
          </div>

          <div className="field input-field">
            <input type="text" {...register("last_name")} />
            <label>Last Name</label>
            {errors.last_name && (
              <p className="form-error">{errors.last_name.message}</p>
            )}
          </div>

          <div className="field input-field">
            <input type="email" {...register("email")} />
            <label>Email</label>
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div className="field input-field">
            <input type="text" {...register("phone")} />
            <label>Phone</label>
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>

          <div className="field input-field">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <label>Password</label>
            <span
              className="showPassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "🙈"}
            </span>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div className="field input-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirm_password")}
            />
            <label>Confirm Password</label>
            <span
              className="showPassword"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? "👁️" : "🙈"}
            </span>
            {errors.confirm_password && (
              <p className="form-error">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <div className="field input-field">
            <input type="text" {...register("photo_url")} />
            <label>Photo URL (optional)</label>
            {errors.photo_url && (
              <p className="form-error">{errors.photo_url.message}</p>
            )}
          </div>

          {errorMessage && (
            <p className="form-error">{errorMessage}</p>
          )}

          <div className="field button-field">
            <button type="submit">Register Super Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminRegistrationForm;