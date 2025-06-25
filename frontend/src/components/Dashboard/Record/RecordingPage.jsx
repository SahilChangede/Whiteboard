import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, X, Check, Play, ArrowLeft, Video, Lock, CheckCircle, Trash2, Search, Filter, Download, Share2, Tag, BarChart2, FileText, Star, CalendarIcon, Grid, List, Sun, Moon, Info } from 'lucide-react';
import "./RecordingPage.css";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

// Sample data - in a real app, this would come from an API
const recordingsData = [
  { 
    id: 1, 
    date: "2025-05-06", 
    timeRange: "02:00 - 04:00", 
    title: "Night Session", 
    url: "/videos/new.mp4", 
    thumbnail: "/placeholder.svg?height=80&width=120",
    duration: "2h 00m",
    category: "Meeting",
    views: 12,
    starred: true
  },
  { 
    id: 2, 
    date: "2025-05-06", 
    timeRange: "05:00 - 08:00", 
    title: "Morning Brief", 
    url: "/videos/new.mp4", 
    thumbnail: "/placeholder.svg?height=80&width=120",
    duration: "3h 00m",
    category: "Presentation",
    views: 8,
    starred: false
  },
  { 
    id: 3, 
    date: "2025-05-06", 
    timeRange: "22:00 - 23:00", 
    title: "Evening Recap", 
    url: "/videos/new.mp4", 
    thumbnail: "/placeholder.svg?height=80&width=120",
    duration: "1h 00m",
    category: "Meeting",
    views: 5,
    starred: false
  },
  { 
    id: 4, 
    date: "2025-05-05", 
    timeRange: "10:00 - 11:00", 
    title: "Daily Standup", 
    url: "/videos/new.mp4", 
    thumbnail: "/placeholder.svg?height=80&width=120",
    duration: "1h 00m",
    category: "Meeting",
    views: 15,
    starred: true
  },
  { 
    id: 5, 
    date: "2025-05-01", 
    timeRange: "09:00 - 10:00", 
    title: "Monthly Kickoff", 
    url: "/videos/new1.mp4", 
    thumbnail: "/placeholder.svg?height=80&width=120",
    duration: "1h 00m",
    category: "Presentation",
    views: 23,
    starred: false
  },
];

// Categories for recordings
const categories = ["All", "Meeting", "Presentation", "Training", "Interview", "Other"];

