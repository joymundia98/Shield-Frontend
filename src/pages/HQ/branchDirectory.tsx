import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";
import HQHeader from "./HQHeader";
import { useAuth } from "../../hooks/useAuth";
import { TourProvider, useTour } from "@reactour/tour";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Organization {
  id: number;
  name: string;
  status: "active" | "inactive";
  address: string;
  org_type_id: number;
  district: string;
  region: string;
}

/* ============================
   TOUR STEPS (React 19 Safe)
============================ */

const tourSteps = [
  {
    selector: "#tour-hamburger",
    content: "Use this button to open the HQ sidebar menu.",
  },
  {
    selector: "#tour-new-branch",
    content: "Click here to create a new branch.",
  },
  {
    selector: "#tour-search",
    content: "Search branches by name here.",
  },
  {
    selector: "#tour-status-filter",
    content: "Filter branches by Active or Inactive status.",
  },
  {
    selector: "#tour-region-filter",
    content: "Filter branches by Region.",
  },
  {
    selector: "#tour-district-filter",
    content: "Filter branches by District.",
  },
  {
    selector: "#tour-table",
    content: "Branches are grouped by Region and District here.",
  },
];

//Custom Close
const CustomClose: React.FC<{ onClick?: () => void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    style={{
      background: "red",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: 32,
      height: 32,
      fontWeight: "bold",
      cursor: disabled ? "not‑allowed" : "pointer",
      display: "flex",           // ✅ Use flex to center the X
      alignItems: "center",      // ✅ Vertical centering
      justifyContent: "center",  // ✅ Horizontal centering
      fontSize: 16,
      position: "absolute",
      top: -9,                     // Adjust as needed
      right: -10,                   // Adjust as needed
      padding: 0,
    }}
  >
    ✕
  </button>
);

