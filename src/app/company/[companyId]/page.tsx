"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import EditCompanyForm from "@/components/EditCompanyForm";

// Define the Company type based on Prisma schema
interface Company {
  id: string;
  name: string;
  legalName?: string | null;
  userId: string;
  registrationNumber: string;
  logoUrl?: string | null;
  website?: string | null;
  industry: string;
  companySize: string;
  about?: string | null;
  contactEmail: string;
  yearFounded: number;
  companyType: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { companyId } = useParams();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyDetails = async () => {
      try {
        setIsLoading(true);

        // Ensure companyId is a string - handle both string and array types
        let rawId: string;
        if (Array.isArray(companyId)) {
          rawId = String(companyId[0] || '');
        } else {
          rawId = String(companyId);
        }

        // Decode URL-encoded characters (%5B -> [, %5D -> ])
        const decodedId = decodeURIComponent(rawId);

        // Clean the ID thoroughly: remove brackets and trim whitespace
        const cleanedId = decodedId
          .replace(/\[|\]/g, '')  // Remove square brackets
          .trim();                 // Remove whitespace

        // Validate the cleaned ID (MongoDB ObjectID must be exactly 24 characters)
        if (!cleanedId || cleanedId.length !== 24) {
          console.error("Invalid company ID format:", cleanedId);
          setCompany(null);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/companies/${cleanedId}`);

        if (response.status === 200) {
          const data = await response.json();
          setCompany(data);
        } else if (response.status === 404) {
          console.error("Company not found");
          setCompany(null);
        } else {
          console.error("Error fetching company details:", response.statusText);
          setCompany(null);
        }
      } catch (error) {
        console.error("Failed to fetch company details:", error);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  // Handle company deletion
  const handleDeleteCompany = async () => {
    // Confirm deletion with user
    const confirmDelete = confirm(
      "Are you sure you want to delete this company and all its job postings? This action cannot be undone."
    );

    if (!confirmDelete) {
      return; // Exit if user cancels
    }

    try {
      setIsDeleting(true);

      // Ensure companyId is a string and clean it
      let rawId: string;
      if (Array.isArray(companyId)) {
        rawId = String(companyId[0] || '');
      } else {
        rawId = String(companyId);
      }

      // Decode URL-encoded characters and clean
      const decodedId = decodeURIComponent(rawId);
      const cleanedId = decodedId
        .replace(/\[|\]/g, '')
        .trim();

      // Make DELETE request
      const response = await fetch(`/api/companies/${cleanedId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Success - show alert and redirect
        alert('Company deleted successfully!');
        router.push('/'); // Redirect to homepage
      } else if (response.status === 403) {
        const errorData = await response.json();
        alert(errorData.error || 'Forbidden - You do not own this company');
      } else if (response.status === 404) {
        alert('Company not found');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete company. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading company details...</p>
        </div>
      </div>
    );
  }

  // Company not found state
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Company Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Company profile display
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Check if user is the owner */}
        {user && company.userId === user.id && isEditing ? (
          // Edit Mode - Show EditCompanyForm
          <EditCompanyForm 
            companyId={String(companyId)} 
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              // Refresh company data
              window.location.reload();
            }}
          />
        ) : (
          // View Mode - Show Company Profile
          <>
            {/* Header Section */}
            <div className="bg-card border border-border rounded-lg shadow-lg p-8 mb-6">
              <div className="flex items-start gap-6">
                {/* Company Logo */}
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Company Name and Basic Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {company.name}
                  </h1>
                  {company.legalName && (
                    <p className="text-text-secondary mb-2">
                      Legal Name: {company.legalName}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  {company.industry}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  {company.companySize} employees
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {company.companyType}
                </span>
              </div>
            </div>
          </div>

          {/* Edit and Delete Buttons - Only show if user owns this company */}
          {user && company.userId === user.id && (
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
              
              <button
                onClick={handleDeleteCompany}
                disabled={isDeleting}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          )}
        </div>

        {/* About Section */}
        {company.about && (
          <div className="bg-card border border-border rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              About Us
            </h2>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {company.about}
            </p>
          </div>
        )}

        {/* Company Details Grid */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year Founded */}
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">
                Year Founded
              </p>
              <p className="text-lg text-text-primary font-semibold">
                {company.yearFounded}
              </p>
            </div>

            {/* Registration Number */}
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">
                Registration Number
              </p>
              <p className="text-lg text-text-primary font-semibold">
                {company.registrationNumber}
              </p>
            </div>

            {/* Industry */}
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">
                Industry
              </p>
              <p className="text-lg text-text-primary font-semibold">
                {company.industry}
              </p>
            </div>

            {/* Company Size */}
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">
                Company Size
              </p>
              <p className="text-lg text-text-primary font-semibold">
                {company.companySize} employees
              </p>
            </div>

            {/* Company Type */}
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">
                Company Type
              </p>
              <p className="text-lg text-text-primary font-semibold">
                {company.companyType}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Contact Information
          </h2>
          <div className="space-y-4">
            {/* Contact Email */}
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-muted">
                  Email
                </p>
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="text-lg text-primary hover:underline"
                >
                  {company.contactEmail}
                </a>
              </div>
            </div>

            {/* Website */}
            {company.website && (
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-text-muted">
                    Website
                  </p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Jobs Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:underline"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Job Listings
          </Link>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
