import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';
import { useAuth } from "../../hooks/useAuth";
import { authFetch, orgFetch } from "../../utils/api";

interface Maintenance {
    id: number;
    asset: string;
    lastService: string;
    nextService: string;
    type: string;
    status: string;
}

interface Category {
    id: number;
    name: string;
}

const baseURL = import.meta.env.VITE_BASE_URL;

const MaintenancePage: React.FC = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filter, setFilter] = useState({ status: "", type: "" });
    const [tempFilter, setTempFilter] = useState(filter);
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        if (sidebarOpen) document.body.classList.add("sidebar-open");
        else document.body.classList.remove("sidebar-open");
    }, [sidebarOpen]);

    // ---------------- Fetch Helper ----------------
    const fetchDataWithAuthFallback = async (url: string, options?: RequestInit) => {
        try {
            return await authFetch(url, options);
        } catch (error: unknown) {
            console.log("authFetch failed, falling back to orgFetch", error);
            return await orgFetch(url, options);
        }
    };

    // ---------------- Fetch Data ----------------
    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                setLoading(true);

                const catData: Category[] = await fetchDataWithAuthFallback(`${baseURL}/api/maintenance_categories`);
                const records: any[] = await fetchDataWithAuthFallback(`${baseURL}/api/maintenance_records`);
                const assets: any[] = await fetchDataWithAuthFallback(`${baseURL}/api/assets`);

                // 🔥 Optimized lookup maps
                const categoryMap = Object.fromEntries(catData.map(c => [c.id, c.name]));
                const assetMap = Object.fromEntries(assets.map(a => [a.asset_id, a.name]));

                const mapped: Maintenance[] = records.map((rec: any) => ({
                    id: rec.id,
                    asset: assetMap[rec.asset_id] || `Asset #${rec.asset_id}`,
                    lastService: rec.last_service?.split("T")[0] || "",
                    nextService: rec.next_service?.split("T")[0] || "",
                    type: categoryMap[rec.category_id] || "Unknown",
                    status: rec.status,
                }));

                setCategories(catData);
                setMaintenanceList(mapped);

            } catch (err: any) {
                console.error(err);
                setError("Failed to fetch maintenance records.");
            } finally {
                setLoading(false);
            }
        };

        fetchMaintenance();
    }, []);

    // ---------------- Filter Logic ----------------
    const filteredMaintenance = useMemo(() => {
        return maintenanceList.filter(item => {
            if (filter.status && item.status !== filter.status) return false;
            if (filter.type && item.type !== filter.type) return false;
            return true;
        });
    }, [maintenanceList, filter]);

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

    // ---------------- Actions ----------------
    const handleAdd = () => navigate("/assets/maintenance/schedule");
    const handleEdit = (id: number) => navigate(`/assets/maintenance/edit/${id}`);
    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;

        try {
            await fetchDataWithAuthFallback(`${baseURL}/api/maintenance_records/${id}`, { method: "DELETE" });
            setMaintenanceList(prev => prev.filter(rec => rec.id !== id));
        } catch (err: any) {
            console.error(err);
            alert("Failed to delete maintenance record.");
        }
    };

    if (loading) return <div>Loading maintenance records...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="dashboard-wrapper">
            {/* Hamburger */}
            <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="close-wrapper">
                    <div className="toggle close-btn">
                        <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
                        <span className="button"></span>
                        <span className="label">X</span>
                    </div>
                </div>

                <h2>ASSET MANAGER</h2>
                {hasPermission("View Asset Dashboard") && <a href="/assets/dashboard">Dashboard</a>}
                {hasPermission("View All Assets") && <a href="/assets/assets">Asset Inventory</a>}
                {hasPermission("View Asset Depreciation") && <a href="/assets/depreciation">Depreciation Info</a>}
                {hasPermission("Manage Asset Maintenance") && <a href="/assets/maintenance" className="active">Maintenance</a>}
                <a href="/assets/locations">Asset Locations</a>
                {hasPermission("View Categories") && <a href="/assets/categories">Categories</a>}
                <hr className="sidebar-separator" />
                {hasPermission("View Main Dashboard") && <a href="/dashboard" className="return-main">← Back to Main Dashboard</a>}
                <a href="/" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}>➜ Logout</a>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <AssetsHeader /><br/>
                <h1>Maintenance Schedule</h1>

                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button className="add-btn" onClick={handleAdd}>+ &nbsp; Schedule Maintenance</button>&emsp;
                    <button className="filter-btn" onClick={openFilter}>📂 Filter</button>
                </div>

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
                        {filteredMaintenance.map((item) => (
                            <tr key={item.id}>
                                <td data-title="Asset">{item.asset}</td>
                                <td data-title="Last Serviced">{item.lastService}</td>
                                <td data-title="Next Service">{item.nextService}</td>
                                <td data-title="Maintenance Type">{item.type}</td>
                                <td data-title="Status">{item.status}</td>
                                <td className="actions">
                                    <button className="edit-btn" onClick={() => handleEdit(item.id)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
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
                        <select value={tempFilter.status} onChange={(e) => setTempFilter(prev => ({ ...prev, status: e.target.value }))}>
                            <option value="">All</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </label>
                    <label>
                        Maintenance Type:
                        <select value={tempFilter.type} onChange={(e) => setTempFilter(prev => ({ ...prev, type: e.target.value }))}>
                            <option value="">All</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
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