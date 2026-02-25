import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HRHeader from "./HRHeader";
import { authFetch, orgFetch } from "../../utils/api";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Define the interface for Payroll components
interface Payroll {
  staff_id: number;
  staff_name: string;
  department_id: number;
  role_id: number;
  salary: number;
  housing_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  overtime: number;
  bonus: number;
  total_gross: number;
  paye_tax_percentage: number;
  paye_tax_amount: number;
  napsa_contribution_percentage: number;
  napsa_contribution_amount: number;
  loan_deduction: number;
  union_dues: number;
  health_insurance: number;
  nhima_contribution: number;
  gratuity_severance: number;
  wcif: number;
  total_deductions: number;
  net_salary: number;
  payment_date: string;
}

const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState<Payroll>({
    staff_id: 0,
    staff_name: "",
    department_id: 0,
    role_id: 0,
    salary: 0,
    housing_allowance: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    overtime: 0,
    bonus: 0,
    total_gross: 0,
    paye_tax_percentage: 0,
    paye_tax_amount: 0,
    napsa_contribution_percentage: 5,
    napsa_contribution_amount: 0,
    loan_deduction: 0,
    union_dues: 0,
    health_insurance: 0,
    nhima_contribution: 0,
    gratuity_severance: 0,
    wcif: 0,
    total_deductions: 0,
    net_salary: 0,
    payment_date: "",
  });

  const [gratuityAmount, setGratuityAmount] = useState<number>(0);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [staffNames, setStaffNames] = useState<any[]>([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  // Helper function to fetch data with auth fallback
const fetchDataWithAuthFallback = async (url: string) => {
  try {
    return await authFetch(url);
  } catch (error: unknown) {
    console.log("authFetch failed, falling back to orgFetch", error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("Unauthorized, redirecting to login");
      navigate("/login");
      return;
    }

    return await orgFetch(url);
  }
};

  // Fetch departments, roles, and staff names
  useEffect(() => {
    const fetchDepartments = async () => {
      const data = await fetchDataWithAuthFallback(`${baseURL}/api/departments`);
      setDepartments(data);

      // Set default department if none is selected
      if (form.department_id === 0 && data.length > 0) {
        setForm((prevForm) => ({ ...prevForm, department_id: data[0].id }));
      }
    };

    const fetchRoles = async () => {
      const data = await fetchDataWithAuthFallback(`${baseURL}/api/roles`);
      setRoles(data);

      // Set default role if none is selected
      if (form.role_id === 0 && data.length > 0) {
        setForm((prevForm) => ({ ...prevForm, role_id: data[0].id }));
      }
    };

    const fetchStaffNames = async () => {
      const data = await fetchDataWithAuthFallback(`${baseURL}/api/staff`);
      setStaffNames(data);
    };

    fetchDepartments();
    fetchRoles();
    fetchStaffNames();
  }, [form.department_id, form.role_id]); // Dependencies to run when form's department or role changes

  // Simulate fetching staff details
  useEffect(() => {
    const staffData = {
      staff_id: 1,
      staff_name: "John Doe",
      department_id: 1,  // Default department_id
      role_id: 1,  // Default role_id
      salary: 5000,
      housing_allowance: 1000,
      transport_allowance: 500,
      medical_allowance: 200,
      overtime: 300,
      bonus: 500,
      payment_date: "2025-12-05",
    };
    setForm((prevForm) => ({
      ...prevForm,
      ...staffData,
    }));
  }, []);

  // Calculate Gratuity Amount when salary or gratuity percentage changes
  useEffect(() => {
    const calculateGratuity = (salary: number, gratuityPercentage: number) => {
      return (salary * gratuityPercentage) / 100;
    };

    const amount = calculateGratuity(form.salary, form.gratuity_severance);
    setGratuityAmount(amount);
  }, [form.salary, form.gratuity_severance]);

  useEffect(() => {
    const calculatePayroll = () => {
      const {
        salary,
        housing_allowance,
        transport_allowance,
        medical_allowance,
        overtime,
        bonus,
        paye_tax_percentage,
        napsa_contribution_percentage,
        union_dues,
        health_insurance,
        nhima_contribution,
        wcif,
      } = form;

      const totalGross =
        salary +
        housing_allowance +
        transport_allowance +
        medical_allowance +
        overtime +
        bonus;

      let paye_tax = 0;
      if (totalGross <= 4000) {
        paye_tax = 0;
      } else if (totalGross <= 10000) {
        paye_tax = (totalGross - 4000) * (paye_tax_percentage / 100);
      } else {
        paye_tax = (totalGross - 10000) * 0.30 + (6000 * 0.25);
      }

      const napsa_contribution = totalGross * (napsa_contribution_percentage / 100);

      const total_deductions =
        paye_tax +
        napsa_contribution +
        union_dues +
        health_insurance +
        nhima_contribution +
        gratuityAmount +
        wcif;

      const net_salary = totalGross - total_deductions;

      setForm((prevForm) => ({
        ...prevForm,
        total_gross: totalGross,
        paye_tax_amount: paye_tax,
        napsa_contribution_amount: napsa_contribution,
        total_deductions,
        net_salary,
      }));
    };

    calculatePayroll();
  }, [
    form.salary, 
    form.housing_allowance,
    form.transport_allowance,
    form.medical_allowance,
    form.overtime,
    form.bonus,
    form.paye_tax_percentage,
    form.napsa_contribution_percentage,
    form.union_dues,
    form.health_insurance,
    form.nhima_contribution,
    form.wcif,
    gratuityAmount,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form Data being sent to backend:", form);

    const departmentExists = departments.some(department => department.id === form.department_id);
    if (!departmentExists) {
      alert("Selected department does not exist in the database.");
      return;
    }

    if (form.department_id === 0 || form.role_id === 0) {
      alert("Please select a valid department and role.");
      return;
    }

    if (!form.staff_name || form.salary <= 0 || !form.payment_date) {
      alert("Please fill in all required fields.");
      return;
    }

    const paymentDate = new Date(form.payment_date);
    const year = paymentDate.getFullYear();
    const month = paymentDate.getMonth() + 1;

    const updatedForm = {
      ...form,
      year,
      month,
      status: "Pending",
    };

    try {
      await authFetch(`${baseURL}/api/payroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedForm),
      });

      alert("Payroll submitted successfully!");
      navigate("/hr/payroll");
    } catch (err: any) {
      console.error("Error occurred while submitting payroll:", err);
      alert("Error: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>
        <h2>HR MANAGER</h2>
        {hasPermission("View HR Dashboard") &&  <a href="/hr/dashboard">Dashboard</a>}
        {hasPermission("View Staff Directory") &&  <a href="/hr/staffDirectory">Staff Directory</a>}
        {hasPermission("Manage HR Payroll") &&  <a href="/hr/payroll" className="active">Payroll</a>}
        {hasPermission("Manage Leave") &&  <a href="/hr/leave">Leave Management</a>}
        {hasPermission("View Leave Applications") &&  <a href="/hr/leaveApplications">Leave Applications</a>}
        {hasPermission("View Departments") && <a href="/hr/departments">Departments</a>}

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

      {/* Page Content */}
      <div className="dashboard-content">

        <HRHeader/>
        <br/>

        <header className="page-header">
          <h1>Payroll Management</h1>
          <div>
            <button className="add-btn" onClick={() => navigate("/hr/payroll", { replace: true })}>
              ← Back
            </button>
            <button className="hamburger" onClick={toggleSidebar}>☰</button>
          </div>
        </header>

        <div className="container">
          <form className="add-form-styling" onSubmit={handleSubmit}>
            {/* Department, Role, Staff Name */}
            <div className="card">
              <h3>Employee Information</h3>

              <label>Department</label>
              <select
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>

              <label>Role</label>
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              <label>Staff Name</label>
              <select
                value={form.staff_id}
                onChange={(e) => setForm({ ...form, staff_id: Number(e.target.value) })}
              >
                {staffNames.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Other Form Sections (Allowances, Deductions, etc.) */}
            <div className="card">
              <h3>Allowances</h3>
              <label>Basic Salary (ZMW)</label>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
              />

              <label>Housing Allowance (ZMW)</label>
              <input
                type="number"
                value={form.housing_allowance}
                onChange={(e) => setForm({ ...form, housing_allowance: Number(e.target.value) })}
              />

              <label>Transport Allowance (ZMW)</label>
              <input
                type="number"
                value={form.transport_allowance}
                onChange={(e) => setForm({ ...form, transport_allowance: Number(e.target.value) })}
              />

              <label>Medical Allowance (ZMW)</label>
              <input
                type="number"
                value={form.medical_allowance}
                onChange={(e) => setForm({ ...form, medical_allowance: Number(e.target.value) })}
              />

              <label>Overtime (ZMW)</label>
              <input
                type="number"
                value={form.overtime}
                onChange={(e) => setForm({ ...form, overtime: Number(e.target.value) })}
              />

              <label>Bonus (ZMW)</label>
              <input
                type="number"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: Number(e.target.value) })}
              />
            </div>

            {/* Tax and Deductions */}
            <div className="card">
              <h3>Tax and Deductions</h3>
              <label>PAYE Tax Rate (%)</label>
              <input
                type="number"
                value={form.paye_tax_percentage}
                onChange={(e) => setForm({ ...form, paye_tax_percentage: Number(e.target.value) })}
              />

              <label>PAYE Tax Amount (ZMW)</label>
              <input
                type="number"
                value={form.paye_tax_amount}
                readOnly
              />

              <label>NAPSA Contribution Rate (%)</label>
              <input
                type="number"
                value={form.napsa_contribution_percentage}
                onChange={(e) => setForm({ ...form, napsa_contribution_percentage: Number(e.target.value) })}
              />

              <label>NAPSA Contribution Amount (ZMW)</label>
              <input
                type="number"
                value={form.napsa_contribution_amount}
                readOnly
              />

              <label>Loan Deduction (ZMW)</label>
              <input
                type="number"
                value={form.loan_deduction}
                onChange={(e) => setForm({ ...form, loan_deduction: Number(e.target.value) })}
              />

              <label>Union Dues (ZMW)</label>
              <input
                type="number"
                value={form.union_dues}
                onChange={(e) => setForm({ ...form, union_dues: Number(e.target.value) })}
              />

              <label>Health Insurance (ZMW)</label>
              <input
                type="number"
                value={form.health_insurance}
                onChange={(e) => setForm({ ...form, health_insurance: Number(e.target.value) })}
              />

              <label>NHIMA Contribution (ZMW)</label>
              <input
                type="number"
                value={form.nhima_contribution}
                onChange={(e) => setForm({ ...form, nhima_contribution: Number(e.target.value) })}
              />
            </div>

            {/* Gratuity/Severance and WCIF */}
            <div className="card">
              <h3>Gratuity/Severance Pay and WCIF</h3>
              <label>Gratuity/Severance Pay (%)</label>
              <input
                type="number"
                value={form.gratuity_severance}
                onChange={(e) => setForm({ ...form, gratuity_severance: Number(e.target.value) })}
              />

              <label>Gratuity/Severance Pay (ZMW)</label>
              <input
                type="number"
                value={gratuityAmount}
                readOnly
              />

              <label>Workers' Compensation Fund (WCIF) (ZMW)</label>
              <input
                type="number"
                value={form.wcif}
                onChange={(e) => setForm({ ...form, wcif: Number(e.target.value) })}
              />
            </div>

            {/* Net Salary */}
            <div className="card">
              <h3>Net Salary</h3>
              <label>Total Gross Salary (ZMW)</label>
              <input
                type="number"
                value={form.total_gross}
                readOnly
              />

              <label>Net Salary (ZMW)</label>
              <input
                type="number"
                value={form.net_salary}
                readOnly
              />

              <label>Payment Date</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              />

              <button type="submit" className="add-btn" style={{ marginTop: 20 }}>
                Submit Payroll
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
