import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa6"; // Updated to use react-icons/fa6 [cite: 2]
import { motion, AnimatePresence } from "framer-motion";
import OtpVerification from "./OtpVerification";
import { storeToken, isAuthenticated } from "../services/authTokenService"; // [cite: 3]
//import landscapeImage from '../assets/landscape.jpg'; // [cite: 4]
import Logo from "../assets/Sulekha.ai1.png"; // Assuming this is your logo file
import "./LoginSignForget.css";
import { login, sendOtp } from "./api/apiJWTtoken";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// Constants from login-back.txt for backend connection and Google OAuth
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "13015010561-ljac6odfbd7en7qq89s7a14m8gvi1a9n.apps.googleusercontent.com";
const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;


// Modified sendOtp function to connect to the backend
const modifiedSendOtp = async (contact, type) => {
  try {
    const response = await fetch(`${BACKEND_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: contact,
        type: type || 'LOGIN'
      }),
    });
    
    const text = await response.text();
    
    // Handle empty response
    if (!text.trim()) {
      console.error('Empty response from server');
      return { 
        success: false, 
        message: "Server returned an empty response. Please try again." 
      };
    }
    
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return { 
        success: false, 
        message: "Invalid response from server. Please try again." 
      };
    }
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || "Failed to send OTP. Please try again." 
      };
    }
    
    return data;
  } catch (error) {
    console.error("Send OTP error:", error);
    return { 
      success: false, 
      message: "Error connecting to server. Please check your network connection." 
    };
  }
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false); // [cite: 9]
  const [email, setEmail] = useState(""); // [cite: 9]
  const [password, setPassword] = useState(""); // [cite: 10]
  const [error, setError] = useState(""); // [cite: 10]
  const [otpSent, setOtpSent] = useState(false); // [cite: 10]
  const [otpVerified, setOtpVerified] = useState(false); // Changed from 'verified' to 'otpVerified' for consistency with login-back.txt [cite: 11]
  const [isSending, setIsSending] = useState(false); // [cite: 11]
  const [isLoading, setIsLoading] = useState(true); // [cite: 11]
  const [isDarkMode, setIsDarkMode] = useState(false); // [cite: 11]
  const [backendConnected, setBackendConnected] = useState(false); // [cite: 12]
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const hasNavigated = useRef(false); // Prevent double navigation

  useEffect(() => {
    // Check if dark mode is enabled for Google button theme
    const checkDarkMode = () => { // [cite: 12]
      const isDark = document.body.classList.contains('dark-mode') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode(); // [cite: 12]

    // Create a mutation observer to watch for class changes on the body
    const observer = new MutationObserver(checkDarkMode); // [cite: 13]
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] }); // [cite: 13]

    // Simulate loading for smooth animation
    const timer = setTimeout(() => { // [cite: 13]
      setIsLoading(false);
    }, 800);

    // Check if user is already authenticated
    if (isAuthenticated()) { // [cite: 13]
      const role = localStorage.getItem("role") || "user";
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    }

    // Load Google Sign-In script
    const loadGoogleScript = () => { // [cite: 14]
      if (!window.google) { // [cite: 14]
        const script = document.createElement("script"); // [cite: 15]
        script.src = "https://accounts.google.com/gsi/client"; // [cite: 15]
        script.async = true; // [cite: 15]
        script.defer = true; // [cite: 15]
        script.onload = initializeGoogleLogin; // [cite: 15]
        document.body.appendChild(script); // [cite: 15]
      } else {
        initializeGoogleLogin(); // [cite: 16]
      }
    };

    // Initialize Google Sign-In button
    const initializeGoogleLogin = () => { // [cite: 17]
      if (window.google?.accounts?.id) { // [cite: 17]
        window.google.accounts.id.initialize({ // [cite: 17]
          client_id: CLIENT_ID, // [cite: 17]
          callback: handleGoogleResponse, // [cite: 17]
        });
        window.google.accounts.id.renderButton( // [cite: 18]
          document.getElementById("google-login-button"),
          {
            theme: isDarkMode ? "filled_black" : "outline", // [cite: 18]
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "pill"
          }
        );
      }
    };

    loadGoogleScript(); // [cite: 19]

    // Listen for dark mode changes to update Google button theme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { // [cite: 20]
      loadGoogleScript();
    });

    // Test backend connection
    const testBackendConnection = async () => { // [cite: 21]
      try {
        const response = await fetch(`${BACKEND_URL}/test-connection`); // [cite: 21]
        if (response.ok) { // [cite: 22]
          console.log("Backend connection successful");
          setBackendConnected(true);
        } else { // [cite: 23]
          console.warn("Backend connection test failed");
          setBackendConnected(false);
        }
      } catch (err) { // [cite: 24]
        console.error("Backend connection error:", err);
        setBackendConnected(false); // [cite: 25]
      }
    };

    testBackendConnection(); // [cite: 25]

    return () => {
      clearTimeout(timer); // [cite: 25]
      observer.disconnect(); // [cite: 25]
    };
  }, []); // Only run once on mount

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginResponse = await login(formData);
      if (loginResponse.success) {
        const otpResponse = await sendOtp({ email: formData.email });
        if (otpResponse.success) {
          localStorage.setItem("loginEmail", formData.email);
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            navigate("/otp");
          }
        } else {
          toast.error(otpResponse.message || "Failed to send OTP");
        }
      } else {
        toast.error(loginResponse.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

const handleOTPVerified = async (otp) => {
  try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
        body: JSON.stringify({ email, password, otp }),
    });

      const text = await response.text();
  
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse login response:", text);
        setError("Invalid response from server.");
        return;
      }
  
      if (response.ok && data.success && data.token) {
        // Store the token
        const tokenStored = storeToken(data.token);
        if (!tokenStored) {
          setError("Invalid authentication token received.");
          return;
        }
  
        // Save session info
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("role", data.role || "user");
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }
        if (data.email) {
          localStorage.setItem("userEmail", data.email);
        } else if (email) {
          localStorage.setItem("userEmail", email);
        }
  
        // Set frontend state
        setOtpVerified(true);
  
        // Redirect based on role
      setTimeout(() => {
        navigate(data.role === "admin" ? "/admin-dashboard" : "/dashboard");
      }, 1500);
    } else {
      setError(data.message || "Login failed. Please try again.");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Error connecting to server. Please check your network connection.");
  }
};


  const handleGoogleResponse = (response) => {
    try {
      const credential = response.credential;
      const user = JSON.parse(atob(credential.split(".")[1]));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("role", "user");
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);

    const res = await fetch("http://localhost:8080/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("authToken", data.jwt); // Store app's JWT
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      alert("Google Sign-in failed");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 }, // [cite: 49]
    visible: {
      opacity: 1, // [cite: 49]
      transition: {
        duration: 0.5, // [cite: 49]
        when: "beforeChildren", // [cite: 49]
        staggerChildren: 0.1 // [cite: 49]
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 }, // [cite: 50]
    visible: {
      y: 0, // [cite: 50]
      opacity: 1, // [cite: 50]
      transition: { duration: 0.4, ease: "easeOut" } // [cite: 50]
    }
  };

  const slideVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
      x: 30,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };


  return (
    <div className="auth-page">
      {/* Retain the existing background structure from Login.jsx */}
      <div className="auth-background">
        <div className="auth-gradient"></div>
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="auth-container">
          {/* Retain the left-side content from Login.jsx */}
          <div className="auth-left">
            <div className="auth-logo-container">
              <img src={Logo} alt="Sulekha.AI Logo" className="auth-main-logo" />
            </div>
            <div className="auth-left-content">
              <h1>Welcome to Sulekha.AI</h1>
              <p>The AI-powered digital whiteboard designed for educators and professionals.</p>
              <div className="auth-features">
                <div className="auth-feature">
                  <div className="feature-icon">✨</div>
                  <div className="feature-text">
                    <h3>AI-Powered</h3>
                    <p>Intelligent features that enhance productivity</p>
                  </div>
                </div>
                <div className="auth-feature">
                  <div className="feature-icon">🔄</div>
                  <div className="feature-text">
                    <h3>Real-time Collaboration</h3>
                    <p>Work together with your team from anywhere</p>
                  </div>
                </div>
                <div className="auth-feature">
                  <div className="feature-icon">📱</div>
                  <div className="feature-text">
                    <h3>Cross-Platform</h3>
                    <p>Access your whiteboards on any device</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This motion.div replaces the auth-right content from Login.jsx with login-back.txt's logic */}
          <motion.div
            className="auth-right" // Matches existing Login.jsx class
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            <motion.div className="auth-header" variants={itemVariants}> {/* Matches existing Login.jsx class */}
              <h2>Welcome Back!</h2> {/* [cite: 52] */}
              <p>Please login to your account</p> {/* [cite: 53] */}
            </motion.div>

            {/* Backend connection warning */}
            {!backendConnected && ( // [cite: 53]
              <motion.div
                className="warning-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }} // [cite: 54]
              >
                Warning: Cannot connect to server. Some features may not work. {/* [cite: 55] */}
              </motion.div>
            )}

            {/* Error message display */}
            {error && ( // [cite: 55]
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }} // [cite: 56]
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {!otpSent ? ( // Conditional rendering based on OTP sent status [cite: 57]
                <motion.form
                  key="email-password-form" // Added key for AnimatePresence
                  onSubmit={handleSubmit}
                  variants={containerVariants}
                  className="auth-form" // Matches existing Login.jsx class
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div className="input-group" variants={itemVariants}>
                    <input
                      type="email"
                      placeholder="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <span className="input-highlight"></span> {/* [cite: 60] */}
                    <label>Email Address</label> {/* [cite: 60] */}
                  </motion.div>

                  <motion.div className="input-group pass-input-div" variants={itemVariants}>
                    <input
                      type={showPassword ? "text" : "password"} // [cite: 61]
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <span className="input-highlight"></span> {/* [cite: 62] */}
                    <label>Password</label> {/* [cite: 62] */}
                    <span
                      className="password-toggle" // [cite: 63]
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"} // [cite: 64]
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />} {/* [cite: 65] */}
                    </span>
                  </motion.div>

                  <motion.div
                    className="auth-options" // Matches existing Login.jsx class
                    variants={itemVariants}
                  >
                    {/* Forgot Password Link [cite: 66] */}
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot Password? {/* [cite: 67] */}
                    </Link>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading} // [cite: 68]
                    className="auth-button primary-button" // Matches existing Login.jsx class
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }} // [cite: 68]
                    whileTap={{ scale: 0.98 }} // [cite: 68]
                  >
                    {loading ? ( // [cite: 69]
                      <>
                        <span className="button-text">Logging in...</span>
                        <span className="button-loader"></span>
                      </>
                    ) : ( // [cite: 70]
                      "Login"
                    )}
                  </motion.button>

                  <motion.div
                    className="divider" // [cite: 70]
                    variants={itemVariants}
                  >
                    
                  </motion.div>

                  {/* Google Sign-In Button [cite: 72] */}
                  <motion.div
                    className="google-button-wrapper"
                    variants={itemVariants}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log("Google Sign-in Error")}
                    />
                  </motion.div>
                </motion.form>
              ) : (
                // OTP Verification Section [cite: 81]
                <motion.div
                  key="otp-verification-section" // Added key for AnimatePresence
                  initial={{ opacity: 0, y: 20 }} // [cite: 82]
                  animate={{ opacity: 1, y: 0 }} // [cite: 82]
                  transition={{ duration: 0.5 }} // [cite: 82]
                >
                  <div className="otp-verification-wrapper"> {/* [cite: 82] */}
                    <OTPVerification
                      contact={email}
                      type="login"
                      onVerified={handleOTPVerified}
                      onBack={() => setOtpSent(false)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message after OTP verification [cite: 86] */}
            {otpVerified && ( // [cite: 86]
              <motion.div
                className="success-message"
                initial={{ opacity: 0, scale: 0.8 }} // [cite: 86]
                animate={{ opacity: 1, scale: 1 }} // [cite: 87]
                transition={{ duration: 0.5 }} // [cite: 87]
              >
                <div className="success-icon">✓</div> {/* [cite: 87] */}
                <p>Login successful! Redirecting...</p> {/* [cite: 88] */}
              </motion.div>
            )}

            {/* Don't have an account link [cite: 88] */}
            <motion.div
              className="auth-bottom-p" // Matches existing Login.jsx class
              variants={itemVariants}
            >
              Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link> {/* [cite: 89] */}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login; // [cite: 90]