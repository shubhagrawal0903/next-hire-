"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import EditUserProfileForm from "@/components/EditUserProfileForm";

export default function UserProfilePage() {
    const { user, isLoaded } = useUser();

    // Get user role from public metadata
    const role = user?.publicMetadata?.role as string | undefined;

    // State management
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(null);

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
        if (file) {
            // Strict file type validation: Only PDF allowed
            if (file.type !== 'application/pdf') {
                alert('Please upload only PDF files.');
                e.target.value = ''; // Reset file input
                return;
            }

            // File size validation: Max 5MB
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                alert('File size must be less than 5MB.');
                e.target.value = ''; // Reset file input
                return;
            }

            // File passes validation
            setSelectedFile(file);
            setUploadStatus('idle');
        }
    };

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

            const uploadResponse = await fetch('/api/upload/resume', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload resume to cloud storage.');
            }

            const uploadData = await uploadResponse.json();
            const secureUrl = uploadData.secure_url;

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
            alert('Resume uploaded and saved successfully!');

        } catch (error) {
            console.error('Resume upload error:', error);
            setUploadStatus('error');
            alert(error instanceof Error ? error.message : 'Failed to upload resume. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen py-8 px-4 space-y-8">
            {/* Clerk User Profile Component */}
            <div className="w-full flex justify-center">
                <UserProfile path="/account" routing="path" />
            </div>

            {/* Resume Management Section */}
            <div className="w-full max-w-2xl bg-surface rounded-lg shadow-nh border border-border p-6">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Manage Resume</h2>

                {/* Current Resume Display */}
                {currentResumeUrl && (
                    <div className="mb-6 p-4 bg-card rounded-lg border border-card-border">
                        <p className="text-sm text-text-secondary mb-2">Current Resume:</p>
                        <a
                            href={currentResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover underline font-medium break-all"
                        >
                            View Current Resume
                        </a>
                    </div>
                )}

                {/* Upload New Resume */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="resume-upload" className="block text-sm font-medium text-text-primary mb-2">
                            Upload New Resume
                        </label>
                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={uploadStatus === 'uploading'}
                            className="block w-full text-sm text-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary-hover
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-input-border rounded-lg p-2 bg-input"
                        />
                        <p className="mt-2 text-xs text-text-secondary">
                            Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                        </p>
                    </div>

                    {/* Selected File Display */}
                    {selectedFile && (
                        <div className="p-3 bg-card rounded-lg border border-card-border">
                            <p className="text-sm text-text-primary">
                                <span className="font-medium">Selected:</span> {selectedFile.name}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                                Size: {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleResumeUpload}
                        disabled={!selectedFile || uploadStatus === 'uploading'}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium
              hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
              transition-all shadow-md hover:shadow-lg"
                    >
                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Resume'}
                    </button>

                    {/* Status Messages */}
                    {uploadStatus === 'success' && (
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                ✓ Resume uploaded successfully!
                            </p>
                        </div>
                    )}

                    {uploadStatus === 'error' && (
                        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                ✗ Upload failed. Please try again.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Extended Profile Section - Only for Job Seekers or users without a role */}
            {(role === 'JOB_SEEKER' || !role) && (
                <div className="w-full max-w-3xl py-8">
                    <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
                        Extended Profile (Skills, Bio, etc.)
                    </h2>
                    <EditUserProfileForm />
                </div>
            )}
        </div>
    );
}
