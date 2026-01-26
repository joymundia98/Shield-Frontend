import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationHeader from './OrganizationHeader';


const AdminLoginPromptPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLoginClick = () => navigate('/login');
  const handleSupportClick = () => navigate('/contact');

  // Button style state
  const [loginBtnStyle, setLoginBtnStyle] = useState(styles.button);
  const [supportBtnStyle, setSupportBtnStyle] = useState(styles.button);

  // Sidebar toggle effect
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }, [sidebarOpen]);

  return (
    <div className="AdminLoginPromptWrapper">
      {/* SIDEBAR */}
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        &#9776;
      </button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>ORG MANAGER</h2>
        <a href="/Organization/edittableProfile">Profile</a>
        <a href="/Organization/orgLobby">The Lobby</a>
        <a href="/Organization/orgAdminAccounts">Admin Accounts</a>
        <a href="/Organization/ListedAccounts">Manage Accounts</a>
        <a href="/Organization/roles">Roles</a>
        <a href="/Organization/permissions">Permissions</a>
        <hr className="sidebar-separator" />
        <a href="/Organization/to_SCI-ELD_ERP" className="return-main">To SCI-ELD ERP</a>
        <a href="/" className="logout-link" onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}> ➜ Logout </a>
      </div>

      {/* Main Content */}
      <div style={styles.container}>

        <OrganizationHeader/><br/>

        <h1 style={styles.heading}>⚠️ Login Required!</h1>
        <div style={styles.card}>
          <div style={styles.message}>
            <p>
              To access and utilize the SCI-ELD ERP system, please log in using your administrator account.
              If you need any assistance with logging in or accessing your account, feel free to reach out,
              and we’ll be happy to help!
            </p>
          </div>
          <div style={styles.buttons}>
            <button
              style={loginBtnStyle}
              onClick={handleLoginClick}
              onMouseEnter={() => setLoginBtnStyle({ ...styles.button, ...styles.buttonHover })}
              onMouseLeave={() => setLoginBtnStyle(styles.button)}
              onFocus={() => setLoginBtnStyle({ ...styles.button, ...styles.buttonFocus })}
              onBlur={() => setLoginBtnStyle(styles.button)}
              onMouseDown={() => setLoginBtnStyle({ ...styles.button, ...styles.buttonActive })}
              onMouseUp={() => setLoginBtnStyle({ ...styles.button, ...styles.buttonHover })}
            >
              Login as Administrator
            </button>
            <button
              style={supportBtnStyle}
              onClick={handleSupportClick}
              onMouseEnter={() => setSupportBtnStyle({ ...styles.button, ...styles.buttonHover })}
                            onMouseLeave={() => setSupportBtnStyle(styles.button)}
              onFocus={() => setSupportBtnStyle({ ...styles.button, ...styles.buttonFocus })}
              onBlur={() => setSupportBtnStyle(styles.button)}
              onMouseDown={() => setSupportBtnStyle({ ...styles.button, ...styles.buttonActive })}
              onMouseUp={() => setSupportBtnStyle({ ...styles.button, ...styles.buttonHover })}
            >
              Contact SCI-ELD Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,  // Ensures 'column' is treated as a valid 'FlexDirection'
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
    textAlign: 'center' as 'center',
  },
  heading: {
    fontSize: '3rem',
    marginBottom: '30px',
    color: '#5C4736',
    paddingTop: '3rem',
  },
  card: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset',
    maxWidth: '850px',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',  // Ensuring boxSizing is a valid type
  },
  message: {
    marginBottom: '30px',
    fontSize: '18px',
    lineHeight: '1.6',
  },
  buttons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    appearance: 'none' as 'none',  // Specifying type for appearance
    backgroundColor: '#FCFCFD',
    borderRadius: '4px',
    borderWidth: 0,
    boxShadow: 'rgba(45, 35, 66, 0.4) 0 2px 4px, rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #D6D6E7 0 -3px 0 inset',
    boxSizing: 'border-box' as 'border-box',  // Ensuring boxSizing is a valid type
    color: '#36395A',
    cursor: 'pointer',
    display: 'inline-flex',
    height: '48px',
    justifyContent: 'center',
    lineHeight: 1,
    listStyle: 'none',
    overflow: 'hidden',
    paddingLeft: '16px',
    paddingRight: '16px',
    position: 'relative' as 'relative',
    textAlign: 'left' as 'left',
    textDecoration: 'none',
    transition: 'box-shadow .15s, transform .15s',
    userSelect: 'none' as 'none', // Type assertion to fix the error
    webkitUserSelect: 'none' as 'none', // Type assertion to fix the error
    touchAction: 'manipulation',
    whiteSpace: 'nowrap',
    willChange: 'box-shadow, transform',
    fontSize: '18px',
  },
  buttonFocus: {
    boxShadow: '#D6D6E7 0 0 0 1.5px inset, rgba(45, 35, 66, 0.4) 0 2px 4px, rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #D6D6E7 0 -3px 0 inset',
  },
  buttonHover: {
    boxShadow: 'rgba(45, 35, 66, 0.4) 0 4px 8px, rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #D6D6E7 0 -3px 0 inset',
    transform: 'translateY(-2px)',
  },
  buttonActive: {
    boxShadow: '#D6D6E7 0 3px 7px inset',
    transform: 'translateY(2px)',
  },
};

export default AdminLoginPromptPage;

