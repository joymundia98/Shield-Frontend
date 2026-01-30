import "./LoginForm.css";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import headerLogo from "../../assets/headerlogo.png";
import { useNavigate } from "react-router-dom";
import CountryRegionSelector from "../CountryRegionSelector";  // Import the CountryRegionSelector component

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// ---------------------------
// Validation Schema
// ---------------------------
const orgSchema = z
  .object({
    name: z.string().min(1, "Organization name is required"),
    email: z
      .string()
      .email("Invalid email")
      .min(1, "Email is required"),
    phone: z
      .string()
      .min(1, "Phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm password is required"),
    address: z.string().min(1, "Address is required"),
    country: z.string().min(1, "Country is required").optional(),
    region: z.string().min(1, "Region is required").optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"]
  });

type OrgFormData = z.infer<typeof orgSchema>;

const HQRegister = () => {
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema)
  });

  const onSubmit = async (data: OrgFormData) => {
    // Debugging log to check selected country and region values before submitting the form
    console.log("Form data:", data);
    console.log("Selected Country:", selectedCountry);
    console.log("Selected Region:", selectedRegion);

    if (!selectedCountry || !selectedRegion) {
      setErrorMessage("Please select a country and region");
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/api/auth/hq/register`,
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          address: data.address,
          country: selectedCountry,
          region: selectedRegion, // Include region
          hq_status: "active"
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const { headquarterId, headquarters_account_id } = response.data;
      setShowSuccessCard(true);
      setTimeout(() => {
        setShowSuccessCard(false);
        navigate("/HQ/success", {
          state: { headquarterId, headquarters_account_id }
        });
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "HQ registration failed");
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  const menuLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Pricing", path: "/pricing" },
    { label: "Sign In / Sign Up", path: "/login" },
    { label: "Contact", path: "/contact" },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="login-parent-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        <h2>Menu</h2>

        {sidebarOpen && (
          <div className="close-wrapper">
            <div className="toggle close-btn">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    closeSidebar();
                    e.target.checked = false;
                  }
                }}
              />
              <span className="button"></span>
              <span className="label">X</span>
            </div>
          </div>
        )}

        {menuLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.path}
            className={location.pathname === link.path ? "active" : ""}
            onClick={closeSidebar}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Hamburger */}
      {!sidebarOpen && (
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </button>
      )}

      <div className="loginContainer">
        <div className="header">
          <img src={headerLogo} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Organization Name */}
          <div className="field input-field">
            <input type="text" {...register("name")} />
            <label>HQ Name</label>
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          {/* Organization Email */}
          <div className="field input-field">
            <input type="email" {...register("email")} />
            <label>HQ Email</label>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div className="field input-field">
            <input type="text" {...register("phone")} />
            <label>Phone Number</label>
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          {/* Password */}
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
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="field input-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirm_password")}
            />
            <label>Confirm Password</label>
            <span
              className="showPassword"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "👁️" : "🙈"}
            </span>
            {errors.confirm_password && <p className="form-error">{errors.confirm_password.message}</p>}
          </div>

          {/* Address */}
          <div className="field input-field">
            <input type="text" {...register("address")} />
            <label>Address</label>
            {errors.address && <p className="form-error">{errors.address.message}</p>}
          </div>

          {/* Country and Region Selector */}
          <CountryRegionSelector
            onCountryChange={setSelectedCountry}
            onRegionChange={setSelectedRegion}
            selectedCountry={selectedCountry}
            selectedRegion={selectedRegion}
            errorMessage={errors.country?.message || errors.region?.message}
          />

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <div className="field button-field">
            <button type="submit">Register HQ</button>
          </div>

          <div className="form-link sign-up">
            <span>Already Registered? &nbsp;</span>
            <a href="/hq-login">Login</a>
          </div>
        </form>
      </div>

      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Headquarters Created!</h3>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default HQRegister;
