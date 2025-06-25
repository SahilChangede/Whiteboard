import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { requestPasswordReset, verifyOTP, resetPassword } from "../services/authService";
import "./LoginSignForget.css";

// Import logo
import Logo from "../assets/Sulekha.ai1.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading for smooth animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!email) {
      setError("Please enter your registered email.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await requestPasswordReset(email);
      setError("");
      setStep(2);
    } catch (error) {
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await verifyOTP(email, otp);
      setError("");
      setStep(3);
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      setIsSubmitting(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const resetData = {
        email,
        otp,
        newPassword
      };
      
      const response = await resetPassword(resetData);
      setError("");
      
      // Success message and redirect
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(error.message || "Password reset failed. Please try again.");
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

  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
      x: -50,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
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
              <h1>Reset Your Password</h1>
              <p>We'll help you get back into your account in no time.</p>
              <div className="auth-features">
                <div className="auth-feature">
                  <div className="feature-icon">🔐</div>
                  <div className="feature-text">
                    <h3>Secure Recovery</h3>
                    <p>Verify your identity with secure OTP</p>
                  </div>
                </div>
                <div className="auth-feature">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-text">
                    <h3>Quick Process</h3>
                    <p>Reset your password in just three steps</p>
                  </div>
                </div>
                <div className="auth-feature">
                  <div className="feature-icon">🛡️</div>
                  <div className="feature-text">
                    <h3>Protected Data</h3>
                    <p>Your information remains safe and secure</p>
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
              <h2>Password Recovery</h2>
              <p>
                {step === 1 && "Please enter your email address"}
                {step === 2 && "Enter the verification code"}
                {step === 3 && "Set your new password"}
              </p>
            </motion.div>

            <div className="step-indicator">
              <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
              <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
              <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
              <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
            </div>

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

            {step === 1 && (
              <motion.form 
                onSubmit={handleRequestOtp}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div className="input-group" variants={itemVariants}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                  />
                  <span className="input-highlight"></span>
                  <label>Email Address</label>
                </motion.div>

                <motion.button 
                  type="submit" 
                  disabled={isSubmitting}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="button-text">Sending OTP</span>
                      <span className="button-loader"></span>
                    </>
                  ) : (
                    <>
                      <span>Request OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                onSubmit={handleVerifyOtp}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="otp-description">
                  <p>We've sent a 6-digit code to <strong>{email}</strong></p>
                </div>
                
                <div className="input-group otp-input-group">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/[^0-9]/g, ''));
                      setError("");
                    }}
                    required
                  />
                  <span className="input-highlight"></span>
                  <label>Enter OTP</label>
                </div>

                <div className="otp-actions">
                  <button 
                    type="button"
                    className="back-button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>

                  <button 
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="button-text">Verifying</span>
                        <span className="button-loader"></span>
                      </>
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                onSubmit={handleResetPassword}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div className="input-group pass-input-div" variants={itemVariants}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    required
                  />
                  <span className="input-highlight"></span>
                  <label>New Password</label>
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
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    required
                  />
                  <span className="input-highlight"></span>
                  <label>Confirm New Password</label>
                  <span 
                    className="password-toggle" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </motion.div>

                <div className="password-requirements">
                  <p>Password must:</p>
                  <ul>
                    <li className={newPassword.length >= 6 ? "fulfilled" : ""}>
                      Be at least 6 characters long
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? "fulfilled" : ""}>
                      Include an uppercase letter
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? "fulfilled" : ""}>
                      Include a number
                    </li>
                  </ul>
                </div>

                <div className="otp-actions">
                  <button 
                    type="button"
                    className="back-button"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>

                  <button 
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="button-text">Resetting</span>
                        <span className="button-loader"></span>
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            <motion.div className="auth-bottom-p" variants={itemVariants}>
              Remember your password? <Link to="/login" className="signup-link">Log In</Link>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;