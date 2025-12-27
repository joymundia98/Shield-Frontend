import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';

interface Maintenance {
    asset: string;
    lastService: string;
    nextService: string;
    type: string;
    status: string;
}

const MaintenancePage: React.FC = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ---------------- Mock Data ----------------
    const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([
        { asset: "Projector X1", lastService: "2023-09-01", nextService: "2024-03-01", type: "Cleaning & Calibration", status: "Scheduled" },
        { asset: "Laptop L5", lastService: "2023-08-15", nextService: "2024-02-15", type: "Repair", status: "Completed" },
        { asset: "Chair A1", lastService: "2023-07-10", nextService: "2024-01-10", type: "Inspection", status: "Overdue" }
    ]);

    // ---------------- Filter State ----------------
    const [filter, setFilter] = useState({
        status: "",
        type: "",
    });

    const [tempFilter, setTempFilter] = useState(filter);
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const openFilter = () => {
        setTempFilter(filter);
        setShowFilterPopup(true);
    };
    const closeFilter = () => setShowFilterPopup(false);

    const handleApplyFilter = () => {
        setFilter(tempFilter);
        closeFilter();
    };

    const handleClearFilter = () => {
        setFilter({ status: "", type: "" });
        setTempFilter({ status: "", type: "" });
        closeFilter();
    };

    // ---------------- Sidebar ----------------
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        if (sidebarOpen) document.body.classList.add("sidebar-open");
        else document.body.classList.remove("sidebar-open");
    }, [sidebarOpen]);

    // ---------------- Filtered Maintenance ----------------
    const filteredMaintenance = useMemo(() => {
        return maintenanceList.filter(item => {
            if (filter.status && item.status !== filter.status) return false;
            if (filter.type && item.type !== filter.type) return false;
            return true;
        });
    }, [maintenanceList, filter]);

    // ---------------- Actions ----------------
    const handleAdd = () => navigate("/assets/maintenance/add");
    const handleEdit = (index: number) => navigate(`/assets/maintenance/edit/${index}`);
    const handleDelete = (index: number) => {
        if (window.confirm("Are you sure you want to delete this maintenance record?")) {
            setMaintenanceList(prev => prev.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="dashboard-wrapper">
            {/* Hamburger */}
            <button className="hamburger" onClick={toggleSidebar}>
                &#9776;
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} id="sidebar">
                <div className="close-wrapper">
                    <div className="toggle close-btn">
                        <input
                            type="checkbox"
                            id="closeSidebarButton"
                            checked={sidebarOpen}
                            onChange={toggleSidebar}
                        />
                        <span className="button"></span>
                        <span className="label">X</span>
                    </div>
                </div>

                <h2>ASSET MANAGER</h2>
                <a href="/assets/dashboard">Dashboard</a>
                <a href="/assets/assets">Asset Inventory</a>
                <a href="/assets/depreciation">Depreciation Info</a>
                <a href="/assets/maintenance" className="active">Maintenance</a>
                <a href="/assets/categories">Categories</a>

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

            {/* Main Content */}
            <div className="dashboard-content">

                <AssetsHeader/><br/>

                <h1>Maintenance Schedule</h1>

                {/* Buttons */}
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button className="add-btn" onClick={handleAdd}>
                        + &nbsp; Schedule Maintenance
                    </button>&emsp;

                    <button className="filter-btn" onClick={openFilter}>
                        📂 Filter
                    </button>
                </div>

                {/* Maintenance Table */}
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Last Serviced</th>
                            <th>Next Service</th>
                            <th>Maintenance Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredMaintenance.map((item, index) => (
                            <tr key={index}>
                                <td data-title="Asset">{item.asset}</td>
                                <td data-title="Last Serviced">{item.lastService}</td>
                                <td data-title="Next Service">{item.nextService}</td>
                                <td data-title="Maintenance Type">{item.type}</td>
                                <td data-title="Status">{item.status}</td>
                                <td className="actions">
                                    <button className="edit-btn" onClick={() => handleEdit(index)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Filter Popup */}
                <div className="overlay" style={{ display: showFilterPopup ? "block" : "none" }} onClick={closeFilter}></div>

                <div className="filter-popup" style={{ display: showFilterPopup ? "block" : "none" }}>
                    <h3>Filter Maintenance</h3>

                    <label>
                        Status:
                        <select
                            value={tempFilter.status}
                            onChange={(e) =>
                                setTempFilter(prev => ({ ...prev, status: e.target.value }))
                            }
                        >
                            <option value="">All</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </label>

                    <label>
                        Maintenance Type:
                        <select
                            value={tempFilter.type}
                            onChange={(e) =>
                                setTempFilter(prev => ({ ...prev, type: e.target.value }))
                            }
                        >
                            <option value="">All</option>
                            <option value="Cleaning & Calibration">Cleaning & Calibration</option>
                            <option value="Repair">Repair</option>
                            <option value="Inspection">Inspection</option>
                        </select>
                    </label>

                    <div className="filter-popup-buttons">
                        <button className="add-btn" onClick={handleApplyFilter}>Apply Filter</button>&emsp;
                        <button className="delete-btn" onClick={handleClearFilter}>Clear All</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
