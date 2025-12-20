"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import ApplicantList from "@/components/ApplicantList";
import Link from "next/link";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import { Building2, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const [userCompany, setUserCompany] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserCompany = async () => {
      // Strict authentication check: Wait for both Clerk states to load
      if (!isAuthLoaded || !isUserLoaded) {
        return;
      }

      // Check if userId exists before making API call
      if (!userId) {
        setIsLoading(false);
        setError('Authentication required. Please sign in.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/companies");

        if (response.ok) {
          const data = await response.json();
          const companies = data || [];

          if (companies.length > 0) {
            // Set the first company as the user's company
            setUserCompany({
              id: companies[0].id,
              name: companies[0].name,
            });
          } else {
            setUserCompany(null);
          }
        } else {
          console.error("Failed to fetch companies:", response.status);
          setError("Failed to load your company. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load your company. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCompany();
  }, [isAuthLoaded, isUserLoaded, userId]);

  // Show loading spinner while Clerk is initializing
  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <main className="min-h-screen bg-background py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-text-secondary">Initializing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
            Company Dashboard
          </h1>
          <p className="text-text-secondary text-sm sm:text-base md:text-lg">
            Manage your company profile, jobs, and applications
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-600 dark:text-red-400 max-w-2xl mx-auto text-center">
            {error}
          </div>
        )}

        {/* No Company State */}
        {!isLoading && !error && !userCompany && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center max-w-2xl mx-auto mt-8">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              No Company Found
            </h2>
            <p className="text-text-secondary mb-8 text-lg max-w-md mx-auto">
              You haven't registered a company yet. Create a company profile to start posting jobs and managing applicants.
            </p>
            <Link
              href="/add-company"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add Your Company
            </Link>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && !error && userCompany && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Company Info Card */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
                      {userCompany.name}
                    </h2>
                    <p className="text-text-muted text-xs sm:text-sm flex items-center gap-2">
                      ID: <span className="font-mono bg-surface px-1.5 py-0.5 rounded text-xs truncate max-w-[150px]">{userCompany.id}</span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/company/${userCompany.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg hover:bg-surface/80 transition-colors font-medium text-sm w-full sm:w-auto"
                >
                  View Public Profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <AnalyticsDashboard companyId={userCompany.id} />

            {/* Applicants Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                  Recent Applications
                </h2>
                <p className="text-text-secondary text-xs sm:text-sm mt-1">Manage and track your candidates</p>
              </div>
              <div className="p-0">
                <ApplicantList companyId={userCompany.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
