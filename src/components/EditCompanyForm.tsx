'use client'

import React, { useState, useEffect } from 'react';

interface EditCompanyFormProps {
  companyId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function EditCompanyForm({ companyId, onCancel, onSuccess }: EditCompanyFormProps) {
  // State for all updatable company fields
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [about, setAbout] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [yearFounded, setYearFounded] = useState('');
  const [companyType, setCompanyType] = useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing company data
  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/companies/${companyId}`);

        if (response.status === 200) {
          const company = await response.json();
          
          // Populate form with existing data
          setName(company.name || '');
          setLegalName(company.legalName || '');
          setLogoUrl(company.logoUrl || '');
          setWebsite(company.website || '');
          setIndustry(company.industry || '');
          setCompanySize(company.companySize || '');
          setAbout(company.about || '');
          setContactEmail(company.contactEmail || '');
          setYearFounded(company.yearFounded ? String(company.yearFounded) : '');
          setCompanyType(company.companyType || '');
        } else if (response.status === 404) {
          setError('Company not found');
        } else {
          setError('Failed to load company data');
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Create update data object
    const updates = {
      name,
      legalName: legalName || null,
      logoUrl: logoUrl || null,
      website: website || null,
      industry,
      companySize,
      about: about || null,
      contactEmail,
      yearFounded: parseInt(yearFounded),
      companyType,
    };

    try {
      // Make PATCH request to API
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      // Handle response
      if (response.status === 200 || response.status === 201) {
        alert('Company updated successfully!');
        // Call onSuccess callback if provided, otherwise redirect
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = `/company/${companyId}`;
        }
      } else if (response.status === 403) {
        const errorData = await response.json();
        alert(errorData.error || 'Forbidden - You do not own this company');
        setError('You do not have permission to edit this company');
      } else if (response.status === 400) {
        const errorData = await response.json();
        alert(errorData.error || 'Validation error - Please check your input');
        setError('Invalid data. Please check all fields.');
      } else if (response.status === 401) {
        alert('Unauthorized - Please sign in');
        setError('Please sign in to edit this company');
      } else {
        alert('Failed to update company. Please try again.');
        setError('Failed to update company');
      }
    } catch (err) {
      console.error('Error updating company:', err);
      alert('Failed to update company. Please try again.');
      setError('Failed to update company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-surface rounded-lg shadow-nh border border-border">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading company data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isSubmitting) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-surface rounded-lg shadow-nh border border-border">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="nh-button-primary px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-lg shadow-nh border border-border">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Company</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="Enter company name"
          />
        </div>

        {/* Legal Name */}
        <div>
          <label htmlFor="legalName" className="block text-sm font-medium text-text-primary mb-2">
            Legal Name
          </label>
          <input
            type="text"
            id="legalName"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="Enter legal company name"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-text-primary mb-2">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="https://company-website.com"
          />
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-text-primary mb-2">
            Industry *
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
            className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
          >
            <option value="">Select industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Consulting">Consulting</option>
            <option value="Media">Media</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-text-primary mb-2">
            Company Size *
          </label>
          <select
            id="companySize"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            required
            className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>

        {/* About */}
        <div>
          <label htmlFor="about" className="block text-sm font-medium text-text-primary mb-2">
            About Company
          </label>
          <textarea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh resize-vertical"
            placeholder="Tell us about the company..."
          />
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-text-primary mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="contact@company.com"
          />
        </div>

        {/* Year Founded */}
        <div>
          <label htmlFor="yearFounded" className="block text-sm font-medium text-text-primary mb-2">
            Year Founded *
          </label>
          <input
            type="number"
            id="yearFounded"
            value={yearFounded}
            onChange={(e) => setYearFounded(e.target.value)}
            required
            min="1800"
            max={new Date().getFullYear()}
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="2020"
          />
        </div>

        {/* Company Type */}
        <div>
          <label htmlFor="companyType" className="block text-sm font-medium text-text-primary mb-2">
            Company Type *
          </label>
          <select
            id="companyType"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            required
            className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
          >
            <option value="">Select company type</option>
            <option value="Startup">Startup</option>
            <option value="MNC">MNC</option>
            <option value="SME">SME</option>
            <option value="Government">Government</option>
            <option value="Non-Profit">Non-Profit</option>
            <option value="Public">Public Company</option>
            <option value="Private">Private Company</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="nh-button-primary flex-1 px-6 py-3 rounded-lg font-medium transition-nh shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Company'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                window.history.back();
              }
            }}
            className="px-6 py-3 rounded-lg font-medium border border-border hover:bg-gray-100 dark:hover:bg-gray-800 transition-nh"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
