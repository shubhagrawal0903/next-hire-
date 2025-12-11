import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Sign In Component */}
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </div>
  );
}