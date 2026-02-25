import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from "./FinanceHeader";
import { authFetch, orgFetch } from "../../utils/api";
//import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

const baseURL = import.meta.env.VITE_BASE_URL;
const BACKEND_URL = `${baseURL}/api`;

interface ExpenseItem {
  id: number;
  date: string;
  department_id: number | null;
  description: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  subcategory_id: number;
  attachments?: { url: string; type: string }[];
}

const ViewExpensePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
    try {
      return await authFetch(url, options);
    } catch (error) {
      return await orgFetch(url, options);
    }
  };

  const fetchExpense = async () => {
    try {
      const data = await fetchDataWithAuthFallback(
        `${BACKEND_URL}/finance/expenses/${id}`
      );

      setExpense({
        ...data,
        amount: Number(data.amount),
      });
    } catch (error) {
      console.error("Failed to fetch expense:", error);
    }
  };

  const fetchSupportingData = async (expenseData: any) => {
    try {
      const [subcategories, categories, departments] = await Promise.all([
        fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_subcategories`),
        fetchDataWithAuthFallback(`${BACKEND_URL}/finance/expense_categories`),
        fetchDataWithAuthFallback(`${BACKEND_URL}/departments`)
      ]);

      const sub = subcategories.find((s: any) => s.id === expenseData.subcategory_id);
      const cat = categories.find((c: any) => c.id === sub?.category_id);
      const dept = departments.find((d: any) => d.id === expenseData.department_id);

      setSubcategoryName(sub?.name || "Unknown");
      setCategoryName(cat?.name || "Uncategorized");
      setDepartmentName(dept?.name || "No Department");

    } catch (error) {
      console.error("Error fetching supporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [id]);

  useEffect(() => {
    if (expense) {
      fetchSupportingData(expense);
    }
  }, [expense]);

  const updateStatus = async (status: "Approved" | "Rejected") => {
    try {
      await fetchDataWithAuthFallback(
        `${BACKEND_URL}/finance/expenses/${expense?.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      setExpense((prev) =>
        prev ? { ...prev, status } : prev
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading || !expense) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">

        <FinanceHeader />

        <br />

        <h1>Expense Details</h1>

        <br />
        <button
          className="add-btn"
          onClick={() => navigate("/finance/expensetracker")}
        >
          ← &nbsp; Back to Expense Tracker
        </button>

        <br /><br />

        {/* Expense Information */}
        <h3>Expense Information</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Date</strong></td>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Department</strong></td>
              <td>{departmentName}</td>
            </tr>
            <tr>
              <td><strong>Category</strong></td>
              <td>{categoryName}</td>
            </tr>
            <tr>
              <td><strong>Subcategory</strong></td>
              <td>{subcategoryName}</td>
            </tr>
            <tr>
              <td><strong>Description</strong></td>
              <td>{expense.description}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Details */}
        <h3>Financial Details</h3>
        <table className="responsive-table left-aligned-table">
          <tbody>
            <tr>
              <td><strong>Amount (ZMW)</strong></td>
              <td>{expense.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>
                <span className={`status ${expense.status}`}>
                  {expense.status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Attachments */}
        {expense.attachments && expense.attachments.length > 0 && (
          <>
            <h3>Attachments</h3>
            <table className="responsive-table left-aligned-table">
              <tbody>
                {expense.attachments.map((file, index) => (
                  <tr key={index}>
                    <td><strong>Attachment {index + 1}</strong></td>
                    <td>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Approval Buttons */}
        {expense.status === "Pending" && (
          <>
            <br />
            <button
              className="approve-btn"
              onClick={() => updateStatus("Approved")}
            >
              Approve
            </button>

            &emsp;

            <button
              className="reject-btn"
              onClick={() => updateStatus("Rejected")}
            >
              Reject
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ViewExpensePage;
