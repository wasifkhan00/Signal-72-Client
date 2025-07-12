"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
// import Chat from "./Chat";
import "../app/globals.css";
import Endpoints from "../endpoint/endpoints";
import sockets from "../websockets/websockets";
import { useLoginStore } from "@store/LoginStore";
import SmallSpinnerLoader from "../utils/SmallSpinnerLoader";
import { AuthStore } from "@store/AuthStore";
import { useRouter } from "next/navigation";
import { useRegisterStore } from "@store/RegisterStore";

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
  const { successMessage, setField } = useRegisterStore();
  const { showChat, setShowChat, setName, setEmailAddress, setToken } =
    AuthStore();

  const accountNoInput = useRef("");
  const passwordInput = useRef("");
  const isContainsNumber = /^(?=.*[0-9]).*$/;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("names");
    const savedAccount = localStorage.getItem("emails");
    const unverifiedEmail = localStorage.getItem("unverifiedEmail");

    if (savedToken && savedName && savedAccount) {
      setField("successMessage", true);

      if (unverifiedEmail) {
        setEmailAddress(unverifiedEmail);
        setField("hasJustRegistered", true);
        setTimeout(() => {
          router.push("/register/otp");
        }, 2000);

        return;
      }

      setUsersName(savedName);
      setShowChat(true);
      router.push("/chat");

      setEmailAddress(savedAccount);
      setName(savedName);
      setToken(savedToken);

      if (!sockets.connected) {
        sockets.connect();
      }
    }
  }, []);

  useEffect(() => {
    sockets.on("loginSuccess", (data) => {
      if (!data.verifiedEmail) {
        localStorage.setItem("unverifiedEmail", data.emails);
        setEmailAddress(data.emails);
        setField("hasJustRegistered", true);
        setTimeout(() => {
          router.push("/register/otp");
        }, 2000);

        return;
      }
      if (data.success && data.verifiedEmail) {
        setShowWaitForApiResponse(false);
        setField("successMessage", true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("names", data.names);
        localStorage.setItem("emails", data.emails);
        setUsersName(data.names);

        setEmailAddress(data.emails);
        setName(data.names);
        setToken(data.token);
        setIncorrectEmailOrPassword(false);
        setShowChat(true);
        router.push("/chat");

        if (!sockets.connected) {
          sockets.connect();
        }

        setTimeout(() => {
          setField("successMessage", false);
          setEmail("");
          setPassword("");
          setIncorrectEmailOrPassword(false);
        }, 2000);
      } else {
        setShowWaitForApiResponse(false);
        setIncorrectEmailOrPassword(true);
      }
    });

    sockets.on("loginError", (error) => {
      setShowWaitForApiResponse(false);
      setIncorrectEmailOrPassword(true);
    });
  }, []);

  const handleLogin = (): void => {
    setShowWaitForApiResponse(true);

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
    let fallbackTriggered = false;

    const proceedWithLogin = () => {
      if (fallbackTriggered) return;

      console.log("✅ WebSocket connected. Emitting login request...");
      sockets.emit("loginUser", loginData);
    };

    const fallbackToAxios = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;

      console.log("⏳ Socket timeout. Using HTTP login...");

      axios
        .post(Endpoints.loginUser, loginData, {
          headers: Endpoints.getHeaders(),
        })
        .then((res) => {
          if (!res.data.verifiedEmail) {
            localStorage.setItem("unverifiedEmail", res.data.emails);
            setEmailAddress(res.data.emails);
            setField("hasJustRegistered", true);
            setTimeout(() => {
              router.push("/register/otp");
            }, 2000);

            return;
          }

          if (res.data.success && res.data.verifiedEmail) {
            setShowWaitForApiResponse(false);
            setField("successMessage", true);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("names", res.data.names);
            localStorage.setItem("emails", res.data.emails);
            setUsersName(res.data.names);
            setEmailAddress(res.data.emails);
            setName(res.data.names);
            setToken(res.data.token);
            setIncorrectEmailOrPassword(false);
            setShowChat(true);
            router.push("/chat");

            setTimeout(() => {
              setField("successMessage", false);
              setEmail("");
              setPassword("");
              setIncorrectEmailOrPassword(false);
            }, 1500);

            if (!sockets.connected) sockets.connect();
          } else {
            setShowWaitForApiResponse(false);
            setIncorrectEmailOrPassword(true);
          }
        })
        .catch((err) => {
          console.error("Fallback HTTP login failed:", err.message);
          setShowWaitForApiResponse(false);
        });
    };

    if (!sockets.connected) {
      sockets.connect();
      sockets.once("connect", proceedWithLogin);

      // Fallback if not connected within 2.5s
      setTimeout(() => {
        if (!sockets.connected) fallbackToAxios();
      }, 2500);
    } else {
      proceedWithLogin();
    }
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
