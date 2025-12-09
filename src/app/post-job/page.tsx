// src/app/post-job/page.tsx
'use client';

import { useUser, SignInButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import JobPostForm from "@/components/job-post-form";
import { Building2, Lock, ArrowRight, LogOut, Home } from "lucide-react";

export default function PostJobPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);

  // Check if user has registered a company
  useEffect(() => {
    async function checkCompanyRegistration() {
      if (!isSignedIn || !user?.id) {
        setCheckingCompany(false);
        return;
      }

      try {
        const response = await fetch(`/api/companies`);

        if (response.ok) {
          const companies = await response.json();

          if (companies && companies.length > 0) {
            setHasCompany(true);
          } else {
            setHasCompany(false);
          }
        } else {
          console.error('Failed to fetch companies, status:', response.status);
          setHasCompany(false);
        }
      } catch (error) {
        console.error('Error checking company registration:', error);
        setHasCompany(false);
      } finally {
        setCheckingCompany(false);
      }
    }

    if (isLoaded) {
      checkCompanyRegistration();
    }
  }, [isLoaded, isSignedIn, user?.id]);

  // Show loading state
  if (!isLoaded || checkingCompany) {
    return (
      <main className="min-h-screen bg-background py-20 px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-text-secondary">Loading verification...</p>
        </div>
      </main>
    );
  }

  // Not Signed In State
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-background py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border shadow-lg p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-3">
              Sign In Required
            </h1>
            <p className="text-text-secondary mb-8">
              You must be signed in to post a new job listing. Create an account or sign in to continue.
            </p>

            <div className="flex flex-col gap-3">
              <SignInButton mode="modal">
                <button className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
                  Sign In / Create Account
                </button>
              </SignInButton>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 bg-surface text-text-primary font-medium rounded-lg hover:bg-surface/80 border border-border transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Company Registration Required State
  if (isSignedIn && !hasCompany) {
    return (
      <main className="min-h-screen bg-background py-20 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Pattern */}
            <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>

            <div className="p-8 text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-6 transition-transform">
                <Building2 className="w-10 h-10 text-primary" />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                Company Registration
              </h1>
              <p className="text-text-secondary text-lg mb-6 leading-relaxed">
                Before you can post jobs, you need to register a company profile. This builds trust with candidates.
              </p>

              <div className="bg-surface rounded-lg p-4 mb-8 text-left border border-border">
                <h3 className="font-semibold text-text-primary mb-2 text-sm uppercase tracking-wider">Why register?</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center gap-2">✓ Manage multiple job listings easily</li>
                  <li className="flex items-center gap-2">✓ Create a branded company page</li>
                  <li className="flex items-center gap-2">✓ Track applicant status and history</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/add-company')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                >
                  Register Company <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4 text-sm">
                <p className="text-text-muted">
                  Already registered with another account?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => signOut(() => router.push('/'))}
                    className="flex items-center gap-1 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                  >
                    <Home className="w-4 h-4" /> Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Job Post Form
  return (
    <main className="min-h-screen bg-background py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Post a New Job</h1>
          <p className="text-text-secondary">Create a compelling job listing to attract the best talent.</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 md:p-8">
          <JobPostForm />
        </div>
      </div>
    </main>
  );
}