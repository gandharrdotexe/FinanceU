"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth(redirectTo = "/auth/login") {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push(redirectTo);
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [redirectTo, router]);

  return { isAuthenticated, loading };
}