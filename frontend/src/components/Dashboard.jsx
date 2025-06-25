"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaPhoneAlt,
  FaLink,
  FaMicrophone,
  FaStickyNote,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaCog,
  FaQuestionCircle,
  FaEllipsisV,
  FaHome,
} from "react-icons/fa"
import sulekhaAILogo from "../assets/Sulekha.ai1.png" // Import the new logo
import ChatBot from "../components/Dashboard/Chatbot/ChatBot"
import LandingContent from "../components/LandingContent"
import axios from "axios"
import "./Dashboard.css"

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL

const Dashboard = () => {
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("link-device")
  const [activeSectionTab, setActiveSectionTab] = useState("overview")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const userMenuRef = useRef(null)
  const mainContentRef = useRef(null)

  useEffect(() => {
    // Check if mobile on resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener("resize", handleResize)

    // Get user name from localStorage if available
    const storedUserName = localStorage.getItem("userName")
    if (storedUserName) {
      setUserName(storedUserName)
    }
    // Get user email from localStorage if available
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("authToken")
    const response = await axios.get(`${BACKEND_URL}/dashboard`, { // Removed '/summary' here
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.data.success) {
      // IMPORTANT: Adjust this line based on what your backend /dashboard endpoint now returns.
      // If the backend /dashboard endpoint directly returns the dashboard data
      // instead of wrapping it in a 'summary' key, you might need to change this.
      // For example, if it now returns { activeCameras: 5, offlineCameras: 1, ... }
      // directly, you'd use: setDashboardData(response.data);
      setDashboardData(response.data.summary) // Keep this if your backend still sends a 'summary' key
                                            // within the /dashboard response.
                                            // If not, change to setDashboardData(response.data);

      // If user info is included in the response
      if (response.data.user) {
        const name = response.data.user.name || response.data.user.username || response.data.user.email || "User"
        setUserName(name)
        // Store user name in localStorage for future use
        localStorage.setItem("userName", name)
      }
    }

    setIsLoading(false)
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    setIsLoading(false)
  }
}

fetchDashboardData()

// Close user menu when clicking outside
const handleClickOutside = (event) => {
  if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
    setShowUserMenu(false)
  }
}

document.addEventListener("mousedown", handleClickOutside)

return () => {
  document.removeEventListener("mousedown", handleClickOutside)
  window.removeEventListener("resize", handleResize)
}
}, [])

  const handleLogout = async () => {
    try {
      // Show logout animation
      setIsLoading(true)

      // Remove tokens and user data from localStorage
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("authToken")
      localStorage.removeItem("userName")

      setTimeout(() => {
        navigate("/login")
      }, 800)
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
    }
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleNavItemClick = (item) => {
    setActiveNavItem(item)
    if (isMobileSidebarOpen && isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  const handleSectionTabClick = (tab) => {
    setActiveSectionTab(tab)
    // Scroll to the section if needed
    document.getElementById(tab)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleRecordClick = () => {
    setActiveNavItem("record")
    navigate("/recordings")
    if (isMobileSidebarOpen && isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  // Animation variants
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
      },
    },
  }

  const navItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Get first letter of user name or email for avatar
  const userInitial = userName
    ? userName.charAt(0).toUpperCase()
    : userEmail
    ? userEmail.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="dashboard-container">
      {isLoading ? (
        <div className="dashboard-loader-container">
          <div className="dashboard-loader"></div>
        </div>
      ) : (
        <>
          {/* Mobile Sidebar Toggle - Only visible on mobile */}
          <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar} aria-label="Toggle sidebar">
            {isMobileSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Sidebar */}
          <div className={`sidebar ${isMobileSidebarOpen ? "mobile-open" : ""}`}>
            {/* Logo with animation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img src={sulekhaAILogo} alt="Sulekha AI Logo" className="logo-img" />
            </motion.div>

            <nav className="nav-links">
              {/* Home/Dashboard Button */}
              <motion.div
                custom={0}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/"
                  className={`nav-link ${activeNavItem === "dashboard" ? "active" : ""}`}
                  onClick={() => handleNavItemClick("dashboard")}
                >
                  <FaHome className="nav-icon" />
                </Link>
              </motion.div>

              {/* Record Button */}
              <motion.div
                custom={1}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  className={`nav-link ${activeNavItem === "record" ? "active" : ""}`}
                  onClick={handleRecordClick}
                >
                  <FaMicrophone className="nav-icon" />
                </button>
              </motion.div>

              {/* Notes Button */}
              <motion.div
                custom={2}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/notes"
                  className={`nav-link ${activeNavItem === "notes" ? "active" : ""}`}
                  onClick={() => handleNavItemClick("notes")}
                >
                  <FaStickyNote className="nav-icon" />
                </Link>
              </motion.div>
            </nav>

            {/* User Profile Section at Bottom */}
            <motion.div
              className="user-profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                marginTop: 'auto',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                marginBottom: '1rem',
                flexDirection: 'column',
                minWidth: '120px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  marginBottom: '0.2rem',
                }}
              >
                {userInitial}
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {userName || "User"}
              </div>
              {userEmail && (
                <div
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem',
                    wordBreak: 'break-all',
                    textAlign: 'center',
                  }}
                >
                  {userEmail}
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Content */}
          <motion.div
            className="main-content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            ref={mainContentRef}
          >
            {/* User Profile Menu in Top Right */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button className="user-menu-button" onClick={toggleUserMenu} aria-label="User menu">
                <FaEllipsisV className="user-menu-icon" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className="user-dropdown-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FaUser className="dropdown-icon" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FaCog className="dropdown-icon" />
                      <span>Settings</span>
                    </Link>
                    <Link to="/contact" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FaPhoneAlt className="dropdown-icon" />
                      <span>Contact Us</span>
                    </Link>
                    <Link to="/help" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FaQuestionCircle className="dropdown-icon" />
                      <span>Help & Support</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Landing Page Content */}
            <div className="landing-content">
              <LandingContent dashboardData={dashboardData} activeSection={activeSectionTab} />
            </div>

            {/* ChatBot floating widget */}
            <div className="chatbot-widget">
              <ChatBot />
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Dashboard;