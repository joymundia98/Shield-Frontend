import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LandingPage } from "./pages/LandingPage";

//Remodelled Landing Page
import  Landing  from "./pages/Landing/Landing";
import  AboutPage  from "./pages/Landing/About";
import  Pricing  from "./pages/Landing/pricing";
import  ContactUs  from "./pages/Landing/contact";

import { OrgLoginPage } from "./pages/orgLoginPage";
import { OrgRegisterPage } from "./pages/orgRegisterPage";
import { AdminAccountPage } from "./pages/AdminAccountPage";

import NotFoundPage from "./pages/NotFoundPage"; // Import the 404 page

import ForbiddenPage from "./pages/ForbiddenPage";  // Import the custom 403 page

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
import EditMemberPage from "./pages/congregation/editMember";
import ConvertsDashboard from "./pages/congregation/converts";
import ConvertsPage from "./pages/congregation/convertRecords";
import AddConvert from "./pages/congregation/addConvert";
import VisitorsDashboard from "./pages/congregation/visitors";
import AddVisitorPage from "./pages/congregation/addVisitors";
import VisitorRecordsPage from "./pages/congregation/visitorRecords";
import ViewVisitorPage from "./pages/congregation/viewVisitor";
import EditVisitorPage from "./pages/congregation/editVisitor";
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
import ViewUserPage from "./pages/Organization/viewUser";
import RolesPage from "./pages/Organization/roles";
import PermissionsPage from "./pages/Organization/permissions";
import HQDashboardPage from "./pages/Organization/HQDashboard";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ------------------------------
                  PUBLIC PAGES
          --------------------------------*/}
          <Route path="/Oldhome" element={<LandingPage />} />

          {/*Remodelled Home Page */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ------------------------------
                  PRIVATE AUTH PAGES
          --------------------------------*/}
          <Route path="/admin/create-account" element={
            <ProtectedRoute requiredPermission="Create Admin Account" fallback="/403">
              <AdminAccountPage />
            </ProtectedRoute>
          } />

          {/* ------------------------------
                  ORGANIZATION PAGES
          --------------------------------*/}
          <Route path="/org-login" element={<OrgLoginPage />} />
          <Route path="/org-register" element={<OrgRegisterPage />} />
          <Route path="/org-dashboard" element={<DashboardPage />} />

          {/* ------------------------------
                  MAIN DASHBOARD
          --------------------------------*/}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredPermission="View Main Dashboard" fallback="/403">
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* ------------------------------
                  DEPARTMENT DASHBOARDS
          --------------------------------*/}
          <Route path="/pastoral/dashboard" element={
            <ProtectedRoute requiredPermission="View Pastoral Dashboard" fallback="/403">
              <PastoralDashboard />
            </ProtectedRoute>
          } />
          <Route path="/programs/dashboard" element={
            <ProtectedRoute requiredPermission="View Programs Dashboard" fallback="/403">
              <ProgramsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ministry/dashboard" element={
            <ProtectedRoute requiredPermission="View Ministry Dashboard" fallback="/403">
              <MinistryDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/dashboard" element={
            <ProtectedRoute requiredPermission="View HR Dashboard" fallback="/403">
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/governance/dashboard" element={
            <ProtectedRoute requiredPermission="View Governance Dashboard" fallback="/403">
              <GovernanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/finance/dashboard" element={
            <ProtectedRoute requiredPermission="View Finance Dashboard" fallback="/403">
              <FinanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/donor/dashboard" element={
            <ProtectedRoute requiredPermission="View Donor Dashboard" fallback="/403">
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/congregation/dashboard" element={
            <ProtectedRoute requiredPermission="View Congregation Dashboard" fallback="/403">
              <CongregationDashboard />
            </ProtectedRoute>
          } />
          <Route path="/class/dashboard" element={
            <ProtectedRoute requiredPermission="View Class Dashboard" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />
          <Route path="/assets/dashboard" element={
            <ProtectedRoute requiredPermission="View Asset Dashboard" fallback="/403">
              <AssetDashboard />
            </ProtectedRoute>
          } />


          {/* ------------------------------
                  ASSETS MODULE
          --------------------------------*/}
          <Route path="/assets/assets" element={
            <ProtectedRoute requiredPermission="View All Assets" fallback="/403">
              <AssetsPage />
            </ProtectedRoute>
          } />
          <Route path="/assets/addAsset" element={
            <ProtectedRoute requiredPermission="Add Asset" fallback="/403">
              <AddAssetPage />
            </ProtectedRoute>
          } />
          <Route path="/assets/viewAsset" element={
            <ProtectedRoute requiredPermission="View Detailed Info about an Asset" fallback="/403">
              <ViewAsset />
            </ProtectedRoute>
          } />
          <Route path="/assets/depreciation" element={
            <ProtectedRoute requiredPermission="View Asset Depreciation" fallback="/403">
              <DepreciationPage />
            </ProtectedRoute>
          } />
          <Route path="/assets/maintenance" element={
            <ProtectedRoute requiredPermission="Manage Asset Maintenance" fallback="/403">
              <MaintenancePage />
            </ProtectedRoute>
          } />
          <Route path="/assets/categories" element={
            <ProtectedRoute requiredPermission="View Categories" fallback="/403">
              <CategoriesPage />
            </ProtectedRoute>
          } />

          {/* ------------------------------
                  DONOR MANAGEMENT
          --------------------------------*/}
           
        <Route path="/donor/donors" element={
                <ProtectedRoute requiredPermission="View All Donors" fallback="/403">
                        <DonorsPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/addDonor" element={
                <ProtectedRoute requiredPermission="Add Donor" fallback="/403">
                        <AddDonorPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/donations" element={
                <ProtectedRoute requiredPermission="View All Donations" fallback="/403">
                        <DonationsManagementPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/addDonation" element={
                <ProtectedRoute requiredPermission="Add Donation" fallback="/403">
                        <AddDonationPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/donorCategories" element={
                <ProtectedRoute requiredPermission="View Donor Categories" fallback="/403">
                        <DonorCategoriesPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/donorView" element={
                <ProtectedRoute requiredPermission="View Detailed Info about a Donor" fallback="/403">
                        <ViewDonorPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/editDonor/:donorId" element={
                <ProtectedRoute requiredPermission="Edit Donor Info" fallback="/403">
                        <EditDonor />
                </ProtectedRoute>
        } />

        <Route path="/donor/DonationViewPage/:id" element={
                <ProtectedRoute requiredPermission="View Detailed Info about a Donation" fallback="/403">
                        <DonationViewPage />
                </ProtectedRoute>
        } />

        <Route path="/donor/EditDonationPage/:id" element={
                <ProtectedRoute requiredPermission="Edit Donation Info" fallback="/403">
                        <EditDonationPage />
                </ProtectedRoute>
        } />


          {/* ------------------------------
                  CONGREGATION MODULE
          --------------------------------*/}
          <Route path="/congregation/members" element={
            <ProtectedRoute requiredPermission="View Members Summary" fallback="/403">
              <ChurchMembersDashboard />
            </ProtectedRoute>
          } />
          <Route path="/congregation/attendance" element={
            <ProtectedRoute requiredPermission="Manage Congregation Attendance" fallback="/403">
              <AttendancePage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/recordAttendance" element={
            <ProtectedRoute requiredPermission="Record Congregation Attendance" fallback="/403">
              <RecordAttendance />
            </ProtectedRoute>
          } />
          <Route path="/congregation/followups" element={
            <ProtectedRoute requiredPermission="View Congregation Follow-ups" fallback="/403">
              <CongregationDashboard />
            </ProtectedRoute>
          } />
          <Route path="/congregation/memberRecords" element={
            <ProtectedRoute requiredPermission="View Member Records" fallback="/403">
              <MembersRecords />
            </ProtectedRoute>
          } />
          <Route path="/congregation/addMember" element={
            <ProtectedRoute requiredPermission="Add Congregation Member" fallback="/403">
              <AddMemberPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/viewMember/:id" element={
            <ProtectedRoute requiredPermission="View Detailed Info about a Member" fallback="/403">
              <ViewMemberPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/editMember/:memberId" element={
            <ProtectedRoute requiredPermission="Edit Member Info" fallback="/403">
              <EditMemberPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/viewVisitor/:id" element={
            <ProtectedRoute requiredPermission="View Detailed Info about a Visitor" fallback="/403">
              <ViewVisitorPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/editVisitor/:id" element={
            <ProtectedRoute requiredPermission="Edit Visitor Info" fallback="/403">
              <EditVisitorPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/converts" element={
            <ProtectedRoute requiredPermission="View Converts Dashboard" fallback="/403">
              <ConvertsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/congregation/convertRecords" element={
            <ProtectedRoute requiredPermission="View Convert Records" fallback="/403">
              <ConvertsPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/addConvert" element={
            <ProtectedRoute requiredPermission="Add New Convert" fallback="/403">
              <AddConvert />
            </ProtectedRoute>
          } />
          <Route path="/congregation/visitors" element={
            <ProtectedRoute requiredPermission="View Visitor Dashboard" fallback="/403">
              <VisitorsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/congregation/addVisitors" element={
            <ProtectedRoute requiredPermission="Add New Visitor" fallback="/403">
              <AddVisitorPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/visitorRecords" element={
            <ProtectedRoute requiredPermission="View Visitor Records" fallback="/403">
              <VisitorRecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/congregation/viewConvert/:id" element={
            <ProtectedRoute requiredPermission="View Convert Info" fallback="/403">
              <ViewConvert />
            </ProtectedRoute>
          } />

          {/* ------------------------------
                  FINANCE MODULE
          --------------------------------*/}
          <Route path="/finance/transactions" element={
            <ProtectedRoute requiredPermission="View Finance Transactions" fallback="/403">
              <FinanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/finance/expensetracker" element={
            <ProtectedRoute requiredPermission="Manage Expense Tracker" fallback="/403">
              <ExpenseTrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/incometracker" element={
            <ProtectedRoute requiredPermission="Manage Income Tracker" fallback="/403">
              <IncomeTrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/expenseDashboard" element={
            <ProtectedRoute requiredPermission="View Expense Dashboard" fallback="/403">
              <ExpenseDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/incomeDashboard" element={
            <ProtectedRoute requiredPermission="View Income Dashboard" fallback="/403">
              <IncomeDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/addExpense" element={
            <ProtectedRoute requiredPermission="Add Expense" fallback="/403">
              <AddExpensePage />
            </ProtectedRoute>
          } />
          <Route path="/finance/addIncome" element={
            <ProtectedRoute requiredPermission="Add Income" fallback="/403">
              <AddIncomePage />
            </ProtectedRoute>
          } />
          <Route path="/finance/payroll" element={
            <ProtectedRoute requiredPermission="Manage Payroll" fallback="/403">
              <FinancePayrollPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/financeCategory" element={
            <ProtectedRoute requiredPermission="View Finance Categories" fallback="/403">
              <FinanceCategoryPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/budgets" element={
            <ProtectedRoute requiredPermission="View Budgets Summary" fallback="/403">
              <BudgetsPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/setBudget" element={
            <ProtectedRoute requiredPermission="Set Budget" fallback="/403">
              <SetBudgetsPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/budgetBreakdown" element={
            <ProtectedRoute requiredPermission="View Budget Breakdown" fallback="/403">
              <BudgetBreakdownPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/ViewPayrollPage/:payrollId" element={
            <ProtectedRoute requiredPermission="View Detailed Payroll" fallback="/403">
              <FinanceViewPayrollPage />
            </ProtectedRoute>
          } />
          <Route path="/finance/reports" element={
            <ProtectedRoute requiredPermission="View Finance Reports" fallback="/403">
              <FinanceDashboard />
            </ProtectedRoute>
          } />


          {/* ------------------------------
                  HR MODULE
          --------------------------------*/}

          <Route path="/hr/staffDirectory" element={
            <ProtectedRoute requiredPermission="View Staff Directory" fallback="/403">
              <StaffDirectory />
            </ProtectedRoute>
          } />
          <Route path="/hr/attendance" element={
            <ProtectedRoute requiredPermission="Manage Attendance" fallback="/403">
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/payroll" element={
            <ProtectedRoute requiredPermission="Manage Payroll" fallback="/403">
              <HrPayrollPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/addPayroll" element={
            <ProtectedRoute requiredPermission="Add Payroll" fallback="/403">
              <Payroll />
            </ProtectedRoute>
          } />
          <Route path="/hr/leave" element={
            <ProtectedRoute requiredPermission="Manage Leave" fallback="/403">
              <LeaveManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/departments" element={
            <ProtectedRoute requiredPermission="View Departments" fallback="/403">
              <DepartmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/addStaff" element={
            <ProtectedRoute requiredPermission="Add Staff" fallback="/403">
              <AddStaffPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/addLeave" element={
            <ProtectedRoute requiredPermission="Add Leave" fallback="/403">
              <AddLeave />
            </ProtectedRoute>
          } />
          <Route path="/hr/leaveApplications" element={
            <ProtectedRoute requiredPermission="View Leave Applications" fallback="/403">
              <LeaveApplicationsPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/ViewPayroll/:payrollId" element={
            <ProtectedRoute requiredPermission="View Detailed Info about a Payroll Record" fallback="/403">
              <ViewPayrollPage />
            </ProtectedRoute>
          } />
          <Route path="/hr/EditPayrollPage/:payrollId" element={
            <ProtectedRoute requiredPermission="Edit Payroll Record" fallback="/403">
              <EditPayroll />
            </ProtectedRoute>
          } />
          <Route path="/hr/viewStaff/:id" element={
            <ProtectedRoute requiredPermission="View Detailed Info about a Staff Member" fallback="/403">
              <ViewStaff />
            </ProtectedRoute>
          } />
          <Route path="/hr/editStaff/:id" element={
            <ProtectedRoute requiredPermission="Edit Staff Info" fallback="/403">
              <EditStaff />
            </ProtectedRoute>
          } />

          {/* ------------------------------
                  PROGRAMS MODULE
          --------------------------------*/}

          <Route path="/programs/donors" element={
            <ProtectedRoute requiredPermission="View Donors" fallback="/403">
              <ProgramsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/programs/RegisteredPrograms" element={
            <ProtectedRoute requiredPermission="View Registered Programs" fallback="/403">
              <RegisteredProgramsPage />
            </ProtectedRoute>
          } />
          <Route path="/programs/attendeeManagement" element={
            <ProtectedRoute requiredPermission="Manage Attendees" fallback="/403">
              <AttendeeManagement />
            </ProtectedRoute>
          } />
          <Route path="/programs/addPrograms" element={
            <ProtectedRoute requiredPermission="Add Program" fallback="/403">
              <AddProgram />
            </ProtectedRoute>
          } />
          <Route path="/programs/addAttendees/:programId" element={
            <ProtectedRoute requiredPermission="Add Attendees" fallback="/403">
              <NewAttendees />
            </ProtectedRoute>
          } />
          <Route path="/programs/editAttendee/:attendeeId" element={
            <ProtectedRoute requiredPermission="Edit Attendee Info" fallback="/403">
              <EditAttendee />
            </ProtectedRoute>
          } />
          <Route path="/programs/viewProgram" element={
            <ProtectedRoute requiredPermission="View Program Details" fallback="/403">
              <ViewProgramPage />
            </ProtectedRoute>
          } />
          <Route path="/programs/editProgram/:id" element={
            <ProtectedRoute requiredPermission="Edit Program Info" fallback="/403">
              <EditProgram />
            </ProtectedRoute>
          } />


          {/* ------------------------------
                  CLASS MODULE
          --------------------------------*/}

          <Route path="/class/classes" element={
            <ProtectedRoute requiredPermission="View Classes" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />
          <Route path="/class/add-class" element={
            <ProtectedRoute requiredPermission="Add Class" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />
          <Route path="/class/teachers" element={
            <ProtectedRoute requiredPermission="View Teachers" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />
          <Route path="/class/enrollments" element={
            <ProtectedRoute requiredPermission="Manage Enrollments" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />
          <Route path="/class/attendance" element={
            <ProtectedRoute requiredPermission="Manage Attendance" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />
          <Route path="/class/reports" element={
            <ProtectedRoute requiredPermission="View Class Reports" fallback="/403">
              <ClassDashboard />
            </ProtectedRoute>
          } />


          {/* ------------------------------
                  MINISTRY MODULE
          --------------------------------*/}
          <Route path="/ministry/teams" element={
            <ProtectedRoute requiredPermission="View Ministry Teams" fallback="/403">
              <MinistryDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ministry/members" element={
            <ProtectedRoute requiredPermission="View Ministry Members" fallback="/403">
              <MinistryDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ministry/reports" element={
            <ProtectedRoute requiredPermission="View Ministry Reports" fallback="/403">
              <MinistryDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ministry/pastors" element={
            <ProtectedRoute requiredPermission="View Pastors Records" fallback="/403">
              <PastorsPage />
            </ProtectedRoute>
          } />


          {/* ------------------------------
                  PASTORAL MODULE
          --------------------------------*/}
          <Route path="/pastoral/donors" element={
            <ProtectedRoute requiredPermission="View Pastoral Donors" fallback="/403">
              <PastoralDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pastoral/add-donor" element={
            <ProtectedRoute requiredPermission="Add Pastoral Donor" fallback="/403">
              <PastoralDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pastoral/donations" element={
            <ProtectedRoute requiredPermission="View Pastoral Donations" fallback="/403">
              <PastoralDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pastoral/reports" element={
            <ProtectedRoute requiredPermission="View Pastoral Reports" fallback="/403">
              <PastoralDashboard />
            </ProtectedRoute>
          } />


          {/* ------------------------------
                  GOVERNANCE MODULE
          --------------------------------*/}
          <Route path="/governance/policies" element={
            <ProtectedRoute requiredPermission="View Policies" fallback="/403">
              <GovernanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/governance/audit-reports" element={
            <ProtectedRoute requiredPermission="View Audit Reports" fallback="/403">
              <GovernanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/governance/compliance-logs" element={
            <ProtectedRoute requiredPermission="View Compliance Logs" fallback="/403">
              <GovernanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/governance/documentation" element={
            <ProtectedRoute requiredPermission="View Documentation" fallback="/403">
              <GovernanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="/governance/certificates" element={
            <ProtectedRoute requiredPermission="View Certificates" fallback="/403">
              <GovernanceDashboard />
            </ProtectedRoute>
          } />

          {/* ------------------------------
                  ORGANIZATION MODULE
          --------------------------------*/}
          <Route path="/Organization/orgLobby" element={<OrgLobby />} />
          <Route path="/Organization/lobby" element={<Lobby />} />
          <Route path="/Organization/success" element={<OrganizationSuccessPage />} />
          <Route path="/Organization/orgProfile" element={<ChurchProfilePage />} />
          <Route path="/Organization/edittableProfile" element={<EdittableChurchProfilePage />} />
          <Route path="/Organization/ListedAccounts" element={<UserTrackerPage />} />
          <Route path="/Organization/viewUser/:id" element={<ViewUserPage />} />
          <Route path="/Organization/roles" element={<RolesPage />} />
          <Route path="/Organization/permissions" element={<PermissionsPage />} />
          <Route path="/Organization/HQDashboard" element={<HQDashboardPage />} />

          {/* ------------------------------ 403 PAGE ------------------------------ */}
          <Route path="/403" element={<ForbiddenPage />} />
          
          {/* Catch-all for undefined routes (404) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
