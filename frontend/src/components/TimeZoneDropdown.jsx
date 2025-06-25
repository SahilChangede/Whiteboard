// TimeZoneDropdown.jsx
import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import ct from 'countries-and-timezones';

const TimeZoneDropdown = () => {
  const [countryTimes, setCountryTimes] = useState([]);

  // Fetch all country timezones and initialize
  useEffect(() => {
    const countries = Object.values(ct.getAllCountries());

    const initialData = countries.map((country) => {
      const timezone = country.timezones[0]; // first timezone for that country
      return {
        name: country.name,
        timezone,
        time: moment().tz(timezone).format('HH:mm:ss'),
      };
    });

    setCountryTimes(initialData);

    // Update time every second
    const interval = setInterval(() => {
      setCountryTimes((prevData) =>
        prevData.map((entry) => ({
          ...entry,
          time: moment().tz(entry.timezone).format('HH:mm:ss'),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Select Time Zone</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {countryTimes.map((country, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>
            <strong>{country.name}</strong>: {country.time} ({country.timezone})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimeZoneDropdown;
