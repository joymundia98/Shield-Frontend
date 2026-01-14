export const permissionsMap: { [key: string]: string[] } = {
  // PRIVATE AUTH PAGES
  '/admin/create-account': ['Create Admin Account'],

  // ORGANIZATION PAGES
  '/org-login': ['View Organization Login'],
  '/org-register': ['View Organization Registration'],
  '/org-dashboard': ['View Organization Dashboard'],

  // MAIN DASHBOARD
  '/dashboard': ['View Main Dashboard'],

  // DEPARTMENT DASHBOARDS
  '/pastoral/dashboard': ['View Pastoral Dashboard'],
  '/programs/dashboard': ['View Programs Dashboard'],
  '/ministry/dashboard': ['View Ministry Dashboard'],
  '/hr/dashboard': ['View HR Dashboard'],
  '/governance/dashboard': ['View Governance Dashboard'],
  '/finance/dashboard': ['View Finance Dashboard'],
  '/donor/dashboard': ['View Donor Dashboard'],
  '/congregation/dashboard': ['View Congregation Dashboard'],
  '/class/dashboard': ['View Class Dashboard'],
  '/assets/dashboard': ['View Asset Dashboard'],

  // ASSETS MODULE
  '/assets/assets': ['View All Assets'],
  '/assets/addAsset': ['Add Asset'],
  '/assets/viewAsset': ['View Detailed Info about an Asset'],
  '/assets/depreciation': ['View Asset Depreciation'],
  '/assets/maintenance': ['Manage Asset Maintenance'],
  '/assets/categories': ['View Categories'],

  // DONOR MANAGEMENT
  '/donor/donors': ['View All Donors'],
  '/donor/addDonor': ['Add Donor'],
  '/donor/donations': ['View All Donations'],
  '/donor/addDonation': ['Add Donation'],
  '/donor/donorCategories': ['View Donor Categories'],
  '/donor/donorView': ['View Detailed Info about a Donor'],
  '/donor/editDonor/:donorId': ['Edit Donor Info'],
  '/donor/DonationViewPage/:id': ['View Detailed Info about a Donation'],
  '/donor/EditDonationPage/:id': ['Edit Donation Info'],

  // CONGREGATION MODULE
  '/congregation/members': ['View Members Summary'],
  '/congregation/attendance': ['Manage Congregation Attendance'],
  '/congregation/recordAttendance': ['Record Congregation Attendance'],
  '/congregation/followups': ['View Congregation Follow-ups'],
  '/congregation/memberRecords': ['View Member Records'],
  '/congregation/addMember': ['Add Congregation Member'],
  '/congregation/viewMember/:id': ['View Detailed Info about a Member'],
  '/congregation/editMember/:memberId': ['Edit Member Info'],
  '/congregation/viewVisitor/:id': ['View Detailed Info about a Visitor'],
  '/congregation/editVisitor/:id': ['Edit Visitor Info'],
  '/congregation/converts': ['View Converts Dashboard'],
  '/congregation/convertRecords': ['View Convert Records'],
  '/congregation/addConvert': ['Add New Convert'],
  '/congregation/visitors': ['View Visitor Dashboard'],
  '/congregation/addVisitors': ['Add New Visitor'],
  '/congregation/visitorRecords': ['View Visitor Records'],
  '/congregation/viewConvert/:id': ['View Convert Info'],

  // FINANCE MODULE
  '/finance/transactions': ['View Finance Transactions'],
  '/finance/expensetracker': ['Manage Expense Tracker'],
  '/finance/incometracker': ['Manage Income Tracker'],
  '/finance/expenseDashboard': ['View Expense Dashboard'],
  '/finance/incomeDashboard': ['View Income Dashboard'],
  '/finance/addExpense': ['Add Expense'],
  '/finance/addIncome': ['Add Income'],
  '/finance/payroll': ['Manage Payroll'],
  '/finance/financeCategory': ['View Finance Categories'],
  '/finance/budgets': ['View Budgets Summary'],
  '/finance/setBudget': ['Set Budget'],
  '/finance/budgetBreakdown': ['View Budget Breakdown'],
  '/finance/ViewPayrollPage/:payrollId': ['View Detailed Payroll'],
  '/finance/reports': ['View Finance Reports'],

  // HR MODULE
  '/hr/staffDirectory': ['View Staff Directory'],
  '/hr/attendance': ['Manage Attendance'],
  '/hr/payroll': ['Manage Payroll'],
  '/hr/addPayroll': ['Add Payroll'],
  '/hr/leave': ['Manage Leave'],
  '/hr/departments': ['View Departments'],
  '/hr/addStaff': ['Add Staff'],
  '/hr/addLeave': ['Add Leave'],
  '/hr/leaveApplications': ['View Leave Applications'],
  '/hr/ViewPayroll/:payrollId': ['View Detailed Info about a Payroll Record'],
  '/hr/EditPayrollPage/:payrollId': ['Edit Payroll Record'],
  '/hr/viewStaff/:id': ['View Detailed Info about a Staff Member'],
  '/hr/editStaff/:id': ['Edit Staff Info'],

  // PROGRAMS MODULE
  '/programs/donors': ['View Donors'],
  '/programs/RegisteredPrograms': ['View Registered Programs'],
  '/programs/attendeeManagement': ['Manage Attendees'],
  '/programs/addPrograms': ['Add Program'],
  '/programs/addAttendees/:programId': ['Add Attendees'],
  '/programs/editAttendee/:attendeeId': ['Edit Attendee Info'],
  '/programs/viewProgram': ['View Program Details'],
  '/programs/editProgram/:id': ['Edit Program Info'],

  // CLASS MODULE
  '/class/classes': ['View Classes'],
  '/class/add-class': ['Add Class'],
  '/class/teachers': ['View Teachers'],
  '/class/enrollments': ['Manage Enrollments'],
  '/class/attendance': ['Manage Attendance'],
  '/class/reports': ['View Class Reports'],

  // MINISTRY MODULE
  '/ministry/teams': ['View Ministry Teams'],
  '/ministry/members': ['View Ministry Members'],
  '/ministry/reports': ['View Ministry Reports'],
  '/ministry/pastors': ['View Pastors Records'],

  // PASTORAL MODULE
  '/pastoral/donors': ['View Pastoral Donors'],
  '/pastoral/add-donor': ['Add Pastoral Donor'],
  '/pastoral/donations': ['View Pastoral Donations'],
  '/pastoral/reports': ['View Pastoral Reports'],

  // GOVERNANCE MODULE
  '/governance/policies': ['View Policies'],
  '/governance/audit-reports': ['View Audit Reports'],
  '/governance/compliance-logs': ['View Compliance Logs'],
  '/governance/documentation': ['View Documentation'],
  '/governance/certificates': ['View Certificates'],
};
