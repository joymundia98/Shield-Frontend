import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './orgProfile.css'; // Assuming your styles are located here
import ChurchLogo from "../../assets/Church Logo.jpg"; // Assuming your logo path remains the same
import api from '../../api/api'; // import your Axios instance
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { orgFetch } from "../../utils/api"; // API fetch function
//import axios from 'axios'; // Add this import // Ensure AxiosError is imported
import OrganizationHeader from './OrganizationHeader';
import { useAuth } from "../../hooks/useAuth";  // Use the auth hook to access user permissions


// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

// Define the types for church data structure
interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
}

interface Leadership {
  role: string;
  name: string;
  yearStart: number | string;
  yearEnd: number | string;
}

interface Ministry {
  name: string;
  description: string;
}

interface ChurchData {
  name: string;
  establishmentYear: number;
  denomination: string;
  email: string;
  phone: string;
  address: string;
  profilePic: string;
  socialLinks: SocialLinks;
  leadership: Leadership[];
  ministries: Ministry[];
  coreValues: string[];
  worshipTimes: {
    sunday: string;
    midweek: string;
    [key: string]: string;  // For dynamic worship times
  };
  sacraments: string[];
  specialServices: string[];
  about: string;
  vision: string;
  mission: string;
  district: string;
  province: string;
  organization_id: string;
}

const denominationMapping = {
  "Catholicism-Roman Catholic": 1,
  "Catholicism-Eastern Catholic": 2,
  "Orthodoxy-Eastern Orthodox": 3,
  "Orthodoxy-Oriental Orthodox": 4,
  "Protestantism-Anglican": 5,
  "Protestantism-Lutheran": 6,
  "Protestantism-Presbyterian": 7,
  "Protestantism-Methodist": 8,
  "Protestantism-Baptist": 9,
  "Protestantism-Reformed": 10,
  "Protestantism-Pentecostal": 11,
  "Protestantism-Non-denominational": 12,
  "Protestantism-Charismatic": 13,
  "Protestantism-Not Listed": 14,
  "Evangelical-Pentecostal": 15,
  "Evangelical-Non-denominational": 16,
  "Evangelical-Charismatic": 17,
  "Evangelical-Not Listed": 18,
  "Adventist-Seventh-day Adventist": 19,
  "Adventist-Mormon": 20,
  "Adventist-Jehovah's Witnesses": 21,
  "Adventist-Not Listed": 22,
  "Anabaptist-Mennonite": 23,
  "Anabaptist-Amish": 24,
  "Anabaptist-Hutterites": 25,
  "Anabaptist-Not Listed": 26,
  "Other-Quakers": 27,
  "Other-Salvation Army": 28,
  "Other-Christian Science": 29,
  "Other-Unitarian": 30,
  "Other-Not Listed": 31
};


