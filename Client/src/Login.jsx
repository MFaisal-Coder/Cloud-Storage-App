import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Auth.css";
import loginWithGoogleApi from "./apis/loginWithGoogleApi.js";
import DOMPurify from 'dompurify';

const Login = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL; // Use the environment variable for the backend URL

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // serverError will hold the error message from the server
  const [serverError, setServerError] = useState("");

  // OTP state variables
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedName = DOMPurify.sanitize(name)
    const sanitizedValue = DOMPurify.sanitize(value)
    // Clear the server error as soon as the user starts typing in either field
    if (serverError) {
      setServerError("");
      setOtpError("");
      setIsOtpVerified(false);
      setIsOtpSent(false);
      setCountdown(0);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [sanitizedName]: sanitizedValue,
    }));
  };

  // Handler for sending OTP
  const sendOtp = async () => {
    const { email } = formData;
    if (!email) {
      setOtpError("Please enter an Email before sending the OTP.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setOtpError("");
        setCountdown(60);
        setIsOtpSent(true);
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setOtpError("Something went wrong sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handler for verifying OTP
  const verifyOtp = async () => {
    const { email } = formData;
    if (!otp) {
      setOtpError("Please enter OTP.");
      return;
    }
    try {
      setIsVerifying(true);
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      console.log(res);
      if (res.ok) {
        setOtpError("");
        setIsOtpVerified(true);
      } else {
        setOtpError(data.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong verifying OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.error) {
        // If there's an error, set the serverError message
        setServerError(data.error);
      } else {
        // On success, navigate to home or any other protected route
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      setServerError("Something went wrong. Please try again.");
    }
  };

  // If there's an error, we'll add "input-error" class to both fields
  const hasError = Boolean(serverError);

  return (
    <div className="container">
      <h2 className="heading">Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            className={`input ${hasError ? "input-error" : ""}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            className={`input ${hasError ? "input-error" : ""}`}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          {/* Absolutely-positioned error message below password field */}
          {serverError && <span className="error-msg">{serverError}</span>}
        </div>

        <label className="label" htmlFor="otp-input">
          Enter OTP
        </label>
        <div className="login-otp-wrapper">
          <input
            className="login-verify-otp"
            id="otp-input"
            type="text"
            placeholder="Enter 4-digit OTP"
            onChange={(e) => setOtp(DOMPurify.sanitize(e.target.value))}
          />

          {!isOtpSent && (
            <button
              type="button"
              disabled={countdown > 0 || isSendingOtp}
              className="send-otp-button"
              onClick={sendOtp}
            >
              {isSendingOtp
                ? "Sending..."
                : countdown > 0
                  ? `${countdown}s`
                  : "Send OTP"}
            </button>
          )}

          {isOtpSent && (
            <button
              type="button"
              disabled={isOtpVerified || isVerifyingOtp}
              className="send-otp-button"
              onClick={verifyOtp}
            >
              {isVerifyingOtp
                ? "Verifying..."
                : isOtpVerified
                  ? "OTP Verified"
                  : "Verify OTP"}
            </button>
          )}
        </div>

        {isOtpVerified && (
          <button type="submit" className="submit-button">
            Login
          </button>
        )}
      </form>

      {/* Link to the register page */}
      <p className="link-text">
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      <div className="or">
        <span>OR</span>
      </div>

      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const status = await loginWithGoogleApi(credentialResponse)
          if(status==='Successful') {
            navigate('/')
          }
        }}
        theme="filled_blue"
        shape="square"
        text="continue_with"
        onError={() => {
          console.log("Login Failed");
        }}
        useOneTap
      />
    </div>
  );
};

export default Login;
