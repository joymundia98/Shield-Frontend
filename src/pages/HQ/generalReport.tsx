import React, { useEffect, useState, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import HeaderNav from "./HQHeader";
import maleImage from "../../assets/male.png";
import femaleImage from "../../assets/female.png";
import branchImage from "../../assets/branch.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* =======================
   API / AUTH CONFIG
======================= */
const baseURL = import.meta.env.VITE_BASE_URL;
const authToken = localStorage.getItem("authToken");
const headquartersRaw = localStorage.getItem("headquarters");
const headquarters = headquartersRaw ? JSON.parse(headquartersRaw) : null;
const headquarterId = headquarters?.id;

/* =======================
   TYPES
======================= */
interface Member {
  member_id: number;
  full_name: string;
  age: number;
  gender: "Male" | "Female";
  date_joined: string;
  status: "Active" | "Visitor" | "New Convert";
  organization_id: number;
}

/*interface AttendanceRecord {
  record_id: number;
  status: "Present" | "Absent";
  attendance_date: string;
  member_id: number | null;
}*/

interface Branch {
  branch_id: number;
  name: string;
}

interface ChartData {
  attendance: number[];
  donations: number[];
}

interface GenderData {
  gender: "Male" | "Female";
  percentage: number;
  totalCount: number;
  ageGroups: {
    label: string;
    percentage: number;
    count: number;
  }[];
}

/* =======================
   COMPONENT
======================= */
const GeneralReport: React.FC = () => {
  /* ===== STATE ===== */
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [kpi, setKpi] = useState({
    totalMembers: 0,
    totalVisitors: 0,
    totalConverts: 0,
    totalBranches: 0,
    monthlyGiving: 18364.05,
  });
  const [chartData, setChartData] = useState<ChartData>({
    attendance: [0, 0, 0, 0],
    donations: [18364.05, 18364.05, 18364.05, 18364.05],
  });

  const attendanceChartRef = useRef<Chart | null>(null);
  const growthChartRef = useRef<Chart | null>(null);

  /* =======================
     FETCH MEMBERS
  ======================= */
  const fetchMembersData = async () => {
    if (!authToken || !headquarterId) return;

    try {
      const response = await fetch(
        `${baseURL}/api/headquarters/${headquarterId}/members`,
        { method: "GET", headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch members");

      const data = await response.json();
      if (Array.isArray(data)) {
        setAllMembers(data);
        setMembers(data); // initially show all members
      } else console.error("Unexpected members response:", data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  /* =======================
     FETCH BRANCHES
  ======================= */
  const fetchBranches = async () => {
    if (!authToken || !headquarterId) return;

    try {
      const response = await fetch(
        `${baseURL}/api/headquarters/organizations/${headquarterId}`,
        { method: "GET", headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch branches");

      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedBranches = data.map(branch => ({
          branch_id: branch.id,
          name: branch.name,
        }));
        setBranches(formattedBranches);

        if (formattedBranches.length > 0) {
          setSelectedBranch(formattedBranches[0]);

          // Filter members for first branch
          const filteredMembers = allMembers.filter(
            (m) => m.organization_id === formattedBranches[0].branch_id
          );
          setMembers(filteredMembers);
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchMembersData();
    fetchBranches();
  }, []);

  /* =======================
     KPI CALCULATIONS
  ======================= */
  useEffect(() => {
    const totalMembers = members.filter(m => m.status === "Active").length;
    const totalVisitors = members.filter(m => m.status === "Visitor").length;
    const totalConverts = members.filter(m => m.status === "New Convert").length;
    const totalBranches = branches.length;

    setKpi({
      totalMembers,
      totalVisitors,
      totalConverts,
      totalBranches,
      monthlyGiving: 18364.05,
    });
  }, [members, branches]);

  /* =======================
     GENDER BREAKDOWN
  ======================= */
  const genderData: GenderData[] = useMemo(() => {
    const genders: ("Male" | "Female")[] = ["Male", "Female"];
    return genders.map(g => {
      const genderMembers = members.filter(m => m.gender === g);
      const total = genderMembers.length;

      const ageGroups = [
        { label: "0-12", min: 0, max: 12 },
        { label: "13-18", min: 13, max: 18 },
        { label: "19-35", min: 19, max: 35 },
        { label: "36-60", min: 36, max: 60 },
        { label: "60+", min: 61, max: 150 },
      ].map(ag => {
        const count = genderMembers.filter(m => m.age >= ag.min && m.age <= ag.max).length;
        const percentage = total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0;
        return { label: ag.label, percentage, count };
      });

      const genderPercentage = members.length > 0
        ? parseFloat(((total / members.length) * 100).toFixed(1))
        : 0;

      return { gender: g, percentage: genderPercentage, totalCount: total, ageGroups };
    });
  }, [members]);

  /* =======================
     ATTENDANCE CHART (dummy data for now)
  ======================= */
  useEffect(() => {
    const weeklyAttendance = [1, 2, 3, 4].map((_, i) =>
      members.length - i * 2 // simple placeholder
    );

    setChartData(prev => ({ ...prev, attendance: weeklyAttendance }));
  }, [members]);

  useEffect(() => {
    attendanceChartRef.current?.destroy();
    const ctx = document.getElementById("attendanceChart") as HTMLCanvasElement;
    if (!ctx) return;

    attendanceChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Weekly Attendance",
            data: chartData.attendance,
            borderColor: "#1A3D7C",
            backgroundColor: "rgba(26,61,124,0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true },
    });
  }, [chartData]);

  /* =======================
     GROWTH CHART
  ======================= */
  useEffect(() => {
    growthChartRef.current?.destroy();
    const ctx = document.getElementById("growthChart") as HTMLCanvasElement;
    if (!ctx) return;

    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    );

    const monthlyCounts = Array(12).fill(0);
    members.forEach(m => {
      const d = new Date(m.date_joined);
      if (!isNaN(d.getTime())) monthlyCounts[d.getMonth()]++;
    });

    growthChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "New Members",
            data: monthlyCounts,
            borderColor: "#1A3D7C",
            backgroundColor: "rgba(26,61,124,0.25)",
            fill: true,
            tension: 0.3,
            borderWidth: 3,
          },
        ],
      },
      options: { responsive: true },
    });
  }, [members]);

  /* =======================
     HANDLERS
  ======================= */
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const branch = branches.find(b => b.branch_id === id) || null;
    setSelectedBranch(branch);

    if (branch) {
      const filteredMembers = allMembers.filter(
        (m) => m.organization_id === branch.branch_id
      );
      setMembers(filteredMembers);
    } else {
      setMembers(allMembers);
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <HeaderNav />
        <br/>
        <h1>General Report</h1>

        {/* KPIs */}
        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Branches</h3><p>{kpi.totalBranches}</p></div>
          <div className="kpi-card">
            <h3>Select Branch</h3>
            <div className="branch-dropdown">
              <img src={branchImage} alt="Branch" width={35} />
              <select value={selectedBranch?.branch_id || ""} onChange={handleBranchChange}>
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="kpi-card">
            <h3>Select a Date</h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
            />
          </div>
        </div>

        <div className="kpi-container">
          <div className="kpi-card"><h3>Total Members</h3><p>{kpi.totalMembers}</p></div>
          <div className="kpi-card"><h3>Total Visitors</h3><p>{kpi.totalVisitors}</p></div>
          <div className="kpi-card"><h3>Total Converts</h3><p>{kpi.totalConverts}</p></div>
          <div className="kpi-card">
            <h3>Monthly Giving</h3>
            <p>ZMW {kpi.monthlyGiving.toLocaleString()}</p>
          </div>
        </div>

        {/* MEMBER BREAKDOWN */}
        <div className="chart-box">
          <h3 className="generalReportH3">Member Breakdown</h3>
          <div className="gender-breakdown">
            {genderData.map((gender, index) => (
              <div className="gender-gender-breakdown" key={index}>
                <div className="gender-content">
                  <img src={gender.gender === "Male" ? maleImage : femaleImage} alt={gender.gender} />
                  <div className="stats-gender-breakdown">
                    <h2>{gender.gender} Breakdown</h2>
                    <div
                      className="donut-chart"
                      style={{
                        background: `conic-gradient(${gender.gender === "Male" ? "#5C4736" : "#AF907A"} 0% ${gender.percentage}%, #ddd ${gender.percentage}% 100%)`,
                      }}
                      title={`${gender.percentage}% (${gender.totalCount} Members)`}
                    >
                      <span>{gender.percentage}%</span>
                    </div>
                    <div className="age-bars">
                      {gender.ageGroups.map((age, i) => (
                        <div className="age-bar" key={i} title={`${age.percentage}% (${age.count} Members)`}>
                          <div className="age-label">{age.label}</div>
                          <div className="bar">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${age.percentage}%`,
                                background: gender.gender === "Male" ? "#5C4736" : "#AF907A",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <h4>Age</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <br/>

        <div className="chart-grid">
          <div className="chart-box">
            <h3>Attendance Trends</h3>
            <canvas id="attendanceChart" />
          </div>
          <div className="chart-box">
            <h3>Church Growth (12 Months)</h3>
            <canvas id="growthChart" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralReport;
