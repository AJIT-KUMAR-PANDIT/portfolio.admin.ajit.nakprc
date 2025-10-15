"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./SessionProvider";

export default function AuthGuard({ children }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading authentication...</div>; // Or a loading spinner
  }

  if (!user) {
    return null; // User is not authenticated, and we are redirecting
  }

  return <>{children}</>;
}