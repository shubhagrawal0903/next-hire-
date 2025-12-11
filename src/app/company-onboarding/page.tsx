"use client";

import { Building2, UserCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<"register" | "existing" | null>(null);

  const handleRegisterCompany = () => {
    setSelectedOption("register");
    localStorage.setItem('selectedRole', 'client');
    router.push('/sign-up');
  };

  const handleExistingCompany = () => {
    setSelectedOption("existing");
    localStorage.setItem('selectedRole', 'client');
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm font-medium text-text-secondary">
            <Building2 className="w-4 h-4 text-primary" />
            Company Access
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
            Welcome to Next-Hire
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Choose how you'd like to proceed with your hiring journey
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Register New Company */}
          <button
            onClick={handleRegisterCompany}
            disabled={selectedOption !== null}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedOption === "register"
                ? "border-primary bg-primary/5 shadow-xl scale-105"
                : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
            } ${selectedOption !== null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <ArrowRight className="w-6 h-6 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-2xl font-bold text-text-primary mb-3">Register a Company</h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              New to Next-Hire? Create your company profile and start posting jobs to find the best talent.
            </p>

            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Create company profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Post unlimited jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>Manage applicants</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Already Registered */}
          <button
            onClick={handleExistingCompany}
            disabled={selectedOption !== null}
            className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedOption === "existing"
                ? "border-primary bg-primary/5 shadow-xl scale-105"
                : "border-border bg-card hover:border-primary/50 hover:shadow-xl"
            } ${selectedOption !== null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <ArrowRight className="w-6 h-6 text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-2xl font-bold text-text-primary mb-3">Already Registered</h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Already have a company account? Sign in to access your dashboard and manage your job postings.
            </p>

            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>Access your dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>View applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>Manage jobs</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        {selectedOption && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center gap-3 text-text-secondary">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
