import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';
import { authFetch, orgFetch } from "../../utils/api"; // Import both authFetch and orgFetch
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

interface IncomeItem {
  id: number;
  date: string;
  giver: string | null;
  description: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  attachments?: { url: string; type: string }[];
  extraFields?: Record<string, string>;
  category_name: string;
  subcategory_name: string;
}

interface IncomeGroup {
  name: string;
  items: IncomeItem[];
}

interface IncomeCategories {
  [category: string]: IncomeGroup[];
}

const BACKEND_URL = `${baseURL}/api`;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const IncomeTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth(); // Access the hasPermission function

  // ---------------- SIDEBAR ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // ---------------- DATA ----------------
  const [categories, setCategories] = useState<IncomeCategories>({});
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);

  const fetchDataWithAuthFallback = async (url: string, options: RequestInit = {}) => {
    try {
      return await authFetch(url, options);
    } catch (error) {
      console.log("authFetch failed, falling back to orgFetch");
      return await orgFetch(url, options);
    }
  };

  const fetchIncomeCategories = async () => {
    try {
      const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_categories`);
      setIncomeCategories(data);
      setCategoryList(["All", ...data.map((c: any) => c.name)]);
    } catch (error) {
      console.error("Failed to fetch income categories", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/income_subcategories`);
      setSubcategories(data);
    } catch (error) {
      console.error("Failed to fetch subcategories", error);
    }
  };

  const fetchIncomeData = async () => {
    try {
      const data = await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/incomes`);

      const mappedIncomes = data.map((item: any) => {
        const sub = subcategories.find((s) => s.id === item.subcategory_id);
        const cat = incomeCategories.find((c) => c.id === sub?.category_id);

        return {
          ...item,
          amount: Number(item.amount),
          subcategory_name: sub?.name || "Unknown",
          category_name: cat?.name || "Uncategorized",
          status: item.status || "Pending",
        };
      });

      // Group incomes
      const grouped: IncomeCategories = {};
      mappedIncomes.forEach((item: IncomeItem) => {
        if (!grouped[item.category_name]) grouped[item.category_name] = [];

        let group = grouped[item.category_name].find(
          (g) => g.name === item.subcategory_name
        );

        if (!group) {
          group = { name: item.subcategory_name, items: [] };
          grouped[item.category_name].push(group);
        }

        group.items.push(item);
      });

      setCategories(grouped);
    } catch (error) {
      console.error("Failed to fetch income data", error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchIncomeCategories();
      await fetchSubcategories();
    })();
  }, []);

  useEffect(() => {
    if (subcategories.length && incomeCategories.length) {
      fetchIncomeData();
    }
  }, [subcategories, incomeCategories]);

  // ---------------- FILTERS ----------------
  const [selectedFilter, setSelectedFilter] = useState("All");

  // ---------------- MONTH/YEAR FILTER ----------------
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const filteredCategories = useMemo(() => {
    // Filter by category first
    let filtered: IncomeCategories;
    if (selectedFilter === "All") filtered = categories;
    else filtered = { [selectedFilter]: categories[selectedFilter] || [] };

    // Then filter each group by selected month/year
    const filteredByDate: IncomeCategories = {};
    Object.entries(filtered).forEach(([catName, groups]) => {
      filteredByDate[catName] = groups.map((g) => ({
        ...g,
        items: g.items.filter((i) => {
          const d = new Date(i.date);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        })
      }));
    });

    return filteredByDate;
  }, [categories, selectedFilter, selectedMonth, selectedYear]);

  // ---------------- KPI totals ----------------
  const { totalApproved, totalPending, totalRejected } = useMemo(() => {
    let approved = 0,
      pending = 0,
      rejected = 0;

    Object.values(filteredCategories).forEach((groups) =>
      groups.forEach((g) =>
        g.items.forEach((item) => {
          if (item.status === "Approved") approved += item.amount;
          if (item.status === "Pending") pending += item.amount;
          if (item.status === "Rejected") rejected += item.amount;
        })
      )
    );

    return { totalApproved: approved, totalPending: pending, totalRejected: rejected };
  }, [filteredCategories]);

  // ---------------- MODALS / VIEWS ----------------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"approve" | "reject">("approve");
  const [modalAction, setModalAction] = useState<() => void>(() => {});

  const openModal = (action: () => void, type: "approve" | "reject") => {
    setModalType(type);
    setModalAction(() => action);
    setModalOpen(true);
  };

  const confirmModal = () => {
    modalAction();
    setModalOpen(false);
  };

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<IncomeItem | null>(null);

  const openViewModal = (item: IncomeItem) => {
    setViewRecord(item);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewRecord(null);
    setViewModalOpen(false);
  };

  const updateStatus = async (
    catName: string,
    groupName: string,
    index: number,
    status: "Approved" | "Rejected"
  ) => {
    const item = categories[catName]
      ?.find((g) => g.name === groupName)
      ?.items[index];

    if (!item) return;

    try {
      await fetchDataWithAuthFallback(`${BACKEND_URL}/finance/incomes/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setCategories((prev) => {
        const updated = { ...prev };
        const group = updated[catName]?.find((g) => g.name === groupName);
        if (group) group.items[index].status = status;
        return updated;
      });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // ---------------- VISIBLE ROWS ----------------
  const [visibleRows, setVisibleRows] = useState<{ [key: string]: number }>({});
  const handleViewMore = (groupKey: string, totalItems: number) => {
    setVisibleRows((prev) => ({ ...prev, [groupKey]: Math.min((prev[groupKey] || 3) + 5, totalItems) }));
  };
  const handleViewLess = (groupKey: string) => {
    setVisibleRows((prev) => ({ ...prev, [groupKey]: Math.max((prev[groupKey] || 3) - 5, 3) }));
  };
  const handleViewAll = (groupKey: string, totalItems: number) => setVisibleRows((prev) => ({ ...prev, [groupKey]: totalItems }));
  const handleBackToInitial = (groupKey: string) => setVisibleRows((prev) => ({ ...prev, [groupKey]: 3 }));

  //--------------------DOWNLOAD REPORTS ----------------
  const downloadFile = async (type: "pdf" | "excel" | "csv") => {
    try {
      const response = await axios.get(
        `${baseURL}/api/reports/incomes/${type}`,
        {
          responseType: "blob", // VERY important
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          params: {
            organization_id: localStorage.getItem("organization_id"),
            // status can be added later if needed
          }
        }
      );
  
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
  
      const extensionMap = {
        pdf: "pdf",
        excel: "xlsx",
        csv: "csv"
      };
  
      link.download = `incomes_data.${extensionMap[type]}`;
      document.body.appendChild(link);
      link.click();
  
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>FINANCE</h2>
        {hasPermission("View Finance Dashboard") && <a href="/finance/dashboard">Dashboard</a>}
        {hasPermission("View Income Dashboard") && <a href="/finance/incomeDashboard" className="active">Track Income</a>}
        {hasPermission("Add Income") && <a href="/finance/addIncome">Add Income</a>}
        {hasPermission("View Expense Dashboard") && <a href="/finance/expenseDashboard">Track Expenses</a>}
        {hasPermission("Add Expense") && <a href="/finance/addExpense">Add Expense</a>}
        {hasPermission("View Budgets Summary") && <a href="/finance/budgets">Budget</a>}
        {hasPermission("Manage Payroll") && <a href="/finance/payroll">Payroll</a>}
        {hasPermission("View Finance Categories") && <a href="/finance/financeCategory">Finance Categories</a>}


        <hr className="sidebar-separator" />

        {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}

        <a
          href="/"
          className="logout-link"
          onClick={(e) => {
            e.preventDefault();
            localStorage.clear();
            navigate("/"); // Redirect to home page after logout
          }}
        >
          ➜ Logout
        </a>
      </div>

      {/* MAIN */}
      <div className="dashboard-content">
        <FinanceHeader />

        <header className="page-header income-header">
          <h1>Church Income Tracker</h1>
          <div>
            <button className="add-btn" onClick={() => navigate("/finance/incomeDashboard")}>
              View Summary
            </button>

            <br/><br/>

              <button className="add-btn" onClick={() => downloadFile("pdf")}>
                📄 Export PDF
              </button>&emsp;

              <button className="add-btn" onClick={() => downloadFile("excel")}>
                📊 Export Excel
              </button>&emsp;

              <button className="add-btn" onClick={() => downloadFile("csv")}>
                ⬇️ Export CSV
              </button>
            

            <button className="hamburger" onClick={toggleSidebar}>☰</button>
          </div>
          
        </header>

        {/* ---------------- MONTH/YEAR FILTER ---------------- */}
        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Filter by Month/Year</h3>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>&emsp;

            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 11 }).map((_, i) => {
                const year = now.getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          {/* KPI CARDS */}
          <div className="kpi-card kpi-approved">
            <h3>Total Approved Income</h3>
            <p>ZMW {totalApproved.toLocaleString()}</p>
          </div>
          <div className="kpi-card kpi-pending">
            <h3>Total Pending Income</h3>
            <p>ZMW {totalPending.toLocaleString()}</p>
          </div>
          <div className="kpi-card kpi-rejected">
            <h3>Total Rejected Income</h3>
            <p>ZMW {totalRejected.toLocaleString()}</p>
          </div>
        </div>

        {/* ---------------- FILTER BY CATEGORY ---------------- */}
        <div className="income-filter-box">
          <h3>Filter by Category</h3>
          <select
            className="income-filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* ---------------- TABLE RENDER ---------------- */}
        {Object.entries(filteredCategories).map(([catName, groups]) => (
          <div key={catName}>
            <h2>{catName}</h2>
            {groups.length > 0 ? (
              groups.map((group) => {
                const groupKey = `${catName}-${group.name}`;
                const visibleCount = visibleRows[groupKey] || 3;
                const totalItems = group.items.length;

                if (totalItems === 0) return null; // Don't show empty subcategories

                return (
                  <div key={group.name}>
                    <h3>{group.name}</h3>
                    <table className="responsive-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Source/Giver</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {group.items.slice(0, visibleCount).map((item, idx) => (
                          <tr key={item.id}>
                            <td>{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td>{item.giver || "N/A"}</td>
                            <td>{item.description}</td>
                            <td>ZMW {item.amount.toLocaleString()}</td>
                            <td>
                              <span className={`status ${item.status}`}>{item.status}</span>
                            </td>
                            <td>
                              <button className="add-btn" onClick={() => openViewModal(item)}>View</button>
                              &nbsp;&nbsp;
                              {item.status === "Pending" && (
                                <>
                                  <button
                                    className="approve-btn"
                                    onClick={() =>
                                      openModal(() => updateStatus(catName, group.name, idx, "Approved"), "approve")
                                    }
                                  >
                                    Approve
                                  </button>
                                  &nbsp;&nbsp;
                                  <button
                                    className="reject-btn"
                                    onClick={() =>
                                      openModal(() => updateStatus(catName, group.name, idx, "Rejected"), "reject")
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Buttons for View More / Less / All */}
                    <div className="table-buttons">
                      {visibleCount < totalItems && (
                        <button className="pagination-btn" onClick={() => handleViewMore(groupKey, totalItems)}>View More</button>
                      )}&emsp;
                      {visibleCount > 3 && (
                        <button className="pagination-btn" onClick={() => handleViewLess(groupKey)}>View Less</button>
                      )}&emsp;
                      {visibleCount !== totalItems && visibleCount > 3 && (
                        <button className="pagination-btn" onClick={() => handleViewAll(groupKey, totalItems)}>View All</button>
                      )}&emsp;
                      {visibleCount === totalItems && (
                        <button className="pagination-btn" onClick={() => handleBackToInitial(groupKey)}>Back to Initial</button>
                      )}
                    </div><br/>
                  </div>
                );
              })
            ) : (
              <p>No items</p>
            )}
          </div>
        ))}

        {/* ---------------- CONFIRM MODAL ---------------- */}
        {modalOpen && (
          <div className="expenseModal" style={{ display: "flex" }}>
            <div className="expenseModal-content">
              <h2>{modalType === "approve" ? "Approve Income?" : "Reject Income?"}</h2>
              <p>This action cannot be undone.</p>
              <div className="expenseModal-buttons">
                <button className="expenseModal-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className={`expenseModal-confirm ${modalType === "reject" ? "reject" : ""}`} onClick={confirmModal}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- VIEW MODAL ---------------- */}
        {viewModalOpen && viewRecord && (
          <div className="expenseModal" style={{ display: "flex" }} onClick={closeViewModal}>
            <div className="expenseModal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Income Details</h2>
              <table>
                <tbody>
                  <tr>
                    <th>Date</th>
                    <td>{new Date(viewRecord.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <th>Source / Giver</th>
                    <td>{viewRecord.giver || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{viewRecord.description}</td>
                  </tr>
                  <tr>
                    <th>Amount</th>
                    <td>${viewRecord.amount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{viewRecord.status}</td>
                  </tr>
                  {viewRecord.attachments && viewRecord.attachments.length > 0 && (
                    <tr>
                      <th>Attachments</th>
                      <td>
                        {viewRecord.attachments.map((file, idx) => (
                          <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer">
                            {file.type === "application/pdf" ? "View PDF" : "View File"}
                          </a>
                        ))}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button className="expenseModal-cancel" onClick={closeViewModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeTrackerPage;
