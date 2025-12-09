"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import EditUserProfileForm from "@/components/EditUserProfileForm";
import { FileText, UploadCloud, CheckCircle2, XCircle, ArrowLeft, User, Settings, Shield, LayoutGrid, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function UserProfilePage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');

  // Get user role from public metadata
  const role = user?.publicMetadata?.role as string | undefined;

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load current resume URL from user metadata
  useEffect(() => {
    if (isLoaded && user) {
      const resumeUrl = user.publicMetadata?.resumeUrl as string | undefined;
      if (resumeUrl) {
        setCurrentResumeUrl(resumeUrl);
      }
    }
  }, [user, isLoaded]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | undefined) => {
    if (file) {
      // Strict file type validation: Only PDF allowed
      if (file.type !== 'application/pdf') {
        alert('Please upload only PDF files.');
        return;
      }

      // File size validation: Max 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }

      // File passes validation
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  }

  // Handle resume upload
  const handleResumeUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    try {
      setUploadStatus('uploading');

      // Step 1: Upload file to Cloudinary
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const uploadResponse = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload resume to cloud storage.');
      }

      const uploadData = await uploadResponse.json();
      const secureUrl = uploadData.secure_url || uploadData.url;

      if (!secureUrl) {
        throw new Error('No URL returned from upload');
      }

      // Step 2: Update user profile metadata with resume URL
      const updateResponse = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeUrl: secureUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile with resume URL.');
      }

      // Success: Update state
      setCurrentResumeUrl(secureUrl);
      setUploadStatus('success');
      setSelectedFile(null);

    } catch (error) {
      console.error('Resume upload error:', error);
      setUploadStatus('error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* 1. Page Header with Breadcrumb */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-sm text-text-secondary hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Profile & Settings</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 2. Premium Profile Header Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden relative">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-surface w-full"></div>

          <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 relative z-10">
            {/* Avatar */}
            <div className="p-1.5 bg-card rounded-full shadow-md">
              <img
                src={user?.imageUrl}
                alt={user?.fullName || "User"}
                className="w-24 h-24 rounded-full object-cover border border-border bg-surface"
              />
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-text-primary">{user?.fullName || user?.username}</h2>
              <p className="text-text-secondary">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${role === 'ADMIN' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                    role === 'COMPANY_ERP' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      'bg-green-500/10 text-green-600 border-green-500/20'
                  }`}>
                  {role === 'ADMIN' ? 'Administrator' : role === 'COMPANY_ERP' ? 'Company Account' : 'Job Seeker'}
                </span>
                <span className="text-xs text-text-muted">
                  Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Custom Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-surface/50 border border-border rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'profile'
                ? 'bg-card text-primary shadow-sm ring-1 ring-border'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'account'
                ? 'bg-card text-primary shadow-sm ring-1 ring-border'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
          >
            <Shield className="w-4 h-4" />
            Account Settings
          </button>
        </div>


        {/* 4. Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-bottom-2">
              {/* Resume Section */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Resume Management</h2>
                    <p className="text-sm text-text-secondary">Keep your resume updated to improve job matches.</p>
                  </div>
                </div>

                {/* Current Resume Card */}
                {currentResumeUrl && (
                  <div className="mb-6 p-4 rounded-lg border border-border bg-surface/50 flex items-center justify-between group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">Current Resume</p>
                        <p className="text-xs text-text-muted">PDF Document</p>
                      </div>
                    </div>
                    <a
                      href={`https://docs.google.com/viewer?url=${encodeURIComponent(currentResumeUrl)}&embedded=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${isDragging
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-border hover:border-primary/50 hover:bg-surface'
                    }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={uploadStatus === 'uploading'}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="flex flex-col items-center pointer-events-none">
                    <div className={`w-14 h-14 rounded-full bg-surface mb-4 flex items-center justify-center transition-colors ${isDragging ? 'text-primary' : 'text-text-muted'}`}>
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      {selectedFile ? selectedFile.name : "Click or drag file to upload"}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
                      {selectedFile
                        ? <span className="text-green-600 font-medium">Ready to upload</span>
                        : "PDF formats only, up to 5MB"
                      }
                    </p>
                  </div>
                </div>

                {/* Action Buttons & Status */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleResumeUpload}
                    disabled={!selectedFile || uploadStatus === 'uploading'}
                    className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {uploadStatus === 'uploading' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Save Resume'}
                  </button>

                  {uploadStatus === 'success' && (
                    <span className="flex items-center text-sm text-green-600 dark:text-green-500 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Uploaded successfully
                    </span>
                  )}
                  {uploadStatus === 'error' && (
                    <span className="flex items-center text-sm text-destructive animate-in fade-in">
                      <XCircle className="w-4 h-4 mr-2" /> Upload failed
                    </span>
                  )}
                </div>
              </div>

              {/* Extended Profile Settings (Only for Job Seekers) */}
              {(role === 'JOB_SEEKER' || !role) && (
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8">
                  <div className="mb-8 border-b border-border pb-4">
                    <h2 className="text-xl font-bold text-text-primary mb-1">Extended Profile</h2>
                    <p className="text-sm text-text-secondary">Manage your professional details, skills, and bio.</p>
                  </div>
                  <EditUserProfileForm />
                </div>
              )}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex justify-center p-8">
                <UserProfile
                  path="/profile"
                  routing="path"
                  appearance={{
                    elements: {
                      rootBox: "w-full max-w-4xl",
                      cardBox: "w-full shadow-none border-0 rounded-none",
                      navbar: "hidden lg:flex",
                      pageScrollBox: "p-0",
                      page: "w-full",
                      headerTitle: "text-2xl font-bold text-text-primary",
                      headerSubtitle: "text-text-secondary",
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
