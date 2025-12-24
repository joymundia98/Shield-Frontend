import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import DonorsHeader from './DonorsHeader';


interface DonorType {
  name: string;
  subcategories: string[];
}

const DonorCategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  /* -------------------- Sidebar -------------------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
  }, [sidebarOpen]);

  /* -------------------- Donor Types -------------------- */
  const [donorTypes] = useState<DonorType[]>([
    { name: "Individual", subcategories: ["Regular", "Occasional", "One-time"] },
    { name: "Corporate", subcategories: ["Silver", "Gold", "Platinum"] },
    { name: "Anonymous", subcategories: [] }, // Anonymous category
  ]);

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

        <h2>DONOR MANAGEMENT</h2>
        <a href="/donor/dashboard">Dashboard</a>
        <a href="/donor/donors">Donors</a>
        <a href="/donor/donations">Donations</a>
        <a href="/donor/categories" className="active">
          Donor Categories
        </a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">
          ← Back to Main Dashboard
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

      {/* Main Content */}
      <div className="dashboard-content">

        <DonorsHeader/><br/>
        
        <header className="page-header income-header">
          <h1>Donor Categories</h1>
          <button className="hamburger" onClick={toggleSidebar}>
            &#9776;
          </button>
        </header>

        <div className="container">
          <div className="table-section">
            <div className="table-header">
              <h2>Donor Types</h2>
            </div>

            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Type Name</th>
                  <th>Subcategories</th>
                </tr>
              </thead>
              <tbody>
                {donorTypes.map((type, index) => (
                  <tr key={index}>
                    <td>{type.name}</td>
                    <td>{type.subcategories.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorCategoriesPage;
