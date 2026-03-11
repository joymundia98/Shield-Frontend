import React, { useEffect } from "react"

interface Props {
  open: boolean
  onLogin: () => void
}

const SessionExpiredModal: React.FC<Props> = ({ open, onLogin }) => {

  useEffect(() => {
    const feImage = document.querySelector("#glass feImage")

    fetch("https://essykings.github.io/JavaScript/map.png")
      .then(res => res.blob())
      .then(blob => {
        const objURL = URL.createObjectURL(blob)
        feImage?.setAttribute("href", objURL)
      })
  }, [])

  if (!open) return null

  return (
    <>
      {/* CSS inside same file */}
      <style>{`
        .glass-modal {
          padding: 40px;
          width: 420px;
          border-radius: 24px;
          text-align: center;
          color: white;

          border: 1px solid rgba(255,255,255,0.3);

          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.25),
            rgba(255,255,255,0.08),
            rgba(255,255,255,0.03)
          );

          backdrop-filter: url(#glass);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }

        .glass-modal p {
            color: #ffffff;
            opacity: 0.95;
            line-height: 1.6;
            text-shadow: 0 1px 4px rgba(0,0,0,0.6);
            margin-bottom: 20px;
        }

        .glass-button {
          cursor: pointer;
          margin-top: 20px;
          padding: 14px 28px;
          border-radius: 999px;

          border: 1px solid rgba(255,255,255,0.3);

          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.3),
            rgba(255,255,255,0.05)
          );

          color: white;
          font-size: 16px;
          font-weight: 600;

          backdrop-filter: blur(8px);

          transition: all 0.4s ease;
        }

        .glass-button:hover {
          transform: scale(1.05);
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.4),
            rgba(255,255,255,0.1)
          );
        }
      `}</style>

      {/* SVG Filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter
          id="glass"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          primitiveUnits="objectBoundingBox"
        >
          <feImage x="-50%" y="-50%" width="200%" height="200%" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feDisplacementMap
            in="blur"
            in2="map"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div style={overlayStyle}>
        <div className="glass-modal">
            
          <h2>Session Expired ⚠︎</h2>

          <p>Your session has expired. Please log in again to continue.</p>

          <button className="glass-button" onClick={onLogin}>
            Login Again
          </button>
        </div>
      </div>
    </>
  )
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(6px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
}

export default SessionExpiredModal