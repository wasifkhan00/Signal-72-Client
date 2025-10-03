"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import "../styles/components/Login.css";
import "../styles/media.css";
import Endpoints from "../endpoint/endpoints";
import sockets from "../websockets/websockets";
import { useLoginStore } from "@store/LoginStore";
import { AuthStore } from "@store/AuthStore";
import { useRouter } from "next/navigation";
import { useRegisterStore } from "@store/RegisterStore";
import { verifyToken } from "../lib/VerifyToken";
import { unlockRSAPrivateKey } from "../encryption/GenerateRSA";
import { createSessionKeyAndCacheRSAKey } from "../encryption/CreateSessionKeyAndCacheRSAKey";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../tailwindComponents/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageCircle } from "lucide-react";
import { Button } from "../tailwindComponents/components/ui/button";
import { Label } from "../tailwindComponents/components/ui/label";
import { Input } from "../tailwindComponents/components/ui/input";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
import localforage from "localforage";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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

    // const fetchRSAPrivateKey = localforage.getItem

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
    const checkUnverifiedEmailLocalStorage =
      localStorage.getItem("unverifiedEmail");

    const checkotpSentEmailLocalStorage =
      localStorage.getItem("otpSentAlready");

    if (
      (checkUnverifiedEmailLocalStorage &&
        checkUnverifiedEmailLocalStorage !== email) ||
      checkotpSentEmailLocalStorage
    ) {
      localStorage.removeItem("unverifiedEmail");
      localStorage.removeItem("otpSentAlready");
    }

    // 🔐 Validate input

    if (email && !email.includes("@")) {
      toast.error("Email Format Incorrect");
      return;
    }

    if (!password) {
      toast.error("Password field cannot be blank");
      return;
    }

    if (
      !email ||
      !password
      // password.length < 8 ||
      // !isContainsNumber.test(password)
    ) {
      setIncorrectEmailOrPassword(true);
      setShowWaitForApiResponse(false);
      toast.error("Fields Cannot Be Blank");

      return;
    }
    setShowWaitForApiResponse(true);

    if (password.length < 8 || !isContainsNumber.test(password)) {
      setTimeout(() => {
        setShowWaitForApiResponse(false);
        setIncorrectEmailOrPassword(true);

        toast.error("Incorrect Email Or Password");
      }, 1000);
      return;
    }

    setShowWaitForApiResponse(true);

    const loginData = { emails: email, password };

    axios
      .post(Endpoints.loginUser, loginData, {
        headers: Endpoints.getHeaders(),
      })
      .then(async (res) => {
        const {
          success,
          verifiedEmail,
          emails,
          names,
          token,
          rsaPublicKey,
          encryptedPrivateKeyForDB,
          encryptedPublicKeyForDB,
          saltBase64,
          privateKeyIVBase64,
          publicKeyIVBase64,
        } = res.data;

        if (!success) {
          setIncorrectEmailOrPassword(true);
          setShowWaitForApiResponse(false);
          toast.error("Email Or Password Incorrect");

          return;
        }

        if (!verifiedEmail) {
          localStorage.setItem("unverifiedEmail", emails);
          setEmailAddress(emails);
          setHasJustRegistered(true);
          toast.info("Please Verify Your Email Address First");

          setTimeout(() => {
            router.push("/register/otp");
          }, 2000);
          return;
        }

        if (success && verifiedEmail) {
          toast.success("Successfully Logged In");
          localStorage.setItem("token", token);
          localStorage.setItem("names", names);
          localStorage.setItem("emails", emails);

          setUsersName(names);
          setEmailAddress(emails);
          setName(names);
          setToken(token);
          // *******************************************************************************************************************Unlock RSA Key

          const unlockRSAKeyPairs = await unlockRSAPrivateKey({
            password,
            encryptedPrivateKey: encryptedPrivateKeyForDB,
            encryptedPublicKey: encryptedPublicKeyForDB,
            saltBase64,
            privateKeyIVBase64,
            publicKeyIVBase64,
          });

          console.log(unlockRSAKeyPairs);
          // 🛡️ Unlock RSA key using password

          // const unlockRSAKeyPairs = await unlockRSAPrivateKey(password);
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
            toast.error("Tryy Logging In Manually");
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
          toast.error("Email Or Password Incorrect");
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
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 bg-white border border-black">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-600/20 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 animate-gentle-bounce"></div>
        </div>

        <Card className="w-full max-w-md glass-morphism bg-white shadow-modern relative z-10">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>

            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-2 text-[#5F6D87]">
                Sign in to continue your conversations
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* email field  */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transdiv -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIncorrectEmailOrPassword(false);
                    }}
                    className={`pl-10 glass-morphism border-white/20 dark:border-slate-700/50 bg-[#F5F5F5]
${incorrectEmailOrPassword ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                </div>
              </div>
            </div>
            {/* email field  */}
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onKeyDown={handleEnterKey}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIncorrectEmailOrPassword(false);
                  }}
                  placeholder="Enter your password"
                  className={`text-xs pl-10 pr-10 glass-morphism border-white/20 dark:border-slate-700/50 bg-[#F5F5F5]

 ${incorrectEmailOrPassword ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-xs absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {incorrectEmailOrPassword && (
                <p className="text-xs text-red-500">
                  ⚠ Email or Password not found
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                // onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 p-0 h-auto bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent"
              >
                <span className="bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent text-xs">
                  Forgot password?
                </span>
              </Button>
            </div>

            {/* Login Button */}
            <Button
              className="w-full gradient-primary text-xs !text-white bg-red shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-blue-500 to-purple-500 text-white"
              disabled={showWaitForApiResponse}
              onClick={handleLogin}
            >
              {showWaitForApiResponse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-xs" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-white/20 dark:bg-slate-700/50" />
              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>

            {/* *************************************************** */}
            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs glass-morphism border-white/20 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-800/50 text-black"
              onClick={() => toast.info("Google Login Comming Soon")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
          {/* *******************************************************************************************s */}
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground text-xs">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium underline pointer bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent

"
              >
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent text-xs"
                >
                  Sign up here
                </Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Login;
