import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import "./LoginSignForget.css";

// Import logo
import Logo from "../assets/Sulekha.ai1.png";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;


const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState("student");

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading for smooth animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Form validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accountType: accountType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(data.message || "Signup failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="auth-page">
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
          <div className="auth-left">
            <div className="auth-logo-container">
              <img src={Logo} alt="Sulekha.AI Logo" className="auth-main-logo" />
            </div>
            <div className="auth-left-content">
              <h1>Join Sulekha.AI Today</h1>
              <p>Create an account to access all features and start collaborating.</p>
              <div className="auth-features">
                <div className="auth-feature">
                  <div className="feature-icon">🚀</div>
                  <div className="feature-text">
                    <h3>Instant Access</h3>
                    <p>Get started immediately after signing up</p>
                  </div>
                </div>
                <div className="auth-feature">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">
                    <h3>Secure Platform</h3>
                    <p>Your data is encrypted and protected</p>
                  </div>
                </div>
                <div className="auth-feature">
                  <div className="feature-icon">💡</div>
                  <div className="feature-text">
                    <h3>Advanced Features</h3>
                    <p>Unlock premium tools and templates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            className="auth-right"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="auth-header" variants={itemVariants}>
              <h2>Create an Account</h2>
              <p>Please enter your details</p>
            </motion.div>

            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="success-icon">✓</div>
                <p>{success}</p>
              </motion.div>
            )}

            <motion.form onSubmit={handleSubmit} variants={containerVariants}>
              <motion.div className="input-group" variants={itemVariants}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <span className="input-highlight"></span>
                <label>Full Name</label>
              </motion.div>

              <motion.div className="input-group" variants={itemVariants}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <span className="input-highlight"></span>
                <label>Email Address</label>
              </motion.div>

              <motion.div className="input-group pass-input-div" variants={itemVariants}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span className="input-highlight"></span>
                <label>Password</label>
                <span 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </motion.div>

              <motion.div className="input-group pass-input-div" variants={itemVariants}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span className="input-highlight"></span>
                <label>Confirm Password</label>
                <span 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </motion.div>

              <motion.div className="account-type-selector" variants={itemVariants}>
                <p>Select Account Type</p>
                <div className="account-type-options">
                  <button
                    type="button"
                    className={`account-type-option ${accountType === "student" ? "active" : ""}`}
                    onClick={() => setAccountType("student")}
                  >
                    <span className="account-type-check">✓</span>
                    Student
                  </button>
                  <button
                    type="button"
                    className={`account-type-option ${accountType === "professional" ? "active" : ""}`}
                    onClick={() => setAccountType("professional")}
                  >
                    <span className="account-type-check">✓</span>
                    Teacher
                  </button>
                </div>
              </motion.div>

              <motion.button
                className="auth-button"
                type="submit"
                disabled={isSubmitting}
                variants={itemVariants}
              >
                {isSubmitting ? (
                  <span className="button-loader"></span>
                ) : (
                  <>
                    <span className="button-text">Create Account</span>
                    <ArrowRight size={20} className="button-icon" />
                  </>
                )}
              </motion.button>

              <motion.div className="auth-bottom-p" variants={itemVariants}>
                Already have an account?{" "}
                <Link to="/login" className="signup-link">
                  Sign in
                </Link>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Signup;