
//import { Link, useLocation } from "react-router-dom";
import { AdminAccount } from "../components/Auth/adminAccount"; // Assuming this is the file that contains your RegisterForm component

export const AdminAccountPage = () => {
  //const location = useLocation();

  // Since you want to remove the sidebar, no need for this state or effect anymore
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  // useEffect(() => {
  //   if (sidebarOpen) {
  //     document.body.classList.add("sidebar-open");
  //   } else {
  //     document.body.classList.remove("sidebar-open");
  //   }
  // }, [sidebarOpen]);

  // Menu links and sidebar handling can be removed as well
  // const menuLinks = [
  //   { label: "Dashboard", path: "/admin/dashboard" },
  //   { label: "Users", path: "/admin/users" },
  //   { label: "Settings", path: "/admin/settings" },
  //   { label: "Logout", path: "/logout" },
  // ];

  // const closeSidebar = () => {
  //   setSidebarOpen(false);
  // };

  return (
    <>
      {/* Remove Sidebar completely */}
      {/* No sidebar or hamburger code needed */}

      {/* Admin Account Form */}
      <div className="admin-account-container">
        <h1>Create Admin Account</h1>
        <AdminAccount /> {/* This is where the RegisterForm component goes */}
      </div>
    </>
  );
};
