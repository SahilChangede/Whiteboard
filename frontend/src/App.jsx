import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import Settings from "./components/Settings";
import { ThemeProvider } from "./components/ThemeContext";
import ActivityCircle from "./components/ActivityCircle";
import Contact from "./components/Contact";
import LandingPage from "./components/LandingPage";
//import EnterCameraID from "./components/EnterCameraID";
import Preview from "./components/Preview";
import WhiteboardPage from "./components/WhiteboardPage";
import RecordingPage from "./components/Dashboard/Record/RecordingPage";
import VideoPage from "./components/Dashboard/Record/Video/VideoPage";
import OtpVerification from "./components/OtpVerification";
import NotesPage from "./components/Dashboard/Notes/NotesPage";
import "./App.css"; // ✅ Add global layout fixes here
import { GoogleOAuthProvider } from '@react-oauth/google';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const [token, setToken] = useState(null);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setToken(authStatus && !!storedToken ? storedToken : null);

    const syncAuth = () => {
      const newToken = localStorage.getItem("authToken");
      const newAuthStatus = localStorage.getItem("isAuthenticated") === "true";
      setToken(newAuthStatus && !!newToken ? newToken : null);
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.scrollY;
      setScrollDirection(currentScrollTop > lastScrollTop ? "down" : "up");
      setLastScrollTop(currentScrollTop);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  useEffect(() => {
    const handlePopState = () => {
      const isOnLoginPage = window.location.pathname === "/login";
      if (isOnLoginPage) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("isAuthenticated");
        window.location.reload();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <ThemeProvider>
      <div
        className={`app-wrapper ${scrollDirection === "down" ? "hide-header" : ""}`}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp" element={<OtpVerification />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <PrivateRoute>
                  <ActivityCircle token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <PrivateRoute>
                  <Contact token={token} />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/preview"
              element={
                <PrivateRoute>
                  <Preview token={token} />
                </PrivateRoute>
              }
            />

            <Route
              path="/whiteboard"
              element={
                <PrivateRoute>
                  <WhiteboardPage token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/recordings"
              element={
                <PrivateRoute>
                  <RecordingPage token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/video"
              element={
                <PrivateRoute>
                  <VideoPage token={token} />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <NotesPage token={token} />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default function WrappedApp() {
  return (
    <GoogleOAuthProvider clientId="13015010561-ljac6odfbd7en7qq89s7a14m8gvi1a9n.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  );
}
