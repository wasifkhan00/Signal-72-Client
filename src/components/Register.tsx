"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRegisterStore } from "@store/RegisterStore"; // adjust path if needed
import { AuthStore } from "@store/AuthStore"; // adjust path
import axios from "axios";
import "../app/globals.css";
import "../styles/chat.css";
import Endpoints from "../endpoint/endpoints";
import SmallSpinnerLoader from "../utils/SmallSpinnerLoader";
import OtpAuthentication from "./Otp";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@store/LoginStore";
import sockets from "../websockets/websockets";

const Register = () => {
  const router = useRouter();

  const setEmailAddress = AuthStore((state) => state.setEmailAddress);
  const {
    fullName,
    email,
    password,
    confirmPassword,
    dbUserData,

    fullNameValidator,
    accountValidator,
    passwordValidator,
    confirmPasswordValidator,
    alreadyExistsEmail,
    showWaitForApiResponse,
    successMessage,
    showOtpScreen,
    errorNetworkWarning,

    setField,
    resetAll,
  } = useRegisterStore();

  const { setUsersName } = useLoginStore();

  const { showChat, setShowChat, setName, setToken } = AuthStore();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]{5,50}$/;
  const isContainsNumber = /^(?=.*[0-9]).*$/;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("names");
    const savedAccount = localStorage.getItem("emails");

    if (savedToken && savedName && savedAccount) {
      setField("successMessage", true);

      setUsersName(savedName);
      setShowChat(true);
      router.push("/chat");

      setEmailAddress(savedAccount);
      setName(savedName);
      setToken(savedToken);
      //   props.gotTheEmail(savedAccount); //function came from app.js

      // Reconnect socket if not already connected
      if (!sockets.connected) {
        sockets.connect();
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      fullName,
      email,
      password,
      confirmPassword,
      fullNameValidator,
      accountValidator,
      passwordValidator,
      confirmPasswordValidator,
      alreadyExistsEmail,
      setField,
      resetAll,
    } = useRegisterStore.getState();

    const nameRegex = /^[a-zA-Z\s]{5,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isContainsNumber = /^(?=.*[0-9]).*$/;

    const formData = {
      name: fullName,
      email,
      password,
      cPassword: confirmPassword,
    };

    // Validation Checks
    const isFormValid =
      fullName.trim() !== "" &&
      email.trim() !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      nameRegex.test(fullName) &&
      emailRegex.test(email) &&
      isContainsNumber.test(password) &&
      password === confirmPassword &&
      !fullNameValidator &&
      !accountValidator &&
      !passwordValidator &&
      !confirmPasswordValidator &&
      !alreadyExistsEmail;

    if (isFormValid) {
      setField("showWaitForApiResponse", true);

      try {
        const response = await axios.post(Endpoints.registerUser, formData, {
          headers: Endpoints.getHeaders(),
        });

        console.log("register response:");
        console.log(response);

        if (response.data.success) {
          localStorage.setItem("unverifiedEmail", formData.email);
          setField("dbUserData", formData);
          setField("successMessage", true);
          setField("showWaitForApiResponse", false);

          setEmailAddress(formData.email);

          setTimeout(() => {
            setField("showOtpScreen", true);
            setTimeout(() => {
              setField("hasJustRegistered", true);
              router.push("/register/otp");
            }, 1000);
          }, 1000);

          resetAll();
        } else {
          setField("showWaitForApiResponse", false);
          setField("alreadyExistsEmail", true);
        }
      } catch (err) {
        setField("showWaitForApiResponse", false);
        setField("errorNetworkWarning", true);
        console.error("Registration error:", err);
      }
    } else {
      // Trigger frontend validations
      setField("fullNameValidator", true);
      setField("accountValidator", true);
      setField("passwordValidator", true);
      setField("confirmPasswordValidator", true);
      setField("alreadyExistsEmail", false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { setField } = useRegisterStore.getState();
    const value = e.target.value;

    if (
      value === "" ||
      value.length < 5 ||
      /\s{2,}/.test(value) || // double spaces
      !nameRegex.test(value)
    ) {
      setField("fullNameValidator", true);
    } else {
      setField("fullName", value);
      setField("fullNameValidator", false);
    }

    // Reset related warnings
    setField("alreadyExistsEmail", false);
    setField("accountValidator", false);
    setField("passwordValidator", false);
    setField("confirmPasswordValidator", false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const { setField } = useRegisterStore.getState();

    if (!emailRegex.test(value)) {
      setField("accountValidator", true);
    } else {
      setField("email", value);
      setField("accountValidator", false);
    }

    // Reset other warning flags
    setField("fullNameValidator", false);
    setField("alreadyExistsEmail", false);
    setField("passwordValidator", false);
    setField("confirmPasswordValidator", false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const { setField } = useRegisterStore.getState();

    if (value === "" || value.length < 8 || !isContainsNumber.test(value)) {
      setField("passwordValidator", true);
    } else {
      setField("password", value);
      setField("passwordValidator", false);
    }

    // Reset other validation flags
    setField("accountValidator", false);
    setField("fullNameValidator", false);
    setField("alreadyExistsEmail", false);
    setField("confirmPasswordValidator", false);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const { password, setField } = useRegisterStore.getState();

    if (value !== password) {
      setField("confirmPasswordValidator", true);
    } else {
      setField("confirmPassword", value);
      setField("confirmPasswordValidator", false);
    }

    // Reset other validation flags
    setField("accountValidator", false);
    setField("fullNameValidator", false);
    setField("alreadyExistsEmail", false);
    setField("passwordValidator", false);
  };

  return (
    <>
      <div className="App">
        <form className="form_inputs_Container">
          <div className="heading_top">
            <h3>Sign Up</h3>
          </div>

          <div className="inputOne">
            <label htmlFor="fullName">
              <b>Full name</b>
            </label>
            <input
              type="text"
              name="fullName"
              maxLength={18}
              onChange={handleFullNameChange}
              placeholder="Enter Your Full Name"
            />

            {fullNameValidator ? (
              <small id="warnings">
                <span> &#9888;</span>
                Must be minimum 5 char long without any special char
              </small>
            ) : null}
          </div>
          <div className="inputOne">
            <label htmlFor="email">
              <b> Email Address</b>
            </label>

            <input
              type="email"
              name="email"
              onChange={handleEmailChange}
              placeholder="Enter Your Email Address"
            />

            {accountValidator ? (
              <small id="warnings">
                <span> &#9888;</span>
                {`Email must be e.g John@email.com`}
              </small>
            ) : null}
          </div>

          <div className="inputTwo">
            <label htmlFor="password">
              <b>Password</b>
            </label>
            <input
              type="password"
              maxLength={40}
              name="password"
              onChange={handlePasswordChange}
              placeholder="Set a Password"
            />

            {passwordValidator ? (
              <small id="warnings">
                <span> &#9888; </span>
                {`Must be 8-40 digits long and must have nums`}
              </small>
            ) : null}
          </div>

          <div className="inputTwo">
            <label htmlFor="cpassword">
              <b>Confirm password</b>
            </label>
            <input
              type="password"
              name="cpassword"
              maxLength={40}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm Your Password"
            />

            {confirmPasswordValidator ? (
              <small id="warnings">
                <span> &#9888; </span>
                {`Password and Confirm Password Doesn't match `}
              </small>
            ) : null}
          </div>

          <button onClick={handleSubmit}>Sign Up</button>

          <span id="Have_an_Account">
            Already have an account?{" "}
            <Link href="/login" style={{ color: "white" }}>
              Login
            </Link>
          </span>

          {errorNetworkWarning ? (
            <small id="warnings">
              <span> &#9888; </span>
              {`Please make sure you have a stable internet Connection`}
            </small>
          ) : null}
          <small id="warnings">
            {showWaitForApiResponse ? <SmallSpinnerLoader /> : null}
          </small>
          {alreadyExistsEmail ? (
            <small id="warnings">
              <span> &#9888; </span>
              {`An account already exists with this Email Address`}
            </small>
          ) : null}

          {successMessage ? (
            <small id="warnings" className="success">
              <span> &#9989;</span>
              {`Account created. Please check your email for the OTP`}
            </small>
          ) : null}
        </form>
      </div>
      {/* )} */}
    </>
  );
};

export default Register;
