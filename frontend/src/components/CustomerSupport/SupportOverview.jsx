import React, { useState } from "react";
import "./SupportOverview.css";

const SupportOverview = () => {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQuery("");
    }, 3000); // Reset after showing success
  };

  return (
    <div className="support-container">
      <h2>Customer Support</h2>
      <p>If you’re facing any issues or need help, please fill out the form below and our team will get back to you.</p>

      <form onSubmit={handleSubmit} className="support-form">
        <label>
          Your Query:
          <textarea
            rows="5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your issue here..."
            required
          />
        </label>
        <button type="submit">Submit</button>
        {submitted && <p className="support-success">✅ Your query has been submitted!</p>}
      </form>

      <div className="support-info">
        <h4>Contact Info</h4>
        <p><strong>Email:</strong> support@sulekha.com</p>
        <p><strong>Phone:</strong> +91-9876543210</p>
        <p><strong>Hours:</strong> Mon–Fri, 9 AM to 6 PM IST</p>
      </div>
    </div>
  );
};

export default SupportOverview;
