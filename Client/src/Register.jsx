import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import "./Auth.css";

const Register = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL; // Use the environment variable for the backend URL

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // serverError will hold the error message from the server
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // state variables for OTP
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return; // we dont want to run this effect as soon as our component mounts
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    // cleanup function for when component unmonuts, i.e after successful registration when redirects to login
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedName = DOMPurify.sanitize(name);
    const sanitizedValue = DOMPurify.sanitize(value);
    // Clear the server error as soon as the user starts typing in Email
    if (name === "email" && serverError) {
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

      if (res.ok) {
        setOtpError("");
        setIsOtpVerified(true);
      } else {
        setOtpError(data.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      setOtpError("Something went wrong verifying OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false); // reset success if any

    if (!isOtpVerified) {
      setOtpError("Please verify your email with OTP before registering.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.error) {
        // Show error below the email field (e.g., "Email already exists")
        setServerError(data.error);
      } else {
        // Registration success
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      // In case fetch fails
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2 className="heading">Register</h2>
      <form className="form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            className="input"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Email & send OTP*/}
        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            // If there's a serverError, add an extra class to highlight border
            className={`input ${serverError ? "input-error" : ""}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <button
            type="button"
            disabled={isSendingOtp || countdown > 0}
            onClick={sendOtp}
            className="otp-send-btn"
          >
            {isSendingOtp
              ? "Sending..."
              : countdown > 0
                ? `${countdown}s`
                : "Send OTP"}
          </button>
          {/* Absolutely-positioned error message below email field */}
          {serverError && <span className="error-msg">{serverError}</span>}
          {/*otpError && <span className="error-msg">{otpError}</span>*/}
        </div>

        {/* Verify OTP */}
        {isOtpSent && (
          <div className="form-group">
            <label htmlFor="otp" className="label">
              Enter OTP
            </label>
            <input
              // If there's a serverError, add an extra class to highlight border
              className={`input ${serverError ? "input-error" : ""}`}
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(DOMPurify.sanitize(e.target.value))}
              placeholder="Please enter 4-digit OTP"
              required
            />
            <button
              type="button"
              disabled={isOtpVerified || isVerifyingOtp}
              onClick={verifyOtp}
              className="otp-send-btn"
            >
              {isVerifyingOtp
                ? "Verifying..."
                : isOtpVerified
                  ? "Verified"
                  : "Verify OTP"}
            </button>
            {/* Absolutely-positioned error message below email field */}
            {serverError && <span className="error-msg">{serverError}</span>}
            {otpError && <span className="error-msg">{otpError}</span>}
          </div>
        )}

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            className="input"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {isOtpVerified && (
          <button
            type="submit"
            disabled={!isOtpVerified || isSuccess}
            className={`submit-button ${isSuccess ? "success" : ""}`}
          >
            {isSuccess ? "Registration Successful" : "Register"}
          </button>
        )}
      </form>
      {/* Link to the login page */}
      <p className="link-text">
        Already have an account? <Link to="/login">Login</Link>
      </p>
      <div className="or">
        <span>OR</span>
      </div>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const status = await loginWithGoogleApi(credentialResponse);
          if (status === "Successful") {
            navigate("/");
          }
        }}
        theme="filled_blue"
        shape="square"
        text="signup_with"
        onError={() => {
          console.log("Login Failed");
        }}
        useOneTap
      />
      ;
    </div>
  );
};

export default Register;
