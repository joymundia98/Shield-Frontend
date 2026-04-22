import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import { authFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import SuperAdminHeader from './SuperAdminHeader';

const baseURL = import.meta.env.VITE_BASE_URL;

interface MonthYear {
  month: string;
  year: string;
}

interface SubscriptionForm {
  organization_id: number | "";
  plan_type: string;
  payment_mode: string;
  payment_provider: string; // ✅ NEW
  billing_cycle: string;
  amount: string;
  status: string;
  remarks: string;
  months: MonthYear[];
  reference_id: number | "";
  payment_date: string;
  payment_method_id: number | "";
}

interface Organization {
  id: number;
  name: string;
}

interface Plan {
  id: number;
  name: string;
  cleanName: string;
  price: string;
  billing_cycle: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
}

interface PaymentReference {
  id: number;
  type: string;
}

const AddPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const currentYear = new Date().getFullYear();

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
    plan_type: "",
    payment_mode: "",
    payment_provider: "",
    billing_cycle: "",
    amount: "",
    status: "",
    remarks: "",
    months: [],
    reference_id: "" as any, // ✅ NEW
    payment_date: "",
    payment_method_id: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]); // ✅ NEW
  const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);

  const [paymentReferences, setPaymentReferences] = useState<PaymentReference[]>([]);

  const monthsList = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const yearsList = Array.from({ length: 7 }, (_, i) => currentYear + i);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch(`${baseURL}/api/organizations`);
        const data = await res.json();

        const sorted = data.sort((a: Organization, b: Organization) =>
          a.name.localeCompare(b.name)
        );

        setOrganizations(sorted);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };

    fetchOrganizations();
  }, []);

  //Fetch Payment References
  useEffect(() => {
  const fetchPaymentReferences = async () => {
    try {
      const res = await fetch(`${baseURL}/api/payment_references`);
      const data = await res.json();
      setPaymentReferences(data);
    } catch (err) {
      console.error("Error fetching payment references:", err);
    }
  };

  fetchPaymentReferences();
}, []);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${baseURL}/api/plans`);
        const data = await res.json();

        const cleaned = data.map((plan: any) => ({
          ...plan,
          cleanName: plan.name.replace(/\s*\(.*?\)\s*$/, ""), // remove parentheses
        }));

        setPlans(cleaned);
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };

    fetchPlans();
  }, []);

  // ✅ Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(`${baseURL}/api/payment_methods`);
        const data = await res.json();

        const activeOnly = data.filter((p: PaymentMethod) => p.is_active);
        setPaymentMethods(activeOnly);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
      }
    };

    fetchPaymentMethods();
  }, []);

  // ✅ Derived values
  const paymentModes = [
    ...new Set(paymentMethods.map((p) => p.name)),
  ].sort();

  const providers = paymentMethods
    .filter((p) => p.name === formData.payment_mode)
    .map((p) => p.provider)
    .sort();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // ✅ Reset provider if payment mode changes
    if (name === "payment_mode") {
      setFormData((prev) => ({
        ...prev,
        payment_mode: value,
        payment_provider: "",
        payment_method_id: "",
      }));
      return;
    }

    if (name === "payment_provider") {
      const selectedMethod = paymentMethods.find(
        (p) =>
          p.name === formData.payment_mode &&
          p.provider === value
      );

      setFormData((prev) => ({
        ...prev,
        payment_provider: value,
        payment_method_id: selectedMethod ? selectedMethod.id : "",
      }));

      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Prefill amount if plan_type or billing_cycle changes
    if (name === "plan_type" || name === "billing_cycle") {
      const selectedPlan = plans.find(
        (p) => p.cleanName === (name === "plan_type" ? value : formData.plan_type)
          && p.billing_cycle === (name === "billing_cycle" ? value : formData.billing_cycle)
      );
      if (selectedPlan) {
        setFormData(prev => ({ ...prev, amount: selectedPlan.price }));
      } else {
        setFormData(prev => ({ ...prev, amount: "" }));
      }
    }
  };

  const handleMonthToggle = (month: string) => {
    setFormData((prev) => {
      const exists = prev.months.find((m) => m.month === month);

      if (exists) {
        return {
          ...prev,
          months: prev.months.filter((m) => m.month !== month),
        };
      } else {
        return {
          ...prev,
          months: [...prev.months, { month, year: String(currentYear) }],
        };
      }
    });
  };

  const handleYearChange = (month: string, year: string) => {
    setFormData((prev) => ({
      ...prev,
      months: prev.months.map((m) =>
        m.month === month ? { ...m, year } : m
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    !formData.organization_id ||
    !formData.plan_type ||
    !formData.payment_mode ||
    !formData.payment_provider ||
    !formData.payment_method_id ||
    !formData.billing_cycle ||
    !formData.amount ||
    !formData.reference_id ||
    formData.months.length === 0
  ) {
    alert("Please fill in all required fields and select months.");
    return;
  }

  const selectedPlan = plans.find(
    (p) =>
      p.cleanName === formData.plan_type &&
      p.billing_cycle === formData.billing_cycle
  );

  if (!selectedPlan) {
    alert("Invalid plan selection.");
    return;
  }

  // Map months to date strings
  const datesPaidFor = formData.months
    .map((m) => `${m.month} ${m.year}`)
    .join(", ");

  const payload = {
    plan_id: selectedPlan.id,
    amount: parseFloat(formData.amount),
    payment_method_id: Number(formData.payment_method_id),
    payment_provider: formData.payment_provider,
    billing_cycle: formData.billing_cycle,
    reference_id: Number(formData.reference_id),
    remarks: formData.remarks || null,
    organization_id: Number(formData.organization_id),
    date: datesPaidFor, // ✅ send array of months paid for
    payment_date: formData.payment_date, // ✅ send as payment_date
  };

  try {
    await authFetch(`${baseURL}/api/payments/initiate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    alert("Payment initiated successfully!");
    navigate("/SuperAdmin/Payments");
  } catch (err) {
    console.error("Error initiating payment:", err);
    alert("Failed to initiate payment.");
  }
};

  return (
    <div className="dashboard-wrapper visitors-wrapper subscription-page">
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

        {hasPermission("View Super Admin Dashboard") && (
          <a href="/SuperAdmin/dashboard">Dashboard</a>
        )}

        {hasPermission("View Registered Organizations") && (
          <a href="/SuperAdmin/RegisteredOrganizations">
            Registered Organizations
          </a>
        )}

        {hasPermission("View Registered Admins") && (
          <a href="/SuperAdmin/RegisteredAdmins">
            System Admin Accounts
          </a>
        )}

        {hasPermission("View Subscriptions") && (
          <a href="/SuperAdmin/Subscriptions">
            Subscriptions
          </a>
        )}

        {hasPermission("View Payments") && (
          <a href="/SuperAdmin/Payments" className="active">
            Payments
          </a>
        )}

        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← To Demo Environment</a>}

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
        <SuperAdminHeader />
        <br/>
        <header>
          <h1>Add Payments</h1>
          <button className="add-btn" onClick={() => navigate("/SuperAdmin/Payments")}>
              ← Payments
            </button>
        </header>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>
            
            <label>Organization</label>
            <select name="organization_id" value={formData.organization_id} onChange={handleChange} required>
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>

            <label>Plan Type</label>
            <select
              name="plan_type"
              value={formData.plan_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Plan</option>
              {plans
                .map(p => p.cleanName)
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((name) => (
                  <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* ✅ Dynamic Payment Mode */}
            <label>Payment Mode</label>
            <select name="payment_mode" value={formData.payment_mode} onChange={handleChange} required>
              <option value="">Select Payment Mode</option>
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>

            {/* ✅ Payment Provider */}
            <label>Payment Provider</label>
            <select
              name="payment_provider"
              value={formData.payment_provider}
              onChange={handleChange}
              required
              disabled={!formData.payment_mode}
            >
              <option value="">Select Provider</option>
              {providers.map((provider, index) => (
                <option key={index} value={provider}>{provider}</option>
              ))}
            </select>

            <label>Payment Reference</label>
            <select
              name="reference_id"
              value={formData.reference_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Reference</option>
              {paymentReferences.map((ref) => (
                <option key={ref.id} value={ref.id}>
                  {ref.type}  {/* <-- use 'type', not 'name' */}
                </option>
              ))}
            </select>

            <label>Billing Cycle</label>
            <select name="billing_cycle" value={formData.billing_cycle} onChange={handleChange} required>
              <option value="">Select Billing Cycle</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Semi-Annually</option>
              <option>Annually</option>
            </select>

            <label>Months Paid For</label>
            <div className="multi-select">
              <div
                className="multi-select-header"
                onClick={() => setShowMonthsDropdown(!showMonthsDropdown)}
              >
                {formData.months.length > 0
                  ? formData.months.map(m => `${m.month} (${m.year})`).join(", ")
                  : "Select Months"}
              </div>

              {showMonthsDropdown && (
                <div className="multi-select-dropdown">
                  {monthsList.map((month) => {
                    const selected = formData.months.find(m => m.month === month);

                    return (
                      <div key={month} className="checkbox-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => handleMonthToggle(month)}
                          />
                          <span>{month}</span>
                        </label>

                        {selected && (
                          <select
                            value={selected.year}
                            onChange={(e) => handleYearChange(month, e.target.value)}
                          >
                            {yearsList.map((yr) => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <label>Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />

            <label>Date Payment Received</label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              required
            />

            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Select Status</option>
              <option>Successful</option>
              <option>Declined</option>
              <option>Refunded</option>
              <option>Failed</option>
              <option>In active Process</option>
              <option>Cancelled</option>
              <option>On -Hold</option>
            </select>

            <label>Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} />

            <div className="form-buttons">
              <button type="submit" className="add-btn">Add Payment</button>
              <button type="button" className="cancel-btn" onClick={() => navigate("/SuperAdmin/Subscriptions")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ YOUR ORIGINAL STYLES — FULLY PRESERVED */}
      <style>
        {`
        .subscription-page .multi-select {
          position: relative;
          width: 100%;
        }

        .subscription-page .multi-select-header {
          padding: 10px;
          border: 1px solid #ccc;
          background: #fff;
          cursor: pointer;
          border-radius: 4px;
        }

        .subscription-page .multi-select-dropdown {
          position: absolute;
          width: 100%;
          border: 1px solid #ccc;
          background: #fff;
          max-height: 250px;
          overflow-y: auto;
          z-index: 1000;
          border-radius: 4px;
          margin-top: 5px;
        }

        .subscription-page .checkbox-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid #f1f1f1;
        }

        .subscription-page .checkbox-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .subscription-page .checkbox-item input[type="checkbox"] {
          transform: scale(1.1);
          cursor: pointer;
        }

        .subscription-page .checkbox-item input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #ccc;
            border-radius: 4px;
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-block;
            vertical-align: middle;
            background-color: #fff;
        }

        .subscription-page .checkbox-item input[type="checkbox"]:checked {
            background-color: #001f5b;
            border-color: #001f5b;
        }

        .subscription-page .checkbox-item input[type="checkbox"]:checked::after {
            content: "";
            position: absolute;
            left: 5px;
            top: 1px;
            width: 4px;
            height: 9px;
            border: solid #fff;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }

        .subscription-page .checkbox-item select {
            min-width: 100px;
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ccc;
            margin-left: 20px;
        }

        .subscription-page .checkbox-item:hover {
          background-color: #f9f9f9;
        }
        `}
      </style>
    </div>
  );
};

export default AddPaymentPage;