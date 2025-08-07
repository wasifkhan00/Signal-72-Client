"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRegisterStore } from "@store/RegisterStore"; // adjust path if needed
import { AuthStore } from "@store/AuthStore"; // adjust path
import axios from "axios";
import "../app/globals.css";
import "../styles/chat.css";
import "../styles/media.css";
import "../styles/components/Login.css";
import "../styles/components/Register.css";
import Endpoints from "../endpoint/endpoints";
import SmallSpinnerLoader from "../utils/SmallSpinnerLoader";
import OtpAuthentication from "./Otp";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@store/LoginStore";
import sockets from "../websockets/websockets";
import { verifyToken } from "../lib/VerifyToken";
import { generateAndStoreRSAKeyPair } from "../encryption/GenerateRSA";
import { createSessionKeyAndCacheRSAKey } from "../encryption/CreateSessionKeyAndCacheRSAKey";
// import {
//   createSessionKeyAndCacheGeneratedRSAKey,
//   createSessionKeyAndCacheRSAKey,
// } from "../encryption/CreateSessionKeyAndCacheRSAKey";

const Register = () => {
  const router = useRouter();
  const { setUsersName } = useLoginStore();
  const { setEmailAddress, setShowChat, setName, setToken, setRSAKeyPairs } =
    AuthStore();
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    setFullNameValidator,
    setAccountValidator,
    setPasswordValidator,
    setPassword,
    setErrorNetworkWarning,
    setAlreadyExistsEmail,
    setShowOtpScreen,
    setHasJustRegistered,
    showWaitForApiResponse,
    fullName,
    email,
    password,
    confirmPassword,
    setDBUserData,
    setShowWaitForApiResponse,
    fullNameValidator,
    accountValidator,
    passwordValidator,
    confirmPasswordValidator,

    setFullName,
    setEmail,
    alreadyExistsEmail,
    resetAll,
    errorNetworkWarning,
    setConfirmPassword,
    setConfirmPasswordValidator,
  } = useRegisterStore();
  const ranOnceRef = useRef(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]{5,50}$/;
  const isContainsNumber = /^(?=.*[0-9]).*$/;

  useEffect(() => {
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;

    const savedToken = localStorage.getItem("token");
    const savedNames = localStorage.getItem("names");
    const savedEmail = localStorage.getItem("emails");

    if (!savedToken || !savedNames || !savedEmail) return;

    verifyToken({
      savedToken,
      savedEmail,
      savedNames,
      setSuccessMessage,
      setHasJustRegistered,
      setUsersName,
      setEmailAddress,
      setName,
      setToken,
      setShowChat,
      router,
      sockets,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const unlockRSAKeyPairs = await generateAndStoreRSAKeyPair(password);

    const createSessionKeyAndCacheRSAKeys =
      await createSessionKeyAndCacheRSAKey(unlockRSAKeyPairs);
    setRSAKeyPairs({
      rsaPrivateKey: unlockRSAKeyPairs.rsaPrivateKey,
      rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
    });

    // setRSAKeyPairs({
    //   rsaPrivateKey: rsaPublicKey.rsaPrivateKeyEncrypted,
    //   rsaPublicKey: rsaPublicKey.rsaPublicKeyBase64,
    // });1

    //  const unlockRSAKeyPairs = await unlockRSAPrivateKey(password);
    //           if (
    //             unlockRSAKeyPairs &&
    //             res.data.rsaPublicKey === unlockRSAKeyPairs?.publicKeyBase64
    //           ) {
    //             console.log(unlockRSAKeyPairs);
    //             const createSessionKeyAndCacheRSAKeys =
    //               await createSessionKeyAndCacheRSAKey(unlockRSAKeyPairs);
    //             console.log(createSessionKeyAndCacheRSAKeys);
    //             setRSAKeyPairs({
    //               rsaPrivateKey: unlockRSAKeyPairs.rsaPrivateKey,
    //               rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
    //             });
    //           } else {
    //             console.log(
    //               "keys couldnt be send because the db and the localforage public keys doesnt match"
    //             );
    //           }
    // ***************************************************************************************************************
    // const unlockRSAKeyPairs = await unlockRSAPrivateKey(password);
    //         if (
    //           unlockRSAKeyPairs &&
    //           res.data.rsaPublicKey === unlockRSAKeyPairs?.publicKeyBase64
    //         ) {
    //           const createSessionKeyAndCacheRSAKeys =
    //             await createSessionKeyAndCacheRSAKey(unlockRSAKeyPairs);
    //           console.log(createSessionKeyAndCacheRSAKeys);
    //           setRSAKeyPairs({
    //             rsaPrivateKey: unlockRSAKeyPairs.rsaPrivateKey,
    //             rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
    //           });
    //         } else {
    //           console.log(
    //             "keys couldnt be send because the db and the localforage public keys doesnt match"
    //           );
    //         }
    // ***************************************************************************************************************
    // setRSAKeyPairs({
    //   rsaPrivateKey: unlockRSAKeyPairs.rsaPrivateKey,
    //   rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
    // });
    // rsaPrivateKeyEncrypted
    // :
    // ArrayBuffer(2390)
    // rsaPublicKeyBase64
    // :

    // const { rsaPrivateKeyEncrypted, rsaPublicKeyBase64 } = rsaPublicKey;

    // 🛡️ Unlock RSA key using password
    // const unlockRSAKeyPairs = await unlockRSAPrivateKey(password);
    // if (
    //   unlockRSAKeyPairs &&
    //   res.data.rsaPublicKey === unlockRSAKeyPairs?.publicKeyBase64
    // ) {
    //   console.log(createSessionKeyAndCacheRSAKeys);
    //   setRSAKeyPairs({
    //     rsaPrivateKey: unlockRSAKeyPairs.rsaPrivateKey,
    //     rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
    //   });
    // } else {
    //   console.log(
    //     "keys couldnt be send because the db and the localforage public keys doesnt match"
    //   );
    // }

    const formData = {
      name: fullName,
      email,
      password,
      cPassword: confirmPassword,
      rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
    };

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
      setShowWaitForApiResponse(true);

      try {
        const response = await axios.post(Endpoints.registerUser, formData, {
          headers: Endpoints.getHeaders(),
        });

        if (response.data.success) {
          localStorage.setItem("unverifiedEmail", formData.email);

          setDBUserData(formData);
          setSuccessMessage(true);
          setShowWaitForApiResponse(false);
          setEmailAddress(formData.email);
          setTimeout(() => {
            setShowOtpScreen(true);
            setTimeout(() => {
              setHasJustRegistered(true);
              router.push("/register/otp");
            }, 1000);
          }, 1000);
          resetAll();
        } else {
          setShowWaitForApiResponse(false);
          setAlreadyExistsEmail(true);
        }
      } catch (err) {
        setShowWaitForApiResponse(false);
        setErrorNetworkWarning(true);
        console.error("Registration error:", err);
      }
    } else {
      // Trigger frontend

      setFullNameValidator(true);
      setAccountValidator(true);
      setPasswordValidator(true);
      setConfirmPasswordValidator(true);
      setAlreadyExistsEmail(false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (
      value === "" ||
      value.length < 5 ||
      /\s{2,}/.test(value) ||
      !nameRegex.test(value)
    ) {
      setFullNameValidator(true);
    } else {
      setFullName(value);
      setFullNameValidator(false);
    }

    setAlreadyExistsEmail(false);
    setAccountValidator(false);
    setPasswordValidator(false);
    setConfirmPasswordValidator(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!emailRegex.test(value)) {
      setAccountValidator(true);
    } else {
      setEmail(value);
      setAccountValidator(false);
    }

    setFullNameValidator(false);
    setAlreadyExistsEmail(false);
    setPasswordValidator(false);
    setConfirmPasswordValidator(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || value.length < 8 || !isContainsNumber.test(value)) {
      setPasswordValidator(true);
    } else {
      setPassword(value);
      setPasswordValidator(false);
    }

    setAccountValidator(false);
    setFullNameValidator(false);
    setAlreadyExistsEmail(false);
    setConfirmPasswordValidator(false);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const { password, setConfirmPassword, setConfirmPasswordValidator } =
      useRegisterStore.getState();

    if (value !== password) {
      setConfirmPasswordValidator(true);
    } else {
      setConfirmPassword(value);
      setConfirmPasswordValidator(false);
    }

    setAccountValidator(false);
    setFullNameValidator(false);
    setAlreadyExistsEmail(false);
    setPasswordValidator(false);
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
    </>
  );
};

export default Register;
