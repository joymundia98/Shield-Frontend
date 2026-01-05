import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './orgProfile.css'; // Assuming your styles are located here
import ChurchLogo from "../../assets/Church Logo.jpg"; // Assuming your logo path remains the same
import api from '../../api/api'; // import your Axios instance
import { useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
//import axios from 'axios'; // Add this import // Ensure AxiosError is imported

// Declare the base URL here
const baseURL = import.meta.env.VITE_BASE_URL;

{/*type ChurchData = {
  name: string;
  establishmentYear: number;
  denomination: string;
  email: string;
  phone: string;
  address: string;
  profilePic: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  leadership: Array<{
    role: string;
    name: string;
    yearStart: number | string;
    yearEnd: number | string;
  }>;
  ministries: Array<{
    name: string;
    description: string;
  }>;
  coreValues: string[];
  worshipTimes: {
    sunday: string;
    midweek: string;
  };
  sacraments: string[];
  specialServices: string[];
  about: string;
  vision: string;
  mission: string;
  district: string;
  province: string;
};*/}

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

  const checkChurchExists = async (organizationId: string | number) => {
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    try {
      const response = await api.get(`${baseURL}/api/profiles/churches?organization_id=${organizationId}`);
      console.log(response);
      if (response.data && response.data.length > 0) {
        return response.data[0]; // Assuming the response returns an array with one church
      }
      return null; // No church data found
    } catch (error) {
      console.error("Error checking if church exists:", error);
      return null;
    }
  };

  // Fetch organization data when the component is mounted or when organizationId changes
  useEffect(() => {
  const fetchChurchData = async () => {
    const orgId = organizationId; // Retrieve the organization ID from context or localStorage
    if (!orgId) {
      console.warn("Organization ID missing, cannot fetch data.");
      return;
    }

    // First, check if a church profile exists for the organization
    const existingChurch = await checkChurchExists(orgId);

    if (existingChurch) {
      // If church data exists, set the church data state and fetch related information
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
      console.log("Church id:", churchId)

      // Fetch leadership data for this church
      const leadershipResponse = await api.get(`${baseURL}/api/profiles/leadership?church_id=${churchId}`);
      const leadershipData = leadershipResponse.data;

      // Fetch ministries data for this church
      const ministriesResponse = await api.get(`${baseURL}/api/profiles/ministries?church_id=${churchId}`);
      const ministriesData = ministriesResponse.data;

      // Fetch core values data for this church
      const coreValuesResponse = await api.get(`${baseURL}/api/profiles/core_values?church_id=${churchId}`);
      const coreValuesData = coreValuesResponse.data;

      // Fetch worship times data for this church
      const worshipTimesResponse = await api.get(`${baseURL}/api/profiles/worship?church_id=${churchId}`);
      const worshipTimesData = worshipTimesResponse.data;

      // Fetch sacraments data for this church
      const sacramentsResponse = await api.get(`${baseURL}/api/profiles/sacraments?church_id=${churchId}`);
      const sacramentsData = sacramentsResponse.data;

      // Fetch special services data for this church
      const specialServicesResponse = await api.get(`${baseURL}/api/profiles/special_services?church_id=${churchId}`);
      const specialServicesData = specialServicesResponse.data;

      // Update the state with all related data
      setChurchData((prev) => ({
        ...prev,
        leadership: leadershipData || [],
        ministries: ministriesData || [],
        coreValues: coreValuesData || [],
        worshipTimes: worshipTimesData.reduce((acc: { [key: string]: string }, item: { day: string, time: string }) => {
          return { ...acc, [item.day]: item.time };
        }, {}),
        sacraments: sacramentsData || [],
        specialServices: specialServicesData || [],
      }));
    } else {
      // If no church profile exists, fetch organization data as fallback
      api.get(`${baseURL}/api/organizations/${orgId}`)
        .then((response) => {
          const org = response.data;
          if (!org) {
            console.warn('No organization data returned');
            return;
          }

          // Update the church data with the fetched organization data
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
        })
        .catch((error) => {
          console.error('Error fetching organization data:', error);
        });
    }
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

    // First, save the church information to the `churches` table
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

    // Get the church_id from the response
    const churchId = churchResponse.data.church_id;

    console.log("Church ID:", churchId);  // Add logging to verify

    if (!churchId) {
      throw new Error("Church ID is missing in response");
    }

    // Temporarily comment out social links saving
    // const socialLinksPromises = churchData.socialLinks ? Object.keys(churchData.socialLinks).map((platform) => {
    //   return api.post(`${baseURL}/api/profiles/social_links`, {
    //     church_id: churchId,
    //     platform,
    //     url: churchData.socialLinks[platform],
    //   });
    // }) : [];
    // await Promise.all(socialLinksPromises);  // Wait for all social links to be saved

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

    await Promise.all(leadershipPromises);  // Wait for all leadership members to be saved

    // Save ministries to `ministries` table
    const ministriesPromises = churchData.ministries.map((ministry) => {
      return api.post(`${baseURL}/api/profiles/ministries`, {
        church_id: churchId,
        name: ministry.name,
        description: ministry.description,
      });
    });

    await Promise.all(ministriesPromises);  // Wait for all ministries to be saved

    // Save core values to `core_values` table
    const coreValuesPromises = churchData.coreValues.map((value) => {
      return api.post(`${baseURL}/api/profiles/core_values`, {
        church_id: churchId,
        value,
      });
    });

    await Promise.all(coreValuesPromises);  // Wait for all core values to be saved

    // Save worship times to `worship_times` table
    const worshipTimesPromises = Object.keys(churchData.worshipTimes).map((day) => {
      return api.post(`${baseURL}/api/profiles/worship`, {
        church_id: churchId,
        day,
        time: churchData.worshipTimes[day],
      });
    });

    await Promise.all(worshipTimesPromises);  // Wait for all worship times to be saved

    // Temporarily Disable Sacraments because of Backend Issues
    // Save sacraments to `sacraments` table
    //const sacramentsPromises = churchData.sacraments.map((sacrament) => {
      //return api.post(`${baseURL}/api/profiles/sacraments`, {
        //church_id: churchId,
        //sacrament_name: sacrament,
      //});
    //});

    //await Promise.all(sacramentsPromises);  // Wait for all sacraments to be saved

    // Save special services to `special_services` table
    //const specialServicesPromises = churchData.specialServices.map((service) => {
      //return api.post(`${baseURL}/api/profiles/special_services`, {
        //church_id: churchId,
        //service_name: service,
      //});
    //});

    //await Promise.all(specialServicesPromises);  // Wait for all special services to be saved

    // Finally, confirm that all the data is saved and navigate away
    // After all the data is saved successfully, show the success card
    setShowSuccessCard(true);

    // Hide the success card and navigate to the lobby after a delay
      setTimeout(() => {
        setShowSuccessCard(false);
        console.log('➡️ Navigating to /Organization/orgLobby');
        navigate('/Organization/orgLobby'); // Redirect to the lobby
      }, 2000); // Adjust timeout as necessary (2 seconds in this case)

    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="orgProfileContainer">

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
        <a href="/Organization/edittableProfile" className="active">Profile</a>
        <a href="/Organization/orgLobby">The Lobby</a>
        <a href="/Organization/ListedAccounts">Accounts Tracker</a>

        <hr className="sidebar-separator" />
        <a href="/dashboard" className="return-main">To SCI-ELD ERP</a>
        <a
          href="/"
          className="logout-link"
          onClick={(e) => { e.preventDefault(); localStorage.clear(); navigate("/"); }}
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
