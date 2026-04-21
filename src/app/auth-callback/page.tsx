"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Suspense } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    // Priority: URL param (catches Google OAuth) → localStorage (catches email sign-up)
    const roleParam = searchParams.get("role");
    const selectedRole = roleParam || localStorage.getItem("selectedRole");

    if (selectedRole) {
      localStorage.removeItem("selectedRole");

      if (user) {
        fetch("/api/user/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: selectedRole }),
        })
          .then(() => {
            if (selectedRole === "client") {
              router.push("/add-company");
            } else {
              router.push("/");
            }
          })
          .catch((error) => {
            console.error("Failed to update role:", error);
            router.push("/");
          });
      }
    } else {
      // No pending role — existing sign-in, route by current role
      const userRole = user?.publicMetadata?.role as string | undefined;

      if (userRole === "client" || userRole === "COMPANY_ERP") {
        router.push("/dashboard");
      } else if (userRole === "admin" || userRole === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [isLoaded, user, router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative inline-flex">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-primary/40 animate-pulse"></div>
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-lg font-medium text-text-primary animate-pulse">Setting up your account</p>
          <p className="text-sm text-text-secondary">Please wait a moment...</p>
        </div>
        <div className="mt-8 flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
