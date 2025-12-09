"use client";

import React, { useState, useEffect } from "react";

interface EditJobFormProps {
  jobId: string;
  onUpdateSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditJobForm({ jobId, onUpdateSuccess, onCancel }: EditJobFormProps) {
  // State for all job fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("INR");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState("active");

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing job data on component mount
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/jobs/${jobId}`);

        if (response.ok) {
          const job = await response.json();

          // Populate form fields with existing data
          setTitle(job.title || "");
          setDescription(job.description || "");
          setCompanyId(job.companyId || "");
          setCompanyName(job.company?.name || "");
          setLocation(job.location || "");
          setEmploymentType(job.employmentType || "");
          setSalaryMin(job.salaryMin ? String(job.salaryMin) : "");
          setSalaryMax(job.salaryMax ? String(job.salaryMax) : "");
          setSalaryCurrency(job.salaryCurrency || "INR");
          setStatus(job.status || "active");
          
          // Convert arrays to comma-separated strings
          setRequirements(
            Array.isArray(job.requirements) ? job.requirements.join(", ") : ""
          );
          setResponsibilities(
            Array.isArray(job.responsibilities) ? job.responsibilities.join(", ") : ""
          );
          
          setApplyLink(job.applyLink || "");
          
          // Format date for input field (YYYY-MM-DD)
          if (job.expiresAt) {
            const date = new Date(job.expiresAt);
            const formattedDate = date.toISOString().split("T")[0];
            setExpiresAt(formattedDate);
          }
        } else if (response.status === 404) {
          setError("Job not found");
        } else if (response.status === 403) {
          setError("You don't have permission to edit this job");
        } else {
          setError("Failed to load job data");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job data. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Create update data object
    const updateData = {
      title,
      description,
      location,
      employmentType,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      salaryCurrency: salaryCurrency || undefined,
      requirements: requirements
        ? requirements.split(",").map((item) => item.trim()).filter((item) => item)
        : [],
      responsibilities: responsibilities
        ? responsibilities.split(",").map((item) => item.trim()).filter((item) => item)
        : [],
      applyLink: applyLink || undefined,
      expiresAt: expiresAt || undefined,
      status,
    };

    try {
      // Make PATCH request to API
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      // Handle response
      if (response.ok) {
        alert("Job updated successfully!");
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.error || "Validation error. Please check all required fields.");
        alert(errorData.error || "Validation error. Please check all required fields.");
      } else if (response.status === 401) {
        setError("Unauthorized. Please sign in.");
        alert("Unauthorized. Please sign in to edit this job.");
      } else if (response.status === 403) {
        setError("You don't have permission to edit this job");
        alert("You don't have permission to edit this job.");
      } else if (response.status === 404) {
        setError("Job not found");
        alert("Job not found.");
      } else if (response.status === 500) {
        setError("Server error. Please try again later.");
        alert("Server error. Please try again later.");
      } else {
        setError("Failed to update job");
        alert("Failed to update job. Please try again.");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setError("Failed to update job. Please check your connection.");
      alert("Failed to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">Loading job data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Job Posting</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        {/* Company (Read-only) */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Company
          </label>
          <input
            type="text"
            id="company"
            value={companyName}
            readOnly
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Company cannot be changed after job creation
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Job Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            placeholder="Describe the role, team, and what makes this opportunity great..."
          />
        </div>

        {/* Location and Employment Type (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              placeholder="e.g., Mumbai, India or Remote"
            />
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Employment Type *
            </label>
            <select
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="">Select Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Minimum Salary
            </label>
            <input
              type="number"
              id="salaryMin"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              placeholder="e.g., 800000"
            />
          </div>

          <div>
            <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Maximum Salary
            </label>
            <input
              type="number"
              id="salaryMax"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              placeholder="e.g., 1200000"
            />
          </div>

          <div>
            <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Currency
            </label>
            <select
              id="salaryCurrency"
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Requirements
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            placeholder="Comma-separated list: React, Node.js, 3+ years experience, Bachelor's degree"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate each requirement with a comma
          </p>
        </div>

        {/* Responsibilities */}
        <div>
          <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Responsibilities
          </label>
          <textarea
            id="responsibilities"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            placeholder="Comma-separated list: Build scalable features, Code reviews, Mentor junior developers"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate each responsibility with a comma
          </p>
        </div>

        {/* Apply Link */}
        <div>
          <label htmlFor="applyLink" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Application Link
          </label>
          <input
            type="url"
            id="applyLink"
            value={applyLink}
            onChange={(e) => setApplyLink(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            placeholder="https://company.com/careers/apply"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Optional: External link where candidates can apply
          </p>
        </div>

        {/* Expiry Date and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              id="expiresAt"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: When should this job posting expire?
            </p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "Updating Job..." : "Update Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
