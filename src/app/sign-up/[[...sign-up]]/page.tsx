"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const forceRedirectUrl = searchParams.get("forceRedirectUrl") || undefined;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          signInUrl="/sign-in"
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
          forceRedirectUrl={forceRedirectUrl}
          fallbackRedirectUrl="/auth-callback"
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}