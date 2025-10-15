"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const redirectTimer = setTimeout(() => {
      router.push("/admin/dashboard");
    }, 3000); // Redirect after 3 seconds

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
        Welcome!
      </h1>
      <p className="text-2xl font-medium mb-8">Current Time: {currentTime}</p>
      <p className="text-lg">Redirecting to Dashboard...</p>
    </div>
  );
}
