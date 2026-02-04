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

interface Visitor {
  id: number;
  name: string;
  gender: "Male" | "Female";
  age: number;
  visit_date: string;
  organization_id: number;
  headquarters_id: number;
}

interface Convert {
  id: number;
  convert_type: "member" | "visitor";
  convert_date: string;
  member_id: number | null;
  visitor_id: number | null;
  follow_up_status: string;
  organization_id: number;
  headquarters_id: number;
}

interface Branch {
  branch_id: number;
  name: string;
}

/*interface ChartData {
  attendance: number[];
  donations: number[];
}*/

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

  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const [allConverts, setAllConverts] = useState<Convert[]>([]);
  const [converts, setConverts] = useState<Convert[]>([]);

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

  /*const [_chartData, setChartData] = useState<ChartData>({
    attendance: [0, 0, 0, 0],
    donations: [18364.05, 18364.05, 18364.05, 18364.05],
  });*/

  const attendanceChartRef = useRef<Chart | null>(null);
  const growthChartRef = useRef<Chart | null>(null);

  /* =======================
     FETCH MEMBERS
  ======================= */
  const fetchMembers = async () => {
    if (!authToken || !headquarterId) return;

    const res = await fetch(
      `${baseURL}/api/headquarters/${headquarterId}/members`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const data = await res.json();
    if (Array.isArray(data)) {
      setAllMembers(data);
      setMembers(data);
    }
  };

  /* =======================
     FETCH VISITORS
  ======================= */
  const fetchVisitors = async () => {
    if (!authToken || !headquarterId) return;

    const res = await fetch(
      `${baseURL}/api/headquarters/${headquarterId}/visitors`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const data = await res.json();
    if (Array.isArray(data)) {
      setAllVisitors(data);
      setVisitors(data);
    }
  };

  /* =======================
     FETCH CONVERTS
  ======================= */
  const fetchConverts = async () => {
    if (!authToken || !headquarterId) return;

    const res = await fetch(
      `${baseURL}/api/headquarters/${headquarterId}/converts`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const data = await res.json();
    if (Array.isArray(data)) {
      setAllConverts(data);
      setConverts(data);
    }
  };

  /* =======================
     FETCH BRANCHES
  ======================= */
  const fetchBranches = async () => {
    if (!authToken || !headquarterId) return;

    const res = await fetch(
      `${baseURL}/api/headquarters/organizations/${headquarterId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const data = await res.json();
    if (Array.isArray(data)) {
      setBranches(
        data.map((b: any) => ({
          branch_id: b.id,
          name: b.name,
        }))
      );
      setSelectedBranch(null);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchVisitors();
    fetchConverts();
    fetchBranches();
  }, []);

  /* =======================
     KPI CALCULATIONS
  ======================= */
  useEffect(() => {
    setKpi({
      totalMembers: members.filter(m => m.status === "Active").length,
      totalVisitors: visitors.length,
      totalConverts: converts.length,
      totalBranches: branches.length,
      monthlyGiving: 18364.05,
    });
  }, [members, visitors, converts, branches]);

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
        const count = genderMembers.filter(
          m => m.age >= ag.min && m.age <= ag.max
        ).length;

        return {
          label: ag.label,
          count,
          percentage: total ? +((count / total) * 100).toFixed(1) : 0,
        };
      });

      return {
        gender: g,
        totalCount: total,
        percentage: members.length
          ? +((total / members.length) * 100).toFixed(1)
          : 0,
        ageGroups,
      };
    });
  }, [members]);

  /* =======================
     FETCH ATTENDANCE
  ======================= */
  const fetchAttendance = async () => {
    if (!authToken || !headquarterId) return;

    try {
      const res = await fetch(
        `${baseURL}/api/headquarters/${headquarterId}/attendance_records`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = await res.json();
      if (!Array.isArray(data)) return;

      // Filter by selected branch
      const filteredData = selectedBranch
        ? data.filter((record: any) => record.organization_id === selectedBranch.branch_id)
        : data;

      // Group by week (last 4 weeks)
      const today = new Date();
      const lastFourWeeks = Array.from({ length: 4 }, (_, i) => {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (i * 7) - today.getDay()); // start of week
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { startOfWeek, endOfWeek };
      }).reverse(); // Oldest week first

      const weeklyCounts = lastFourWeeks.map(({ startOfWeek, endOfWeek }) => {
        return filteredData.filter(
          (record: any) =>
            record.status === "Present" &&
            new Date(record.attendance_date) >= startOfWeek &&
            new Date(record.attendance_date) <= endOfWeek
        ).length;
      });

      const weekLabels = lastFourWeeks.map(({ startOfWeek, endOfWeek }) => {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        return `${startOfWeek.toLocaleDateString(undefined, options)} - ${endOfWeek.toLocaleDateString(undefined, options)}`;
      });

      // Render chart
      attendanceChartRef.current?.destroy();
      const ctx = document.getElementById("attendanceChart") as HTMLCanvasElement;
      if (!ctx) return;

      attendanceChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: weekLabels,
          datasets: [
            {
              label: "Weekly Attendance",
              data: weeklyCounts,
              borderColor: "#1A3D7C",
              backgroundColor: "rgba(26,61,124,0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      });
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  };

  /* =======================
     ATTENDANCE CHART EFFECT
  ======================= */
  useEffect(() => {
    fetchAttendance();
  }, [selectedBranch, members]);

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
    const value = e.target.value;

    if (value === "all") {
      setSelectedBranch(null);
      setMembers(allMembers);
      setVisitors(allVisitors);
      setConverts(allConverts);
      return;
    }

    const id = parseInt(value);
    const branch = branches.find(b => b.branch_id === id) || null;
    setSelectedBranch(branch);

    if (branch) {
      setMembers(allMembers.filter(m => m.organization_id === branch.branch_id));
      setVisitors(allVisitors.filter(v => v.organization_id === branch.branch_id));
      setConverts(allConverts.filter(c => c.organization_id === branch.branch_id));
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <HeaderNav />
        <br />
        <h1>General Report</h1>

        <p>Please Refresh your browser regularly to get the latest Information</p>

        <div className="kpi-container">
          <div className="kpi-card">
            <h3>Total Branches</h3>
            <p>{kpi.totalBranches}</p>
          </div>

          <div className="kpi-card">
            <h3>Select Branch</h3>
            <div className="branch-dropdown">
              <img src={branchImage} alt="Branch" width={35} />
              <select
                value={selectedBranch?.branch_id ?? "all"}
                onChange={handleBranchChange}
              >
                <option value="all">All Branches (HQ)</option>
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
          <div className="kpi-card"><h3>Monthly Giving</h3><p>ZMW {kpi.monthlyGiving.toLocaleString()}</p></div>
        </div>

        <div className="chart-box">
          <h3 className="generalReportH3">Member Breakdown</h3>
          <div className="gender-breakdown">
            {genderData.map((gender, i) => (
              <div className="gender-gender-breakdown" key={i}>
                <div className="gender-content">
                  <img src={gender.gender === "Male" ? maleImage : femaleImage} />
                  <div className="stats-gender-breakdown">
                    <h2>{gender.gender} Breakdown</h2>

                    <div
                      className="donut-chart"
                      style={{
                        background: `conic-gradient(${gender.gender === "Male" ? "#5C4736" : "#AF907A"} 0% ${gender.percentage}%, #ddd ${gender.percentage}% 100%)`,
                      }}
                      title={`${gender.totalCount} members (${gender.percentage}%)`}
                    >
                      <span>{gender.percentage}%</span>
                    </div>

                    <div className="age-bars">
                        {gender.ageGroups.map((age, j) => (
                          <div className="age-bar" key={j} title={`${age.count} members (${age.percentage}%)`}>
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
