import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Sulekha.ai.jpg"; // Adjust path if needed
import "./ActivityCircle.css";

const activities = [
  { title: "Profile Updated", description: "You updated your profile picture.", icon: "👤" },
  { title: "Password Changed", description: "Your password was changed successfully.", icon: "🔑" },
  { title: "Email Updated", description: "You changed your email address.", icon: "📧" },
  { title: "Settings Updated", description: "Your app settings were modified.", icon: "⚙️" },
  { title: "New Device Login", description: "You logged in from a new device.", icon: "💻" },
  { title: "2FA Enabled", description: "Two-Factor Authentication is now enabled.", icon: "🔒" },
  { title: "Unread Notifications", description: "You have unread notifications.", icon: "🔔" },
  { title: "App Usage", description: "You’ve spent 5 hours on the app this week.", icon: "📊" },
];

const ActivityCircle = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const navigate = useNavigate();

  const handleClick = (activity) => {
    setSelectedActivity(activity);
  };

  const closePopup = () => {
    setSelectedActivity(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <div className="activity-page">
      {/* Header Section */}
      <div className="header">
        {/* Logo on the Left (No Text) */}
        <img src={logo} alt="Sulekha Logo" className="logo-img" />

        {/* Buttons on the Right */}
        <div className="header-buttons">
          <Link to="/dashboard" className="header-btn">Dashboard</Link>
          <button className="header-btn logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Activity Circle Layout */}
      <div className="activity-container">
        <h1>Activity Overview</h1>
        <div className="circle-layout">
          {activities.map((activity, index) => {
            const angle = (index / activities.length) * 2 * Math.PI;
            const x = 180 + 140 * Math.cos(angle); // X position
            const y = 180 + 140 * Math.sin(angle); // Y position

            return (
              <div
                key={index}
                className="activity-item"
                style={{ left: `${x}px`, top: `${y}px` }}
                onClick={() => handleClick(activity)}
              >
                <div className="activity-icon">{activity.icon}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup Modal */}
      {selectedActivity && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedActivity.title}</h2>
            <p>{selectedActivity.description}</p>
            <button className="close-btn" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCircle;
