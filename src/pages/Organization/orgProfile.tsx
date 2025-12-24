import React, { useState } from 'react';
import { FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // <-- Import useNavigate
import './orgProfile.css'; // Assuming your styles are located here
import ChurchLogo from "../../assets/Church Logo.jpg";

const ChurchProfilePage: React.FC = () => {
  const [churchData] = useState({
    name: 'Eternal Hope Ministries',
    establishmentYear: 2010,
    denomination: 'Pentecostal / Evangelical',
    email: 'contact@eternalhope.org.zm',
    phone: '+260961234567',
    address: '88 Sunrise Avenue, Kabwata, Lusaka, Zambia',
    profilePic: 'shieldLogo.png', // Replace with actual image path
    socialLinks: {
      facebook: 'https://facebook.com/eternalhope',
      instagram: 'https://instagram.com/eternalhope',
      twitter: 'https://twitter.com/eternalhope',
    },
    leadership: [
      { role: 'Senior Pastor', name: 'Pastor Benjamin Mwale', yearStart: 2010, yearEnd: 2025 },
      { role: 'Associate Pastor - Youth & Women', name: 'Pastor Lillian Chola', yearStart: 2015 },
      { role: 'Associate Pastor - Outreach', name: 'Pastor Peter Zulu', yearStart: 2018 },
    ],
    ministries: [
      'Children\'s Ministry', 
      'Youth Ministry', 
      'Adult Ministries', 
      'Community Outreach'
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
  });

  // Initialize the navigate function
  const navigate = useNavigate();

  return (
    <div className="orgProfileContainer">
      {/* Header */}
      <header>
        <div className="banner"></div>
        <div className="profile-wrapper">
          <img src={ChurchLogo} alt="Profile" className="profile-pic" />
        </div>
      </header>

      {/* Back to Lobby Button */}
      <div className="back-to-lobby">
        <button onClick={() => navigate('/Organization/lobby')} className="add-btn">
          ← &nbsp; Back to Lobby
        </button>
      </div>

      {/* Profile Info */}
      <section className="profile-info">
        <h1>
          {churchData.name} <span className="verified-icon"><FaCheckCircle /></span>
        </h1>
        <p>{churchData.denomination} Church in Lusaka, Zambia</p>
        <p><i>Established: {churchData.establishmentYear}</i></p>

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

        {/*<div className="social-icons">
          <a href={churchData.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
            <FaFacebook className="fa-lg" />
          </a>
          <a href={churchData.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram className="fa-lg" />
          </a>
          <a href={churchData.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
            <FaTwitter className="fa-lg" />
          </a>
        </div>*/}
      </section>

      {/* Main Content */}
      <main>
        {/* Left Column */}
        <div className="left-column">
          <div className="content-card">
            <h2>About Us</h2>
            <p>{churchData.name} is dedicated to bringing hope, transforming lives, and empowering communities through the love of Jesus Christ.</p>
            <p><strong>Vision:</strong> To expand ministries, empower youth and women, and create a positive impact in Lusaka.</p>
            <p><strong>Mission:</strong> To serve with love, share the Gospel, and transform communities through practical support and spiritual growth.</p>
          </div>

          <div className="content-card">
            <h2>Leadership</h2>
            <div className="timeline">
              {churchData.leadership.map((member, index) => (
                <div key={index} className={`timeline-item ${index % 2 === 0 ? '#5C4736' : ''}`}>
                  <h3>{member.role}</h3>
                  <p>{member.name} | {member.yearStart} - {member.yearEnd || 'Present'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <h2>Ministries & Programs</h2>
            <div className="space-y-5">
              {churchData.ministries.map((ministry, index) => (
                <div key={index}>
                  <h3>{ministry}</h3>
                  <p>{ministry} related description or programs.</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="content-card">
            <h2>Contact Information</h2>
            <div className="contact-item"><i><FaEnvelope /></i> <span>{churchData.email}</span></div>
            <div className="contact-item"><i><FaPhone /></i> <span>{churchData.phone}</span></div>
            <div className="contact-item"><i><FaMapMarkerAlt /></i> <span>{churchData.address}</span></div>
            <hr />
          </div>

          <div className="content-card">
            <h2>Core Values</h2>
            <div className="check-list">
              {churchData.coreValues.map((value, index) => (
                <div key={index} className="check-list-item">
                  <i><FaCheckCircle /></i>
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <h2>Worship Services</h2>
            <p><strong>Sunday Worship:</strong> {churchData.worshipTimes.sunday}</p>
            <p><strong>Midweek:</strong> {churchData.worshipTimes.midweek}</p>
            <p><strong>Style of Worship:</strong> Energetic contemporary worship, in English, Bemba, and Nyanja, with music, dance, and testimonies.</p>
            <p><strong>Sacraments:</strong> {churchData.sacraments.join(', ')}</p>
            <p><strong>Special Services:</strong> {churchData.specialServices.join(', ')}</p>
          </div>
        </div>
      </main>

      <footer>&copy; 2025 {churchData.name}. All Rights Reserved.</footer>
    </div>
  );
};

export default ChurchProfilePage;
