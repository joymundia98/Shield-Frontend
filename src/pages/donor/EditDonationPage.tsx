import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface Donor {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  donor_type_id: number;
  donor_subcategory_id: number;
}

interface DonationForm {
  donorRegistered: boolean | null;
  donorType: string;
  donorName: string;
  donorPhone: string;
  donorEmail: string;
  donorId: number | null;
  donorTypeId: number | null;
  subcategoryId: number | null;

  subcategory: string;
  date: string;
  amount: number | null;
  method: string;
  purpose: number | ""; // number for purpose_id
  notes: string;
  isAnonymous: string;
}

const EditDonation: React.FC = () => {
  const { id: donationId } = useParams<{ id: string }>(); // Get the donation ID from the URL
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  // Helper function to handle auth + fallback
const fetchDataWithAuthFallback = async (
  url: string,
  options?: RequestInit
) => {
  try {
    return await authFetch(url, options);
  } catch (error: unknown) {
    console.log("authFetch failed, falling back to orgFetch", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("Unauthorized, redirecting to login");
      navigate("/login");
      return;
    }

    return await orgFetch(url, options);
  }
};

  // ---------------- DONORS FROM DATABASE ----------------
  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
  const loadDonors = async () => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${baseURL}/api/donors`
      );
      if (data) setDonors(data);
    } catch (err) {
      console.error("Failed to load donors", err);
    }
  };

  loadDonors();
}, []);

  // ---------------- FETCH DONATION DATA ----------------
  const [form, setForm] = useState<DonationForm>({
    donorRegistered: null,
    donorType: "",
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donorId: null,
    donorTypeId: null,
    subcategoryId: null,
    subcategory: "",
    date: "",
    amount: null,
    method: "",
    purpose: "",
    notes: "",
    isAnonymous: "",
  });

  useEffect(() => {
    if (!donationId) return; // If no donationId is provided, do nothing

    // Fetch the existing donation details
    const fetchDonation = async () => {
      try {
        const data = await fetchDataWithAuthFallback(
          `${baseURL}/api/donations/${donationId}`
        );

        if (data) {
          setForm({
            donorRegistered: data.donor_registered,
            donorType: data.donor_type_id === 1 ? "individual" : "organization",
            donorName: data.donor_name || "",
            donorPhone: data.donor_phone || "",
            donorEmail: data.donor_email || "",
            donorId: data.donor_id || null,
            donorTypeId: data.donor_type_id || null,
            subcategoryId: data.donor_subcategory_id || null,
            subcategory: data.donor_subcategory || "",
            date: data.date.split("T")[0],
            amount: parseFloat(data.amount),
            method: data.method,
            purpose: data.purpose_id || "",
            notes: data.notes || "",
            isAnonymous: data.is_anonymous ? "true" : "false",
          });
        } else {
          alert("Failed to load donation data");
        }
      } catch (err) {
        console.error("Error fetching donation data", err);
        alert("Error fetching donation data");
      }
    };

    fetchDonation();
  }, [donationId]);

  // ---------------- SUBMIT DONATION UPDATE ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const donationPayload = {
      donor_registered: form.donorRegistered,
      donor_id: form.donorRegistered ? form.donorId : null,
      donor_type_id: form.donorRegistered
        ? form.donorTypeId
        : form.isAnonymous === "true"
        ? null
        : form.donorType === "individual"
        ? 1
        : 2,
      donor_subcategory_id: form.donorRegistered ? form.subcategoryId : null,
      is_anonymous: form.isAnonymous === "true",
      donor_name:
        form.donorRegistered || form.isAnonymous === "false"
          ? form.donorName
          : "N/A",
      donor_phone:
        form.donorRegistered || form.isAnonymous === "false"
          ? form.donorPhone
          : "N/A",
      donor_email:
        form.donorRegistered || form.isAnonymous === "false"
          ? form.donorEmail
          : "N/A",
      date: form.date,
      amount: form.amount,
      method: form.method,
      purpose_id: form.purpose,
      notes: form.notes,
    };

    try {
      // 1️⃣ Update the donation in the database
      const res = await fetch(`${baseURL}/api/donations/${donationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donationPayload),
      });

      if (!res.ok) throw new Error("Failed to update donation");

      // Redirect back to the donations list after successful update
      alert("Donation updated successfully!");
      navigate("/donor/donations");
    } catch (err) {
      console.error(err);
      alert("Failed to update donation");
    }
  };

  // ---------------- MAP DONORS FOR DROPDOWN ----------------
  const registeredIndividuals = donors.filter((d) => d.donor_type_id === 1);
  const registeredOrganizations = donors.filter((d) => d.donor_type_id === 2);

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
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
        {hasPermission("View All Donors") &&  <a href="/donor/donors">Donors</a>}
        {hasPermission("View All Donations") &&  <a href="/donor/donations" className="active">
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

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        <DonorsHeader/><br/>

        <header className="page-header">
          <h1>Edit Donation</h1>
          <button className="hamburger" onClick={toggleSidebar}>
            &#9776;
          </button>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>
            {/* REGISTERED DONOR */}
            <label>Registered Donor?</label>
            <select
              required
              value={form.donorRegistered === null ? "" : form.donorRegistered ? "true" : "false"}
              onChange={(e) =>
                setForm({
                  ...form,
                  donorRegistered: e.target.value === "true",
                  donorType: "",
                  donorName: "",
                  donorPhone: "",
                  donorEmail: "",
                  donorId: null,
                  isAnonymous: "",
                })
              }
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            {/* DONOR TYPE */}
            {form.donorRegistered && (
              <>
                <label>Donor Type</label>
                <select
                  value={form.donorType}
                  onChange={(e) =>
                    setForm({ ...form, donorType: e.target.value })
                  }
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </>
            )}

            {/* DONOR NAME */}
            {form.donorType && (
              <>
                <label>Donor Name</label>
                <select
                  value={form.donorId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const donor = donors.find((d) => d.id === id);

                    setForm({
                      ...form,
                      donorId: id,
                      donorName: donor?.name ?? "",
                      donorPhone: donor?.phone ?? "",
                      donorEmail: donor?.email ?? "",
                      donorTypeId: donor?.donor_type_id ?? null,
                      subcategoryId: donor?.donor_subcategory_id ?? null,
                    });
                  }}
                >
                  <option value="">Select</option>
                  {(form.donorType === "individual" ? registeredIndividuals : registeredOrganizations).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* DONOR DETAILS */}
            {form.donorRegistered === false && (
              <>
                <label>Anonymous?</label>
                <select
                  value={form.isAnonymous}
                  onChange={(e) =>
                    setForm({ ...form, isAnonymous: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>

                {/* Only show info if not anonymous */}
                {form.isAnonymous === "false" && (
                  <>
                    <label>Donor Name</label>
                    <input
                      type="text"
                      value={form.donorName}
                      onChange={(e) =>
                        setForm({ ...form, donorName: e.target.value })
                      }
                    />

                    <label>Phone</label>
                    <input
                      type="tel"
                      value={form.donorPhone}
                      onChange={(e) =>
                        setForm({ ...form, donorPhone: e.target.value })
                      }
                    />

                    <label>Email</label>
                    <input
                      type="email"
                      value={form.donorEmail}
                      onChange={(e) =>
                        setForm({ ...form, donorEmail: e.target.value })
                      }
                    />
                  </>
                )}
              </>
            )}

            {/* DONATION DETAILS */}
            <label>Donation Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <label>Amount</label>
            <input
              type="number"
              required
              value={form.amount ?? ""}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />

            <label>Payment Method</label>
            <select
              required
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
            >
              <option value="">Select</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Mobile Money</option>
              <option>Check</option>
            </select>

            <label>Purpose</label>
            <select
              required
              value={form.purpose}
              onChange={(e) =>
                setForm({ ...form, purpose: Number(e.target.value) })
              }
            >
              <option value="">Select</option>
              <option value={1}>Tithes</option>
              <option value={2}>Offering</option>
              <option value={3}>Special Fund</option>
              <option value={4}>Disaster Relief</option>
              <option value={5}>Other</option>
            </select>

            <label>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="form-buttons">
              <button className="edit-btn" type="submit">
                Save Changes
              </button>
              <button
                className="cancel-btn"
                type="button"
                onClick={() => navigate("/donor/donations")}
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

export default EditDonation;