// Custom navigation with dots
const CustomNavigation = () => {
  const { currentStep, steps, setCurrentStep, setIsOpen } = useTour();

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div style={{ marginTop: 10 }}>
      {/* Step dots */}
      <div style={{ textAlign: "center", marginBottom: 5 }}>
        {steps.map((_, idx) => (
          <span
            key={idx}
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              margin: "0 4px",
              background: idx === currentStep ? "#007bff" : "#ccc",
              cursor: "pointer",
            }}
            onClick={() => setCurrentStep(idx)}
          />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          style={{
            backgroundColor: "#ccc",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: currentStep === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>
        <button
          onClick={goNext}
          style={{
            backgroundColor: "#ccc",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {currentStep === steps.length - 1 ? "End Tour" : "Next →"}
        </button>
      </div>
    </div>
  );
};

const BranchDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { setIsOpen, setCurrentStep } = useTour();

  const [organizationData, setOrganizationData] = useState<Organization[]>([]);
  const [orgTypes, setOrgTypes] = useState<Record<number, string>>({});
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  /* ============================
     AUTO START TOUR (ONCE)
  ============================ */

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("branchTourSeen");
    if (!hasSeenTour) {
      setIsOpen(true);
      localStorage.setItem("branchTourSeen", "true");
    }
  }, [setIsOpen]);

  /* ============================
     ORIGINAL DATA FETCH LOGIC
  ============================ */

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    const orgData = JSON.parse(localStorage.getItem("organization") || "null");

    const headquarterId =
      userData?.headquarter_id || orgData?.headquarters_id;

    const authToken = localStorage.getItem("authToken");

    if (!headquarterId || !authToken) {
      setError("Authentication or headquarters data is missing.");
      setLoading(false);
      return;
    }

    const fetchOrganizations = async () => {
      try {
        const response = await fetch(
          `${baseURL}/api/headquarters/organizations/${headquarterId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const data = await response.json();
        console.log("Fetched Organization Data:", data);

        setOrganizationData(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load organization data");
        setLoading(false);
      }
    };

    const fetchOrgTypes = async () => {
      try {
        const response = await fetch(`${baseURL}/api/organization_type`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch organization types");
        }

        const data = await response.json();
        console.log("Fetched Organization Types:", data);

        const orgTypesMap = data.reduce(
          (
            acc: Record<number, string>,
            orgType: { org_type_id: number; name: string }
          ) => {
            acc[orgType.org_type_id] = orgType.name;
            return acc;
          },
          {}
        );

        setOrgTypes(orgTypesMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load organization types");
      }
    };

    fetchOrganizations();
    fetchOrgTypes();
  }, []);

  const filteredOrganizations = useMemo(() => {
    let filtered = organizationData;

    if (searchQuery) {
      filtered = filtered.filter((org) =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter(
        (org) => org.status === selectedStatusFilter
      );
    }

    if (selectedRegionFilter !== "all") {
      filtered = filtered.filter(
        (org) => org.region === selectedRegionFilter
      );
    }

    if (selectedDistrictFilter !== "all") {
      filtered = filtered.filter(
        (org) => org.district === selectedDistrictFilter
      );
    }

    return filtered;
  }, [
    organizationData,
    selectedStatusFilter,
    selectedRegionFilter,
    selectedDistrictFilter,
    searchQuery,
  ]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(
      new Set(organizationData.map((org) => org.region))
    );
    return ["all", ...uniqueRegions];
  }, [organizationData]);

  const districts = useMemo(() => {
    const uniqueDistricts = Array.from(
      new Set(organizationData.map((org) => org.district))
    );
    return ["all", ...uniqueDistricts];
  }, [organizationData]);

  const openViewOrganization = () => {
    navigate(`/InProgress`);
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
      <button
        className="hamburger"
        id="tour-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        &#9776;
      </button>

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

        <h2>HQ MANAGER</h2>

        {hasPermission("View Branch Directory") && (
          <a
            href="/HQ/branchDirectory"
            className={
              location.pathname === "/HQ/branchDirectory"
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.preventDefault();
              navigate("/HQ/branchDirectory");
              setSidebarOpen(false);
            }}
          >
            Manage Branches
          </a>
        )}

        {hasPermission("View HQ Reports") && (
          <a
            href="/HQ/GeneralReport"
            className={
              location.pathname === "/HQ/GeneralReport"
                ? "active"
                : ""
            }
            onClick={(e) => {
              e.preventDefault();
              navigate("/HQ/GeneralReport");
              setSidebarOpen(false);
            }}
          >
            Branch Reports
          </a>
        )}

        <hr className="sidebar-separator" />

        {hasPermission("View Main Dashboard") && (
          <a href="/dashboard" className="return-main">
            ← Back to Main Dashboard
          </a>
        )}

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
        <HQHeader />
        <br />

        <header className="page-header user-header">
          <h1 id="tour-page-title">Branch Directory</h1>

          <div className="header-buttons">
            <button
              className="add-btn"
              id="tour-new-branch"
              onClick={() => navigate("/HQ/newBranch")}
            >
              + &nbsp; New Branch
            </button>

            <button
              className="add-btn"
              style={{ background: "#ffffff", marginLeft: "10px", color: "#000000" }}
              onClick={() => {
                setCurrentStep(0);
                setIsOpen(true);
              }}
            >
              🎥 Take a Tour
            </button>
          </div>
        </header>

        {error && <div className="error">{error}</div>}
        {loading && <p>Loading organizations...</p>}

        <br />

        <div className="user-filter-box">
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              id="tour-search"
              type="text"
              placeholder="Search by name..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              id="tour-status-filter"
              className="user-filter-select"
              value={selectedStatusFilter}
              onChange={(e) =>
                setSelectedStatusFilter(e.target.value)
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              id="tour-region-filter"
              className="user-filter-select"
              value={selectedRegionFilter}
              onChange={(e) =>
                setSelectedRegionFilter(e.target.value)
              }
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <select
              id="tour-district-filter"
              className="user-filter-select"
              value={selectedDistrictFilter}
              onChange={(e) =>
                setSelectedDistrictFilter(e.target.value)
              }
            >
              <option value="all">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <br />

        {["active", "inactive"].map((status) => {
          if (
            selectedStatusFilter !== "all" &&
            selectedStatusFilter !== status
          )
            return null;

          const filtered = filteredOrganizations.filter(
            (org) => org.status === status
          );

          const groupedByDistrict = filtered.reduce(
            (acc, org) => {
              acc[org.region] = acc[org.region] || {};
              acc[org.region][org.district] =
                acc[org.region][org.district] || [];
              acc[org.region][org.district].push(org);
              return acc;
            },
            {} as Record<string, Record<string, Organization[]>>
          );

          return (
            <div key={status}>
              <h2>
                {status === "active"
                  ? "Active"
                  : "Inactive"}{" "}
                Organizations
              </h2>

              {Object.keys(groupedByDistrict).map((region) => (
                <div key={region}>
                  <h3>{region}</h3>

                  {Object.keys(
                    groupedByDistrict[region]
                  ).map((district) => (
                    <div key={district}>
                      <h4>{district}</h4>

                      <table
                        className="responsive-table"
                        id="tour-table"
                      >
                        <thead>
                          <tr>
                            <th>Organization Name</th>
                            <th>Status</th>
                            <th>Address</th>
                            <th>Organization Type</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {groupedByDistrict[region][
                            district
                          ].map((org) => (
                            <tr key={org.id}>
                              <td>{org.name}</td>
                              <td>{org.status}</td>
                              <td>{org.address}</td>
                              <td>
                                {orgTypes[org.org_type_id] ||
                                  "Unknown Type"}
                              </td>
                              <td>
                                <button
                                  className="add-btn"
                                  onClick={() =>
                                    openViewOrganization()
                                  }
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================
   WRAPPED WITH TOUR PROVIDER
============================ */

export default function BranchDirectoryPageWithTour() {
  return (
    <TourProvider
      steps={tourSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
    >
      <BranchDirectoryPage />
    </TourProvider>
  );
}