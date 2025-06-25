// /src/services/authTokenService.js

import { jwtDecode } from "jwt-decode";

// Key used in localStorage
const TOKEN_KEY = "authToken";

// Save token to localStorage
export const storeToken = (token) => {
  if (!token) {
    console.error("No token provided to store");
    return false;
  }

  try {
    // Verify the token is valid JWT before storing
    const decoded = jwtDecode(token);
    if (!decoded) {
      throw new Error("Invalid token format");
    }
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Failed to store invalid token:", error);
    return false;
  }
};

// Retrieve token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Retrieve token with Bearer prefix (used in Authorization header)
export const getBearerToken = () => {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
};

// Decode JWT token to extract user info
export const decodeToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    return jwtDecode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    removeToken(); // Clear invalid token
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  try {
  const token = getToken();
  if (!token) return false;

    const decoded = jwtDecode(token);
    if (!decoded) return false;

    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp > currentTime;

    if (!isValid) {
      removeToken(); // Clear expired token
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token authentication check failed:", error);
    removeToken(); // Clear invalid token
    return false;
  }
};

// Set token in localStorage
export const setToken = (token) => {
  if (!token) {
    console.error("No token provided to set");
    return false;
  }

  try {
    // Verify the token is valid JWT before storing
    const decoded = jwtDecode(token);
    if (!decoded) {
      throw new Error("Invalid token format");
    }
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Failed to set invalid token:", error);
    return false;
  }
};
