'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function JobPostForm() {
  // Auth state
  const { userId } = useAuth();

  // State for all job fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('INR');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for companies dropdown
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Fetch user's companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!userId) {
        setCompaniesLoading(false);
        return;
      }

      try {
        setCompaniesLoading(true);
        const response = await fetch('/api/companies');

        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
          
          // Automatically set the first company as selected if available
          if (data.length > 0) {
            setCompanyId(data[0].id);
          }
        } else {
          console.error('Failed to fetch companies:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create job data object with type conversions
    const jobData = {
      title,
      description,
      companyId,
      location,
      employmentType,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      salaryCurrency: salaryCurrency || undefined,
      requirements: requirements ? requirements.split(',').map(item => item.trim()).filter(item => item) : [],
      responsibilities: responsibilities ? responsibilities.split(',').map(item => item.trim()).filter(item => item) : [],
      applyLink: applyLink || undefined,
      expiresAt: expiresAt || undefined,
      status: 'active'
    };

    try {
      // Make POST request to API
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      // Handle response
      if (response.ok) {
        alert('Job posted successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setCompanyId(companies.length > 0 ? companies[0].id : '');
        setLocation('');
        setEmploymentType('');
        setSalaryMin('');
        setSalaryMax('');
        setSalaryCurrency('INR');
        setRequirements('');
        setResponsibilities('');
        setApplyLink('');
        setExpiresAt('');
      } else if (response.status === 400) {
        const errorData = await response.json();
        alert(errorData.error || 'Validation error. Please check all required fields.');
      } else if (response.status === 401) {
        alert('Unauthorized. Please sign in to post a job.');
      } else {
        alert('Failed to post job. Please try again.');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-lg shadow-nh border border-border">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Post a New Job</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        {/* Company Selection */}
        <div>
          <label htmlFor="companyId" className="block text-sm font-medium text-text-primary mb-2">
            Company *
          </label>
          {companiesLoading ? (
            <div className="nh-input w-full px-4 py-3 rounded-lg border border-input-border bg-muted text-text-secondary">
              Loading companies...
            </div>
          ) : companies.length === 0 ? (
            <div>
              <div className="nh-input w-full px-4 py-3 rounded-lg border border-input-border bg-muted text-text-secondary">
                No companies found. Please add a company first.
              </div>
              <p className="text-xs text-text-secondary mt-1">
                <a href="/add-company" className="text-primary hover:underline">
                  Click here to add a company
                </a>
              </p>
            </div>
          ) : (
            <div className="nh-input w-full px-4 py-3 rounded-lg border border-input-border bg-background text-foreground">
              {companies[0].name}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
            Job Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="Describe the role, team, and what makes this opportunity great..."
          />
        </div>

        {/* Location and Employment Type (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
              placeholder="e.g., Mumbai, India or Remote"
            />
          </div>

          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-text-primary mb-2">
              Employment Type *
            </label>
            <select
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              required
              className="nh-input w-full px-4 py-3 rounded-lg border border-input-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            >
              <option value="" className="bg-background text-foreground">Select Type</option>
              <option value="Full-time" className="bg-background text-foreground">Full-time</option>
              <option value="Part-time" className="bg-background text-foreground">Part-time</option>
              <option value="Contract" className="bg-background text-foreground">Contract</option>
              <option value="Internship" className="bg-background text-foreground">Internship</option>
              <option value="Freelance" className="bg-background text-foreground">Freelance</option>
            </select>
          </div>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="salaryMin" className="block text-sm font-medium text-text-primary mb-2">
              Minimum Salary
            </label>
            <input
              type="number"
              id="salaryMin"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
              placeholder="e.g., 800000"
            />
          </div>

          <div>
            <label htmlFor="salaryMax" className="block text-sm font-medium text-text-primary mb-2">
              Maximum Salary
            </label>
            <input
              type="number"
              id="salaryMax"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
              placeholder="e.g., 1200000"
            />
          </div>

          <div>
            <label htmlFor="salaryCurrency" className="block text-sm font-medium text-text-primary mb-2">
              Currency
            </label>
            <select
              id="salaryCurrency"
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
              className="nh-input w-full px-4 py-3 rounded-lg border border-input-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            >
              <option value="INR" className="bg-background text-foreground">INR (₹)</option>
              <option value="USD" className="bg-background text-foreground">USD ($)</option>
              <option value="EUR" className="bg-background text-foreground">EUR (€)</option>
              <option value="GBP" className="bg-background text-foreground">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-text-primary mb-2">
            Requirements
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={4}
            className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="Comma-separated list: React, Node.js, 3+ years experience, Bachelor's degree"
          />
          <p className="text-xs text-text-secondary mt-1">
            Separate each requirement with a comma
          </p>
        </div>

        {/* Responsibilities */}
        <div>
          <label htmlFor="responsibilities" className="block text-sm font-medium text-text-primary mb-2">
            Responsibilities
          </label>
          <textarea
            id="responsibilities"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            rows={4}
            className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="Comma-separated list: Build scalable features, Code reviews, Mentor junior developers"
          />
          <p className="text-xs text-text-secondary mt-1">
            Separate each responsibility with a comma
          </p>
        </div>

        {/* Apply Link */}
        <div>
          <label htmlFor="applyLink" className="block text-sm font-medium text-text-primary mb-2">
            Application Link
          </label>
          <input
            type="url"
            id="applyLink"
            value={applyLink}
            onChange={(e) => setApplyLink(e.target.value)}
            className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="https://company.com/careers/apply"
          />
          <p className="text-xs text-text-secondary mt-1">
            Optional: External link where candidates can apply
          </p>
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-text-primary mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            id="expiresAt"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="nh-input w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
          />
          <p className="text-xs text-text-secondary mt-1">
            Optional: When should this job posting expire?
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to clear the form?')) {
                setTitle('');
                setDescription('');
                setCompanyId(companies.length > 0 ? companies[0].id : '');
                setLocation('');
                setEmploymentType('');
                setSalaryMin('');
                setSalaryMax('');
                setSalaryCurrency('INR');
                setRequirements('');
                setResponsibilities('');
                setApplyLink('');
                setExpiresAt('');
              }
            }}
            className="px-6 py-3 rounded-lg border border-border text-text-primary hover:bg-muted transition-nh"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-nh disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Posting Job...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}