const EdittableChurchProfilePage: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = useAuth(); // Access the hasPermission function
  const orgData = location.state?.org;
  const auth = useContext(AuthContext);
  const organizationId = auth?.user?.org_id || JSON.parse(localStorage.getItem('user') || '{}')?.org_id;
  console.log("Organization ID:", organizationId); // Logs the organization_id passed from the login page
  console.log("Organization Data:", orgData);

  const [churchData, setChurchData] = useState<ChurchData>({
    name: 'Eternal Hope Ministries',
    establishmentYear: 2010,
    denomination: 'Pentecostal / Evangelical',
    email: 'contact@eternalhope.org.zm',
    phone: '+260961234567',
    address: '88 Sunrise Avenue, Kabwata, Lusaka, Zambia',
    profilePic: 'shieldLogo.png',
    socialLinks: {
      facebook: 'https://facebook.com/eternalhope',
      instagram: 'https://instagram.com/eternalhope',
      twitter: 'https://twitter.com/eternalhope',
    },
    leadership: [
      { role: 'Senior Pastor', name: 'Pastor Benjamin Mwale', yearStart: 2010, yearEnd: 'Present' },
      { role: 'Associate Pastor - Youth & Women', name: 'Pastor Lillian Chola', yearStart: 2015, yearEnd: 'Present' },
      { role: 'Associate Pastor - Outreach', name: 'Pastor Peter Zulu', yearStart: 2018, yearEnd: 'Present' },
    ],
    ministries: [
      { name: 'Children\'s Ministry', description: 'A ministry focused on nurturing children in their faith.' },
      { name: 'Youth Ministry', description: 'Empowering youth through spiritual teachings and activities.' },
      { name: 'Adult Ministries', description: 'Guiding adults in their spiritual journeys through various programs.' },
      { name: 'Community Outreach', description: 'Serving the community through charitable acts and outreach programs.' }
    ],
    coreValues: [
      'Faith & Worship', 
      'Community Service', 
      'Youth Empowerment', 
      'Leadership Development', 
      'Outreach & Evangelism'
    ],
    worshipTimes: {
      sunday: '8:00 AM (Traditional), 10:30 AM (Contemporary), 5:00 PM (Evening Praise)',
      midweek: 'Wednesday Bible Study & Prayer, 7:00 PM; Friday Youth Fellowship, 6:30 PM',
    },
    sacraments: ['Baptism (immersion)', 'Communion (monthly)', 'Child Dedication'],
    specialServices: ['Easter Sunrise', 'Christmas Eve', 'Annual Revival Week'],
    about: 'Eternal Hope Ministries is dedicated to bringing hope, transforming lives, and empowering communities through the love of Jesus Christ.',
    vision: 'To expand ministries, empower youth and women, and create a positive impact in Lusaka.',
    mission: 'To serve with love, share the Gospel, and transform communities through practical support and spiritual growth.',
    district: 'Lusaka',
    province: 'Lusaka',
    organization_id: organizationId || '',  // Ensure it's set with the organizationId or a default value
  });

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar visibility

  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const checkChurchExists = async (organizationId: string | undefined) => {
  if (!organizationId) {
    console.warn("Organization ID is required");
    return null;
  }

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found. Please log in.");
      navigate('/'); // Redirect to login if no token is found
      return null;
    }

    const response = await orgFetch(`${baseURL}/api/profiles/churches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Churches API response:', response);

    // Check if response.data is an array and contains at least one church entry
    if (!Array.isArray(response.data) || response.data.length === 0) {
      console.warn('No church data found in response.');
      return null;
    }

    // Extract the first church entry
    const churchData = response.data[0];

    console.log('Church Data:', churchData);

    // Check if the church's organization_id matches the provided one
    const orgIdFromResponse = String(churchData.organization_id).trim();
    const orgIdFromParam = String(organizationId).trim();

    if (orgIdFromResponse === orgIdFromParam) {
      console.log('Church entry matches the organization ID');
      return churchData;
    } else {
      console.log('Organization IDs do not match');
      return null;
    }
  } catch (error) {
    console.error("Error checking if church exists:", error);
    return null;
  }
};


const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchChurchData = async () => {
    setIsLoading(true);  // Start loading

    const orgId = organizationId; // Retrieve the organization ID from context or localStorage
    if (!orgId) {
      console.warn("Organization ID missing, cannot fetch data.");
      setIsLoading(false);  // Stop loading when organization ID is missing
      return;
    }

    // FIRST: Check if there is an entry in the churches table for this organization
    console.log("Checking for church entry in churches table...");
    const existingChurch = await checkChurchExists(orgId);

    if (existingChurch) {
      // Church entry exists - proceed to display info from the churches table
      console.log("Church entry found! Loading data from churches table...");
      
      // Update state with church data from the database
      setChurchData((prev) => ({
        ...prev,
        name: existingChurch.name || prev.name,
        establishmentYear: existingChurch.establishment_year || prev.establishmentYear,
        denomination: existingChurch.denomination_id || prev.denomination,
        email: existingChurch.email || prev.email,
        phone: existingChurch.phone || prev.phone,
        address: existingChurch.address || prev.address,
        profilePic: existingChurch.profile_pic || prev.profilePic,
        vision: existingChurch.vision || prev.vision,
        mission: existingChurch.mission || prev.mission,
        organization_id: existingChurch.organization_id || prev.organization_id,
      }));

      // Fetch related data (leadership, ministries, etc.) using church_id
      const churchId = existingChurch.church_id;
      console.log("Fetching related data for church_id:", churchId);

      const fetchRelatedData = async (churchId: string) => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.warn("No auth token found. Please log in.");
          navigate('/'); // Redirect to login if no token is found
          return;
        }

        // Fetch Leadership data
        const leadershipResponse = await orgFetch(`${baseURL}/api/profiles/leadership?church_id=${churchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const leadershipData = leadershipResponse.data || [];
        console.log('leadershipData',leadershipData);

        // Fetch Ministries data
        const ministriesResponse = await orgFetch(`${baseURL}/api/profiles/ministries?church_id=${churchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const ministriesData = ministriesResponse.data || [];
        console.log('ministriesData',ministriesData);

        // Fetch Core Values data
        const coreValuesResponse = await orgFetch(`${baseURL}/api/profiles/core_values?church_id=${churchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const coreValuesData = coreValuesResponse.data || [];
        console.log('coreValuesData',coreValuesData);

        // Fetch Worship Times data
        const worshipTimesResponse = await orgFetch(`${baseURL}/api/profiles/worship?church_id=${churchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const worshipTimesData = worshipTimesResponse.data || [];
        console.log('worshipTimesData',worshipTimesData);

        // Fetch Sacraments data
        const sacramentsResponse = await orgFetch(`${baseURL}/api/profiles/sacraments?church_id=${churchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sacramentsData = sacramentsResponse || [];
        console.log('sacramentsData',sacramentsData);

        // Fetch Special Services data
        const specialServicesResponse = await orgFetch(`${baseURL}/api/profiles/special_services?church_id=${churchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const specialServicesData = specialServicesResponse.data || [];
        console.log('specialServicesData',specialServicesData);

        // Update churchData state with the related data
        setChurchData((prev) => ({
          ...prev,
          leadership: leadershipData,
          ministries: ministriesData,
          coreValues: Array.isArray(coreValuesData)
            ? coreValuesData.map((item: any) => item.value)
            : [],

          worshipTimes: Array.isArray(worshipTimesData) && worshipTimesData.length > 0
            ? worshipTimesData.reduce((acc, item) => ({ ...acc, [item.day]: item.time }), {})
            : prev.worshipTimes,

          sacraments: Array.isArray(sacramentsData)
          ? sacramentsData.map((item: any) => item.sacrament_name)
          : [],

          specialServices: Array.isArray(specialServicesData)
            ? specialServicesData.map((item: any) => item.service_name)
            : [],
            
        }));

        console.log("Successfully loaded all related data from the profiles tables");

      } catch (error) {
        console.error("Error fetching related church data:", error);
      }
    };
       await fetchRelatedData(churchId);  // Call fetchRelatedData here to load related data

        } else {
          // No church entry exists in the churches table - fallback to organization data
          console.log("No church entry found in churches table. Falling back to organization data...");

          try {
            const orgResponse = await api.get(`${baseURL}/api/organizations/${orgId}`);
            const org = orgResponse.data;

            if (org) {
              setChurchData((prev) => ({
                ...prev,
                name: org.name || prev.name,
                email: org.organization_email || prev.email,
                phone: org.phone || prev.phone,
                address: org.address || prev.address,
                denomination: org.denomination || prev.denomination,
                establishmentYear: org.establishment_year || prev.establishmentYear,
                district: org.district || prev.district,
                province: org.region || prev.province,
              }));
              console.log("Loaded organization data as fallback");
            } else {
              console.warn('No organization data returned');
            }
          } catch (error) {
            console.error("Error fetching organization data:", error);
          }
        }

        setIsLoading(false); // Stop loading when data is fetched
      };

      fetchChurchData();
    }, [organizationId]); // Trigger on organizationId change


  // Handle input change
  const handleChange = (key: string, value: string) => {
    setChurchData(prevState => ({
      ...prevState,
      [key]: value
    }));
  };

  // Add or remove ministries or core values
  const handleAddItem = (key: string) => {
    if (key === 'ministries') {
      setChurchData(prevState => ({
        ...prevState,
        ministries: [...prevState.ministries, { name: 'New Ministry', description: 'New description' }]
      }));
    } else if (key === 'coreValues') {
      setChurchData(prevState => ({
        ...prevState,
        coreValues: [...prevState.coreValues, 'New Core Value']
      }));
    }
  };

  const handleRemoveItem = (key: string, index: number) => {
    if (key === 'ministries') {
      const updatedMinistries = churchData.ministries.filter((_, idx) => idx !== index);
      setChurchData({ ...churchData, ministries: updatedMinistries });
    } else if (key === 'coreValues') {
      const updatedCoreValues = churchData.coreValues.filter((_, idx) => idx !== index);
      setChurchData({ ...churchData, coreValues: updatedCoreValues });
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  // Save Profile Function
  const saveProfile = async () => {
  try {
    // Map the denomination name to the corresponding denomination_id
    const denominationId = denominationMapping[churchData.denomination as keyof typeof denominationMapping];

    // Check if the church already exists (for update scenario)
    const existingChurch = await checkChurchExists(organizationId);

    let churchResponse: any;
    
    if (existingChurch) {
      // Update the church information
      const churchResponse = await api.put(`${baseURL}/api/profiles/churches/${existingChurch.church_id}`, {
        name: churchData.name,
        establishment_year: churchData.establishmentYear,
        denomination_id: denominationId,  // Pass the denomination_id here instead of denomination
        email: churchData.email,
        phone: churchData.phone,
        address: churchData.address,
        profile_pic: churchData.profilePic,
        vision: churchData.vision,
        mission: churchData.mission,
        organization_id: organizationId,  // Use the organization ID here
      });

      console.log("Successfully updated church data:", churchResponse.data);
    } else {
      // No existing church, create a new one
      const churchResponse = await api.post(`${baseURL}/api/profiles/churches`, {
        name: churchData.name,
        establishment_year: churchData.establishmentYear,
        denomination_id: denominationId,  // Pass the denomination_id here instead of denomination
        email: churchData.email,
        phone: churchData.phone,
        address: churchData.address,
        profile_pic: churchData.profilePic,
        vision: churchData.vision,
        mission: churchData.mission,
        organization_id: organizationId,  // Use the organization ID here
      });

      console.log("Successfully created new church data:", churchResponse.data);
    }

    // Continue saving other related data, such as leadership, ministries, etc.
    const churchId = existingChurch ? existingChurch.church_id : churchResponse.data.church_id;

    // Save leadership members to `leadership` table
    const leadershipPromises = churchData.leadership.map((member) => {
      return api.post(`${baseURL}/api/profiles/leadership`, {
        church_id: churchId,
        role: member.role,
        name: member.name,
        year_start: member.yearStart,
        year_end: member.yearEnd === 'Present' ? null : member.yearEnd, // Use NULL if 'Present'
      });
    });

    await Promise.all(leadershipPromises);

    // Save ministries to `ministries` table
    const ministriesPromises = churchData.ministries.map((ministry) => {
      return api.post(`${baseURL}/api/profiles/ministries`, {
        church_id: churchId,
        name: ministry.name,
        description: ministry.description,
      });
    });

    await Promise.all(ministriesPromises);

    // Save core values to `core_values` table
    const coreValuesPromises = churchData.coreValues.map((value) => {
      return api.post(`${baseURL}/api/profiles/core_values`, {
        church_id: churchId,
        value,
      });
    });

    await Promise.all(coreValuesPromises);

    // Save worship times to `worship_times` table
    const worshipTimesPromises = Object.keys(churchData.worshipTimes).map((day) => {
      return api.post(`${baseURL}/api/profiles/worship`, {
        church_id: churchId,
        day,
        time: churchData.worshipTimes[day],
      });
    });

    await Promise.all(worshipTimesPromises);

    // If everything is saved successfully, show the success message and navigate
    setShowSuccessCard(true);
    setTimeout(() => {
      setShowSuccessCard(false);
      navigate('/Organization/orgLobby'); // Redirect to the lobby
    }, 2000);

  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

// Render loading state or the rest of the UI
if (isLoading) {
  return <div>Loading...</div>;  // You can replace this with a loading spinner or animation
}

  return (
    <div className="orgProfileContainer">

      <OrganizationHeader/><br/> 

      {/* Success Card */}
      {showSuccessCard && (
        <div className="success-card">
          <h3>✅ Profile Created Successfully!</h3>
          <p>Redirecting to Lobby...</p>
        </div>
      )}


      {/* Header */}
      <header>
        <div className="banner"></div>
        <div className="profile-wrapper">
          <img src={ChurchLogo} alt="Profile" className="profile-pic" />
        </div>
      </header>

      {/* Sidebar */}
      <button className="hamburger" onClick={toggleSidebar}>&#9776;</button>

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="close-wrapper">
          <div className="toggle close-btn">
            <input type="checkbox" checked={sidebarOpen} onChange={toggleSidebar} />
            <span className="button"></span>
            <span className="label">X</span>
          </div>
        </div>

        <h2>ORG MANAGER</h2>
        {/*{hasPermission("Manage Organization Profile") && <a href="/Organization/edittableProfile" className="active">Profile</a>}*/}
        {hasPermission("Access Organization Lobby") && <a href="/Organization/orgLobby">The Lobby</a>}
        {hasPermission("Manage Organization Admins") && <a href="/Organization/orgAdminAccounts">Admin Accounts</a>}
        {hasPermission("Manage Organization Accounts") && <a href="/Organization/ListedAccounts">Manage Accounts</a>}
        {hasPermission("Manage Roles") && <a href="/Organization/roles">Roles</a>}
        {hasPermission("Manage Permissions") && <a href="/Organization/permissions">Permissions</a>}
        <hr className="sidebar-separator" />
        {hasPermission("View Main Dashboard") && (
          <a
            href="/dashboard"
            className="return-main"
            onClick={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            ← Back to Main Dashboard
          </a>)}
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

      {/* Edit Button */}
      <div className="edit-btn-container">
        &emsp;
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            ✏️ &nbsp; Edit Profile
          </button>
        ) : null}
      </div>

      {/* Profile Info */}
      <section className="profile-info">

        <h1>
          {isEditing ? (
            <input
              type="text"
              value={churchData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter Church Name"
            />
          ) : (
            <>
              {churchData.name} <span className="verified-icon"><FaCheckCircle /></span>
            </>
          )}
        </h1>

        <p>
          {isEditing ? (
            <input
              type="text"
              value={churchData.denomination}
              onChange={(e) => handleChange('denomination', e.target.value)}
              placeholder="Enter Denomination"
            />
          ) : (
            `${churchData.denomination} Church in ${churchData.district}, ${churchData.province}`
          )}
        </p>

        <p>
          <i>
            {isEditing ? (
              <input
                type="number"
                value={churchData.establishmentYear}
                onChange={(e) => handleChange('establishmentYear', e.target.value)}
                placeholder="Enter Establishment Year"
              />
            ) : (
              `Established: ${churchData.establishmentYear}`
            )}
          </i>
        </p>

        {/* Contact Information */}
        <div className="action-buttons">
          <a href={`mailto:${churchData.email}`} className="email-btn">
            <i><FaEnvelope style={{ marginRight: '0.5rem' }} /></i>
            <span className='email-profile'>Email Us</span>
          </a>
          <a href={`tel:${churchData.phone}`} className="action-button bg-gray">
            <FaPhone style={{ marginRight: '0.5rem' }} />
            Call Us
          </a>
        </div>
      </section>

      {/* Main Content */}
      <main>
        {/* Left Column */}
        <div className="left-column">
          <div className="content-card">
            <h2>About Us</h2>
            {isEditing ? (
              <textarea
                value={churchData.about}
                onChange={(e) => handleChange('about', e.target.value)}
                placeholder="Enter a description about the church"
              />
            ) : (
              <p>{churchData.about}</p>
            )}

            <h3>Vision</h3>
            {isEditing ? (
              <textarea
                value={churchData.vision}
                onChange={(e) => handleChange('vision', e.target.value)}
                placeholder="Enter Church Vision"
              />
            ) : (
              <p>{churchData.vision}</p>
            )}

            <h3>Mission</h3>
            {isEditing ? (
              <textarea
                value={churchData.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                placeholder="Enter Church Mission"
              />
            ) : (
              <p>{churchData.mission}</p>
            )}
          </div>

          <div className="content-card">
            <h2>Leadership</h2>
            <div className="timeline">
              {churchData.leadership.map((member, index) => (
                <div key={index} className="timeline-item">
                  <h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => {
                          const updatedLeadership = [...churchData.leadership];
                          updatedLeadership[index].role = e.target.value;
                          setChurchData({ ...churchData, leadership: updatedLeadership });
                        }}
                        placeholder="Enter Role"
                      />
                    ) : (
                      member.role
                    )}
                  </h3>

                  <p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => {
                          const updatedLeadership = [...churchData.leadership];
                          updatedLeadership[index].name = e.target.value;
                          setChurchData({ ...churchData, leadership: updatedLeadership });
                        }}
                        placeholder="Enter Name"
                      />
                    ) : (
                      member.name
                    )}{" "}
                    | &nbsp;
                    {isEditing ? (
                      <input
                        type="number"
                        value={member.yearStart}
                        onChange={(e) => {
                          const updatedLeadership = [...churchData.leadership];
                          updatedLeadership[index].yearStart = isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                          setChurchData({ ...churchData, leadership: updatedLeadership });
                        }}
                        placeholder="Year Start"
                      />
                    ) : (
                      member.yearStart
                    )}
                    &nbsp;-&nbsp;
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          value={member.yearEnd === "Present" ? "" : member.yearEnd}
                          onChange={(e) => {
                            const updatedLeadership = [...churchData.leadership];
                            updatedLeadership[index].yearEnd = e.target.value || "Present"; // Handle empty value as "Present"
                            setChurchData({ ...churchData, leadership: updatedLeadership });
                          }}
                          placeholder="Year End"
                        />
                        <label>
                          <input
                            type="checkbox"
                            checked={member.yearEnd === "Present"}
                            onChange={(e) => {
                              const updatedLeadership = [...churchData.leadership];
                              updatedLeadership[index].yearEnd = e.target.checked ? "Present" : ""; // Toggle between "Present" and empty string
                              setChurchData({ ...churchData, leadership: updatedLeadership });
                            }}
                          />
                          Present
                        </label>
                      </>
                    ) : (
                      member.yearEnd
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ministries Section */}
          <div className="content-card">
            <h2>Ministries & Programs</h2>
            <div className="space-y-5">
              {churchData.ministries.map((ministry, index) => (
                <div key={index}>
                  <h3>{isEditing ? (
                    <input
                      type="text"
                      value={ministry.name}
                      onChange={(e) => {
                        const updatedMinistries = [...churchData.ministries];
                        updatedMinistries[index].name = e.target.value;
                        setChurchData({ ...churchData, ministries: updatedMinistries });
                      }}
                      placeholder="Enter Ministry Name"
                    />
                  ) : (
                    ministry.name
                  )}</h3>

                  <p>{isEditing ? (
                    <textarea
                      value={ministry.description}
                      onChange={(e) => {
                        const updatedMinistries = [...churchData.ministries];
                        updatedMinistries[index].description = e.target.value;
                        setChurchData({ ...churchData, ministries: updatedMinistries });
                      }}
                      placeholder="Enter Ministry Description"
                    />
                  ) : (
                    ministry.description
                  )}</p>
                  {isEditing && <button onClick={() => handleRemoveItem('ministries', index)}>Remove</button>}
                </div>
              ))}
              {isEditing && <button onClick={() => handleAddItem('ministries')}>Add Ministry</button>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="content-card">
            <h2>Contact Information</h2>
            <div className="contact-item">
              <i><FaEnvelope /></i>
              {isEditing ? (
                <input
                  type="email"
                  value={churchData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter Email"
                />
              ) : (
                <span>{churchData.email}</span>
              )}
            </div>
            <div className="contact-item">
              <i><FaPhone /></i>
              {isEditing ? (
                <input
                  type="tel"
                  value={churchData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter Phone Number"
                />
              ) : (
                <span>{churchData.phone}</span>
              )}
            </div>
            <div className="contact-item">
              <i><FaMapMarkerAlt /></i>
              {isEditing ? (
                <input
                  type="text"
                  value={churchData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter Address"
                />
              ) : (
                <span>{churchData.address}</span>
              )}
            </div>
          </div>

          <div className="content-card">
            <h2>Core Values</h2>
            <div className="check-list">
              {churchData.coreValues.map((value, index) => (
                <div key={index} className="check-list-item">
                  <i><FaCheckCircle /></i>
                  {isEditing ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const updatedCoreValues = [...churchData.coreValues];
                        updatedCoreValues[index] = e.target.value;
                        setChurchData({ ...churchData, coreValues: updatedCoreValues });
                      }}
                      placeholder="Enter Core Value"
                    />
                  ) : (
                    value
                  )}
                  {isEditing && <button onClick={() => handleRemoveItem('coreValues', index)}>Remove</button>}
                </div>
              ))}
              {isEditing && <button onClick={() => handleAddItem('coreValues')}>Add Core Value</button>}
            </div>
          </div>

          {/* Worship Services */}
          <div className="content-card">
            <h2>Worship Services</h2>

            <h3>Sunday Worship Times</h3>
            {isEditing ? (
              <textarea
                value={churchData.worshipTimes.sunday}
                onChange={(e) => setChurchData(prev => ({
                  ...prev,
                  worshipTimes: { ...prev.worshipTimes, sunday: e.target.value }
                }))}
                placeholder="Enter Sunday Worship Times"
              />
            ) : (
              <p>{churchData.worshipTimes.sunday}</p>
            )}

            <h3>Midweek Worship Times</h3>
            {isEditing ? (
              <textarea
                value={churchData.worshipTimes.midweek}
                onChange={(e) => setChurchData(prev => ({
                  ...prev,
                  worshipTimes: { ...prev.worshipTimes, midweek: e.target.value }
                }))}
                placeholder="Enter Midweek Worship Times"
              />
            ) : (
              <p>{churchData.worshipTimes.midweek}</p>
            )}

            <h3>Sacraments</h3>
            {isEditing ? (
              <textarea
                value={churchData.sacraments.join(', ')}
                onChange={(e) =>
                  setChurchData(prev => ({ ...prev, sacraments: e.target.value.split(',').map(s => s.trim()) }))
                }
                placeholder="Enter Sacraments separated by commas"
              />
            ) : (
              <ul>
                {churchData.sacraments.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            )}

            <h3>Special Services</h3>
            {isEditing ? (
              <textarea
                value={churchData.specialServices.join(', ')}
                onChange={(e) =>
                  setChurchData(prev => ({ ...prev, specialServices: e.target.value.split(',').map(s => s.trim()) }))
                }
                placeholder="Enter Special Services separated by commas"
              />
            ) : (
              <ul>
                {churchData.specialServices.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="save-btn-container">
            <button onClick={saveProfile} className="add-btn">
              Save Changes
            </button>
          </div>
        )}
      </main>

      <footer>&copy; 2025 {churchData.name}. All Rights Reserved.</footer>
    </div>
  );
};

export default EdittableChurchProfilePage;
