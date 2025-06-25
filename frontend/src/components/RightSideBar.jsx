import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUserCircle,
  FaCog,
  FaPowerOff,
  FaMoon,
  FaSun,
  FaTimes,
  FaCheckCircle
} from "react-icons/fa";
import { motion } from "framer-motion";
import SimpleBar from "simplebar-react";
import { Link, useNavigate } from "react-router-dom";
import "simplebar-react/dist/simplebar.min.css";
import "../components/RightSideBar.css";
import bgimg1 from "../assets/sidebar/img1.jpg";
import bgimg2 from "../assets/sidebar/img2.jpg";

const RightSideBar = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState("light");
  const [bgImage, setBgImage] = useState(bgimg1);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.body.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-xl z-50"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <SimpleBar style={{ height: "100%" }}>
          <div className="p-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
            <FaTimes
              className="text-gray-600 dark:text-gray-300 cursor-pointer"
              onClick={onClose}
            />
          </div>

          {/* Navigation Links */}
          <ul className="p-4 space-y-4 text-gray-800 dark:text-white">
            <li>
              <Link to="/">
                <FaHome className="inline mr-2" /> Home
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <FaUserCircle className="inline mr-2" /> Profile
              </Link>
            </li>
            <li>
              <Link to="/settings">
                <FaCog className="inline mr-2" /> Settings
              </Link>
            </li>
            <li className="cursor-pointer" onClick={handleLogout}>
              <FaPowerOff className="inline mr-2" /> Logout
            </li>
          </ul>

          {/* Theme & Background Section */}
          <div className="p-4 border-t border-gray-300 dark:border-gray-700">
            <button
              className="w-full py-2 px-4 flex items-center justify-center gap-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              onClick={toggleTheme}
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
              {theme === "light" ? "Dark" : "Light"} Mode
            </button>

            <div className="mt-4">
              <p className="mb-2 font-medium">Background:</p>
              <div className="flex gap-2">
                <img
                  src={bgimg1}
                  alt="bg1"
                  onClick={() => setBgImage(bgimg1)}
                  className={`w-12 h-12 rounded cursor-pointer border-2 ${
                    bgImage === bgimg1 ? "border-blue-500" : "border-transparent"
                  }`}
                />
                <img
                  src={bgimg2}
                  alt="bg2"
                  onClick={() => setBgImage(bgimg2)}
                  className={`w-12 h-12 rounded cursor-pointer border-2 ${
                    bgImage === bgimg2 ? "border-blue-500" : "border-transparent"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Setup Guide
            </h3>

            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow">
              <h4 className="font-medium mb-1 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Step 1: Link Your Device
              </h4>
              <p className="text-sm">Go to the Link Device section to connect your hardware device.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow">
              <h4 className="font-medium mb-1 flex items-center gap-2">
                <FaCheckCircle className="text-yellow-400" />
                Step 2: Record Data
              </h4>
              <p className="text-sm">Start capturing input from the linked device through the Record tab.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow">
              <h4 className="font-medium mb-1 flex items-center gap-2">
                <FaCheckCircle className="text-blue-500" />
                Step 3: View Notes
              </h4>
              <p className="text-sm">Access and manage the saved content in the Notes section.</p>
            </div>
          </div>
        </SimpleBar>
      </motion.div>
    </>
  );
};

export default RightSideBar;
