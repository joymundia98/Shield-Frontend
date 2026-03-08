import "./Lobby.css"; // Make sure to link the CSS file for styling
import lobbyImage from "../../assets/lobby.jpeg";

const Lobby = () => {
  return (
    <div className="lobby" style={{ backgroundImage: `url(${lobbyImage})` }}>
      
      <div className="lobby-content">
        <h1 className="lobby-title">Welcome to the Lobby!</h1>
        <p className="lobby-subtitle">Please wait for an Admin to approve your Registration...</p>
        <a href="/" className="add-btn">Return to Home</a>
      </div>
    </div>
  );
};

export default Lobby;
