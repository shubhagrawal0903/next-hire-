"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Sign Up Component */}
      <div className="w-full max-w-md">
        <SignUp 
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}