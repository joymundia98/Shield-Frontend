import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

const baseURL = import.meta.env.VITE_BASE_URL;

interface SubscriptionForm {
  organization_id: number | "";
  plan_id: number | "";
  status: string;
  start_date: string;
  end_date: string;
  remarks: string;
}

interface Organization {
  id: number;
  name: string;
  created_at: string; // ✅ added
}

interface Plan {
  id: number;
  name: string;
}

const AddSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const body = document.body;
    if (sidebarOpen) body.classList.add("sidebar-open");
    else body.classList.remove("sidebar-open");
    return () => body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const [formData, setFormData] = useState<SubscriptionForm>({
    organization_id: "",
    plan_id: "",
    status: "",
    start_date: "",
    end_date: "",
    remarks: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch(`${baseURL}/api/organizations`);
        const data: Organization[] = await res.json(); // ✅ typed

        const sorted = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setOrganizations(sorted);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch plans and remove duplicates by name
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${baseURL}/api/plans`);
        const data: Plan[] = await res.json(); // ✅ typed

        const uniquePlans: Plan[] = Object.values(
          data.reduce<Record<string, Plan>>((acc, plan) => {
            if (!acc[plan.name]) {
              acc[plan.name] = {
                id: plan.id,
                name: plan.name,
              };
            }
            return acc;
          }, {})
        );

        setPlans(uniquePlans);
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };

    fetchPlans();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organization_id || !formData.plan_id || !formData.status || !formData.start_date) {
      alert("Please fill in all required fields.");
      return;
    }

    // ✅ Find selected organization with created_at
    const selectedOrg = organizations.find(
      (org) => org.id === Number(formData.organization_id)
    );

    let trialEnd: string | null = null;

    if (selectedOrg?.created_at) {
      const createdAt = new Date(selectedOrg.created_at);
      createdAt.setDate(createdAt.getDate() + 21);
      trialEnd = createdAt.toISOString();
    }

    const payload = {
      organization_id: formData.organization_id,
      plan_id: formData.plan_id,
      status: formData.status,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      trial_end: trialEnd, // ✅ added
    };

    try {
      await fetch(`${baseURL}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Subscription added successfully!");
      navigate("/SuperAdmin/Subscriptions");
    } catch (err) {
      console.error("Error adding subscription:", err);
      alert("Failed to add subscription.");
    }
  };

  return (
    <div className="dashboard-wrapper visitors-wrapper">
      <button className="hamburger" onClick={toggleSidebar}>
        &#9776;
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>SUPER ADMIN</h2>

        <a href="/SuperAdmin/dashboard">Dashboard</a>
        <a href="/SuperAdmin/RegisteredOrganizations">Registered Organizations</a>
        <a href="/SuperAdmin/RegisteredAdmins">System Admin Accounts</a>
        <a href="/SuperAdmin/Subscriptions" className="active">
          Subscriptions
        </a>

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
        <header>
          <h1>Add Subscription</h1>
          <button
            className="add-btn"
            onClick={() => navigate("/SuperAdmin/Subscriptions")}
          >
            ← Subscriptions
          </button>
        </header>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            <label>Organization</label>
            <select
              name="organization_id"
              value={formData.organization_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>

            <label>Plan</label>
            <select
              name="plan_id"
              value={formData.plan_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>

            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending-Renewal</option>
              <option>Discontinued</option>
            </select>

            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />

            <label>End Date (Optional)</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />

            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />

            <div className="form-buttons">
              <button type="submit" className="add-btn">
                Add Subscription
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/SuperAdmin/Subscriptions")}
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

export default AddSubscriptionPage;