const RecordingPage = () => {
  const navigate = useNavigate();
  const [todoTasks, setTodoTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showRecordingTable, setShowRecordingTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [calendarView, setCalendarView] = useState("month"); // month, week, day
  const [showRecordingInfo, setShowRecordingInfo] = useState(false);
  const [recordingNotes, setRecordingNotes] = useState("");
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
    setTodoTasks(storedTasks);
    
    // Show recordings by default if there are any for the selected date
    const hasRecordings = recordingsData.some(
      rec => rec.date === selectedDate.toISOString().split("T")[0]
    );
    if (hasRecordings) {
      setShowRecordingTable(true);
    }
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
  }, [todoTasks]);

  const toggleTodo = (id) => {
    setTodoTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const deleteTodo = (id) => {
    setTodoTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        done: false,
        date: selectedDate.toISOString().split("T")[0],
      };
      setTodoTasks([...todoTasks, newTask]);
      setNewTaskText("");
      setIsAddingTask(false);
    }
  };

  const getMonthName = (month) =>
    ["January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"][month];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const changeMonth = (dir) => {
    let newMonth = currentMonth + dir;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const totalDays = getDaysInMonth(currentMonth, currentYear);
    const daysArray = [];

    for (let i = 0; i < firstDay; i++) daysArray.push(null);
    for (let day = 1; day <= totalDays; day++) daysArray.push(day);
    return daysArray;
  };

  const filteredTasks = todoTasks.filter(
    (task) => task.date === selectedDate.toISOString().split("T")[0]
  );

  const getFilteredRecordings = () => {
    let filtered = recordingsData
      .filter((rec) => rec.date === selectedDate.toISOString().split("T")[0]);
    
    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rec => 
        rec.title.toLowerCase().includes(query) || 
        rec.category.toLowerCase().includes(query) ||
        rec.timeRange.toLowerCase().includes(query)
      );
    }
    
    // Sort by time
    filtered.sort((a, b) => {
      const getStartTime = (range) => parseInt(range.split(" - ")[0].replace(":", ""));
      return getStartTime(a.timeRange) - getStartTime(b.timeRange);
    });
    
    return filtered;
  };

  const recordingsForSelectedDate = getFilteredRecordings();

  const handleWatchRecording = () => {
    setShowRecordingTable(true);
  };

  const handlePlayRecording = (recording) => {
    setSelectedRecording(recording);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || !selectedRecording) return;

    setLoading(true);
    try {
      // In a real app, this would be an actual API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, any password works
      navigate("/video", { state: { videoUrl: selectedRecording.url } });
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
      setIsPasswordModalOpen(false);
      setPassword("");
    }
  };

  const hasRecordingsOnDate = (date) => {
    let dateObj = null;
    if (date instanceof Date && !isNaN(date)) {
      dateObj = date;
    } else if (typeof date === 'number') {
      dateObj = new Date(currentYear, currentMonth, date);
    }
    if (!dateObj || isNaN(dateObj)) return false;
    const dateString = dateObj.toISOString().split("T")[0];
    return recordingsData.some(rec => rec.date === dateString);
  };

  const hasTasksOnDate = (date) => {
    let dateObj = null;
    if (date instanceof Date && !isNaN(date)) {
      dateObj = date;
    } else if (typeof date === 'number') {
      dateObj = new Date(currentYear, currentMonth, date);
    }
    if (!dateObj || isNaN(dateObj)) return false;
    const dateString = dateObj.toISOString().split("T")[0];
    return todoTasks.some(task => task.date === dateString);
  };

  const handleStarRecording = (id) => {
    // In a real app, this would update the database
    // For demo, we're just updating the local state
    const updatedRecordings = recordingsData.map(rec => 
      rec.id === id ? { ...rec, starred: !rec.starred } : rec
    );
    // This would normally be handled by a state update or API call
    console.log("Starred recording:", id);
  };

  const handleExportCalendar = () => {
    // In a real app, this would generate and download a calendar file
    alert("Calendar exported successfully!");
  };

  const handleShareRecording = (recording) => {
    // In a real app, this would open a share dialog
    alert(`Sharing recording: ${recording.title}`);
  };

  const handleDownloadRecording = (recording) => {
    // In a real app, this would download the recording
    alert(`Downloading recording: ${recording.title}`);
  };

  const handleViewRecordingInfo = (recording) => {
    setSelectedRecording(recording);
    setShowRecordingInfo(true);
    // In a real app, we would load notes from the database
    setRecordingNotes("These are sample notes for this recording. In a real application, these would be saved and loaded from a database.");
  };

  const handleSaveNotes = () => {
    // In a real app, this would save the notes to the database
    alert("Notes saved successfully!");
    setShowRecordingInfo(false);
  };

  const handleViewStats = () => {
    setShowStatsModal(true);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e) => {
    // Ctrl+F or Cmd+F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Helper to get start of week (Sunday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };
  // Helper to get all days in the week
  const getWeekDays = (date) => {
    const start = getStartOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  // Add week navigation
  const changeWeek = (dir) => {
    const current = getStartOfWeek(selectedDate);
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + dir * 7);
    setSelectedDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  return (
    <div className="recording-page-container">
      <motion.div 
        className="recording-page"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="recording-sidebar" variants={itemVariants}>
          <div className="sidebar-header">
            <motion.button 
              className="back-btn" 
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </motion.button>
          </div>

          <div className="calendar-header">
            <h2 className="month-title">{`${getMonthName(currentMonth)} ${currentYear}`}</h2>
            <div className="calendar-nav">
              <motion.button 
                onClick={() => changeMonth(-1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={18} />
              </motion.button>
              <motion.button 
                onClick={() => changeMonth(1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>

          <div className="calendar-view-selector">
            <button 
              className={calendarView === "month" ? "active" : ""} 
              onClick={() => setCalendarView("month")}
            >
              <CalendarIcon size={14} />
              <span>Month</span>
            </button>
          </div>

          <div className="calendar-wrapper">
            {calendarView === "month" && (
              <table className="calendar-month">
                <thead>
                  <tr>{weekdays.map((day) => <th key={day}>{day}</th>)}</tr>
                </thead>
                <tbody>
                  {(() => {
                    const days = generateCalendarDays();
                    return Array.from({ length: Math.ceil(days.length / 7) }).map((_, rowIdx) => (
                      <tr key={rowIdx}>
                        {Array.from({ length: 7 }).map((_, colIdx) => {
                          const idx = rowIdx * 7 + colIdx;
                          const day = days[idx];
                          const isSelected =
                            day &&
                            day === selectedDate.getDate() &&
                            currentMonth === selectedDate.getMonth() &&
                            currentYear === selectedDate.getFullYear();
                          
                          const hasRecordings = day && hasRecordingsOnDate(day);
                          const hasTasks = day && hasTasksOnDate(day);
                          
                          return (
                            <td
                              key={colIdx}
                              className={
                                `${isSelected ? "selected" : ""} ` +
                                `${hasRecordings ? "has-recording" : ""} ` +
                                `${hasTasks ? "has-task" : ""} ` +
                                `${day ? "" : "empty-day"}`
                              }
                              onClick={() => {
                                if (day) {
                                  setSelectedDate(new Date(currentYear, currentMonth, day));
                                }
                              }}
                            >
                              {day ? (
                                <div className="calendar-day">
                                  <span className="day-number">{day}</span>
                                  {hasRecordings && <div className="recording-indicator"></div>}
                                  {hasTasks && <div className="task-indicator"></div>}
                                </div>
                              ) : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}
            {calendarView === "week" && (
              <div className="calendar-week-view">
                <div className="week-nav">
                  <button onClick={() => changeWeek(-1)}>&lt;</button>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {getWeekDays(selectedDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {" - "}
                    {getWeekDays(selectedDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => changeWeek(1)}>&gt;</button>
                </div>
                <table className="calendar-week">
                  <thead>
                    <tr>{weekdays.map((day) => <th key={day}>{day}</th>)}</tr>
                  </thead>
                  <tbody>
                    <tr>
                      {getWeekDays(selectedDate).map((dateObj, idx) => {
                        const isSelected =
                          dateObj.getDate() === selectedDate.getDate() &&
                          dateObj.getMonth() === selectedDate.getMonth() &&
                          dateObj.getFullYear() === selectedDate.getFullYear();
                        const hasRecordings = hasRecordingsOnDate(dateObj);
                        const hasTasks = hasTasksOnDate(dateObj);
                        return (
                          <td
                            key={idx}
                            className={
                              `${isSelected ? "selected" : ""} ` +
                              `${hasRecordings ? "has-recording" : ""} ` +
                              `${hasTasks ? "has-task" : ""}`
                            }
                            onClick={() => setSelectedDate(new Date(dateObj))}
                          >
                            <div className="calendar-day">
                              <span className="day-number">{dateObj.getDate()}</span>
                              {hasRecordings && <div className="recording-indicator"></div>}
                              {hasTasks && <div className="task-indicator"></div>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="sidebar-actions">
            <motion.button 
              className="action-button"
              onClick={handleExportCalendar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              <span>Export Calendar</span>
            </motion.button>
            <motion.button 
              className="action-button"
              onClick={handleViewStats}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart2 size={16} />
              <span>View Statistics</span>
            </motion.button>
          </div>

          <div className="todo-section">
            <div className="section-header">
              <h3>
                <Calendar size={16} />
                <span>Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </h3>
              <motion.button 
                className="add-task-btn"
                onClick={() => setIsAddingTask(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isAddingTask}
              >
                <Plus size={16} />
              </motion.button>
            </div>

            <AnimatePresence>
              {isAddingTask && (
                <motion.form 
                  className="add-task-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={addTodo}
                >
                  <input
                    type="text"
                    placeholder="Enter task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    autoFocus
                  />
                  <div className="form-actions">
                    <motion.button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTaskText("");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      type="submit" 
                      className="save-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add Task
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="task-list">
              {filteredTasks.length > 0 ? (
                <AnimatePresence>
                  {filteredTasks.map((task) => (
                    <motion.div 
                      key={task.id} 
                      className={`task-item ${task.done ? "completed" : ""}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      layout
                    >
                      <div className="task-content">
                        <motion.button 
                          className="task-checkbox"
                          onClick={() => toggleTodo(task.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {task.done ? <Check size={14} /> : null}
                        </motion.button>
                        <span className="task-text">{task.text}</span>
                      </div>
                      <motion.button 
                        className="delete-task"
                        onClick={() => deleteTodo(task.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="no-tasks">
                  <p>No tasks for this day</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div className="recording-content" variants={itemVariants}>
          <div className="content-header">
            <h1>
              <Video size={24} />
              <span>Recordings</span>
            </h1>
            <div className="date-display">
              <span className="selected-date">{selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          <div className="search-filter-container">
            <div className={`search-box ${isSearchFocused ? 'focused' : ''}`}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search recordings... (Ctrl+F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                ref={searchInputRef}
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filter-container">
              <div className="category-filter">
                <Filter size={18} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="view-toggle">
                <button 
                  className={viewMode === "grid" ? "active" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={viewMode === "list" ? "active" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="time-selector">
            <div className="time-label">
              <Clock size={18} />
              <span>Select Time:</span>
            </div>
            <select
              id="timePicker"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="time-dropdown"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <motion.button 
              className="watch-btn"
              onClick={handleWatchRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={18} />
              <span>Watch Recording</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showRecordingTable && (
              <motion.div 
                className="recordings-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h2>Available Recordings</h2>
                
                {recordingsForSelectedDate.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="recordings-grid">
                      {recordingsForSelectedDate.map((rec) => (
                        <motion.div 
                          key={rec.id} 
                          className="recording-card"
                          whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                        >
                          <div className="recording-thumbnail">
                            <img src={rec.thumbnail || "/placeholder.svg"} alt={rec.title} />
                            <div className="recording-duration">{rec.duration}</div>
                            <motion.button 
                              className="play-button"
                              onClick={() => handlePlayRecording(rec)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play size={24} />
                            </motion.button>
                            <motion.button 
                              className={`star-button ${rec.starred ? 'starred' : ''}`}
                              onClick={() => handleStarRecording(rec.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Star size={16} />
                            </motion.button>
                          </div>
                          <div className="recording-info">
                            <h3>{rec.title}</h3>
                            <div className="recording-meta">
                              <span className="time-range">{rec.timeRange}</span>
                              <span className="category-tag">{rec.category}</span>
                            </div>
                            <div className="recording-actions">
                              <motion.button 
                                onClick={() => handleViewRecordingInfo(rec)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="View Details"
                              >
                                <Info size={16} />
                              </motion.button>
                              <motion.button 
                                onClick={() => handleShareRecording(rec)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Share"
                              >
                                <Share2 size={16} />
                              </motion.button>
                              <motion.button 
                                onClick={() => handleDownloadRecording(rec)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Download"
                              >
                                <Download size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="recordings-list">
                      {recordingsForSelectedDate.map((rec) => (
                        <motion.div 
                          key={rec.id} 
                          className="recording-list-item"
                        >
                          <div className="list-item-thumbnail">
                            <img src={rec.thumbnail || "/placeholder.svg"} alt={rec.title} />
                            <div className="recording-duration">{rec.duration}</div>
                          </div>
                          <div className="list-item-content">
                            <div className="list-item-header">
                              <h3>{rec.title}</h3>
                              <motion.button 
                                className={`star-button ${rec.starred ? 'starred' : ''}`}
                                onClick={() => handleStarRecording(rec.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Star size={16} />
                              </motion.button>
                            </div>
                            <div className="list-item-meta">
                              <span className="time-range">{rec.timeRange}</span>
                              <span className="category-tag">{rec.category}</span>
                              <span className="views-count">{rec.views} views</span>
                            </div>
                          </div>
                          <div className="list-item-actions">
                            <motion.button 
                              className="play-list-button"
                              onClick={() => handlePlayRecording(rec)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Play size={16} />
                              <span>Play</span>
                            </motion.button>
                            <motion.button 
                              onClick={() => handleViewRecordingInfo(rec)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                            >
                              <Info size={16} />
                            </motion.button>
                            <motion.button 
                              onClick={() => handleShareRecording(rec)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Share"
                            >
                              <Share2 size={16} />
                            </motion.button>
                            <motion.button 
                              onClick={() => handleDownloadRecording(rec)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Download"
                            >
                              <Download size={16} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="no-recordings">
                    <div className="empty-state">
                      <Video size={48} />
                      <p>No recordings available for this date</p>
                      <p className="suggestion">Try selecting a different date or time</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="password-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>
                  <Lock size={18} />
                  <span>Enter Password</span>
                </h3>
                <motion.button 
                  className="close-modal"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPassword("");
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              <p className="modal-info">
                This recording is password protected. Please enter the password to continue.
              </p>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="password-input">
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="modal-actions">
                  <motion.button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setPassword("");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Watch</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Info Modal */}
      <AnimatePresence>
        {showRecordingInfo && selectedRecording && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="info-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>
                  <FileText size={18} />
                  <span>Recording Details</span>
                </h3>
                <motion.button 
                  className="close-modal"
                  onClick={() => setShowRecordingInfo(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              <div className="info-content">
                <div className="info-thumbnail">
                  <img src={selectedRecording.thumbnail || "/placeholder.svg"} alt={selectedRecording.title} />
                </div>
                
                <div className="info-details">
                  <h2>{selectedRecording.title}</h2>
                  
                  <div className="info-meta">
                    <div className="info-item">
                      <strong>Date:</strong> 
                      <span>{new Date(selectedRecording.date).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <strong>Time:</strong> 
                      <span>{selectedRecording.timeRange}</span>
                    </div>
                    <div className="info-item">
                      <strong>Duration:</strong> 
                      <span>{selectedRecording.duration}</span>
                    </div>
                    <div className="info-item">
                      <strong>Category:</strong> 
                      <span>{selectedRecording.category}</span>
                    </div>
                    <div className="info-item">
                      <strong>Views:</strong> 
                      <span>{selectedRecording.views}</span>
                    </div>
                  </div>
                  
                  <div className="notes-section">
                    <h4>Notes</h4>
                    <textarea
                      value={recordingNotes}
                      onChange={(e) => setRecordingNotes(e.target.value)}
                      placeholder="Add notes about this recording..."
                      rows={5}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <motion.button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowRecordingInfo(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  type="button" 
                  className="submit-btn"
                  onClick={handleSaveNotes}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Notes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="stats-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>
                  <BarChart2 size={18} />
                  <span>Recording Statistics</span>
                </h3>
                <motion.button 
                  className="close-modal"
                  onClick={() => setShowStatsModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
              
              <div className="stats-content">
                <div className="stats-summary">
                  <div className="stat-card">
                    <h4>Total Recordings</h4>
                    <div className="stat-value">{recordingsData.length}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Total Duration</h4>
                    <div className="stat-value">8h 00m</div>
                  </div>
                  <div className="stat-card">
                    <h4>Total Views</h4>
                    <div className="stat-value">63</div>
                  </div>
                </div>
                
                <div className="stats-charts">
                  <div className="chart-container">
                    <h4>Recordings by Category</h4>
                    <div className="chart-placeholder">
                      <div className="chart-bar" style={{ height: '60%', backgroundColor: '#f43f5e' }}>
                        <span className="bar-label">Meeting</span>
                      </div>
                      <div className="chart-bar" style={{ height: '40%', backgroundColor: '#3b82f6' }}>
                        <span className="bar-label">Presentation</span>
                      </div>
                      <div className="chart-bar" style={{ height: '20%', backgroundColor: '#10b981' }}>
                        <span className="bar-label">Training</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    <h4>Most Viewed Recordings</h4>
                    <ul className="top-recordings">
                      <li>
                        <span className="recording-name">Monthly Kickoff</span>
                        <span className="recording-views">23 views</span>
                      </li>
                      <li>
                        <span className="recording-name">Daily Standup</span>
                        <span className="recording-views">15 views</span>
                      </li>
                      <li>
                        <span className="recording-name">Night Session</span>
                        <span className="recording-views">12 views</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions center">
                <motion.button 
                  type="button" 
                  className="submit-btn"
                  onClick={() => setShowStatsModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordingPage;