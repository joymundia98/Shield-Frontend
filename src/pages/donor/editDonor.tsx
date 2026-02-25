import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface DonorType {
  id: number;
  name: string;
}

interface DonorSubcategory {
  id: number;
  donor_type_id: number;
  name: string;
}

interface DonorForm {
  donorTypeId: number | null;
  donorSubcategoryId: number | null;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  preferredContact: string;
  companyName: string;
  orgEmail: string;
  orgPhone: string;
  address: string;
  notes: string;
}

const ALLOWED_SUBCATEGORIES: Record<number, string[]> = {
  1: ["regular", "one-time", "occasional"], // Individual
  2: ["gold", "platinum", "silver"],        // Corporate
};

const EditDonor: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const { donorId } = useParams(); // Get donor ID from URL

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Auth + fallback helper
const fetchDataWithAuthFallback = async (
  url: string,
  options?: RequestInit
) => {
  try {
    return await authFetch(url, options);
  } catch (error: unknown) {
    console.log("authFetch failed, trying orgFetch", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      navigate("/login");
      return;
    }

    return await orgFetch(url, options);
  }
};

  // Form state for the donor data
  const [form, setForm] = useState<DonorForm>({
    donorTypeId: null,
    donorSubcategoryId: null,
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    preferredContact: "",
    companyName: "",
    orgEmail: "",
    orgPhone: "",
    address: "",
    notes: "",
  });

  const [donorTypes, setDonorTypes] = useState<DonorType[]>([]);
  const [subcategories, setSubcategories] = useState<DonorSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state

  // Fetch donor types
  useEffect(() => {
  const loadDonorTypes = async () => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/donors/donor_types`
      );
      if (data) setDonorTypes(data);
    } catch (err: any) {
      console.error("Failed to load donor types", err);
      setError(`An error occurred: ${err.message || "Unknown error"}`);
    }
  };

  loadDonorTypes();
}, []);

  // Fetch donor data by ID to populate the form
  useEffect(() => {
  if (!donorId) {
    setError("Donor ID is missing");
    return;
  }

  const loadDonor = async () => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/donors/${donorId}`
      );

      if (!data) throw new Error("No donor data returned");

      setForm({
        donorTypeId: data.donor_type_id,
        donorSubcategoryId: data.donor_subcategory_id,
        firstName: data.name?.split(" ")[0] || "",
        lastName: data.name?.split(" ")[1] || "",
        gender: data.gender || "",
        email: data.email || "",
        phone: data.phone || "",
        preferredContact: data.preferred_contact_method || "",
        companyName: data.organization_id ? data.name : "",
        orgEmail: data.email || "",
        orgPhone: data.phone || "",
        address: data.address || "",
        notes: data.notes || "",
      });

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch donor data");
      setLoading(false);
    }
  };

  loadDonor();
}, [donorId]);

  // Fetch and filter subcategories based on the donor type
  useEffect(() => {
    if (!form.donorTypeId) {
      setSubcategories([]);
      return;
    }

    fetch(
      `${baseURL}/api/donors/donor_sub_category?donor_type_id=${form.donorTypeId}`
    )
      .then((res) => res.json())
      .then((data: DonorSubcategory[]) => {
        const allowed = ALLOWED_SUBCATEGORIES[form.donorTypeId ?? 1] || []; // Default to '1' (Individual)
        setSubcategories(data.filter((sc) => allowed.includes(sc.name.toLowerCase())));
      })
      .catch((err) => console.error("Failed to load subcategories", err));
  }, [form.donorTypeId]);

  const isIndividual = form.donorTypeId === 1;
  const isOrganization = form.donorTypeId === 2;

  // Handle form submission (Update Donor)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowSuccessModal(false); // Reset modal visibility

    try {
      const payload: any = {
        donor_type_id: form.donorTypeId,
        donor_subcategory_id: form.donorSubcategoryId || null,
        address: form.address,
        phone: isIndividual ? form.phone : form.orgPhone,
        email: isIndividual ? form.email : form.orgEmail,
        preferred_contact_method: form.preferredContact || null,
        notes: form.notes || null,
        is_active: true,
      };

      if (isIndividual) {
        payload.name = `${form.firstName} ${form.lastName}`;
        payload.organization_id = null;
      } else if (isOrganization) {
        payload.name = form.companyName;
        payload.organization_id = 1; // adjust if needed
      }

      const res = await fetch(`${baseURL}/api/donors/${donorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update donor");
      }

      // Show success modal for 2 seconds before redirecting
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false); // Hide the modal
        navigate("/donor/donors"); // Redirect to donors list
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input
              type="checkbox"
              checked={sidebarOpen}
              onChange={toggleSidebar}
            />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>DONOR MGMT</h2>
        {hasPermission("View Donor Dashboard") && <a href="/donor/dashboard">Dashboard</a>}
        {hasPermission("View All Donors") &&  <a href="/donor/donors" className="active">Donors</a>}
        {hasPermission("View All Donations") &&  <a href="/donor/donations">
          Donations
        </a>}
        {hasPermission("View Donor Categories") && <a href="/donor/donorCategories">Donor Categories</a>}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/");
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <DonorsHeader/><br/>

        <header className="page-header">
          <h1>Edit Donor</h1>
          <button className="add-btn" onClick={() => navigate("/donor/donors")}>
            ← Back
          </button>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {/* Success Message Modal */}
            {showSuccessModal && (
              <div className="success-card">
                <h3>✅ Donor Updated Successfully!</h3>
                <p>Redirecting to donors list...</p>
              </div>
            )}

            {/* Donor Type */}
            <label>Donor Type</label>
            <select
              required
              value={form.donorTypeId ?? ""}
              onChange={(e) => setForm({ ...form, donorTypeId: Number(e.target.value) })}
            >
              <option value="">Select Donor Type</option>
              {donorTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>

            {/* Donor Subcategory */}
            {subcategories.length > 0 && (
              <>
                <label>Donor Subcategory</label>
                <select
                  value={form.donorSubcategoryId ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      donorSubcategoryId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Individual Fields */}
            {isIndividual && (
              <>
                <label>First Name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />

                <label>Last Name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />

                <label>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>

                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <label>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <label>Preferred Contact Method</label>
                <select
                  value={form.preferredContact}
                  onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                >
                  <option value="">Select Contact Method</option>
                  <option>Email</option>
                  <option>Phone</option>
                </select>
              </>
            )}

            {/* Organization Fields */}
            {isOrganization && (
              <>
                <label>Company Name</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />

                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.orgEmail}
                  onChange={(e) => setForm({ ...form, orgEmail: e.target.value })}
                />

                <label>Phone</label>
                <input
                  type="text"
                  value={form.orgPhone}
                  onChange={(e) => setForm({ ...form, orgPhone: e.target.value })}
                />
              </>
            )}

            {/* Address */}
            <label>Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            {/* Notes */}
            <label>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              placeholder="Optional remarks"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="form-buttons">
              <button type="submit" className="add-btn" disabled={loading}>
                {loading ? "Submitting..." : "Update Donor"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/donor/donors")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDonor;
