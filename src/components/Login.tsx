"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
// import Chat from "./Chat";
import "../styles/components/Login.css";
import "../styles/media.css";
import Endpoints from "../endpoint/endpoints";
import sockets from "../websockets/websockets";
import { useLoginStore } from "@store/LoginStore";
import SmallSpinnerLoader from "../utils/SmallSpinnerLoader";
import { AuthStore } from "@store/AuthStore";
import { useRouter } from "next/navigation";
import { useRegisterStore } from "@store/RegisterStore";
import { verifyToken } from "../lib/VerifyToken";
import { unlockRSAPrivateKey } from "../encryption/GenerateRSA";
import { createSessionKeyAndCacheRSAKey } from "../encryption/CreateSessionKeyAndCacheRSAKey";

const Login = () => {
  const router = useRouter();
  const {
    incorrectEmailOrPassword,
    usersName,
    showWaitForApiResponse,
    email,
    password,
    setIncorrectEmailOrPassword,
    setUsersName,
    setShowWaitForApiResponse,
    setEmail,
    setPassword,
  } = useLoginStore();
  const { successMessage, setSuccessMessage, setHasJustRegistered } =
    useRegisterStore();
  const {
    showChat,
    setShowChat,
    setName,
    setEmailAddress,
    setToken,
    setRSAKeyPairs,
  } = AuthStore();
  const ranOnceRef = useRef(false);

  const accountNoInput = useRef("");
  const passwordInput = useRef("");
  const isContainsNumber = /^(?=.*[0-9]).*$/;

  useEffect(() => {
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;

    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("emails");
    const savedNames = localStorage.getItem("names");

    if (!savedToken || !savedEmail || !savedNames) return;

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

  const handleLogin = (): void => {
    setShowWaitForApiResponse(true);

    // 🔐 Validate input
    if (
      !email ||
      !password ||
      password.length < 8 ||
      !isContainsNumber.test(password)
    ) {
      setIncorrectEmailOrPassword(true);
      setShowWaitForApiResponse(false);
      return;
    }

    const loginData = { emails: email, password };

    axios
      .post(Endpoints.loginUser, loginData, {
        headers: Endpoints.getHeaders(),
      })
      .then(async (res) => {
        const { success, verifiedEmail, emails, names, token } = res.data;

        if (!success) {
          setIncorrectEmailOrPassword(true);
          setShowWaitForApiResponse(false);
          return;
        }

        if (!verifiedEmail) {
          localStorage.setItem("unverifiedEmail", emails);
          setEmailAddress(emails);
          setHasJustRegistered(true);

          setTimeout(() => {
            router.push("/register/otp");
          }, 2000);
          return;
        }

        if (success && verifiedEmail) {
          localStorage.setItem("token", token);
          localStorage.setItem("names", names);
          localStorage.setItem("emails", emails);

          setUsersName(names);
          setEmailAddress(emails);
          setName(names);
          setToken(token);

          // 🛡️ Unlock RSA key using password
          const unlockRSAKeyPairs = await unlockRSAPrivateKey(password);
          if (
            unlockRSAKeyPairs &&
            res.data.rsaPublicKey === unlockRSAKeyPairs?.publicKeyBase64
          ) {
            console.log(unlockRSAKeyPairs);
            const createSessionKeyAndCacheRSAKeys =
              await createSessionKeyAndCacheRSAKey(unlockRSAKeyPairs);
            console.log(createSessionKeyAndCacheRSAKeys);
            setRSAKeyPairs({
              rsaPrivateKey: unlockRSAKeyPairs.rsaPrivateKey,
              rsaPublicKey: unlockRSAKeyPairs.publicKeyBase64,
            });
          } else {
            console.log(
              "keys couldnt be send because the db and the localforage public keys doesnt match"
            );
          }

          setIncorrectEmailOrPassword(false);
          setShowWaitForApiResponse(false);
          setSuccessMessage(true);
          setShowChat(true);
          router.push("/chat");

          setTimeout(() => {
            setSuccessMessage(false);
            setEmail("");
            setPassword("");
          }, 1500);

          // 🔌 Connect WebSocket after login
          if (!sockets.connected) sockets.connect();
        } else {
          setSuccessMessage(false);

          setIncorrectEmailOrPassword(true);
          setShowWaitForApiResponse(false);
        }
      })
      .catch((err) => {
        console.error("Login failed:", err.message);
        setSuccessMessage(false);
        setShowWaitForApiResponse(false);
        setIncorrectEmailOrPassword(true);
      });
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <div className="App">
        <div className="container">
          <div className="form_inputs">
            <div className="heading_top">
              <h3>Log In</h3>
            </div>

            <div className="inputOne">
              <label>
                <b>Email</b>
              </label>
              <input
                name="email"
                type="text"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="inputTwo">
              <label>
                <b>Password</b>
              </label>
              <input
                type="password"
                maxLength={40}
                placeholder="Enter Your Password"
                value={password}
                onKeyDown={handleEnterKey}
                onChange={(e) => setPassword(e.target.value)}
              />
              {incorrectEmailOrPassword && (
                <small style={{ color: "red", marginTop: "0.5rem" }}>
                  ⚠ Email or Password not found
                </small>
              )}
            </div>

            <button className="button" onClick={handleLogin}>
              Login
            </button>

            <span style={{ margin: "30px" }}>
              {"Doesn't have an account? "}
              <Link
                href="/register"
                style={{
                  color: "white",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Register Now
              </Link>
            </span>

            <small id="warnings">
              {showWaitForApiResponse ? <SmallSpinnerLoader /> : null}
            </small>

            {successMessage ? (
              <small id="warnings" className="success">
                <span> &#9989;</span>
                {`Login Successful! Redirecting to chat...`}
              </small>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
