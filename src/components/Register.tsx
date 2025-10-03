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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../tailwindComponents/components/ui/card";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  User,
} from "lucide-react";
import { Label } from "../tailwindComponents/components/ui/label";
import { Input } from "../tailwindComponents/components/ui/input";
import { Button } from "../tailwindComponents/components/ui/button";
import { IoWarning } from "react-icons/io5";
import { Checkbox } from "../tailwindComponents/components/ui/checkbox";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";
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
  const [showPassword, setshowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      encryptedPrivateKeyForDB: unlockRSAKeyPairs.encryptedPrivateKeyForDB,
      encryptedPublicKeyForDB: unlockRSAKeyPairs.encryptedPublicKeyForDB,
      saltBase64: unlockRSAKeyPairs.saltBase64,
      privateKeyIVBase64: unlockRSAKeyPairs.privateKeyIVBase64,
      publicKeyIVBase64: unlockRSAKeyPairs.publicKeyIVBase64,
    };
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions to continue.");
      return;
    }

    if (!fullName) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email) {
      toast.error("Please your email.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }

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
          toast.success("Registered successfully. Check your email for OTP");

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
          toast.error("This email is already associated with an account.");
          setAlreadyExistsEmail(true);
        }
      } catch (err) {
        setShowWaitForApiResponse(false);
        setErrorNetworkWarning(true);
        toast.error("Please make sure you have a stable internet connection");

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
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center p-2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-xs">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-600/20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-600/20 animate-float-delayed"></div>
          <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-600/10 animate-gentle-bounce"></div>
        </div>

        <Card className="w-full max-w-md glass-morphism bg-white shadow-modern relative z-10 ">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>

            <div>
              <CardTitle className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent ">
                Create Account
              </CardTitle>
              <CardDescription
                className="text-muted-foreground mt-2 text-slate-500
"
              >
                Join thousands of users in seamless conversations
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    onChange={handleFullNameChange}
                    className={`pl-10 glass-morphism border-white/20 dark:border-slate-700/50 bg-[#F5F5F5] ${
                      fullNameValidator
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {fullNameValidator && (
                  <div className="flex items-center text-xs gap-1 text-red-500">
                    <IoWarning />
                    <p className="text-xs text-red-500">
                      Must be minimum 5 char long without any special char
                    </p>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    // value={formData.email}
                    onChange={handleEmailChange}
                    className={`pl-10 glass-morphism border-white/20 dark:border-slate-700/50 bg-[#F5F5F5] ${
                      accountValidator
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                </div>
                {accountValidator && (
                  <div className="flex items-center text-xs gap-1 text-red-500">
                    <IoWarning />
                    <p className="text-xs text-red-500">
                      {`Email must be e.g John@email.com`}
                    </p>
                  </div>
                )}
              </div>

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
                    placeholder="Create a strong password"
                    onChange={handlePasswordChange}
                    className={`pl-10 pr-10 glass-morphism border-white/20 dark:border-slate-700/50 bg-[#F5F5F5] ${
                      passwordValidator
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setshowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {passwordValidator && (
                  <div className="flex items-center text-xs gap-1 text-red-500">
                    <IoWarning />
                    <p className="text-xs text-red-500">
                      {`Password is weak `}
                    </p>
                  </div>
                )}
              </div>

              {/* *******************************confirm Password */}

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    onChange={handleConfirmPasswordChange}
                    className={`pl-10 pr-10 glass-morphism border-white/20 dark:border-slate-700/50 bg-[#F5F5F5]${
                      confirmPasswordValidator
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setshowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {confirmPasswordValidator && (
                  <div className="flex items-center text-xs gap-1 text-red-500">
                    <IoWarning />
                    <p className="text-xs text-red-500">
                      {`Password and Confirm Password Doesn't match `}
                    </p>
                  </div>
                )}
              </div>

              {/* *******************************confirm Password */}

              {/* *******************************TErms of Services */}

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) =>
                      setAcceptedTerms(checked === true)
                    }
                    className="border-2 border-black dark:border-slate-500 rounded-sm
             data-[state=checked]:bg-gradient-to-br 
             data-[state=checked]:from-[#4D7CFE] 
             data-[state=checked]:to-[#A155F9]"
                  />

                  <Label
                    htmlFor="terms"
                    className="text-xs text-muted-foreground leading-relaxed cursor-pointer text-slate-500
"
                  >
                    I agree to the
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto font-medium underline"
                    >
                      <span className="bg-gradient-to-r text-xs from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent">
                        Terms of Service
                      </span>
                    </Button>
                    and
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto font-medium underline"
                    >
                      <span className="bg-gradient-to-r text-xs from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent">
                        Privacy Policy
                      </span>
                    </Button>
                  </Label>
                </div>

                <Button
                  className="w-full text-xs !text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#4D7CFE] to-[#A155F9]"
                  disabled={showWaitForApiResponse}
                  onClick={handleSubmit}
                >
                  {showWaitForApiResponse ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <Separator className="bg-white/20 dark:bg-slate-700/50" />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                {/* Google Signup */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs glass-morphism border-white/20 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-800/50"
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
                  Sign up with Google
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-xs text-muted-foreground ">
              Already have an account?{" "}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                // onClick={onSwitchToLogin}
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent"
              >
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent text-xs"
                >
                  Sign In here
                </Link>
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Register;
