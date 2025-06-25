"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decodeToken } from "../services/authTokenService";
import "./LandingContent.css";

// Get the backend URL from environment variables or use a fallback
const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://192.168.1.63:8080/api';

const LandingContent = () => {
  const [cameraId, setCameraId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLinkConfirmationDialog, setShowLinkConfirmationDialog] = useState(false);
  const [showAddCameraFormModal, setShowAddCameraFormModal] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [connectingDevice, setConnectingDevice] = useState(null);
  const [autoConnect, setAutoConnect] = useState(false);
  const [userIdError, setUserIdError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

// Get userId with fallback to JWT token
  const getUserId = () => {
    let userId = localStorage.getItem("userId");
 
    if (!userId || userId === "null" || userId === "undefined") {
      try {
        const decodedToken = decodeToken();
 
        if (decodedToken) {
          // Prefer direct userId claim
          if (decodedToken.userId) {
            userId = String(decodedToken.userId);
          } else if (decodedToken.sub && !isNaN(decodedToken.sub)) {
            // Use sub only if it's numeric
            userId = decodedToken.sub;
          } else {
            console.warn(
              "JWT token does not contain a usable userId. Update backend to include userId in token."
            );
            return null;
          }
 
          // Only store it if valid
          if (userId && !isNaN(userId)) {
            localStorage.setItem("userId", userId);
          } else {
            console.error("Extracted userId is invalid:", userId);
            return null;
          }
        }
      } catch (error) {
        console.error("Failed to decode token for userId:", error);
        return null;
      }
    }
 
    return userId;
  };
 
  const userId = getUserId();
 

  const fetchConnectedDevices = useCallback(async () => {
    // Don't make API call if userId is null
    if (!userId) {
      setUserIdError("User ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }
 
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      setUserIdError("No authentication token found. Please log in again.");
      setIsLoading(false);
      return;
    }
 
    try {
      setIsLoading(true);
      setUserIdError(""); // Clear any previous errors
 
      // Debug logging
      console.log('Making API call with:', {
        url: `${BACKEND_URL}/cameras/connected`,
        userId: userId,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
 
      const response = await axios.get(`${BACKEND_URL}/api/cameras/connected/${userId}`,  {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("🔍 API response for connected devices:", response.data);


      console.log('API response:', response.data);
      setConnectedDevices(response.data.devices || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching connected devices:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 403) {
        setUserIdError("Access denied. Please check your authentication.");
      } else if (error.response?.status === 404) {
        setUserIdError("User not found or no cameras available.");
      } else if (error.response?.status === 401) {
        setUserIdError("Authentication failed. Please log in again.");
      } else {
        setUserIdError(`Failed to fetch connected devices (${error.response?.status || 'Network Error'}). Please try again.`);
      }
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConnectedDevices();
  }, [fetchConnectedDevices]);

  const handleLinkCamera = async () => {
    if (!cameraId || !deviceName) {
      setLinkError('Camera ID and Device Name cannot be empty.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(cameraId)) {
      setLinkError('Invalid Camera ID. Must be 3-20 characters, letters/numbers/underscores only.');
      return;
    }
    
    setLinkError('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log("Checking camera status for:", cameraId);
      console.log("Linking camera with userId:", userId);
 
      const checkResponse = await axios.get(`${BACKEND_URL}/api/cameras/${cameraId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // if (!checkResponse.data.available) {
      //   throw new Error('Camera is offline or not available');
      // }
 
      const response = await axios.post(`${BACKEND_URL}/api/cameras/link`, {
        cameraId: cameraId,
        userId: userId,
        deviceName: deviceName
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Clear input and close modals
        setCameraId('');
        setDeviceName('');
        setShowLinkConfirmationDialog(false);
        setShowAddCameraFormModal(false);
      
        // 🔁 Fetch updated list from backend instead of adding manually
        await fetchConnectedDevices();
        
        // Show success popup
        setShowSuccessPopup(true);
        // Do NOT navigate to preview here
        // localStorage.setItem('selectedCameraId', cameraId);
        // navigate(`/preview?cameraId=${cameraId}`);
      } else {
        setLinkError(response.data.message || 'Failed to link camera');
      }
      
    } catch (error) {
      console.error('Error linking camera:', error);
      setLinkError(error.message || 'Failed to link camera');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (camera_id_to_disconnect) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(`${BACKEND_URL}/disconnect_camera`, 
        {
          camera_id: camera_id_to_disconnect // ✅ correct field
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' // ✅ optional but recommended
          }
        }
      );
  
      if (response.data.success) {
        setConnectedDevices(prevDevices => 
          prevDevices.filter(device => device.cameraId !== camera_id_to_disconnect)
        );
        const selectedCameraId = localStorage.getItem("selectedCameraId");
        if (selectedCameraId === camera_id_to_disconnect) {
          localStorage.removeItem("selectedCameraId");
        }
      } else {
        throw new Error(response.data.message || "Failed to disconnect camera");
      }
    } catch (error) {
      console.error("Error disconnecting camera:", error);
      alert(error.message || "An error occurred while disconnecting the camera");
    } finally {
      setIsLoading(false);
      await fetchConnectedDevices();
    }
  };
  
  const handleConnect = async (device) => {
    const camId = device?.cameraId;
    if (!camId || camId === "undefined") {
      alert("Camera ID is invalid. Please try again.");
      console.error("Invalid cameraId passed to preview:", device);
      return;
    }
  
    setConnectingDevice(camId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Connecting to ${device.deviceName} (${camId})...`);
      localStorage.setItem("selectedCameraId", camId); // Optional: persist
      navigate(`/preview?cameraId=${camId}`);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect to device.");
    } finally {
      setConnectingDevice(null);
    }
  };
  

  const filteredDevices = connectedDevices.filter(
    (device) =>
      device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.cameraId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="camera-management-container">
      <div className="camera-management-header">
        <h2 className="section-title">Manage Your Cameras</h2>
        <button className="new-camera-button" onClick={() => setShowAddCameraFormModal(true)}>
          <span className="button-icon">➕</span> Add New Camera
        </button>
      </div>
 
      {/* Display userId error if present */}
      {userIdError && (
        <div className="error-message-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {userIdError}
            <button
              className="retry-button"
              onClick={() => {
                setUserIdError("");
                fetchConnectedDevices();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
 
      <div className="search-bar-and-toggle">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="auto-connect-toggle">
              <label htmlFor="autoConnect">Auto-connect last device</label>
              <input
                type="checkbox"
                id="autoConnect"
                checked={autoConnect}
                onChange={(e) => setAutoConnect(e.target.checked)}
              />
            </div>
          </div>

          <div className="linked-devices-section">
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : filteredDevices.length > 0 ? (
              <ul className="device-list">
                {filteredDevices.map((device, index) => (
                  <li key={device.cameraId || `fallback-key-${index}`} className="device-item">
                    <div className="device-info">
                      <span className="device-icon" style={{ fontSize: '2.7rem' }}>📹</span>
                      <div className="device-details" style={{ fontSize: '1.65rem' }}>
                        <span className="device-name" style={{ fontSize: '1.65rem', fontWeight: 700 }}>{device.deviceName}</span>
                        <span className="camera-id-display" style={{ fontSize: '1.275rem' }}>{device.cameraId}</span>
                        <span className="camera-status" style={{ fontSize: '1.1rem', color: device.status === 'online' ? '#10b981' : '#ef4444' }}>
                          Status: {device.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : 'Online'}
                        </span>
                        <span className="camera-last-connected" style={{ fontSize: '1.1rem', color: '#4b5563' }}>
                          Last Connected: {device.lastConnected || 'Just now'}
                        </span>
                      </div>
                    </div>
                    <div className="device-actions" style={{ gap: '1.2rem' }}>
                      <button
                        className="connect-button"
                        style={{ fontSize: '1.35rem', padding: '0.9rem 1.5rem' }}
                        onClick={() => handleConnect(device)}
                        disabled={connectingDevice === device.cameraId}
                      >
                        {connectingDevice === device.cameraId ? (
                          <>
                            <span className="loading-indicator"></span> Connecting...
                          </>
                        ) : (
                          <>
                            <span className="button-icon">▶️</span> Connect
                          </>
                        )}
                      </button>
                      <button
                        className="disconnect-button"
                        style={{ fontSize: '1.35rem', padding: '0.9rem 1.5rem' }}
                        onClick={() => handleDisconnect(device.cameraId)}
                      >
                        <span className="button-icon">❌</span> Disconnect
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-devices-message">No linked devices found. Click "Add New Camera" to get started!</p>
            )}
          </div>

          {/* Add New Camera Form Modal */}
          {showAddCameraFormModal && (
            <div className="add-camera-form-modal-overlay">
          <div className="add-camera-form-modal-content">
            <h2 className="modal-title">Manually Link a Camera</h2>
            <p className="modal-description">
                  Enter the Camera ID and a descriptive Device Name to establish a new connection.
                </p>
                <div className="manual-entry-form">
              {/* Floating Label for Camera ID */}
              <div className="input-field-container">
                <label htmlFor="cameraId" className={cameraId ? "active" : ""}>Camera ID</label>
                    <input
                      type="text"
                      id="cameraId"
                      value={cameraId}
                  onChange={(e) => e.target.value.length <= 20 && setCameraId(e.target.value)}
                  onFocus={(e) => e.target.parentNode.classList.add("focused")}
                  onBlur={(e) => e.target.parentNode.classList.remove("focused")}
                      className="input-field"
                    />
                  </div>
              {/* Floating Label for Device Name */}
              <div className="input-field-container">
                <label htmlFor="deviceName" className={deviceName ? "active" : ""}>Device Name</label>
                    <input
                      type="text"
                      id="deviceName"
                      value={deviceName}
                  onChange={(e) => e.target.value.length <= 20 && setDeviceName(e.target.value)}
                  onFocus={(e) => e.target.parentNode.classList.add("focused")}
                  onBlur={(e) => e.target.parentNode.classList.remove("focused")}
                      className="input-field"
                    />
                  </div>
                  {linkError && <p className="error-message">{linkError}</p>}
                  <div className="modal-actions">
                    <button
                  className="cancel-link-btn"
                      onClick={() => {
                        setShowAddCameraFormModal(false);
                    setLinkError("");
                        setCameraId("");
                        setDeviceName("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                  className="link-camera-submit-btn"
                  onClick={() => setShowLinkConfirmationDialog(true)}
                      disabled={isLoading || !cameraId || !deviceName}
                    >
                      <span className="button-icon">➕</span> Link Camera
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Link Confirmation Dialog */}
          {showLinkConfirmationDialog && (
            <div className="link-dialog-overlay">
              <div className="link-dialog-content">
            <h3 className="dialog-title">Confirm Link</h3>
            <p className="dialog-message">
                  Are you sure you want to link device "<strong>{deviceName}</strong>" with ID "
                  <strong>{cameraId}</strong>"?
                </p>
            <div className="dialog-footer">
              <button className="cancel-confirm-btn" onClick={() => setShowLinkConfirmationDialog(false)}>
                    Cancel
                  </button>
              <button className="confirm-link-btn" onClick={handleLinkCamera} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="loading-indicator"></span>
                        Linking...
                      </>
                    ) : (
                      <>
                        <span className="button-icon">🔗</span>
                        Confirm Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="success-popup-overlay">
              <div className="success-popup-content">
                <span className="success-icon">✅</span>
                <span>Camera successfully added!</span>
                <button className="close-success-btn" onClick={() => setShowSuccessPopup(false)}>
                  Close
                </button>
        </div>
      </div>
          )}
    </div>
  );
};

export default LandingContent;
 