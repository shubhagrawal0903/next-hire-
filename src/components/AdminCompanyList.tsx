"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Building, Mail, Globe, Hash, FileText, Download } from 'lucide-react';

interface AdminCompany {
  id: string;
  name: string;
  contactEmail: string;
  website: string | null;
  createdAt: string;
  registrationCertificateUrl?: string | null;
  taxCertificateUrl?: string | null;
  incorporationCertificateUrl?: string | null;
  additionalDocumentUrl?: string | null;
  registrationNumber?: string;
  companyType?: string;
  industry?: string;
}

export default function AdminCompanyList() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnverifiedCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/companies");
        if (response.status === 200) {
          const data = await response.json();
          setCompanies(data || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnverifiedCompanies();
  }, []);

  const handleVerifyCompany = async (companyId: string) => {
    try {
      setVerifyingId(companyId);
      const response = await fetch(`/api/admin/companies/${companyId}/verify`, {
        method: "PATCH",
      });

      if (response.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      } else {
        alert("Failed to verify company. Access denied or server error.");
      }
    } catch (error) {
      console.error("Error verifying company:", error);
      alert("Network error.");
    } finally {
      setVerifyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-text-secondary">Loading pending verifications...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-surface inline-flex p-4 rounded-full mb-4">
          <Building className="h-8 w-8 text-text-muted" />
        </div>
        <p className="text-text-primary text-lg font-medium">No pending verifications</p>
        <p className="text-text-secondary text-sm">All registered companies have been verified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companies.map((company) => (
        <div key={company.id} className="bg-background rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                {company.name}
                <span className="text-xs font-normal px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full border border-yellow-500/20">
                  Pending Review
                </span>
              </h3>
              <p className="text-sm text-text-muted mt-1">
                Registered on {new Date(company.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
              onClick={() => handleVerifyCompany(company.id)}
              disabled={verifyingId === company.id}
            >
              {verifyingId === company.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Approve & Verify
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-surface/50 rounded-lg border border-border">
            <div className="flex flex-col">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Contact</span>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Mail className="w-3.5 h-3.5 text-primary" /> {company.contactEmail}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Website</span>
              {company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  <Globe className="w-3.5 h-3.5" /> {company.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span className="text-sm text-text-muted italic">Not provided</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Reg Number</span>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Hash className="w-3.5 h-3.5 text-text-muted" /> {company.registrationNumber || "N/A"}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Details</span>
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Building className="w-3.5 h-3.5 text-text-muted" /> {company.industry || "N/A"} ({company.companyType || "N/A"})
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-text-secondary" /> Verificaton Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <DocumentCard title="Registration Cert." url={company.registrationCertificateUrl} type="primary" />
              <DocumentCard title="Tax Certificate" url={company.taxCertificateUrl} type="success" />
              <DocumentCard title="Incorporation" url={company.incorporationCertificateUrl} type="secondary" />
              <DocumentCard title="Additional Docs" url={company.additionalDocumentUrl} type="warning" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentCard({ title, url, type }: { title: string; url?: string | null; type: 'primary' | 'success' | 'warning' | 'secondary' }) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border border-dashed bg-surface/30 opacity-60">
        <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center">
          <FileText className="w-4 h-4 text-text-muted" />
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">{title}</p>
          <p className="text-[10px] text-text-muted/80">Missing</p>
        </div>
      </div>
    );
  }

  // Type colors map
  const typeStyles = {
    primary: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20",
    warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20",
    secondary: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20",
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-surface/80 hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${typeStyles[type]}`}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-primary truncate">{title}</p>
        <div className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5">
          View <Download className="w-3 h-3" />
        </div>
      </div>
    </a>
  );
}
