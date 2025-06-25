import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import axios from "axios";
import countryData from "../assets/countryData.json";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [firstName, setFirstName] = useState("Arafat Ahmed");
  const [lastName, setLastName] = useState("Chowdhury");
  const [phoneNumber, setPhoneNumber] = useState("123 4567 890");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [selectedCountry, setSelectedCountry] = useState(countryData[0]);
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "");
  const [timezones, setTimezones] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch timezones using a free API
  useEffect(() => {
    axios.get("https://worldtimeapi.org/api/timezone")
      .then(response => {
        if (response.data) {
          setTimezones(response.data);
        }
      })
      .catch(error => console.error("Error fetching timezones:", error));
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        setProfileImage(base64Image);
        localStorage.setItem("profileImage", base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleSaveChanges = () => {
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("phoneNumber", phoneNumber);
    localStorage.setItem("timezone", timezone);

    alert("Profile Updated Successfully!");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture" onClick={handleClick}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-placeholder">+</div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <label className="upload-btn">Upload Image</label>
      </div>

      <div className="profile-content">
        <h2>Contact Details</h2>
        <div className="profile-form">
          <div className="input-group">
            <label>First Name</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>Last Name</label>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
            />
          </div>
          <div className="input-group phone-group">
            <label>Phone Number</label>
            <div className="phone-input">
              <select
                className="country-code"
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countryData.find(c => c.code === e.target.value);
                  setSelectedCountry(country);
                }}
              >
                {countryData.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.dial_code}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                className="phone-number"
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <div className="input-group">
            <label>Timezone</label>
            <select 
              value={timezone} 
              onChange={(e) => setTimezone(e.target.value)}
            >
              {timezones.length > 0 ? (
                timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))
              ) : (
                <option>Loading timezones...</option>
              )}
            </select>
          </div>
        </div>
        <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;
