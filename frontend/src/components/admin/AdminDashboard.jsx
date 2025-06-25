import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // Import the CSS file

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <h1 className="admin-heading">Welcome, Admin! 👑</h1>
      <p className="admin-text">You have access to admin-level features and controls.</p>
      <button onClick={handleLogout} className="admin-button">Logout</button>
    </div>
  );
};

export default AdminDashboard;
