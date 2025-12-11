import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Sign In Component */}
      <div className="w-full max-w-md">
        <SignIn 
          appearance={clerkAppearance}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}