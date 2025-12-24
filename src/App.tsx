import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";
import { OrgLoginPage } from "./pages/orgLoginPage";
import { OrgRegisterPage } from "./pages/orgRegisterPage";
import { AdminAccountPage } from "./pages/AdminAccountPage";

import DashboardPage from "./pages/DashboardPage";

// Department Dashboards
import PastoralDashboard from "./pages/pastoral/dashboard";
import ProgramsDashboard from "./pages/programs/dashboard";
import MinistryDashboard from "./pages/ministry/dashboard";
import HRDashboard from "./pages/hr/dashboard";
import GovernanceDashboard from "./pages/governance/dashboard";
import FinanceDashboard from "./pages/finance/dashboard";
import DonorDashboard from "./pages/donor/dashboard";
import CongregationDashboard from "./pages/congregation/dashboard";

// NEW — Class Module Dashboard
import ClassDashboard from "./pages/class/dashboard";

// NEW — Asset Module Dashboard
import AssetDashboard from "./pages/assets/dashboard";

// HR Module Functional Pages
import StaffDirectory from "./pages/hr/staffDirectory";
import LeaveManagementPage from "./pages/hr/leave";
import HrPayrollPage from "./pages/hr/payroll";
import Payroll from "./pages/hr/addPayroll";
import DepartmentsPage from "./pages/hr/departments";
import AddStaffPage from "./pages/hr/addStaff";
import AddLeave from "./pages/hr/addLeave";
import LeaveApplicationsPage from "./pages/hr/leaveApplications";
import ViewPayrollPage from "./pages/hr/ViewPayroll";  // Import the View Payroll page
import EditPayroll from "./pages/hr/EditPayrollPage";
import ViewStaff from "./pages/hr/viewStaff";
import EditStaff from "./pages/hr/editStaff";

// Asset Module Functional Pages
import AssetsPage from "./pages/assets/assets";
import ViewAsset from "./pages/assets/viewAsset";
import DepreciationPage from "./pages/assets/depreciation";
import AddAssetPage from "./pages/assets/addAsset";
import MaintenancePage from "./pages/assets/maintenance";
import CategoriesPage from "./pages/assets/categories";

// Finance Module Functional Pages
import FinancePayrollPage from "./pages/finance/payroll";
import ExpenseDashboardPage from "./pages/finance/expenseDashboard";
import ExpenseTrackerPage from "./pages/finance/expensetracker";
import AddExpensePage from "./pages/finance/addExpense";
import IncomeTrackerPage from "./pages/finance/incometracker";
import AddIncomePage from "./pages/finance/addIncome";
import IncomeDashboardPage from "./pages/finance/incomeDashboard";
import FinanceCategoryPage from "./pages/finance/financeCategory";
import BudgetsPage from "./pages/finance/budgets";          
import SetBudgetsPage from "./pages/finance/setBudget"; 
import BudgetBreakdownPage from "./pages/finance/budgetBreakdown"; 
import FinanceViewPayrollPage from "./pages/finance/ViewPayrollPage";

// Donors Module Functional Pages
import DonorsPage from "./pages/donor/donors";
import AddDonorPage from "./pages/donor/addDonor";
import DonationsManagementPage from "./pages/donor/donations";
import AddDonationPage from "./pages/donor/addDonation";
import DonorCategoriesPage from "./pages/donor/donorCategories";
import ViewDonorPage from "./pages/donor/donorView";
import EditDonor from "./pages/donor/editDonor";
import DonationViewPage from './pages/donor/DonationViewPage';
import EditDonationPage from './pages/donor/EditDonationPage';

// Ministry Module Functional Pages
import PastorsPage from "./pages/ministry/pastors";

// Congregation Module Functional Pages
import AttendancePage from "./pages/congregation/attendance";
import RecordAttendance from "./pages/congregation/recordAttendance";
import ChurchMembersDashboard from "./pages/congregation/members";
import MembersRecords from "./pages/congregation/memberRecords";
import AddMemberPage from "./pages/congregation/addMember";
import ViewMemberPage from "./pages/congregation/viewMember"; // ViewMember Page will be the component for viewing individual member details
import ConvertsDashboard from "./pages/congregation/converts";
import ConvertsPage from "./pages/congregation/convertRecords";
import AddConvert from "./pages/congregation/addConvert";
import VisitorsDashboard from "./pages/congregation/visitors";
import AddVisitorPage from "./pages/congregation/addVisitors";
import VisitorRecordsPage from "./pages/congregation/visitorRecords";
import ViewConvert from "./pages/congregation/viewConvert";

// Programs Module Functional Pages
import RegisteredProgramsPage from "./pages/programs/RegisteredPrograms";
import AttendeeManagement from "./pages/programs/attendeeManagement";
import AddProgram from "./pages/programs/addPrograms";
import NewAttendees from "./pages/programs/addAttendees";
import EditAttendee from "./pages/programs/editAttendee";
import ViewProgramPage from "./pages/programs/viewProgram";
import EditProgram from "./pages/programs/editProgram";

