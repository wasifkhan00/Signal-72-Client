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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../tailwindComponents/components/ui/card";
import { ArrowLeft, Clock, Loader2, RefreshCw, Shield } from "lucide-react";
import { Label } from "../tailwindComponents/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../tailwindComponents/components/ui/input-otp";
import { Button } from "../tailwindComponents/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import { toast } from "sonner";
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
      localStorage.setItem("otpSentAlready", "true");
      axios
        .post(Endpoints.unverifiedEmail, { email: unverifiedEmail })
        .then((response) => {
          if (response.data.success) {
            toast.info("Please Verify Your Email First");
            setField("invalidOTP", false);
            setField("OTPSent", true);
            setField("timeLeft", 60);
            setField("canResend", false);
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
    if (!otp) {
      toast.error("Cannot be blank ");
    }

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
          toast.success("OTP Verification Successful");
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
        toast.error(
          error.response?.data?.message ||
            "The OTP you entered is incorrect. Please verify and try again."
        );

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
            toast.success(
              "New OTP sent successfully. Please check your email."
            );
            setField("OTPSent", true);
            setField("timeLeft", 60);
            setField("canResend", false);
          }
        })
        .catch((error) => {
          toast.error("Bad Request: Please try again after 15 minutes");
          console.error("Error sending new OTP:", error);
        });
    }
  };

  const handleOtpOnChange = (value) => {
    setField("otp", value);
    setField("invalidOTPMessage", "Invalid OTP");
    setField("OTPSent", false);
  };

  const maskEmail = () => {
    const [localPart, domain] = emailAddress.split("@");
    if (localPart.length <= 2) return emailAddress;
    const maskedLocal =
      localPart[0] +
      "*".repeat(localPart.length - 2) +
      localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  };
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 animate-float-delayed"></div>
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-600/10 animate-gentle-bounce"></div>
        </div>

        <Card className="w-full max-w-md glass-morphism bg-white shadow-modern relative z-10">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <div>
              <CardTitle className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent ">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-xs text-slate-400">
                We've sent a 6-digit code to
                <br />
                <span className="font-medium text-foreground text-black">
                  {maskEmail()}
                </span>
              </CardDescription>
            </div>
          </CardHeader>
          {/* **************************************END */}

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="otp" className="text-center block text-xs">
                Enter verification code
              </Label>

              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={handleOtpOnChange}
                  maxLength={6}
                  className="gap-2"
                  disabled={showWaitForApiResponse}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="w-10 h-10 text-lg font-semibold glass-morphism border-white/20 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 border-2 border-slate-300"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-10 h-10 text-lg font-semibold glass-morphism border-white/20 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 border-2 border-slate-300"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-10 h-10 text-lg font-semibold glass-morphism border-white/20 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 border-2 border-slate-300"
                    />
                  </InputOTPGroup>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={3}
                      className="w-10 h-10 text-lg font-semibold glass-morphism border-white/20 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 border-2 border-slate-300"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-10 h-10 text-lg font-semibold glass-morphism border-white/20 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 border-2 border-slate-300"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-10 h-10 text-lg font-semibold glass-morphism border-white/20 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 border-2 border-slate-300"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center text-sm text-muted-foreground text-xs  text-slate-400">
                {otp.length} / 6 digits entered
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyOTP}
              className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#4D7CFE] to-[#A155F9]"
              disabled={showWaitForApiResponse || otp.length !== 6}
            >
              {showWaitForApiResponse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-xs" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4 text-xs" />
                  Verify Code
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-white/20 dark:bg-slate-700/50" />
              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or
              </span>
            </div>

            {/* Resend Section */}
            <div className="text-center py-5 space-y-4">
              <p className="text-sm text-muted-foreground text-xs  text-slate-400">
                Didn't receive the code?
              </p>

              <Button
                type="button"
                variant="outline"
                className="w-full glass-morphism border-white/20 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-800/50 text-xs"
                onClick={handleGetANewCode}
                disabled={canResend && otpAttempts > 0 ? false : true}
              >
                {!canResend ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 text-xs" />
                    Resend in {timeLeft}s : ${otpAttempts} attempt(s) left
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground p-0 h-auto font-medium mx-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <Link
                href="/login"
                className="bg-gradient-to-r from-[#4D7CFE] to-[#A155F9] bg-clip-text text-transparent text-xs"
              >
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Security notice */}
      <div className="absolute bottom-4 left-4 max-w-xs p-3 glass-morphism border-white/20 dark:border-slate-700/50 rounded-lg bg-white shadow-modern  ">
        <p className="text-xs text-muted-foreground flex items-center">
          <Shield className="w-3 h-3 mr-1" />
          Otp Code expires in 5 minutes
        </p>
      </div>
    </>
  );
};

export default OtpAuthentication;
