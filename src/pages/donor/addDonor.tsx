import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';

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

// ---------------- Allowed Subcategories ----------------
const ALLOWED_SUBCATEGORIES: Record<number, string[]> = {
  1: ["regular", "one-time", "occasional"], // Individual
  2: ["gold", "platinum", "silver"],        // Corporate
};

const AddDonor: React.FC = () => {
  const navigate = useNavigate();

  // ---------------- Sidebar ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- Form State ----------------
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false); // Success card state

  // ---------------- Fetch Donor Types ----------------
  useEffect(() => {
    fetch(`${baseURL}/api/donors/donor_types`)
      .then((res) => res.json())
      .then((data) => setDonorTypes(data))
      .catch((err) => console.error("Failed to load donor types", err));
  }, []);

  // ---------------- Fetch + Filter Subcategories ----------------
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
        const allowed = form.donorTypeId ? ALLOWED_SUBCATEGORIES[form.donorTypeId] : undefined;
        let filtered = data;
        if (allowed) {
          filtered = data.filter((sc) =>
            allowed.includes(sc.name.toLowerCase())
          );
        }
        setSubcategories(filtered);
      })
      .catch((err) => console.error("Failed to load subcategories", err));
  }, [form.donorTypeId]);

  const isIndividual = form.donorTypeId === 1;
  const isOrganization = form.donorTypeId === 2;

  // ---------------- Submit Handler ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowSuccessCard(false); // Reset success card visibility

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

      const res = await fetch(`${baseURL}/api/donors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add donor");
      }

      // Show success card for 2 seconds before resetting and redirecting
      setShowSuccessCard(true);
      setTimeout(() => {
        setShowSuccessCard(false); // Hide the success card
        navigate("/donor/donors"); // Redirect to donor list
      }, 2000);

      setForm({
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

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger */}
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* Sidebar */}
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

        <a href="#" onClick={() => navigate("/donor/dashboard")}>
          Dashboard
        </a>
        <a href="#" onClick={() => navigate("/donor/donors")} className="active">
          Donors List
        </a>
        <a href="#" onClick={() => navigate("/donor/donations")}>
          Donations
        </a>
        <a href="#" onClick={() => navigate("/donor/donorCategories")}>
          Donor Categories
        </a>

        <hr className="sidebar-separator" />
        <a href="#" onClick={() => navigate("/dashboard")} className="return-main">
          ← Back to Main Dashboard
        </a>

        <a
          href="#"
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
          <h1>Add Donor</h1>
          <button className="add-btn" onClick={() => navigate("/donor/donors")}>
            ← Back
          </button>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            {/* Success Message Card */}
            {showSuccessCard && (
              <div className="success-card">
                <h3>✅ Donor Added Successfully!</h3>
                <p>Redirecting to donors list...</p>
              </div>
            )}

            {/* Donor Type */}
            <label>Donor Type</label>
            <select
              required
              value={form.donorTypeId ?? ""}
              onChange={(e) =>
                setForm({ ...form, donorTypeId: Number(e.target.value) })
              }
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
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />

                <label>Last Name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />

                <label>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />

                <label>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />

                <label>Preferred Contact Method</label>
                <select
                  value={form.preferredContact}
                  onChange={(e) =>
                    setForm({ ...form, preferredContact: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />

                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.orgEmail}
                  onChange={(e) =>
                    setForm({ ...form, orgEmail: e.target.value })
                  }
                />

                <label>Phone</label>
                <input
                  type="text"
                  value={form.orgPhone}
                  onChange={(e) =>
                    setForm({ ...form, orgPhone: e.target.value })
                  }
                />
              </>
            )}

            {/* Address */}
            <label>Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
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
                {loading ? "Submitting..." : "Add Donor"}
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

export default AddDonor;
