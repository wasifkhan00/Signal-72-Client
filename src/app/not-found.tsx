"use client";
import { useRouter } from "next/navigation";
import NotFOunds from "@utils/NotFound";

const NotFound = () => {
  const router = useRouter();

  return <NotFOunds />;
};

export default NotFound;
