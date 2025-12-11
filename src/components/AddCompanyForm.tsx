'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddCompanyForm() {
  const router = useRouter();
  // State for all company fields
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [about, setAbout] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [yearFounded, setYearFounded] = useState('');
  const [companyType, setCompanyType] = useState('');
  
  // Certificate upload states
  const [registrationCertificate, setRegistrationCertificate] = useState<File | null>(null);
  const [taxCertificate, setTaxCertificate] = useState<File | null>(null);
  const [incorporationCertificate, setIncorporationCertificate] = useState<File | null>(null);
  const [additionalDocument, setAdditionalDocument] = useState<File | null>(null);
  const [uploadingCertificates, setUploadingCertificates] = useState(false);

  // Upload certificate to Cloudinary
  const uploadCertificate = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        console.error('Certificate upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading certificate:', error);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingCertificates(true);

    try {
      // Upload certificates first
      let registrationCertificateUrl = null;
      let taxCertificateUrl = null;
      let incorporationCertificateUrl = null;
      let additionalDocumentUrl = null;

      if (registrationCertificate) {
        registrationCertificateUrl = await uploadCertificate(registrationCertificate);
      }
      if (taxCertificate) {
        taxCertificateUrl = await uploadCertificate(taxCertificate);
      }
      if (incorporationCertificate) {
        incorporationCertificateUrl = await uploadCertificate(incorporationCertificate);
      }
      if (additionalDocument) {
        additionalDocumentUrl = await uploadCertificate(additionalDocument);
      }

      setUploadingCertificates(false);

      // Create company data object with certificates
      const companyData = {
        name,
        legalName,
        registrationNumber,
        logoUrl,
        website,
        industry,
        companySize,
        about,
        contactEmail,
        yearFounded,
        companyType,
        registrationCertificateUrl,
        taxCertificateUrl,
        incorporationCertificateUrl,
        additionalDocumentUrl,
      };

      // Make POST request to API
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      // Handle response
      if (response.ok) {
        alert('Company created successfully! Redirecting to dashboard...');
        // Redirect to dashboard after successful company creation
        setTimeout(() => {
          window.location.href = '/dashboard'; // Use hard redirect to ensure role refresh
        }, 1500);
      } else if (response.status === 409) {
        const errorData = await response.json();
        alert(errorData.error || 'Company already exists');
      } else {
        alert('Failed to create company. Please try again.');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-lg shadow-nh border border-border">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Add New Company</h2>
      
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

        {/* Registration Number */}
        <div>
          <label htmlFor="registrationNumber" className="block text-sm font-medium text-text-primary mb-2">
            Registration Number *
          </label>
          <input
            type="text"
            id="registrationNumber"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
            className="bg-input text-foreground placeholder-input-placeholder w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh"
            placeholder="Enter registration number"
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

        {/* Verification Documents Section */}
        <div className="border-t border-border pt-6 mt-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Verification Documents
            <span className="text-sm font-normal text-text-secondary ml-2">(For Admin Verification)</span>
          </h3>
          
          {/* Registration Certificate */}
          <div className="mb-4">
            <label htmlFor="registrationCertificate" className="block text-sm font-medium text-text-primary mb-2">
              Company Registration Certificate
            </label>
            <input
              type="file"
              id="registrationCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setRegistrationCertificate(e.target.files?.[0] || null)}
              className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-text-secondary mt-1">Upload PDF, JPG, or PNG (Max 5MB)</p>
          </div>

          {/* Tax Certificate */}
          <div className="mb-4">
            <label htmlFor="taxCertificate" className="block text-sm font-medium text-text-primary mb-2">
              Tax Registration Certificate
            </label>
            <input
              type="file"
              id="taxCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setTaxCertificate(e.target.files?.[0] || null)}
              className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-text-secondary mt-1">Upload PDF, JPG, or PNG (Max 5MB)</p>
          </div>

          {/* Incorporation Certificate */}
          <div className="mb-4">
            <label htmlFor="incorporationCertificate" className="block text-sm font-medium text-text-primary mb-2">
              Certificate of Incorporation
            </label>
            <input
              type="file"
              id="incorporationCertificate"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIncorporationCertificate(e.target.files?.[0] || null)}
              className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-text-secondary mt-1">Upload PDF, JPG, or PNG (Max 5MB)</p>
          </div>

          {/* Additional Document */}
          <div className="mb-4">
            <label htmlFor="additionalDocument" className="block text-sm font-medium text-text-primary mb-2">
              Additional Document (Optional)
            </label>
            <input
              type="file"
              id="additionalDocument"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setAdditionalDocument(e.target.files?.[0] || null)}
              className="bg-input text-foreground w-full px-4 py-3 rounded-lg border border-input-border focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-nh file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-text-secondary mt-1">Any other supporting document</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={uploadingCertificates}
            className="nh-button-primary w-full px-6 py-3 rounded-lg font-medium transition-nh shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingCertificates ? 'Uploading Documents...' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  );
}