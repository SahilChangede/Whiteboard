"use client"

import { useEffect, useState, useRef } from "react"
import "./LandingPage.css"
import "./responsive.css"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaBars, FaTimes } from 'react-icons/fa'

// Import actual images from assets
import logo from "../assets/Sulekha.ai1.png"
import rightImage from "../assets/landingpage.png"
import landingPage1 from "../assets/landingpage1.jpg"
import landingPage2 from "../assets/landingpage2.jpg"
// Removed unused imports: windowsLogo, appleLogo, androidLogo
import support1 from "../assets/support1.png"
import support2 from "../assets/support2.png"
import support3 from "../assets/support3.png"
import samsanLogo from "../assets/samsan.jpg"

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("overview")
  const [faqOpen, setFaqOpen] = useState(null)
  const [allExpanded, setAllExpanded] = useState(false)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Use actual images from assets
  const images = [rightImage, landingPage1, landingPage2]

  // Refs for sections - Updated to reflect removed sections
  const sectionRefs = {
    overview: useRef(null),
    features: useRef(null),
    support: useRef(null),
    faq: useRef(null),
    contact: useRef(null),
  }

  // Toggle dark mode


  // Image rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000) // Increased time for better user experience
    return () => clearInterval(interval)
  }, [images.length])

  // Scroll handling for header visibility and section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY

      // Header visibility
      if (scrollTop > 100) {
        setIsHeaderVisible(scrollTop <= lastScrollTop)
      } else {
        setIsHeaderVisible(true)
      }
      setLastScrollTop(Math.max(scrollTop, 0))

      // Active section highlight on scroll
      const sectionIds = Object.keys(sectionRefs)
      for (const id of sectionIds) {
        const el = sectionRefs[id]?.current
        if (el) {
          const rect = el.getBoundingClientRect()
          // Only update active section when element is substantially in view
          if (rect.top <= 150 && rect.bottom >= 300) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollTop])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleButtonClick = (sectionId) => {
    setActiveSection(sectionId)
    sectionRefs[sectionId]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    setIsMenuOpen(false)
  }

  const toggleFaq = (index) => {
    setFaqOpen((prev) => (prev === index ? null : index))
  }

  const toggleAllFaqs = () => {
    setAllExpanded(!allExpanded)
    setFaqOpen(allExpanded ? null : -1)
  }

  const faqData = [
    {
      question: "What is a digital whiteboard?",
      answer:
        "A digital whiteboard is an app that functions like a traditional whiteboard but is hosted virtually. It provides a collaborative space for teams to brainstorm, plan, and visualize ideas in real-time, regardless of physical location.",
    },
    {
      question: "What are the benefits of a digital whiteboard?",
      answer:
        "Digital whiteboards help teams collaborate in real-time, save work, and share ideas efficiently. They enable seamless audio recording alongside visual content, support remote collaboration, and provide persistent storage of all your work for future reference.",
    },
    {
      question: "How can a whiteboard help with productivity?",
      answer:
        "It allows brainstorming, task organization, and real-time communication among team members. Digital whiteboards eliminate the need for physical meeting spaces, reduce meeting times, and provide tools for better visualization of complex ideas and workflows.",
    },
    {
      question: "What are some tips for writing and drawing on a digital whiteboard?",
      answer:
        "Use a stylus for better accuracy, organize ideas with colors, and save versions for future reference. Take advantage of templates for common workflows, use the grid feature for alignment, and utilize shapes and connectors for clearer diagrams.",
    },
    {
      question: "Is Sulekha.AI suitable for educational institutions?",
      answer:
        "Sulekha.AI is designed with both corporate and educational environments in mind. It offers specialized templates for lesson planning, student collaboration, and interactive learning activities. Many educators find it enhances student engagement and facilitates better understanding of complex concepts through visual learning.",
    },
  ]

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="landing-page-wrapper">
      {/* Header */}
      <header className={`header ${isHeaderVisible ? "" : "hidden"}`}>
        <div className="header-content">
          <div className="logo-container">
          <img src={logo || "/placeholder.svg"} alt="Sulekha.AI Logo" className="logo-image" />
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {["overview", "features", "faq", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => handleButtonClick(section)}
                className={`nav-button ${activeSection === section ? "active" : ""}`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </nav>

          <div className="right-header">
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Desktop Auth Buttons */}
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/signup" className="signup-button">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-nav-content">
                {["overview", "features", "faq", "contact"].map((section) => (
                  <button
                    key={section}
                    onClick={() => handleButtonClick(section)}
                    className={`mobile-nav-button ${activeSection === section ? "active" : ""}`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
                <Link to="/login" className="mobile-login-button">
                  Login
                </Link>
                <Link to="/signup" className="mobile-signup-button">
                  Sign Up
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="page-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <motion.div 
              className="hero-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="hero-badge animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                ✨ Welcome to the Future of Digital Collaboration
              </motion.span>

              <motion.h1 
                className="hero-title animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Transform Your Digital Workspace
              </motion.h1>

              <motion.p 
                className="hero-description animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Experience seamless collaboration with our innovative digital whiteboard solution. 
                Connect, create, and collaborate in real-time from anywhere in the world.
              </motion.p>

              <motion.div 
                className="hero-buttons animate-fadeInUp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Link to="/login" className="primary-button">
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
                <Link to="/contact" className="secondary-button">
                  Learn More
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="hero-image-container animate-scaleIn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <img 
                src={images[currentImage]} 
                alt="Digital Workspace" 
                className="hero-image"
              />
            </motion.div>
          </div>
        </section>

        
        {/* Features Section */}
        <section id="features" ref={sectionRefs.features} className="features-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="section-title">Everything You Need in One Place</h2>
              <p className="section-subtitle">
                Discover the tools that make Sulekha.AI the preferred choice for teams worldwide
              </p>
            </motion.div>

            <div className="feature-blocks">
              <motion.div
                className="feature-block"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="feature-content">
                  <h3>Smart Drawing Recognition</h3>
                  <p>
                    Our AI automatically recognizes and enhances your sketches, turning rough drawings into professional
                    diagrams and shapes with a single click.
                  </p>
                  <ul className="feature-list">
                    <li>Automatic shape recognition</li>
                    <li>Handwriting to text conversion</li>
                    <li>Smart diagram suggestions</li>
                  </ul>
                </div>
                <div className="feature-image">
                  <img src={landingPage1 || "/placeholder.svg"} alt="Smart Drawing Recognition" />
                </div>
              </motion.div>

              <motion.div
                className="feature-block reverse"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="feature-image">
                  <img src={landingPage2 || "/placeholder.svg"} alt="Real-time Collaboration" />
                </div>
                <div className="feature-content">
                  <h3>Real-time Collaboration</h3>
                  <p>
                    Work together with your team in real-time, no matter where they are located. See changes instantly
                    and collaborate as if you're in the same room.
                  </p>
                  <ul className="feature-list">
                    <li>Unlimited collaborators</li>
                    <li>Live cursor tracking</li>
                    <li>Instant updates across devices</li>
                  </ul>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

  
            

        {/* FAQ Section */}
        <section id="faq" ref={sectionRefs.faq} className="faq-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="section-title">Frequently Asked Questions</h2>
            </motion.div>

            <motion.div
              className="faq-controls"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <button className="faq-toggle-all" onClick={toggleAllFaqs}>
                {allExpanded ? "Collapse All" : "Expand All"}
              </button>
            </motion.div>

            <div className="faq-container">
              {faqData.map((item, index) => (
                <motion.div
                  key={index}
                  className={`faq-item ${allExpanded || faqOpen === index ? "open" : ""}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <button className="faq-question" onClick={() => toggleFaq(index)}>
                    <div className="faq-question-content">
                      <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="faq-question-text">{item.question}</span>
                    </div>
                    {allExpanded || faqOpen === index ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="faq-icon"
                      >
                        <line x1="18" y1="12" x2="6" y2="12"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="faq-icon"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    )}
                  </button>

                  <AnimatePresence>
                    {(allExpanded || faqOpen === index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="faq-answer-container"
                      >
                        <div className="faq-answer">{item.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={sectionRefs.contact} id="contact" className="contact-section">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="contact-container"
          >
            <div className="contact-header">
              <motion.span variants={fadeInUp} className="section-badge">Get in Touch</motion.span>
              <motion.h2 variants={fadeInUp} className="contact-main-title">
                Let's Start a Conversation
              </motion.h2>
              <motion.p variants={fadeInUp} className="section-description">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </motion.p>
            </div>

            <div className="contact-three-column">
              {/* Contact Information Column */}
              <motion.div variants={fadeInRight} className="contact-info-column">
                <h3 className="contact-title">Contact Information</h3>
                <div className="contact-details">
                  <div className="contact-detail-item">
                    <div className="contact-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="contact-info-content">
                      <span className="contact-label">Visit us</span>
                      <div className="address-content">
                        <span className="address-line">123 Innovation Drive</span>
                        <span className="address-line">Tech Hub, Floor 4</span>
                        <span className="address-line">Silicon Valley, CA 94025</span>
                      </div>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <div className="contact-icon">
                      <FaPhone />
                    </div>
                    <div className="contact-info-content">
                      <span className="contact-label">Call us</span>
                      <a href="tel:+1234567890" className="contact-value">
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <div className="contact-icon">
                      <FaEnvelope />
                    </div>
                    <div className="contact-info-content">
                      <span className="contact-label">Email us</span>
                      <a href="mailto:contact@sulekha.ai" className="contact-value">
                        contact@sulekha.ai
                      </a>
                    </div>
                  </div>
                </div>

                <div className="social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaLinkedin />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaTwitter />
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaGithub />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaInstagram />
                  </a>
                </div>
              </motion.div>

              {/* Contact Form Column */}
              <motion.div variants={fadeInUp} className="contact-form-column">
                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" placeholder="john@example.com" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input type="text" id="subject" placeholder="How can we help?" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows="5" placeholder="Your message here..." required></textarea>
                  </div>
                  <button type="submit" className="submit-button">
                    Send Message
                  </button>
                </form>
              </motion.div>

              {/* Map Column */}
              <motion.div variants={fadeInRight} className="map-column">
                <div className="map-container">
                  <div className="map-placeholder">
                    <div className="map-icon">
                      <FaMapMarkerAlt />
                    </div>
                    <p>Interactive Map</p>
                    <span>Click to view location</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
