import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <h1 className="contact-heading">Contact Us</h1>
      <div className="contact-content">
        {/* Left Section: Contact Details */}
        <div className="footer-contact">
          <h2>Get in Touch</h2>
          <p><strong>Email:</strong> <a href="mailto:prashant@samsanlabs.com">prashant@samsanlabs.com</a></p>
          <p><strong>Email:</strong> <a href="mailto:test@gmail.com">test@gmail.com</a></p>
          <p><strong>Phone:</strong> +91 9876543210</p>
        </div>

        {/* Right Section: Address */}
        <div className="footer-address">
          <h2>Address</h2>
          <p>SAMSAN Technische Labs Pvt. Ltd</p>
          <p>#113, The Business Hub, Vandevi Corner,</p>
          <p>Karvenagar, Kothrud, Pune 411038 INDIA.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
