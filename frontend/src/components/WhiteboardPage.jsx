"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import "./WhiteboardPage.css"
import SamsanLogo from "../assets/samsan.jpg"
import SulekhaLogo from "../assets/Sulekha.ai.jpeg"
import BackgroundImage from "../assets/backgroundimage1.jpg"

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://192.168.1.63:8080/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://192.168.1.63:8080/ws';

export default function WhiteboardPage() {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const wsRef = useRef(null)
  const [latestImage, setLatestImage] = useState(null)
  const [message, setMessage] = useState("🔌 Connecting to whiteboard...")
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [fps, setFps] = useState(0)
  const [lastFrameTime, setLastFrameTime] = useState(0)
  const [whiteboardInfo, setWhiteboardInfo] = useState({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const cameraId = new URLSearchParams(location.search).get("cameraId") || "LaptopCam1"
  const fallbackBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AApEBgE4KrrIAAAAASUVORK5CYII="

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      const wsUrl = `${WS_URL}/whiteboard/${cameraId}?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log("🔗 Whiteboard WebSocket connected");
        setConnectionStatus("connected");
        setMessage("✅ Whiteboard connected - Receiving live updates");
        setIsLoading(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'frame') {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastFrameTime;
            const currentFps = timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
            
            setFps(currentFps);
            setLastFrameTime(currentTime);
            
            if (data.imageUrl) {
              setLatestImage(data.imageUrl);
              drawImageToCanvas(data.imageUrl);
            }
          } else if (data.type === 'whiteboard_info') {
            setWhiteboardInfo(data.info);
          } else if (data.type === 'error') {
            setMessage(`⚠️ ${data.message}`);
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionStatus("error");
        setMessage("❌ Connection error - Retrying...");
      };

      wsRef.current.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setConnectionStatus("disconnected");
        setMessage("🔌 Connection lost - Reconnecting...");
        
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 3000);
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      setConnectionStatus("error");
      setMessage("❌ Failed to connect to whiteboard");
    }
  }, [cameraId, lastFrameTime]);

  const drawImageToCanvas = useCallback((imageSrc) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      const containerWidth = canvas.parentElement.clientWidth * 0.9
      const containerHeight = canvas.parentElement.clientHeight * 0.9
      const imgRatio = img.width / img.height
      const containerRatio = containerWidth / containerHeight

      let width, height
      if (imgRatio > containerRatio) {
        width = containerWidth
        height = width / imgRatio
      } else {
        height = containerHeight
        width = height * imgRatio
      }

      canvas.width = width
      canvas.height = height

      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Add timestamp overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 250, 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Poppins';
      ctx.fillText(`Whiteboard - ${new Date().toLocaleTimeString()}`, 15, 35);

      ctxRef.current = ctx
      console.log("🖼️ Whiteboard image drawn on canvas")
    }

    img.onerror = () => {
      console.error("❌ Failed to load image. Using fallback.")
      if (imageSrc !== fallbackBase64) {
        drawImageToCanvas(fallbackBase64)
      }
    }

    img.src = imageSrc || fallbackBase64
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Take screenshot
  const takeScreenshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `whiteboard-${cameraId}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Save whiteboard
  const saveWhiteboard = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const imageData = canvas.toDataURL('image/png');
      const token = localStorage.getItem('authToken');
      
      await axios.post(`${BACKEND_URL}/whiteboard/${cameraId}/save`, {
        imageData: imageData
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessage("✅ Whiteboard saved successfully!");
    } catch (error) {
      console.error("❌ Error saving whiteboard:", error);
      setMessage("❌ Failed to save whiteboard");
    }
  };

  useEffect(() => {
    connectWebSocket();

    const handleResize = () => {
      if (latestImage) drawImageToCanvas(latestImage);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [connectWebSocket, drawImageToCanvas, latestImage]);

  const reloadCanvasImage = () => {
    if (latestImage) {
      drawImageToCanvas(latestImage)
      setMessage("♻️ Last image redrawn successfully.")
    } else {
      setMessage("⚠️ No previous image to redraw. Fetching new image...")
      connectWebSocket();
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div
      className="whiteboard-page"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <button 
        className="action-button btn-back"
        onClick={() => navigate("/dashboard")}
        title="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="header-container">
        <div className="logos-wrapper">
          <img src={SamsanLogo} alt="Samsan Logo" className="logo-image" />
          <img src={SulekhaLogo} alt="Sulekha.ai Logo" className="logo-image" />
        </div>
        
        <div className="connection-status">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span>{connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}</span>
          <span className="camera-id">Camera: {cameraId}</span>
          {fps > 0 && <span className="fps-counter">FPS: {fps}</span>}
        </div>
      </div>

      <div className="whiteboard-container">
        <div className="whiteboard-content">
          <div className="canvas-container">
            <canvas ref={canvasRef} className="whiteboard-canvas" />
            
            {!latestImage && (
              <div className="no-image-overlay">
                <div className="spinner"></div>
                <p>Waiting for whiteboard feed...</p>
              </div>
            )}
          </div>
          
          <div className="whiteboard-controls">
            <div className="control-buttons">
              <button 
                className="action-button btn-secondary"
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? '⛶' : '⛶'} Fullscreen
              </button>
              
              <button 
                className="action-button btn-secondary"
                onClick={takeScreenshot}
                title="Take Screenshot"
              >
                📸 Screenshot
              </button>
              
              <button 
                className="action-button btn-secondary"
                onClick={saveWhiteboard}
                title="Save Whiteboard"
              >
                💾 Save
              </button>
              
              <button 
                className="action-button btn-refresh"
                onClick={reloadCanvasImage}
                title="Reload"
              >
                🔄 Reload
              </button>
            </div>
            
            <div className="status-message">{message}</div>
          </div>
        </div>
      </div>

      {whiteboardInfo && Object.keys(whiteboardInfo).length > 0 && (
        <div className="whiteboard-info-panel">
          <h4>📊 Whiteboard Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Resolution:</span>
              <span className="info-value">{whiteboardInfo.resolution || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Update Rate:</span>
              <span className="info-value">{whiteboardInfo.updateRate || 'Unknown'} FPS</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{whiteboardInfo.lastUpdated || 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

