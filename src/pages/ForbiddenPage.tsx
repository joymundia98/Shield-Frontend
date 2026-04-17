import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/heroImage.jpeg';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.errorTextContainer}>
        <span style={styles.number}>4</span>
        <div style={styles.imageContainer}>
          <img src={heroImage} alt="403 Image" style={styles.heroImage} />
        </div>
        <span style={styles.number}>3</span>
      </div>

      <div style={styles.textContainer}>
        <p style={styles.message}>
          You do not have permission to access this page.
        </p>
        <button onClick={handleGoHome} style={styles.button29}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    flexDirection: 'column' as 'column',
    textAlign: 'center' as 'center',
    padding: '20px',
  },
  errorTextContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '10vw',
    letterSpacing: '5px',
    position: 'relative' as 'relative',
  },
  number: {
    fontSize: 'inherit',
    zIndex: 1,
    textShadow: `
      1px 1px 1px #919191,
      1px 2px 1px #919191,
      1px 3px 1px #919191,
      1px 4px 1px #919191,
      1px 5px 1px #919191,
      1px 6px 1px #919191,
      1px 7px 1px #919191,
      1px 8px 1px #919191,
      1px 9px 1px #919191,
      1px 10px 1px #919191,
      1px 18px 6px rgba(16,16,16,0.4),
      1px 22px 10px rgba(16,16,16,0.2),
      1px 25px 35px rgba(16,16,16,0.2),
      1px 30px 60px rgba(16,16,16,0.4)
    `,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 10px',
  },
  heroImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover' as 'cover',
    zIndex: 0,
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
  },
  textContainer: {
    marginTop: '20px',
  },
  message: {
    fontSize: '18px',
    color: '#666',
  },
  button29: {
    alignItems: 'center',
    appearance: 'none' as 'none',
    backgroundImage:
      'radial-gradient(100% 100% at 100% 0, #ff7a7a 0, #ff3d3d 100%)', // 🔴 slight red tone for "forbidden"
    border: '0',
    borderRadius: '6px',
    boxShadow:
      'rgba(45, 35, 66, .4) 0 2px 4px, rgba(45, 35, 66, .3) 0 7px 13px -3px, rgba(58, 65, 111, .5) 0 -3px 0 inset',
    boxSizing: 'border-box' as 'border-box',
    color: '#fff',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: '"JetBrains Mono", monospace',
    height: '48px',
    justifyContent: 'center',
    paddingLeft: '16px',
    paddingRight: '16px',
    transition: 'box-shadow .15s, transform .15s',
    userSelect: 'none' as 'none',
    WebkitUserSelect: 'none' as 'none',
    touchAction: 'manipulation',
    fontSize: '18px',
  },
};

export default ForbiddenPage;