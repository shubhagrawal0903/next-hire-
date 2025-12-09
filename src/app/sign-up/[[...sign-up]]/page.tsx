import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Header with branding */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">NH</span>
          </div>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-xl font-bold">
            Next Hire
          </h1>
        </Link>
      </div>

      {/* Sign Up Component */}
      <div className="w-full max-w-md">
        <SignUp />
      </div>
    </div>
  );
}