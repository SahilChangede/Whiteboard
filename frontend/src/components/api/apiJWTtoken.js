// /components/api/apiJWTtoken.js

import { getToken } from "../../services/authTokenService";

// Helper function to get the Bearer token format
const getBearerToken = () => {
  const token = getToken();
  return token ? `Bearer ${token}` : "";
};

// Base URL for API
//const BASE_URL = "http://192.168.1.63:8080";
const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;


// Generalized fetch with token
export const fetchWithAuth = async (url, options = {}) => {
  const token = getBearerToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: token }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return { success: true };
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Network error. Please check your connection and try again.");
  }
};

// Login function - now only validates credentials
export const login = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};

// Send OTP function
export const sendOtp = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: data.email,
        type: "LOGIN",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to send OTP",
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: "OTP sent successfully",
      email: responseData.email,
    };
  } catch (error) {
    console.error("Send OTP error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};

// Verify OTP function
export const verifyOtp = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Invalid OTP",
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      token: responseData.token,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};
