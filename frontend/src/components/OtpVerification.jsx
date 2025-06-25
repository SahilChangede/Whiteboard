import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp, sendOtp } from "./api/apiJWTtoken";
import { storeToken } from "../services/authTokenService";
import { toast } from "react-toastify";
import "./LoginSignForget.css";
import Logo from "../assets/logo.png";

const OtpVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("loginEmail");
    if (!storedEmail) navigate("/login");
    else setEmail(storedEmail);
    const timer = setInterval(() => setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await verifyOtp({ email, otp });
      if (response.success) {
        if (storeToken(response.token)) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.removeItem("loginEmail");
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            navigate("/dashboard");
          }
        } else toast.error("Failed to store authentication token");
      } else toast.error(response.message || "Invalid OTP");
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    setLoading(true);
    try {
      const response = await sendOtp({ email });
      if (response.success) {
        setTimeLeft(30);
        toast.success("OTP resent successfully!");
      } else toast.error(response.message || "Failed to resend OTP");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
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
      <div className="auth-container">
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
        <div className="auth-right">
          <div className="auth-header">
            <h2>Verify Your Email</h2>
            <p>Enter the 6-digit code sent to your email</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group otp-group">
              <label htmlFor="otp">Verification Code</label>
              <div className="otp-input-container">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  className="form-control otp-input"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <div className="otp-timer">
                  {timeLeft > 0 ? (
                    <span className="timer-text">Resend in {timeLeft}s</span>
                  ) : (
                    <button
                      type="button"
                      className="resend-button"
                      onClick={handleResendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
              <p className="email-info">
                <span className="email-label">Code sent to:</span>
                <span className="email-value">{email}</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`login-button ${loading ? 'loading' : ''} ${otp.length === 6 ? 'active' : ''}`}
            >
              {loading ? (
                <span className="button-content">
                  <span className="spinner"></span>
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </button>
            <div className="form-footer">
              <p>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification; 