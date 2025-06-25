"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { verifyOtp, sendOtp } from "../services/otpService"
import "./OTPVerification.css"

const OTPVerification = ({ contact, type, onVerified, onBack }) => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendTimer, setResendTimer] = useState(30)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef([])

  // Initialize refs for each input
  useEffect(() => {
    // Create an array of refs for each input
    inputRefs.current = Array(6)
      .fill(null)
      .map((_, i) => inputRefs.current[i] || React.createRef())

    // Focus on first input when component mounts
    setTimeout(() => {
      if (inputRefs.current[0] && inputRefs.current[0].focus) {
        inputRefs.current[0].focus()
      }
    }, 100)
  }, [])

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value.slice(-1) // Take only the last character if multiple are entered
    setOtpValues(newOtpValues)
    setError("")
    setSuccess("")

    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      if (inputRefs.current[index + 1] && inputRefs.current[index + 1].focus) {
        inputRefs.current[index + 1].focus()
        setActiveInput(index + 1)
      }
    }

    // Check if all inputs are filled to auto-submit
    const allFilled = newOtpValues.every((val) => val !== "")
    if (value && index === 5 && allFilled) {
      setTimeout(() => verifyOTP(), 300)
    }
  }

  // Handle key press
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      if (inputRefs.current[index - 1] && inputRefs.current[index - 1].focus) {
        inputRefs.current[index - 1].focus()
        setActiveInput(index - 1)
      }
    }

    // Handle arrow keys for better accessibility
    if (e.key === "ArrowLeft" && index > 0) {
      if (inputRefs.current[index - 1] && inputRefs.current[index - 1].focus) {
        inputRefs.current[index - 1].focus()
        setActiveInput(index - 1)
      }
    }
    if (e.key === "ArrowRight" && index < 5) {
      if (inputRefs.current[index + 1] && inputRefs.current[index + 1].focus) {
        inputRefs.current[index + 1].focus()
        setActiveInput(index + 1)
      }
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    // Check if pasted content is a number
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 6).split("")
      const newOtpValues = [...otpValues]

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtpValues[index] = digit
        }
      })

      setOtpValues(newOtpValues)

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtpValues.findIndex((val) => val === "")
      if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex] && inputRefs.current[nextEmptyIndex].focus) {
        inputRefs.current[nextEmptyIndex].focus()
        setActiveInput(nextEmptyIndex)
      } else if (digits.length < 6 && inputRefs.current[digits.length] && inputRefs.current[digits.length].focus) {
        inputRefs.current[digits.length].focus()
        setActiveInput(digits.length)
      } else if (inputRefs.current[5] && inputRefs.current[5].focus) {
        inputRefs.current[5].focus()
        setActiveInput(5)

        // Auto-submit if all digits are pasted
        if (newOtpValues.every((val) => val !== "")) {
          setTimeout(() => verifyOTP(), 300)
        }
      }
    }
  }

  const verifyOTP = async () => {
    const otpString = otpValues.join("")
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsVerifying(true)
    setError("")
    setSuccess("")

    try {
      // For login, we'll handle the verification in the parent component
      if (type === "login") {
        setSuccess("Verifying OTP...")
        // Pass the OTP to the parent component
        onVerified(otpString)
      } else {
        const res = await verifyOtp(contact, otpString, type)

        if (res.success) {
          setSuccess("OTP verified successfully!")
          onVerified(otpString)
        } else {
          setError(res.message || "Invalid OTP. Please try again.")
        }
      }
    } catch (err) {
      setError("Verification failed. Please try again later.")
    } finally {
      setIsVerifying(false)
    }
  }

  const resendOTP = async () => {
    if (resendTimer > 0) return

    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const response = await sendOtp(contact, type)

      if (response.success) {
        setResendTimer(30)
        setSuccess("OTP resent successfully!")
      } else {
        setError(response.message || "Failed to resend OTP. Try again later.")
      }
    } catch (err) {
      setError("Failed to resend OTP. Try again later.")
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    if (resendTimer === 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  return (
    <div className="otp-container">
      <div className="otp-lock-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
        </svg>
      </div>

      <h2 className="otp-title">Enter OTP Code</h2>
      <p className="otp-description">We have sent the verification code to {contact}</p>

      {error && <div className="otp-error">{error}</div>}
      {success && <div className="otp-success">{success}</div>}

      <div className="otp-inputs-wrapper">
        {otpValues.map((value, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : null}
            onFocus={() => setActiveInput(index)}
            className={`otp-input ${value ? "filled" : ""} ${activeInput === index ? "active" : ""}`}
            aria-label={`Digit ${index + 1} of OTP`}
          />
        ))}
      </div>

      <button onClick={resendOTP} disabled={resendTimer > 0 || isResending} className="otp-resend-button" type="button">
        {isResending ? "Sending..." : resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
      </button>

      <button
        onClick={verifyOTP}
        disabled={isVerifying || otpValues.some((val) => val === "")}
        className="otp-verify-button"
        type="button"
      >
        {isVerifying ? "Verifying..." : "Verify Code"}
      </button>

      <button onClick={onBack} className="otp-back-button" type="button">
        Back to Login
      </button>
    </div>
  )
}

OTPVerification.propTypes = {
  contact: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onVerified: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}

export default OTPVerification
