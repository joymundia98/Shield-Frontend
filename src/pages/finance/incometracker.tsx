import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import FinanceHeader from './FinanceHeader';

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

const IncomeTrackerPage: React.FC = () => {
  const navigate = useNavigate();

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    sidebarOpen
      ? document.body.classList.add("sidebar-open")
      : document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Data storage
  const [categories, setCategories] = useState<IncomeCategories>({});
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);

  // Fetch category table
  const fetchIncomeCategories = async () => {
    const res = await fetch(`${BACKEND_URL}/finance/income_categories`);
    const data = await res.json();

    setIncomeCategories(data);
    setCategoryList(["All", ...data.map((c: any) => c.name)]);
  };

  // Fetch subcategory table
  const fetchSubcategories = async () => {
    const res = await fetch(`${BACKEND_URL}/finance/income_subcategories`);
    const data = await res.json();
    setSubcategories(data);
  };

  // Fetch income table + JOIN with statuses
  const fetchIncomeData = async () => {
    const res = await fetch(`${BACKEND_URL}/finance/incomes`);
    const data = await res.json();

    const mappedIncomes = data.map((item: any) => {
      const sub = subcategories.find((s) => s.id === item.subcategory_id);
      const cat = incomeCategories.find((c) => c.id === sub?.category_id);

      return {
        ...item,
        amount: Number(item.amount),
        subcategory_name: sub?.name || "Unknown",
        category_name: cat?.name || "Uncategorized",
        status: item.status || "Pending", // status fetched from backend
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

  // Filter
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredCategories = useMemo(() => {
    if (selectedFilter === "All") return categories;
    return { [selectedFilter]: categories[selectedFilter] || [] };
  }, [categories, selectedFilter]);

  // Approve/Reject Modals
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

  // View Modal
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

  // Update status (Approve/Reject)
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

    await fetch(`${BACKEND_URL}/finance/incomes/${item.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    // Update UI locally
    setCategories((prev) => {
      const updated = { ...prev };
      const group = updated[catName]?.find((g) => g.name === groupName);
      if (group) group.items[index].status = status;
      return updated;
    });
  };

  // KPI totals
  const { totalApproved, totalPending, totalRejected } = useMemo(() => {
    let approved = 0,
      pending = 0,
      rejected = 0;

    Object.values(categories).forEach((groups) =>
      groups.forEach((g) =>
        g.items.forEach((item) => {
          if (item.status === "Approved") approved += item.amount;
          if (item.status === "Pending") pending += item.amount;
          if (item.status === "Rejected") rejected += item.amount;
        })
      )
    );

    return { totalApproved: approved, totalPending: pending, totalRejected: rejected };
  }, [categories]);

  return (
    <div className="dashboard-wrapper">

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>FINANCE</h2>
        <a href="/finance/dashboard">Dashboard</a>
        <a href="/finance/incometracker" className="active">Track Income</a>
        <a href="/finance/expensetracker">Track Expenses</a>
        <a href="/finance/budgets">Budget</a>
        <a href="/finance/payroll">Payroll</a>
        <a href="/finance/financeCategory">Finance Categories</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>
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

      {/* MAIN */}
      <div className="dashboard-content">

        <FinanceHeader />
                        
        <br/>

        <header className="page-header income-header">
          <h1>Church Income Tracker</h1>

          <div>
            <br /><br />
            <button
              className="add-btn"
              onClick={() => navigate("/finance/incomeDashboard")}
            >
              View Summary
            </button>
            &nbsp;
            <button className="hamburger" onClick={toggleSidebar}>
              ☰
            </button>
          </div>
        </header>

        <br /><br />

        {/* KPI CARDS */}
        <div className="kpi-container">
          <div className="kpi-card kpi-approved">
            <h3>Total Approved Income</h3>
            <p>${totalApproved.toLocaleString()}</p>
          </div>
          <div className="kpi-card kpi-pending">
            <h3>Total Pending Income</h3>
            <p>${totalPending.toLocaleString()}</p>
          </div>
          <div className="kpi-card kpi-rejected">
            <h3>Total Rejected Income</h3>
            <p>${totalRejected.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Income */}
        <button
          className="add-btn"
          onClick={() => navigate("/finance/addIncome")}
          style={{ margin: "10px 0" }}
        >
          + Add Income
        </button>

        {/* Filter */}
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

        {/* TABLE RENDER */}
        {Object.entries(filteredCategories).map(([catName, groups]) => (
          <div key={catName}>
            <h2>{catName}</h2>

            {groups.length > 0 ? (
              groups.map((group) => (
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
                      {group.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.giver || "N/A"}</td>
                          <td>{item.description}</td>
                          <td>${item.amount.toLocaleString()}</td>
                          <td>
                            <span className={`status ${item.status}`}>
                              {item.status}
                            </span>
                          </td>

                          <td>
                            <button className="add-btn" onClick={() => openViewModal(item)}>
                              View
                            </button>
                            &nbsp;&nbsp;

                            {item.status === "Pending" && (
                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() =>
                                    openModal(
                                      () =>
                                        updateStatus(
                                          catName,
                                          group.name,
                                          idx,
                                          "Approved"
                                        ),
                                      "approve"
                                    )
                                  }
                                >
                                  Approve
                                </button>
                                &nbsp;&nbsp;

                                <button
                                  className="reject-btn"
                                  onClick={() =>
                                    openModal(
                                      () =>
                                        updateStatus(
                                          catName,
                                          group.name,
                                          idx,
                                          "Rejected"
                                        ),
                                      "reject"
                                    )
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
                </div>
              ))
            ) : (
              <p>No items</p>
            )}
          </div>
        ))}

        {/* Confirmation Modal */}
        {modalOpen && (
          <div className="expenseModal" style={{ display: "flex" }}>
            <div className="expenseModal-content">
              <h2>
                {modalType === "approve" ? "Approve Income?" : "Reject Income?"}
              </h2>
              <p>This action cannot be undone.</p>

              <div className="expenseModal-buttons">
                <button
                  className="expenseModal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  className={`expenseModal-confirm ${
                    modalType === "reject" ? "reject" : ""
                  }`}
                  onClick={confirmModal}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModalOpen && viewRecord && (
          <div
            className="expenseModal"
            style={{ display: "flex" }}
            onClick={closeViewModal}
          >
            <div
              className="expenseModal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Income Details</h2>

              <table>
                <tbody>
                  <tr>
                    <th>Date</th>
                    <td>{viewRecord.date}</td>
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

              <button
                className="expenseModal-cancel"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeTrackerPage;
