
"use client";
 
import { useEffect, useRef, useState, useCallback } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

import "./Preview.css";
 
const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL ;

const WS_URL = import.meta.env.VITE_WS_URL;
 
const Preview = () => {

  const canvasRef = useRef(null);

  const containerRef = useRef(null);

  const wsRef = useRef(null);

  const navigate = useNavigate();

  const location = useLocation();
 
  const [latestImage, setLatestImage] = useState(null);

  const [message, setMessage] = useState("🔌 Waiting for camera feed...");

  const [isLoading, setIsLoading] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const [fps, setFps] = useState(0);

  const [lastFrameTime, setLastFrameTime] = useState(0);

  const [cameraInfo, setCameraInfo] = useState({});

  const [isFullscreen, setIsFullscreen] = useState(false);
 
  const rawCameraId = new URLSearchParams(location.search).get("cameraId");

  const cameraId = rawCameraId?.trim() || "defaultCam";
 
  const userId = localStorage.getItem("userId") || "user01";
 
  const drawImageToCanvas = useCallback((imageSrc) => {

    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.onload = () => {

      const canvas = canvasRef.current;

      const ctx = canvas.getContext("2d");

      const container = containerRef.current;
 
      const containerWidth = container.clientWidth;

      const containerHeight = container.clientHeight;

      const aspect = img.width / img.height;
 
      let canvasWidth, canvasHeight;

      if (containerWidth / containerHeight > aspect) {

        canvasHeight = containerHeight;

        canvasWidth = containerHeight * aspect;

      } else {

        canvasWidth = containerWidth;

        canvasHeight = containerWidth / aspect;

      }
 
      canvas.width = canvasWidth;

      canvas.height = canvasHeight;
 
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = 'rgba(0,0,0,0.6)';

      ctx.fillRect(10, 10, 210, 30);

      ctx.fillStyle = '#fff';

      ctx.font = '14px Poppins';

      ctx.fillText(`📷 Live - ${new Date().toLocaleTimeString()}`, 15, 30);

    };
 
    img.onerror = () => {

      console.error("❌ Failed to load image.");

      setMessage("❌ Failed to load preview image.");

    };
 
    img.src = imageSrc;

  }, []);
 
  const connectWebSocket = useCallback(() => {

    try {

      const token = localStorage.getItem("authToken");

      const wsUrl = `${WS_URL}/api/camera/${cameraId}?token=${token}`;

      wsRef.current = new WebSocket(wsUrl);
 
      wsRef.current.onopen = () => {

        console.log("✅ WebSocket connected");

        setConnectionStatus("connected");

        setMessage("📡 Streaming live feed...");

      };
 
      wsRef.current.onmessage = (event) => {

        try {

          const data = JSON.parse(event.data);

          if (data.type === "frame") {

            const now = Date.now();

            const delta = now - lastFrameTime;

            setFps(delta > 0 ? Math.round(1000 / delta) : 0);

            setLastFrameTime(now);
 
            const proxied = `${BACKEND_URL}/api/proxy/stream?cameraId=${cameraId}`;

            setLatestImage(proxied);

            drawImageToCanvas(proxied);

          } else if (data.type === "camera_info") {

            setCameraInfo(data.info);

          } else if (data.type === "error") {

            setMessage(`⚠️ ${data.message}`);

          }

        } catch (err) {

          console.error("❌ WS parse error:", err);

        }

      };
 
      wsRef.current.onerror = (e) => {

        console.error("❌ WebSocket error:", e);

        setConnectionStatus("error");

        setMessage("❌ WS connection failed");

      };
 
      wsRef.current.onclose = () => {

        console.warn("🔌 WebSocket closed. Retrying...");

        setConnectionStatus("disconnected");

        setTimeout(() => {

          if (wsRef.current?.readyState === WebSocket.CLOSED) {

            connectWebSocket();

          }

        }, 3000);

      };

    } catch (err) {

      console.error("❌ WebSocket connection error:", err);

    }

  }, [cameraId, lastFrameTime, drawImageToCanvas]);
 
  const toggleFullscreen = () => {

    if (!document.fullscreenElement) {

      containerRef.current.requestFullscreen();

      setIsFullscreen(true);

    } else {

      document.exitFullscreen();

      setIsFullscreen(false);

    }

  };
 
  const takeScreenshot = () => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");

    link.download = `camera-${cameraId}-${Date.now()}.png`;

    link.href = canvas.toDataURL();

    link.click();

  };
 
  const handleContinue = async () => {

    setIsLoading(true);

    try {

      const token = localStorage.getItem("authToken");

      await axios.put(`${BACKEND_URL}/cameras/${cameraId}/status`, {

        status: "IN_USE",

        userId,

      }, {

        headers: {

          Authorization: `Bearer ${token}`

        }

      });

      navigate("/whiteboard");

    } catch (err) {

      console.error("❌ Status update failed:", err);

      navigate("/whiteboard");

    } finally {

      setIsLoading(false);

    }

  };
 
  const getStatusColor = () => {

    switch (connectionStatus) {

      case "connected": return "#10b981";

      case "connecting": return "#f59e0b";

      case "disconnected":

      case "error": return "#ef4444";

      default: return "#6b7280";

    }

  };
 
  useEffect(() => {

    connectWebSocket();

    const resizeHandler = () => latestImage && drawImageToCanvas(latestImage);

    window.addEventListener("resize", resizeHandler);

    return () => {

      wsRef.current?.close();

      window.removeEventListener("resize", resizeHandler);

    };

  }, [connectWebSocket, drawImageToCanvas, latestImage]);
 
  return (
<div className="linkdevice-wrapper">
<button className="btn btn-back" onClick={() => navigate("/dashboard")}>

        ← Back to Dashboard
</button>
 
      <div className="linkdevice-container">
<div className="preview-header">
<h1 className="linkdevice-title">📷 Live Camera Preview</h1>
<div className="connection-status">
<div className="status-indicator" style={{ backgroundColor: getStatusColor() }} />
<span>{connectionStatus}</span>
<span className="camera-id">Camera: {cameraId}</span>

            {fps > 0 && <span className="fps-counter">FPS: {fps}</span>}
</div>
</div>
 
        <div className="video-container" ref={containerRef}>
<canvas ref={canvasRef} className="video-preview" />

          {!latestImage && (
<div className="no-image-overlay">
<div className="spinner"></div>
<p>{message}</p>
</div>

          )}
</div>
 
        <div className="preview-controls">
<div className="control-buttons">
<button className="btn btn-secondary" onClick={toggleFullscreen}>

              {isFullscreen ? "⛶ Exit" : "⛶ Fullscreen"}
</button>
<button className="btn btn-secondary" onClick={takeScreenshot}>

              📸 Screenshot
</button>
<button className="btn btn-refresh" onClick={connectWebSocket}>

              🔄 Reconnect
</button>
</div>
 
          <div className="status-message">{message}</div>
 
          <button

            className="btn btn-continue"

            onClick={handleContinue}

            disabled={isLoading || connectionStatus !== "connected"}
>

            {isLoading ? "🔄 Processing..." : "🚀 Continue to Whiteboard"}
</button>
</div>
</div>
</div>

  );

};
 
export default Preview;

 