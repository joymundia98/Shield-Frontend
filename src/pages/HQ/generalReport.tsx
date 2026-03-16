import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../../styles/global.css";
import HeaderNav from "./HQHeader";
import maleImage from "../../assets/male.png";
import femaleImage from "../../assets/female.png";
import branchImage from "../../assets/branch.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../hooks/useAuth";
import { TourProvider, useTour } from "@reactour/tour";

/* =======================
   API / AUTH CONFIG
======================= */
const baseURL = import.meta.env.VITE_BASE_URL;


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

const AGE_GROUPS = [
  { label: "0-12", min: 0, max: 12 },
  { label: "13-18", min: 13, max: 18 },
  { label: "19-35", min: 19, max: 35 },
  { label: "36-60", min: 36, max: 60 },
  { label: "60+", min: 61, max: 150 },
];

/*======================
TOUR STEPS
=======================*/
const reportTourSteps = [
  {
    selector: "#tour-hamburger",
    content: (
      <>
        <h3>Navigation Menu</h3>
        <p>
          Access the HQ management sidebar from here. Use this menu to move
          between branch management, reports, and your main dashboard.
        </p>
        <p>
          On smaller screens, this becomes your primary navigation tool.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-branch-select",
    content: (
      <>
        <h3>Branch Filter</h3>
        <p>
          Select a specific branch to generate a detailed performance report.
        </p>
        <p>
          Leaving this set to <strong>All Branches</strong> provides a
          consolidated Headquarters overview.
        </p>
        <p>
          All charts and KPIs will automatically update based on your
          selection.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-date-select",
    content: (
      <>
        <h3>Reporting Period</h3>
        <p>
          Choose a month and year to analyze performance trends for a specific
          reporting period.
        </p>
        <p>
          Key metrics such as Visitors and Converts reflect the selected month,
          while Membership totals represent cumulative growth up to that date.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-kpi-section",
    content: (
      <>
        <h3>Key Performance Indicators</h3>
        <p>
          This section highlights the most important metrics at a glance:
        </p>
        <ul>
          <li>Total Active Members</li>
          <li>Total Visitors (Selected Month)</li>
          <li>Total Converts (Selected Month)</li>
          <li>Total Branches (HQ View)</li>
        </ul>
        <p>
          These figures provide a quick snapshot of health and growth.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-member-breakdown",
    content: (
      <>
        <h3>Member Demographics</h3>
        <p>
          Analyze the gender distribution and age composition of active
          members.
        </p>
        <p>
          This insight helps leadership understand generational engagement and
          identify areas for strategic outreach or ministry focus.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-convert-chart",
    content: (
      <>
        <h3>Conversion Insights</h3>
        <p>
          This chart illustrates the source of new converts — whether they
          originated as Visitors or transitioned from existing Members.
        </p>
        <p>
          Monitoring this trend helps evaluate outreach effectiveness and
          assimilation strategies.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-attendance-chart",
    content: (
      <>
        <h3>Attendance Trends</h3>
        <p>
          Weekly attendance for the selected month is displayed here.
        </p>
        <p>
          Consistent growth patterns may indicate healthy engagement, while
          fluctuations can signal seasonal or operational factors.
        </p>
      </>
    ),
  },
  {
    selector: "#tour-growth-chart",
    content: (
      <>
        <h3>Church Growth (12-Month View)</h3>
        <p>
          This chart tracks new member growth over the past 12 months.
        </p>
        <p>
          It provides leadership with a strategic, long-term perspective on
          expansion and retention momentum.
        </p>
      </>
    ),
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

/* =======================
   COMPONENT
======================= */
const GeneralReport: React.FC = () => {

  const navigate = useNavigate();

  const { hasPermission } = useAuth();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [headquarterId, setHeadquarterId] = useState<number | null>(null);

  /* ===== STATE ===== */
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const [allConverts, setAllConverts] = useState<Convert[]>([]);
  const [converts, setConverts] = useState<Convert[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [hqName, setHqName] = useState("Headquarters");

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
  const convertChartRef = useRef<Chart | null>(null);
  const ageChartRef = useRef<Chart | null>(null);
  const convertGenderChartRef = useRef<Chart | null>(null);

  useEffect(() => {
      if (sidebarOpen) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }, [sidebarOpen]);

/*=============
Ensure Data Loads on page landing
================*/
useEffect(() => {
  const token = localStorage.getItem("authToken");
  const userRaw = localStorage.getItem("user");
  const orgRaw = localStorage.getItem("organization");

  const userData = userRaw ? JSON.parse(userRaw) : null;
  const orgData = orgRaw ? JSON.parse(orgRaw) : null;

  const hqId =
    userData?.headquarter_id || orgData?.headquarters_id || null;

  setAuthToken(token);
  setHeadquarterId(hqId);
}, []);

/*=================
RESUSABLE HELPER
==================*/
const isUpToSelectedDate = (dateString: string, selectedDate: Date) => {
  return new Date(dateString) <= selectedDate;
};

const filterByBranch = <T extends { organization_id: number }>(
  data: T[],
  branch: Branch | null
) => {
  return branch
    ? data.filter(d => d.organization_id === branch.branch_id)
    : data;
};

/*========================
No data helper function
=========================*/
const fetchAsArray = async (url: string): Promise<any[]> => {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // If backend returns 404 → treat as empty dataset
    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      console.error("Request failed:", res.status);
      return [];
    }

    const data = await res.json();

    // If backend returns { message: "..."}
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    console.error("Network error:", error);
    return [];
  }
};



  /* =======================
     FETCH MEMBERS
  ======================= */
  const fetchMembers = async () => {
    if (!authToken || !headquarterId) return;

    const data = await fetchAsArray(
      `${baseURL}/api/headquarters/${headquarterId}/members`
    );

    setAllMembers(data);
    setMembers(data);
  };


  /* =======================
     FETCH VISITORS
  ======================= */
  const fetchVisitors = async () => {
    if (!authToken || !headquarterId) return;

    const data = await fetchAsArray(
      `${baseURL}/api/headquarters/${headquarterId}/visitors`
    );

    setAllVisitors(data);
    setVisitors(data);
  };


  /* =======================
     FETCH CONVERTS
  ======================= */
  const fetchConverts = async () => {
    if (!authToken || !headquarterId) return;

    const data = await fetchAsArray(
      `${baseURL}/api/headquarters/${headquarterId}/converts`
    );

    setAllConverts(data);
    setConverts(data);
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

// helper to fetch HQ names
  const fetchHqName = async (id: number) => {
  try {
    const res = await fetch(`${baseURL}/api/public/hqs/names`);
    if (!res.ok) return "Headquarters";

    const data = await res.json();
    if (!Array.isArray(data)) return "Headquarters";

    const hq = data.find((hq: any) => hq.id === id);
    return hq ? hq.name : "Headquarters";
  } catch (error) {
    console.error("Failed to fetch HQ name:", error);
    return "Headquarters";
  }
};

  useEffect(() => {
  if (!authToken || !headquarterId) {
    console.error("Missing auth token or headquarters ID.");
    return;
  }

  // Fetch HQ name
  fetchHqName(headquarterId).then(name => setHqName(name));

  // Fetch dashboard data
  fetchMembers();
  fetchVisitors();
  fetchConverts();
  fetchBranches();
}, [authToken, headquarterId]);


  /* =======================
     GENDER BREAKDOWN
  ======================= */
  /* =======================
   GENDER BREAKDOWN (ROLLING)
======================= */
const genderData: GenderData[] = useMemo(() => {
  const genders: ("Male" | "Female")[] = ["Male", "Female"];

  //Counting only Active Members to reflect actual Growth
  const membersUpToDate = filterByBranch(allMembers, selectedBranch).filter(
    m => isUpToSelectedDate(m.date_joined, selectedDate) && m.status === "Active"
  );

  return genders.map(g => {
    const genderMembers = membersUpToDate.filter(m => m.gender === g);
    const total = genderMembers.length;

    const ageGroups = AGE_GROUPS.map(ag => {
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
      percentage: membersUpToDate.length
        ? +((total / membersUpToDate.length) * 100).toFixed(1)
        : 0,
      ageGroups,
    };
  });
}, [allMembers, selectedDate, selectedBranch]);


  /* =====================
    Fetch attendance Helper Function
  ========================*/
  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks: { startOfWeek: Date; endOfWeek: Date }[] = [];

    let current = new Date(firstDay);
    current.setDate(current.getDate() - current.getDay()); // Sunday start

    while (current <= lastDay) {
      const startOfWeek = new Date(current);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      weeks.push({ startOfWeek, endOfWeek });
      current.setDate(current.getDate() + 7);
    }

    return weeks;
  };


  /* =======================
     FETCH ATTENDANCE
  ======================= */
  const fetchAttendance = async () => {
    if (!authToken || !headquarterId) return;

    try {
      const data = await fetchAsArray(
        `${baseURL}/api/headquarters/${headquarterId}/attendance_records`
      );


      // Filter by selected branch
      // Filter by selected branch AND selected month/year
      const filteredData = data.filter((record: any) => {
        const recordDate = new Date(record.attendance_date);

        const sameMonthYear =
          recordDate.getMonth() === selectedDate.getMonth() &&
          recordDate.getFullYear() === selectedDate.getFullYear();

        const sameBranch = selectedBranch
          ? record.organization_id === selectedBranch.branch_id
          : true;

        return record.status === "Present" && sameMonthYear && sameBranch;
      });


      // Group by week (last 4 weeks)
      // ✅ Weeks of the SELECTED month
      const weeksInMonth = getWeeksInMonth(selectedDate);

      const weeklyCounts = weeksInMonth.map(({ startOfWeek, endOfWeek }) =>
        filteredData.filter(
          (record: any) =>
            new Date(record.attendance_date) >= startOfWeek &&
            new Date(record.attendance_date) <= endOfWeek
        ).length
      );

      const weekLabels = weeksInMonth.map(({ startOfWeek, endOfWeek }) => {
        const options: Intl.DateTimeFormatOptions = {
          month: "short",
          day: "numeric",
        };
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
     CONVERTS CHART EFFECT
  ======================= */
  const convertBreakdown = useMemo(() => {
    const memberConverts = converts.filter(c => c.convert_type === "member").length;
    const visitorConverts = converts.filter(c => c.convert_type === "visitor").length;
    const total = memberConverts + visitorConverts;

    return {
      memberConverts,
      visitorConverts,
      memberPercentage: total ? ((memberConverts / total) * 100).toFixed(1) : "0",
      visitorPercentage: total ? ((visitorConverts / total) * 100).toFixed(1) : "0",
    };
  }, [converts]);


  useEffect(() => {
  convertChartRef.current?.destroy();

  const ctx = document.getElementById("convertChart") as HTMLCanvasElement;
  if (!ctx) return;

  convertChartRef.current = new Chart(ctx, {
    type: "pie", // 👈 THIS makes it a PIE, not donut
    data: {
      labels: ["From Visitors", "From Members"],
      datasets: [
        {
          data: [
            convertBreakdown.visitorConverts,
            convertBreakdown.memberConverts,
          ],
          backgroundColor: ["#AF907A", "#5C4736"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total =
                convertBreakdown.memberConverts +
                convertBreakdown.visitorConverts;
              const value = context.raw as number;
              const percentage = total
                ? ((value / total) * 100).toFixed(1)
                : 0;
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}, [convertBreakdown]);


const ageDistribution = useMemo(() => {
  const memberMap = new Map(allMembers.map(m => [m.member_id, m]));
  const visitorMap = new Map(allVisitors.map(v => [v.id, v]));


  const memberCounts = AGE_GROUPS.map(() => 0);
  const visitorCounts = AGE_GROUPS.map(() => 0);

  converts.forEach(convert => {
    let age: number | null = null;

    if (convert.convert_type === "member" && convert.member_id) {
      age = memberMap.get(convert.member_id)?.age ?? null;
    }

    if (convert.convert_type === "visitor" && convert.visitor_id) {
      age = visitorMap.get(convert.visitor_id)?.age ?? null;
    }

    if (age === null) return;

    const index = AGE_GROUPS.findIndex(
      g => age! >= g.min && age! <= g.max
    );

    if (index !== -1) {
      convert.convert_type === "member"
        ? memberCounts[index]++
        : visitorCounts[index]++;
    }
  });

  const totals = AGE_GROUPS.map(
    (_, i) => memberCounts[i] + visitorCounts[i]
  );

  return {
    labels: AGE_GROUPS.map(g => g.label),
    memberCounts,
    visitorCounts,
    totals,
  };
}, [converts, members, visitors]);

useEffect(() => {
  ageChartRef.current?.destroy();

  const ctx = document.getElementById("ageDistributionChart") as HTMLCanvasElement;
  if (!ctx) return;

  ageChartRef.current = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ageDistribution.labels,
      datasets: [
        {
          label: "Visitors",
          data: ageDistribution.visitorCounts,
          backgroundColor: "#AF907A",
          stack: "stack1",
        },
        {
          label: "Members",
          data: ageDistribution.memberCounts,
          backgroundColor: "#5C4736",
          stack: "stack1",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: "Age Groups",
          },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: "Number of Converts",
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.dataIndex;
              const value = context.raw as number;
              const total = ageDistribution.totals[index] || 1;
              const percentage = ((value / total) * 100).toFixed(1);

              return `${context.dataset.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}, [ageDistribution]);

const convertGenderDistribution = useMemo(() => {
  const memberMap = new Map(allMembers.map(m => [m.member_id, m]));
  const visitorMap = new Map(allVisitors.map(v => [v.id, v]));

  const counts = {
    members: { Male: 0, Female: 0 },
    visitors: { Male: 0, Female: 0 },
  };

  converts.forEach(convert => {
    if (convert.convert_type === "member" && convert.member_id) {
      const member = memberMap.get(convert.member_id);
      if (member) counts.members[member.gender]++;
    }

    if (convert.convert_type === "visitor" && convert.visitor_id) {
      const visitor = visitorMap.get(convert.visitor_id);
      if (visitor) counts.visitors[visitor.gender]++;
    }
  });

  return counts;
}, [converts, allMembers, allVisitors]);


useEffect(() => {
  convertGenderChartRef.current?.destroy();

  const ctx = document.getElementById(
    "convertGenderChart"
  ) as HTMLCanvasElement;

  if (!ctx) return;

  const memberTotal =
    convertGenderDistribution.members.Male +
    convertGenderDistribution.members.Female;

  const visitorTotal =
    convertGenderDistribution.visitors.Male +
    convertGenderDistribution.visitors.Female;

  convertGenderChartRef.current = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Members", "Visitors"], // 👈 clusters
      datasets: [
        {
          label: "Male",
          data: [
            convertGenderDistribution.members.Male,
            convertGenderDistribution.visitors.Male,
          ],
          backgroundColor: "#5C4736",
        },
        {
          label: "Female",
          data: [
            convertGenderDistribution.members.Female,
            convertGenderDistribution.visitors.Female,
          ],
          backgroundColor: "#AF907A",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Convert Source",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Converts",
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              const index = context.dataIndex;

              const total =
                index === 0 ? memberTotal : visitorTotal;

              const percentage = total
                ? ((value / total) * 100).toFixed(1)
                : "0";

              return `${context.dataset.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}, [convertGenderDistribution]);


  /* =======================
     ATTENDANCE CHART EFFECT
  ======================= */
  useEffect(() => {
  fetchAttendance();
}, [selectedBranch, selectedDate]);


/*===============
Growth helper function
====================*/
const getLast12Months = (endDate: Date) => {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(endDate);
    d.setMonth(d.getMonth() - (11 - i));
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
};


  /* =======================
     GROWTH CHART
  ======================= */
  useEffect(() => {
  growthChartRef.current?.destroy();

  const ctx = document.getElementById("growthChart") as HTMLCanvasElement;
  if (!ctx) return;

  const branchMembers = filterByBranch(allMembers, selectedBranch);

  const months = getLast12Months(selectedDate);

  const labels = months.map(d =>
    d.toLocaleString("default", { month: "short", year: "numeric" })
  );

  const monthlyCounts = months.map(monthDate => {
    return branchMembers.filter(m => {
      const joined = new Date(m.date_joined);
      return (
        joined.getMonth() === monthDate.getMonth() &&
        joined.getFullYear() === monthDate.getFullYear()
      );
    }).length;
  });


  growthChartRef.current = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "New Members (Last 12 Months)",
          data: monthlyCounts,
          borderColor: "#1A3D7C",
          backgroundColor: "rgba(26,61,124,0.25)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });
}, [selectedDate, allMembers, selectedBranch]);


  /* =======================
     HANDLERS
  ======================= */
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;

  if (value === "all") {
    setSelectedBranch(null);
    applyFilters(null, selectedDate);
    return;
  }

  const id = parseInt(value);
  const branch = branches.find(b => b.branch_id === id) || null;
  setSelectedBranch(branch);

  if (branch) {
    applyFilters(branch, selectedDate);
  }
};

  /** Month Year for Date Picker **/
  const isSameMonthAndYear = (dateString: string, selectedDate: Date) => {
    const d = new Date(dateString);
    return (
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  const applyFilters = (
  branch: Branch | null,
  date: Date
) => {
  const filterByBranch = <T extends { organization_id: number }>(
    data: T[]
  ) => (branch ? data.filter(d => d.organization_id === branch.branch_id) : data);

  const filteredMembers = filterByBranch(allMembers).filter(m =>
    isSameMonthAndYear(m.date_joined, date)
  );

  const filteredVisitors = filterByBranch(allVisitors).filter(v =>
    isSameMonthAndYear(v.visit_date, date)
  );

  const filteredConverts = filterByBranch(allConverts).filter(c =>
    isSameMonthAndYear(c.convert_date, date)
  );

  setMembers(filteredMembers);
  setVisitors(filteredVisitors);
  setConverts(filteredConverts);
};

useEffect(() => {
  applyFilters(selectedBranch, selectedDate);
}, [selectedDate, selectedBranch]);

/* =======================
     KPI CALCULATIONS
  ======================= */
  useEffect(() => {
  // ✅ MEMBERS → rolling
  const membersUpToDate = filterByBranch(allMembers, selectedBranch).filter(
    m => isUpToSelectedDate(m.date_joined, selectedDate) && m.status === "Active"
  );

  // ✅ VISITORS → selected month ONLY
  const visitorsThisMonth = filterByBranch(allVisitors, selectedBranch).filter(
    v => isSameMonthAndYear(v.visit_date, selectedDate)
  );

  // ✅ CONVERTS → selected month ONLY
  const convertsThisMonth = filterByBranch(allConverts, selectedBranch).filter(
    c => isSameMonthAndYear(c.convert_date, selectedDate)
  );

  setKpi({
    totalMembers: membersUpToDate.length,
    totalVisitors: visitorsThisMonth.length,
    totalConverts: convertsThisMonth.length,
    totalBranches: branches.length,
    monthlyGiving: 18364.05,
  });
}, [allMembers, allVisitors, allConverts, branches, selectedDate, selectedBranch]);

/*===================
DYNAMIC H1
====================*/
const reportTitle = selectedBranch
  ? `${selectedBranch.name} Report`
  : `${hqName} Report`;

/*=====================
TOUR GUIDE 
======================*/
const { setIsOpen, setCurrentStep } = useTour();

/* ============================
     AUTO START TOUR (ONCE)
     Temporarily Removed
  ============================ */
{/*useEffect(() => {
  const hasSeenTour = localStorage.getItem("generalReportTourSeen");

  if (!hasSeenTour) {
    setIsOpen(true);
    localStorage.setItem("generalReportTourSeen", "true");
  }
}, [setIsOpen]);*/}

//Pulsate the Tour Button
  const [isPulsating, setIsPulsating] = useState(false);
  const [timePassed, setTimePassed] = useState(0);  // Track time passed
  const [pulseIntervalStarted, setPulseIntervalStarted] = useState(false);  // To prevent multiple intervals from being set
  
  useEffect(() => {
    // Start pulsating immediately when the component mounts
    setIsPulsating(true);
  
    const timer = setInterval(() => {
      setTimePassed((prev) => prev + 1);  // Increment time passed every minute
    }, 60000);  // Track every minute
  
    // If the time passed reaches 2 minutes, stop pulsating for 2 minutes
    if (timePassed === 2 && !pulseIntervalStarted) {
      setIsPulsating(false);  // Stop pulsating
      setTimeout(() => {
        setPulseIntervalStarted(true);
        setIsPulsating(true);  // Resume pulsating
      }, 120000);  // Wait for 2 minutes before resuming
    }
  
    // Once time passed reaches 4 minutes, set the pulsating interval
    if (timePassed >= 4 && pulseIntervalStarted) {
      const pulseInterval = setInterval(() => {
        setIsPulsating(true);
        setTimeout(() => setIsPulsating(false), 1000);  // Pulsate for 1 second
      }, 120000);  // Pulsates every 2 minutes after the initial 2-minute pause
  
      // Clean up the interval after 5 minutes (total 7 minutes)
      setTimeout(() => {
        clearInterval(pulseInterval);
        setIsPulsating(false);  // Stop pulsating after 5 minutes
      }, 300000);  // After 5 minutes (5 * 60 seconds)
  
      return () => clearInterval(pulseInterval);  // Clean up on unmount
    }
  
    return () => clearInterval(timer);  // Clean up the timer
  }, [timePassed, pulseIntervalStarted]);

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="dashboard-wrapper">

      {/* SIDEBAR */}
      <button
        className="hamburger"
        id="tour-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        >&#9776;
      </button>
      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar content */}
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>
        
        <h2>HQ MANAGER</h2>
        {/* Sidebar links */}

          {hasPermission("View Branch Directory") && (
          <a
            href="/HQ/branchDirectory"
            className={location.pathname === "/HQ/branchDirectory" ? "active" : ""}
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
            className={location.pathname === "/HQ/GeneralReport" ? "active" : ""}
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

      <div className="dashboard-content">
        <div className="do-not-print">
          <HeaderNav />
        </div>
        <div className="do-not-print print-button-container">
        <button
          className={`add-btn ${isPulsating ? 'pulsating' : ''}`}
          style={{background: "#ffffff", color: "#000000", marginLeft: "10px"}}
          onClick={() => {
            setCurrentStep(0);
            setIsOpen(true);
          }}
        >
          🎥 Take a Tour
        </button>&emsp;

        <button
          className="print-button"
          onClick={() => window.print()}
        >
          🖨️ Print Report
        </button>
        
      </div>

        <br />
        <h1>{reportTitle}</h1>

        <p className="do-not-print">Please Refresh your browser regularly to get the latest Information</p>

        <div className="kpi-container do-not-print">

          <div className="kpi-card">
            <h3>Select Branch</h3>
            <div className="branch-dropdown">
              <img src={branchImage} alt="Branch" width={35} />
              <select
                  id="tour-branch-select"
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
            <div id="tour-date-select">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                showFullMonthYearPicker
              />
            </div>

          </div>
        </div>

        <div className="kpi-container" id="tour-kpi-section">
          {/** Conditionally render the Total branches KPI depending on whether a branch is selected **/}
          {!selectedBranch && (
            <div className="kpi-card">
              <h3>Total Branches</h3>
              <p>{kpi.totalBranches}</p>
            </div>
          )}

          <div className="kpi-card"><h3>Total Members</h3><p>{kpi.totalMembers}</p></div>
          <div className="kpi-card"><h3>Total Visitors</h3><p>{kpi.totalVisitors}</p></div>
          <div className="kpi-card"><h3>Total Converts</h3><p>{kpi.totalConverts}</p></div>
          {/*<div className="kpi-card"><h3>Monthly Giving</h3><p>ZMW {kpi.monthlyGiving.toLocaleString()}</p></div>*/}
        </div>

        <div className="chart-box" id="tour-member-breakdown">
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

        <div className="chart-grid" id="tour-convert-chart">
          <div className="chart-box">
            <h3>Convert Breakdown</h3>
            <canvas id="convertChart" />
            <p style={{ textAlign: "center", marginTop: "10px" }}>
              Visitors: {convertBreakdown.visitorPercentage}% &nbsp;|&nbsp;
              Members: {convertBreakdown.memberPercentage}%
            </p>
          </div>

          <div className="chart-box">
            <div className="chart-box page-break move-down">
              <h3>Convert Age Distribution</h3>
              <canvas id="ageDistributionChart" />
            </div>

            <br/>

            <div className="chart-box">
              <h3>Convert Gender Distribution</h3>
              <canvas id="convertGenderChart" />
            </div>

          </div>

        </div>

        <br/>

        <div className="chart-grid">
          <div className="chart-box move-down-alot" id="tour-attendance-chart">
            <h3>Attendance Trends (Last 4 weeks)</h3>
            <canvas id="attendanceChart" />
          </div>
          <div className="chart-box" id="tour-growth-chart">
            <h3>Church Growth (Last 12 Months)</h3>
            <canvas id="growthChart" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default function GeneralReportWithTour() {
  return (
    <TourProvider
      steps={reportTourSteps}
      scrollSmooth={true}
      components={{
        Navigation: CustomNavigation,
        Close: CustomClose,  // ✅ Custom close button
      }}
    >
      <GeneralReport />
    </TourProvider>
  );
}