"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpAuthentication from "@components/Otp";
import { useRegisterStore } from "@store/RegisterStore";

const OtpPage = () => {
  const router = useRouter();
  const hasJustRegistered = useRegisterStore((s) => s.hasJustRegistered);

  // useEffect(() => {
  //   if (!hasJustRegistered) {
  //     router.replace("/register");
  //   }
  // }, [hasJustRegistered]);

  // return hasJustRegistered ? <OtpAuthentication /> : null;
  return <OtpAuthentication />;
};

export default OtpPage;
