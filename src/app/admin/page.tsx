"use client";

import React from 'react';
import { useUser, SignInButton } from "@clerk/nextjs";
import AdminCompanyList from "@/components/AdminCompanyList";
import AdminUserList from "@/components/AdminUserList";
import AdminAnalyticsDashboard from "@/components/admin/AdminAnalyticsDashboard";
import { ShieldAlert, shieldCheck } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="text-text-secondary font-medium">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Admin Access Required</h1>
          <p className="text-text-secondary mb-6 text-sm">Please sign in to access the administration dashboard.</p>
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but not admin
  if (role !== "ADMIN" && role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-md shadow-sm">
          <div className="bg-destructive/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-destructive mb-2">
            Access Denied
          </h2>
          <p className="text-destructive/80 text-sm">
            You do not have permission to view this page. This area is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  // Admin access granted
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-screen-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary text-lg">
            Manage companies, users, and platform settings.
          </p>
        </header>

        {/* Analytics Section */}
        <section>
          <AdminAnalyticsDashboard />
        </section>

        {/* Companies Pending Verification Section */}
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              Companies Pending Verification
            </h2>
            <p className="text-text-secondary text-sm mt-1">Review and approve company registration documents.</p>
          </div>
          <div className="p-6">
            <AdminCompanyList />
          </div>
        </section>

        {/* User Management Section */}
        <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary">
              User Management
            </h2>
            <p className="text-text-secondary text-sm mt-1">View and manage user roles and accounts.</p>
          </div>
          <div className="p-0">
            <AdminUserList />
          </div>
        </section>
      </div>
    </div>
  );
}
