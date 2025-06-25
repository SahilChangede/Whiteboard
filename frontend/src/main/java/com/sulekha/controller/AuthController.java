package com.sulekha.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:5175",
    "http://localhost:5174",
    "http://192.168.1.63:5175"
})
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Your login logic here
        return ResponseEntity.ok().body(/* your response */);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // Your registration logic here
        return ResponseEntity.ok().body(/* your response */);
    }

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest otpRequest) {
        // Your OTP sending logic here
        return ResponseEntity.ok().body(/* your response */);
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest verificationRequest) {
        // Your OTP verification logic here
        return ResponseEntity.ok().body(/* your response */);
    }
} 