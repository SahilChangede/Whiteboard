import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Maximize, Minimize, Settings, ArrowLeft, Download, Share2, Bookmark, MessageSquare, PictureInPicture, ChevronDown, X, Clock, Check, Info } from 'lucide-react';
import "./VideoPage.css";

const fallbackVideoUrl = "/videos/new.mp4";

// Sample video metadata - in a real app, this would come from an API
const videoMetadata = {
  title: "Team Meeting - Product Strategy Discussion",
  date: "May 16, 2025",
  duration: "1h 24m",
  description: "This recording covers our quarterly product strategy discussion, including roadmap planning, feature prioritization, and market analysis.",
  presenter: "Alex Johnson",
  tags: ["Meeting", "Product", "Strategy"],
  transcript: true
};

// Sample playback speeds
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Sample quality options
const qualityOptions = [
  { label: "Auto", value: "auto" },
  { label: "1080p", value: "1080" },
  { label: "720p", value: "720" },
  { label: "480p", value: "480" },
  { label: "360p", value: "360" }
];

const VideoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const timeoutRef = useRef(null);

  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState(fallbackVideoUrl);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const passedState = location.state;
    if (passedState?.videoUrl) {
      setVideoUrl(passedState.videoUrl);
    }

    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.state]);

  useEffect(() => {
    // Apply dark mode class to body
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setVideoPlaying(true);
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isDraggingProgress) return;

    setCurrentTime(video.currentTime);
    const percent = (video.currentTime / video.duration) * 100;
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${percent}%`;
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration);
  };

  const handleProgressBarClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleProgressBarMouseDown = (e) => {
    setIsDraggingProgress(true);
    handleProgressBarClick(e);
    
    document.addEventListener('mousemove', handleProgressBarMouseMove);
    document.addEventListener('mouseup', handleProgressBarMouseUp);
  };

  const handleProgressBarMouseMove = (e) => {
    if (!isDraggingProgress || !progressBarRef.current) return;
    
    const progressBar = progressBarRef.current.parentElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setCurrentTime(videoRef.current.currentTime);
      progressBarRef.current.style.width = `${pos * 100}%`;
    }
  };

  const handleProgressBarMouseUp = () => {
    setIsDraggingProgress(false);
    document.removeEventListener('mousemove', handleProgressBarMouseMove);
    document.removeEventListener('mouseup', handleProgressBarMouseUp);
  };

  const handleVolumeChange = (e) => {
    const volumeBar = e.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    setVolume(pos);
    setMuted(pos === 0);
    
    if (videoRef.current) {
      videoRef.current.volume = pos;
      videoRef.current.muted = pos === 0;
    }
    
    if (volumeBarRef.current) {
      volumeBarRef.current.style.width = `${pos * 100}%`;
    }
  };

  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true);
    handleVolumeChange(e);
    
    document.addEventListener('mousemove', handleVolumeMouseMove);
    document.addEventListener('mouseup', handleVolumeMouseUp);
  };

  const handleVolumeMouseMove = (e) => {
    if (!isDraggingVolume) return;
    handleVolumeChange(e);
  };

  const handleVolumeMouseUp = () => {
    setIsDraggingVolume(false);
    document.removeEventListener('mousemove', handleVolumeMouseMove);
    document.removeEventListener('mouseup', handleVolumeMouseUp);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !muted;
    setMuted(newMuted);
    video.muted = newMuted;

    if (newMuted) {
      if (volumeBarRef.current) {
        volumeBarRef.current.style.width = '0%';
      }
    } else {
      if (volumeBarRef.current) {
        volumeBarRef.current.style.width = `${volume * 100}%`;
      }
      video.volume = volume;
    }
  };

  const toggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.msFullscreenElement
    );
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (videoPlaying) {
      timeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Picture-in-Picture failed:", error);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e) => {
    // Only handle keyboard shortcuts when the video player is in focus
    if (!videoContainerRef.current?.contains(document.activeElement) && 
        document.activeElement !== document.body) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'arrowright':
        e.preventDefault();
        skipForward();
        break;
      case 'arrowleft':
        e.preventDefault();
        skipBackward();
        break;
      case 'i':
        e.preventDefault();
        setShowInfoPanel(prev => !prev);
        break;
      case 'p':
        e.preventDefault();
        togglePictureInPicture();
        break;
      default:
        break;
    }
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const changeVideoQuality = (quality) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);
    // In a real implementation, this would change the video source
    console.log(`Quality changed to ${quality}`);
  };

  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
    // In a real app, this would save the bookmark to a database
  };

  const handleDownload = () => {
    // In a real app, this would trigger a download of the video
    alert("Download started!");
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert("Share functionality would open here!");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className={`video-page-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="video-page-content">
        <motion.div 
          className="video-header"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="header-left">
            <motion.button 
              className="back-btn" 
              onClick={() => navigate("/recordings")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} />
              <span>Back to Recordings</span>
            </motion.button>
          </div>
          
          <div className="header-right">
            <motion.button 
              className={`theme-toggle ${isDarkMode ? 'active' : ''}`}
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="video-player-container"
          ref={videoContainerRef}
          onMouseMove={handleMouseMove}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <video
            ref={videoRef}
            className="video-player"
            src={videoUrl}
            type="video/mp4"
            onClick={togglePlayPause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          <AnimatePresence>
            {showControls && (
              <motion.div 
                className="video-controls-overlay"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeIn}
              >
                <div className="video-title-overlay">
                  <h3>{videoMetadata.title}</h3>
                </div>

                <div className="video-progress-container" onClick={handleProgressBarClick} onMouseDown={handleProgressBarMouseDown}>
                  <div className="video-progress-bar">
                    <div className="video-progress-fill" ref={progressBarRef}></div>
                    <div className="video-progress-handle"></div>
                  </div>
                </div>

                <div className="video-controls-main">
                  <div className="video-controls-left">
                    <button className="control-btn" onClick={togglePlayPause} aria-label={videoPlaying ? "Pause" : "Play"}>
                      {videoPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <button className="control-btn" onClick={skipBackward} aria-label="Skip backward 10 seconds">
                      <SkipBack size={20} />
                      <span className="control-tooltip">-10s</span>
                    </button>
                    
                    <button className="control-btn" onClick={skipForward} aria-label="Skip forward 10 seconds">
                      <SkipForward size={20} />
                      <span className="control-tooltip">+10s</span>
                    </button>
                    
                    <div className="volume-control">
                      <button className="control-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      
                      <div className="volume-slider" onClick={handleVolumeChange} onMouseDown={handleVolumeMouseDown}>
                        <div className="volume-slider-bar">
                          <div className="volume-slider-fill" ref={volumeBarRef} style={{ width: `${muted ? 0 : volume * 100}%` }}></div>
                          <div className="volume-slider-handle"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="time-display">
                      <span>{formatTime(currentTime)}</span>
                      <span className="time-separator">/</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  
                  <div className="video-controls-right">
                    <div className="playback-speed-control">
                      <button 
                        className="control-btn speed-btn" 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        aria-label="Playback speed"
                      >
                        <span>{playbackSpeed}x</span>
                        <ChevronDown size={14} />
                      </button>
                      
                      {showSpeedMenu && (
                        <div className="speed-menu">
                          {playbackSpeeds.map(speed => (
                            <button 
                              key={speed} 
                              className={`speed-option ${playbackSpeed === speed ? 'active' : ''}`}
                              onClick={() => changePlaybackSpeed(speed)}
                            >
                              {speed}x {playbackSpeed === speed && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="quality-control">
                      <button 
                        className="control-btn quality-btn" 
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        aria-label="Video quality"
                      >
                        <Settings size={18} />
                        <span className="control-tooltip">Quality</span>
                      </button>
                      
                      {showQualityMenu && (
                        <div className="quality-menu">
                          <div className="menu-header">
                            <span>Quality</span>
                            <button onClick={() => setShowQualityMenu(false)}>
                              <X size={14} />
                            </button>
                          </div>
                          {qualityOptions.map(option => (
                            <button 
                              key={option.value} 
                              className={`quality-option ${selectedQuality === option.value ? 'active' : ''}`}
                              onClick={() => changeVideoQuality(option.value)}
                            >
                              {option.label} {selectedQuality === option.value && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="control-btn" 
                      onClick={togglePictureInPicture}
                      aria-label="Picture in picture"
                    >
                      <PictureInPicture size={18} />
                      <span className="control-tooltip">PiP</span>
                    </button>
                    
                    <button 
                      className="control-btn" 
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                      <span className="control-tooltip">{isFullscreen ? "Exit" : "Fullscreen"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="video-info-section"
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          <div className="video-info-header">
            <div className="video-info-title-section">
              <h1 className="video-title">{videoMetadata.title}</h1>
              <div className="video-meta">
                <span className="video-date">
                  <Clock size={16} />
                  {videoMetadata.date}
                </span>
                <span className="video-duration">
                  {videoMetadata.duration}
                </span>
                <span className="video-presenter">
                  Presenter: {videoMetadata.presenter}
                </span>
              </div>
            </div>
            
            <div className="video-actions">
              <motion.button 
                className={`action-btn ${isBookmarked ? 'active' : ''}`}
                onClick={toggleBookmark}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark size={18} />
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </motion.button>
              
              <motion.button 
                className="action-btn"
                onClick={handleDownload}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                <span>Download</span>
              </motion.button>
              
              <motion.button 
                className="action-btn"
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 size={18} />
                <span>Share</span>
              </motion.button>
            </div>
          </div>
          
          <div className="video-tabs">
            <button 
              className={`tab-btn ${!showTranscript ? 'active' : ''}`}
              onClick={() => setShowTranscript(false)}
            >
              <Info size={16} />
              <span>Details</span>
            </button>
            
            <button 
              className={`tab-btn ${showTranscript ? 'active' : ''}`}
              onClick={() => setShowTranscript(true)}
            >
              <MessageSquare size={16} />
              <span>Transcript</span>
            </button>
          </div>
          
          <div className="video-content-panel">
            {!showTranscript ? (
              <div className="video-details">
                <div className="video-description">
                  <p>{videoMetadata.description}</p>
                </div>
                
                <div className="video-tags">
                  {videoMetadata.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="video-notes">
                  <h3>Notes</h3>
                  <textarea 
                    placeholder="Add your notes about this recording..."
                    rows={4}
                  ></textarea>
                  <motion.button 
                    className="save-notes-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Notes
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="video-transcript">
                <div className="transcript-search">
                  <input type="text" placeholder="Search in transcript..." />
                </div>
                
                <div className="transcript-content">
                  <div className="transcript-line">
                    <span className="timestamp">00:00</span>
                    <p>Hello everyone, and welcome to our quarterly product strategy discussion.</p>
                  </div>
                  <div className="transcript-line">
                    <span className="timestamp">00:08</span>
                    <p>Today we will be covering our roadmap for the next six months.</p>
                  </div>
                  <div className="transcript-line">
                    <span className="timestamp">00:15</span>
                    <p>Lets start by reviewing our progress on the current initiatives.</p>
                  </div>
                  <div className="transcript-line">
                    <span className="timestamp">00:23</span>
                    <p>As you can see from the slides, weve completed 80% of our planned features for this quarter.</p>
                  </div>
                  <div className="transcript-line">
                    <span className="timestamp">00:35</span>
                    <p>The user feedback has been overwhelmingly positive, especially for the new dashboard interface.</p>
                  </div>
                  <div className="transcript-line">
                    <span className="timestamp">00:48</span>
                    <p>Now, lets discuss the challenges were facing with the mobile application.</p>
                  </div>
                  <div className="transcript-line">
                    <span className="timestamp">01:02</span>
                    <p>Sarah, would you like to share your insights on the user testing results?</p>
                  </div>
                  {/* More transcript lines would go here */}
                </div>
                
                <div className="transcript-download">
                  <motion.button 
                    className="download-transcript-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download size={16} />
                    <span>Download Full Transcript</span>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="keyboard-shortcuts-info">
        <h3>Keyboard Shortcuts</h3>
        <div className="shortcuts-grid">
          <div className="shortcut">
            <span className="key">Space</span>
            <span className="description">Play/Pause</span>
          </div>
          <div className="shortcut">
            <span className="key">←</span>
            <span className="description">Rewind 10s</span>
          </div>
          <div className="shortcut">
            <span className="key">→</span>
            <span className="description">Forward 10s</span>
          </div>
          <div className="shortcut">
            <span className="key">M</span>
            <span className="description">Mute/Unmute</span>
          </div>
          <div className="shortcut">
            <span className="key">F</span>
            <span className="description">Fullscreen</span>
          </div>
          <div className="shortcut">
            <span className="key">P</span>
            <span className="description">Picture-in-Picture</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;