// Organizations Module Functional Pages
import Lobby from "./pages/Organization/lobby";
import OrgLobby from "./pages/Organization/orgLobby";
import OrganizationSuccessPage from "./pages/Organization/success";
import ChurchProfilePage from "./pages/Organization/orgProfile";
import EdittableChurchProfilePage from "./pages/Organization/edittableProfile";
import UserTrackerPage from "./pages/Organization/ListedAccounts";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ------------------------------
                  PUBLIC PAGES
          --------------------------------*/}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ------------------------------
                  PRIVATE AUTH PAGES
          --------------------------------*/}
          <Route path="/admin/create-account" element={<AdminAccountPage />} />

          {/* ------------------------------
                  ORGANIZATION PAGES
          --------------------------------*/}
          <Route path="/org-login" element={<OrgLoginPage />} />
          <Route path="/org-register" element={<OrgRegisterPage />} />
          <Route path="/org-dashboard" element={<DashboardPage />} />

          {/* ------------------------------
                  MAIN DASHBOARD
          --------------------------------*/}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* ------------------------------
                  DEPARTMENT DASHBOARDS
          --------------------------------*/}
          <Route path="/pastoral/dashboard" element={<PastoralDashboard />} />
          <Route path="/programs/dashboard" element={<ProgramsDashboard />} />
          <Route path="/ministry/dashboard" element={<MinistryDashboard />} />
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/governance/dashboard" element={<GovernanceDashboard />} />
          <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/congregation/dashboard" element={<CongregationDashboard />} />
          <Route path="/class/dashboard" element={<ClassDashboard />} />
          <Route path="/assets/dashboard" element={<AssetDashboard />} />

          {/* ------------------------------
                  ASSETS MODULE
          --------------------------------*/}
          <Route path="/assets/assets" element={<AssetsPage />} />
          <Route path="/assets/addAsset" element={<AddAssetPage />} />
          <Route path="/assets/viewAsset" element={<ViewAsset />} />
          <Route path="/assets/depreciation" element={<DepreciationPage />} />
          <Route path="/assets/maintenance" element={<MaintenancePage />} />
          <Route path="/assets/categories" element={<CategoriesPage />} />

          {/* ------------------------------
                  DONOR MANAGEMENT
          --------------------------------*/}
          <Route path="/donor/donors" element={<DonorsPage />} />
          <Route path="/donor/addDonor" element={<AddDonorPage />} />
          <Route path="/donor/donations" element={<DonationsManagementPage />} />
          <Route path="/donor/addDonation" element={<AddDonationPage />} />
          <Route path="/donor/donorCategories" element={<DonorCategoriesPage />} />
          <Route path="/donor/donorView" element={<ViewDonorPage />} />
          <Route path="/donor/editDonor/:donorId" element={<EditDonor />} />
          <Route path="/donor/DonationViewPage/:id" element={<DonationViewPage />} />
          <Route path="/donor/EditDonationPage/:id" element={<EditDonationPage />} />

          {/* ------------------------------
                  CONGREGATION MODULE
          --------------------------------*/}
          <Route path="/congregation/members" element={<ChurchMembersDashboard />} />
          <Route path="/congregation/attendance" element={<AttendancePage />} />
          <Route path="/congregation/recordAttendance" element={<RecordAttendance />} />
          <Route path="/congregation/followups" element={<CongregationDashboard />} />
          <Route path="/congregation/memberRecords" element={<MembersRecords />} />
          <Route path="/congregation/addMember" element={<AddMemberPage />} />
          <Route path="/congregation/viewMember/:id" element={<ViewMemberPage />} />
          <Route path="/congregation/converts" element={<ConvertsDashboard />} />
          <Route path="/congregation/convertRecords" element={<ConvertsPage />} />
          <Route path="/congregation/addConvert" element={<AddConvert />} />
          <Route path="/congregation/visitors" element={<VisitorsDashboard />} />
          <Route path="/congregation/addVisitors" element={<AddVisitorPage />} />
          <Route path="/congregation/visitorRecords" element={<VisitorRecordsPage />} />
          <Route path="/congregation/viewConvert/:id" element={<ViewConvert />} />


          {/* ------------------------------
                  FINANCE MODULE
          --------------------------------*/}
          <Route path="/finance/transactions" element={<FinanceDashboard />} />
          <Route path="/finance/expensetracker" element={<ExpenseTrackerPage />} />
          <Route path="/finance/incometracker" element={<IncomeTrackerPage />} />
          <Route path="/finance/expenseDashboard" element={<ExpenseDashboardPage />} />
          <Route path="/finance/incomeDashboard" element={<IncomeDashboardPage />} />
          <Route path="/finance/addExpense" element={<AddExpensePage />} />
          <Route path="/finance/addIncome" element={<AddIncomePage />} />
          <Route path="/finance/payroll" element={<FinancePayrollPage />} />
          <Route path="/finance/financeCategory" element={<FinanceCategoryPage />} />
          <Route path="/finance/budgets" element={<BudgetsPage />} />
          <Route path="/finance/setBudget" element={<SetBudgetsPage />} />
          <Route path="/finance/budgetBreakdown" element={<BudgetBreakdownPage />} />
          <Route path="/finance/ViewPayrollPage/:payrollId" element={<FinanceViewPayrollPage />} />
          <Route path="/finance/reports" element={<FinanceDashboard />} />

          {/* ------------------------------
                  HR MODULE
          --------------------------------*/}
          <Route path="/hr/staffDirectory" element={<StaffDirectory />} />
          <Route path="/hr/attendance" element={<HRDashboard />} />
          <Route path="/hr/payroll" element={<HrPayrollPage />} />
          <Route path="/hr/addPayroll" element={<Payroll />} />
          <Route path="/hr/leave" element={<LeaveManagementPage />} />
          <Route path="/hr/departments" element={<DepartmentsPage />} />
          <Route path="/hr/addStaff" element={<AddStaffPage />} />
          <Route path="/hr/addLeave" element={<AddLeave />} />
          <Route path="/hr/leaveApplications" element={<LeaveApplicationsPage />} />
          <Route path="/hr/ViewPayroll/:payrollId" element={<ViewPayrollPage />} />
          <Route path="/hr/EditPayrollPage/:payrollId" element={<EditPayroll />} />
          <Route path="/hr/viewStaff/:id" element={<ViewStaff />} />
          <Route path="/hr/editStaff/:id" element={<EditStaff />} />

          {/* ------------------------------
                  PROGRAMS MODULE
          --------------------------------*/}
          <Route path="/programs/donors" element={<ProgramsDashboard />} />
          <Route path="/programs/RegisteredPrograms" element={<RegisteredProgramsPage />} />
          <Route path="/programs/attendeeManagement" element={<AttendeeManagement />} />
          <Route path="/programs/addPrograms" element={<AddProgram />} />
          <Route path="/programs/addAttendees/:programId" element={<NewAttendees />} />
          <Route path="/programs/editAttendee/:attendeeId" element={<EditAttendee />} />
          <Route path="/programs/viewProgram" element={<ViewProgramPage />} />
          <Route path="/programs/editProgram/:id" element={<EditProgram />} />

          {/* ------------------------------
                  CLASS MODULE
          --------------------------------*/}
          <Route path="/class/classes" element={<ClassDashboard />} />
          <Route path="/class/add-class" element={<ClassDashboard />} />
          <Route path="/class/teachers" element={<ClassDashboard />} />
          <Route path="/class/enrollments" element={<ClassDashboard />} />
          <Route path="/class/attendance" element={<ClassDashboard />} />
          <Route path="/class/reports" element={<ClassDashboard />} />

          {/* ------------------------------
                  MINISTRY MODULE
          --------------------------------*/}
          <Route path="/ministry/teams" element={<MinistryDashboard />} />
          <Route path="/ministry/members" element={<MinistryDashboard />} />
          <Route path="/ministry/reports" element={<MinistryDashboard />} />
          <Route path="/ministry/pastors" element={<PastorsPage />} />

          {/* ------------------------------
                  PASTORAL MODULE
          --------------------------------*/}
          <Route path="/pastoral/donors" element={<PastoralDashboard />} />
          <Route path="/pastoral/add-donor" element={<PastoralDashboard />} />
          <Route path="/pastoral/donations" element={<PastoralDashboard />} />
          <Route path="/pastoral/reports" element={<PastoralDashboard />} />

          {/* ------------------------------
                  GOVERNANCE MODULE
          --------------------------------*/}
          <Route path="/governance/policies" element={<GovernanceDashboard />} />
          <Route path="/governance/audit-reports" element={<GovernanceDashboard />} />
          <Route path="/governance/compliance-logs" element={<GovernanceDashboard />} />
          <Route path="/governance/documentation" element={<GovernanceDashboard />} />
          <Route path="/governance/certificates" element={<GovernanceDashboard />} />

          {/* ------------------------------
                  ORGANIZATION MODULE
          --------------------------------*/}
          <Route path="/Organization/orgLobby" element={<OrgLobby />} />
          <Route path="/Organization/lobby" element={<Lobby />} />
          <Route path="/Organization/success" element={<OrganizationSuccessPage />} />
          <Route path="/Organization/orgProfile" element={<ChurchProfilePage />} />
          <Route path="/Organization/edittableProfile" element={<EdittableChurchProfilePage />} />
          <Route path="/Organization/ListedAccounts" element={<UserTrackerPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
