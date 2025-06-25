// Update BASE_URL to use a direct URL instead of process.env
const BASE_URL = 'http://192.168.1.63:8000';

export const sendOtp = async (contact, type) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: contact,
        type: type || 'LOGIN'
      }),
    });

    const text = await res.text();
    
    // Handle empty response
    if (!text.trim()) {
      console.error('Empty response from server');
      return {
        success: false,
        message: 'Server returned an empty response. Please try again.'
      };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON in sendOtp:', text);
      return {
        success: false,
        message: 'Invalid response from server. Please try again.'
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Failed to send OTP. Please try again.'
      };
    }

    return data;
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

export const verifyOtp = async (contact, otp, type) => {
  try {
    const endpoint = type === 'login' ? 'auth/login' : 'auth/verify-otp';
    const payload = type === 'login' 
      ? { 
          email: contact, 
          otp: otp,
          password: localStorage.getItem('tempPassword') || ''
        }
      : { 
          email: contact, 
          otp: otp
        };

    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    
    // Handle empty response
    if (!text.trim()) {
      console.error('Empty response from server');
      return {
        success: false,
        message: 'Server returned an empty response. Please try again.'
      };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON in verifyOtp:', text);
      return {
        success: false,
        message: 'Invalid response from server. Please try again.'
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Failed to verify OTP. Please try again.'
      };
    }

    // For login, store the JWT token
    if (type === 'login' && data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role || 'USER');
    }

    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};
