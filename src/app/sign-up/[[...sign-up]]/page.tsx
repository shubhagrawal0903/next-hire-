"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Sign Up Component */}
      <div className="w-full max-w-md">
        <SignUp 
          signInUrl="/sign-in"
          appearance={clerkAppearance}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}