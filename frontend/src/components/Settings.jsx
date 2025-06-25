import React, { useState, useEffect } from "react";
import "../index.css";
import "./Settings.css";
import { useNavigate } from "react-router-dom";
import ct from "countries-and-timezones";
import moment from "moment-timezone";

import SupportOverview from "./CustomerSupport/SupportOverview"; // at the top



const Settings = () => {
  const navigate = useNavigate();

  const sections = [
    "Personal Details",
    "Address Details",
    "App Settings",
    "Language Preferences",
    "Account Sync",
    "Settings",
    "Customer Support"
  ];

  const [selectedSection, setSelectedSection] = useState("Personal Details");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    profession: "",
    fatherName: "",
    residency: "",
    orgName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
    mapLink: "",
    theme: "",
    notifyEmail: false,
    notifySMS: false,
    timeZone: "",
    dateFormat: "DD/MM/YYYY",
    twoFA: false,
    autoLogout: false,
    storagePref: "cloud",
    cloudSyncEnabled: false,
    lastSynced: "",
    syncStatus: "",
    syncFrequency: "manual"
  });

  const [saved, setSaved] = useState(false);

  const applyTheme = (themeValue) => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");

    if (themeValue === "light") {
      html.classList.add("light");
    } else if (themeValue === "dark") {
      html.classList.add("dark");
    } else if (themeValue === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.classList.add(prefersDark ? "dark" : "light");
    }
  };

  const logoutUser = () => {
    localStorage.clear(); // or remove specific keys if needed
    navigate("/login");
  };
  
  useEffect(() => {
    let timeout;
  
    const resetTimer = () => {
      if (formData.autoLogout) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          alert("You have been logged out due to inactivity.");
          logoutUser();
        }, 60000); // 1 minute
      }
    };
  
    const activityEvents = ["mousemove", "keydown", "scroll", "click"];
  
    if (formData.autoLogout) {
      activityEvents.forEach((event) =>
        window.addEventListener(event, resetTimer)
      );
      resetTimer(); // Start the timer when enabled
    }
  
    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(timeout);
    };
  }, [formData.autoLogout]);
  
  

  const [timezones, setTimezones] = useState([]);

  useEffect(() => {
    const allTimezones = moment.tz.names().map(tz => {
      const country = Object.values(ct.getAllTimezones()).find(item => item.name === tz)?.country || "N/A";
        return {
          name: tz,
          country: country,
          localTime: moment().tz(tz).format("hh:mm A"),
        };
      });
    setTimezones(allTimezones);
  }, []);


  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userProfile"));
    if (storedData) {
      setFormData(storedData);
      if (storedData.theme) {
        applyTheme(storedData.theme);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.theme) {
      applyTheme(formData.theme);
    }
  }, [formData.theme]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(formData));
    applyTheme(formData.theme);
    setSaved(true);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear cache and cookies? This will reset your settings.")) {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
  
      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      });
  
      alert("Cache and cookies cleared. Reloading the page...");
      window.location.reload();
    }
  };

  const handleDownloadData = () => {
    const dataStr = JSON.stringify(formData, null, 2); // pretty JSON
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "my_settings_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  const handleCloudSyncToggle = () => {
  setCloudSyncEnabled((prev) => !prev);
  console.log("Cloud Sync Toggled:", !cloudSyncEnabled);
  };

    
  

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "Personal Details":
        return (
          <>
            <h2>Personal Details</h2>
            <div className="settings-details-grid">
              <div><strong>First Name</strong><input name="firstName" value={formData.firstName} onChange={handleChange} /></div>
              <div><strong>Last Name</strong><input name="lastName" value={formData.lastName} onChange={handleChange} /></div>
              <div><strong>Email</strong><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
              <div><strong>Mobile</strong><input name="mobile" value={formData.mobile} onChange={handleChange} /></div>
              <div><strong>Date of Birth</strong><input type="date" name="dob" value={formData.dob} onChange={handleChange} /></div>
              <div><strong>Gender</strong>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div><strong>Profession</strong><input name="profession" value={formData.profession} onChange={handleChange} /></div>
              <div><strong>Father’s Name</strong><input name="fatherName" value={formData.fatherName} onChange={handleChange} /></div>
              <div><strong>Residential Status</strong><input name="residency" value={formData.residency} onChange={handleChange} /></div>
              <div><strong>Organisation Name</strong><input name="orgName" value={formData.orgName} onChange={handleChange} /></div>
            </div>
          </>
        );
      case "Address Details":
        return (
          <>
            <h2>Address Details</h2>
            <div className="settings-details-grid">
              <div><strong>Organization</strong><input name="orgName" value={formData.orgName} onChange={handleChange} /></div>
              <div><strong>Street Address</strong><input name="address" value={formData.address} onChange={handleChange} /></div>
              <div><strong>City</strong><input name="city" value={formData.city} onChange={handleChange} /></div>
              <div><strong>State</strong><input name="state" value={formData.state} onChange={handleChange} /></div>
              <div><strong>Postal Code</strong><input name="pincode" value={formData.pincode} onChange={handleChange} /></div>
              <div><strong>Country</strong><input name="country" value={formData.country} onChange={handleChange} /></div>
              <div><strong>Phone</strong><input type="tel" name="phone" value={formData.phone} onChange={handleChange} /></div>
              <div><strong>Alternate Email</strong><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
              <div><strong>Map Link</strong><input type="url" name="mapLink" value={formData.mapLink} onChange={handleChange} /></div>
            </div>
            {formData.mapLink && (
              <div style={{ marginTop: "20px" }}>
                <strong>Map Preview</strong>
                <div style={{ marginTop: "10px" }}>
                  <iframe
                    src={formData.mapLink.replace("/maps", "/maps/embed")}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}
          </>
        );
      case "App Settings":
        return (
          <>
            <h2>App Settings</h2>
            <div className="settings-details-grid">
              <div>
                <strong>Theme Mode</strong>
                <select name="theme" value={formData.theme} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <strong>Notifications</strong><br />
                <label><input type="checkbox" name="notifyEmail" checked={formData.notifyEmail} onChange={handleChange} /> Email</label><br />
                <label><input type="checkbox" name="notifySMS" checked={formData.notifySMS} onChange={handleChange} /> SMS</label>
              </div>
              <div>
                <strong>Time Zone</strong>
                <select name="timeZone" value={formData.timeZone} onChange={handleChange}>
                  <option value="">Select Timezone</option>
                  {timezones.map((tz, index) => (
                    <option key={index} value={tz.name}>
                      {tz.name} ({tz.country}) - {tz.localTime}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <strong>Date Format</strong>
                <select name="dateFormat" value={formData.dateFormat} onChange={handleChange}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}><h3>Security</h3></div>
              <div><label><input type="checkbox" name="twoFA" checked={formData.twoFA} onChange={handleChange} /> Enable 2FA</label></div>
              <div><label><input type="checkbox" name="autoLogout" checked={formData.autoLogout} onChange={handleChange} /> Auto Logout</label></div>
              <div style={{ gridColumn: "1 / -1" }}><h3>Data & Storage</h3></div>
              <div>
                <strong>Storage</strong>
                <select name="storagePref" value={formData.storagePref} onChange={handleChange}>
                  <option value="local">Local</option>
                  <option value="cloud">Cloud</option>
                </select>
              </div>
              <div><button onClick={handleClearCache}>Clear Cache</button></div>
              <div><button onClick={handleDownloadData}>Download My Data</button></div>
            </div>
          </>
        );

        case "Account Sync":
          return (
           <>
            <h2>Account Sync</h2>
            <div className="settings-details-grid">
              <div>
                <strong>Cloud Sync</strong>
                <label style={{ display: "block", marginTop: "5px" }}>
                <input type="checkbox" checked={cloudSyncEnabled} onChange={handleCloudSyncToggle} />

                  Enable Cloud Sync
                </label>
              </div>

              <div>
                <strong>Last Synced</strong>
                <p>{formData.lastSynced || "Not yet synced"}</p>
              </div>

              <div>
                <strong>Sync Status</strong>
                <p>{formData.syncStatus || "Idle"}</p>
              </div>

              <div>
               <strong>Auto Sync Frequency</strong>
                <select
                  name="syncFrequency"
                  value={formData.syncFrequency || "manual"}
                  onChange={handleChange}
                >
                <option value="manual">Manual</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                </select>
              </div>

            
            </div>
           </>
          );

          case "Customer Support":
            return <SupportOverview />;

        
      default:
        return <p style={{ fontStyle: "italic", marginTop: "20px" }}>Coming soon...</p>;
    }
  };

  const handleManualSync = () => {
    setFormData(prev => ({
      ...prev,
      lastSynced: new Date().toLocaleString(),
      syncStatus: "Synced successfully"
    }));
  
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        syncStatus: "Idle"
      }));
    }, 3000); // Reset status after 3 seconds
  };
  

  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <h3 onClick={() => navigate("/dashboard")} className="settings-back-link">← Back to Home</h3>
        <ul className="settings-sidebar-menu">
          {sections.map(section => (
            <li
              key={section}
              onClick={() => setSelectedSection(section)}
              className={selectedSection === section ? "settings-active" : ""}
            >
              {section}
            </li>
          ))}
        </ul>
      </div>

      <div className="settings-details-panel">
        {renderSectionContent()}
        {["Personal Details", "Address Details", "App Settings", "Account Sync"].includes(selectedSection) && (
          <div style={{ marginTop: "20px" }}>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={handleSave}
            >
              Save Changes
            </button>
            {saved && <p className="text-green-600 mt-2">✔️ Changes saved locally!</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;