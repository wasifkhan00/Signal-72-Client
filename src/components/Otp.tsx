"use client";
import React, { useEffect, useRef } from "react";
import axios from "axios";
import "../app/globals.css";
import "../styles/media.css";
import "../styles/components/Login.css";
import Endpoints from "../endpoint/endpoints";
import sockets from "../websockets/websockets";
import { useOtpStore } from "@store/OTPStore"; // update path if needed
import { AuthStore } from "@store/AuthStore";
import SmallSpinnerLoader from "../utils/SmallSpinnerLoader";
import { useRegisterStore } from "@store/RegisterStore";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@store/LoginStore";

const OtpAuthentication = () => {
  const router = useRouter();
  const { setHasJustRegistered } = useRegisterStore();

  const {
    timeLeft,
    canResend,
    otpAttempts,
    OTPSent,
    otp,
    invalidOTP,
    invalidOTPMessage,
    OTPVerifiedSuccess,
    showWaitForApiResponse,
    setField,
  } = useOtpStore();
  const { setUsersName } = useLoginStore();
  const {
    showChat,
    setShowChat,
    setToken,
    setName,
    emailAddress,
    setEmailAddress,
  } = AuthStore();

  useEffect(() => {
    if (timeLeft === 0) {
      setField("canResend", true);
      return;
    }

    const interval = setInterval(() => {
      setField("timeLeft", timeLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, setField]);

  // const hasSentOTP = useRef(false);

  const hasSentOTP = useRef(false);
  useEffect(() => {
    if (hasSentOTP.current) return;
    hasSentOTP.current = true;
    if (!emailAddress) {
      router.replace("/register");
      return;
    }

    const unverifiedEmail = localStorage.getItem("unverifiedEmail");

    if (unverifiedEmail && !localStorage.getItem("otpSentAlready")) {
      console.log("rendered useffect otp if conditon");

      localStorage.setItem("otpSentAlready", "true");
      axios
        .post(Endpoints.unverifiedEmail, { email: unverifiedEmail })
        .then((response) => {
          if (response.data.success) {
            setField("invalidOTP", false);
            setField("OTPSent", true);
            setField("timeLeft", 60);
            setField("canResend", false);

            // Automatically allow resend after 60 seconds
            setTimeout(() => {
              localStorage.removeItem("otpSentAlready");
              setField("canResend", true);
            }, 60000);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleVerifyOTP = () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      setField("invalidOTP", true);
      return;
    }

    setField("showWaitForApiResponse", true);
    setTimeout(() => {
      setField("invalidOTP", false);
    }, 3000);

    axios
      .post(Endpoints.verifyOTP, { email: emailAddress, otp })
      .then((response) => {
        if (response.data.success) {
          localStorage.removeItem("otpSentAlready");
          localStorage.removeItem("unverifiedEmail");
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("names", response.data.names);
          localStorage.setItem("emails", response.data.emails);
          setField("OTPSent", true);
          setField("OTPVerifiedSuccess", true);
          setField("otpAttempts", 3);
          setField("canResend", false);
          setField("timeLeft", 0);

          if (!sockets.connected) sockets.connect();
          setField("OTPVerifiedSuccess", false);
          setField("showWaitForApiResponse", false);

          setHasJustRegistered(false);

          setUsersName(response.data.names);
          setEmailAddress(response.data.emails);
          setToken(response.data.token);
          setName(response.data.names);
          setShowChat(true);
          router.push("/chat");
        } else {
          setField("showWaitForApiResponse", false);
        }
      })
      .catch((error) => {
        setField("invalidOTP", true);
        setField(
          "invalidOTPMessage",
          error.response?.data?.message || "An error occurred"
        );
        setField("showWaitForApiResponse", false);
      });
  };

  const handleGetANewCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (otpAttempts > 0) {
      setField("otpAttempts", otpAttempts - 1);
      setField("timeLeft", 60);
      setField("canResend", false);
      setField("invalidOTPMessage", "Invalid OTP");
      setField("invalidOTP", false);
      setField("OTPSent", true);

      axios
        .post(Endpoints.getNewOTP, { email: emailAddress })
        .then((response) => {
          if (response.data.success) {
            setField("OTPSent", true);
            setField("timeLeft", 60);
            setField("canResend", false);
          }
        })
        .catch((error) => {
          console.error("Error sending new OTP:", error);
        });
    }
  };

  const handleOtpOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField("otp", e.target.value);
    setField("invalidOTPMessage", "Invalid OTP");
    setField("OTPSent", false);
  };

  const handleEnterKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerifyOTP();
    }
  };

  return (
    <>
      <div className="App">
        <div className="container">
          <div className="form_inputs">
            <div className="heading_top">
              <h3>Log In</h3>
            </div>
            <div className="inputTwo">
              <label htmlFor="OTP">
                <b>OTP</b>
              </label>

              <input
                type="tel"
                maxLength={6}
                onChange={handleOtpOnChange}
                onKeyDown={handleEnterKeyPressed}
                placeholder="Enter the OTP sent to your email"
              />
              <span id="timerForOTP">
                {`Next OTP in ${timeLeft} sec : ${otpAttempts} attempt(s) left`}
              </span>
              <small id="warnings">
                <span> </span>
                {/* {`An email with the OTP has been sent to ${"ukhanwasif@gmail.com"}`} */}
              </small>

              {invalidOTP && (
                <small id="warnings">
                  <span> &#9888;</span> {invalidOTPMessage}
                </small>
              )}
              {OTPSent && (
                <small id="warnings" className="success">
                  <span> &#9989;</span>
                  {`OTP Sent ! Please check your email for the OTP`}
                </small>
              )}
              {OTPVerifiedSuccess && (
                <small id="warnings" className="success">
                  <span> &#9989;</span>
                  {`OTP Verified Successfully ! Redirecting to chat...`}
                </small>
              )}
            </div>
            <button className="button" onClick={handleVerifyOTP}>
              Verify OTP and Login
            </button>
            <button
              className="button"
              disabled={canResend && otpAttempts > 0 ? false : true}
              onClick={handleGetANewCode}
            >
              {"Get a New OTP "}
            </button>
            <small style={{ margin: `1rem` }} id="warnings">
              {showWaitForApiResponse ? <SmallSpinnerLoader /> : null}
            </small>{" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default OtpAuthentication;
