"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import ScheduleInterviewModal from "@/components/dashboard/ScheduleInterviewModal";

/* ─── Types ──────────────────────────────────────────────────────── */

interface Job {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  status: string;
}

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  coverLetter?: string;
  status: string;
  atsScore?: number | null;
  createdAt: string;
  job: Job;
  interviewDate?: string | null;
  interviewLink?: string | null;
}

interface ApplicantListProps {
  companyId: string;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
    case "REVIEWED":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    case "INTERVIEW":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
    case "ACCEPTED":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":    return <Clock className="w-3 h-3" />;
    case "REVIEWED":   return <Eye className="w-3 h-3" />;
    case "INTERVIEW":  return <MessageSquare className="w-3 h-3" />;
    case "ACCEPTED":   return <CheckCircle className="w-3 h-3" />;
    case "REJECTED":   return <XCircle className="w-3 h-3" />;
    default:           return null;
  }
};

const getAtsScoreColor = (score: number | null | undefined) => {
  if (score === null || score === undefined)
    return "text-muted-foreground bg-muted ring-border";
  if (score >= 70) return "text-green-600 dark:text-green-400 bg-green-500/10 ring-green-500/20";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 ring-yellow-500/20";
  return "text-red-600 dark:text-red-400 bg-red-500/10 ring-red-500/20";
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function ApplicantList({ companyId }: ApplicantListProps) {
  // ── Job filter state ──────────────────────────────────────────────
  const [jobs, setJobs] = useState<Pick<Job, "id" | "title">[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // ── Application list state ────────────────────────────────────────
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Modal state ───────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  /* ── Fetch company jobs for the dropdown ─────────────────────────── */
  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/jobs?companyId=${companyId}&status=active&mine=false`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        // The GET /api/jobs returns { jobs, totalJobs }
        setJobs((data.jobs ?? []).map((j: Job) => ({ id: j.id, title: j.title })));
      })
      .catch(() => {
        // Non-critical – dropdown just shows "All Jobs"
      });
  }, [companyId]);

  /* ── Fetch applications (re-runs on companyId OR selectedJobId change) */
  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = selectedJobId
        ? `/api/applications/company/${companyId}?jobId=${selectedJobId}`
        : `/api/applications/company/${companyId}`;

      const response = await fetch(url);

      if (response.status === 200) {
        const data = await response.json();
        setApplications(data || []);
      } else if (response.status === 401) {
        setError("Please sign in to view applications");
      } else if (response.status === 403) {
        setError("You don't have permission to view these applications");
      } else if (response.status === 404) {
        setError("Company not found");
      } else {
        setError("Failed to load applications.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load applications. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedJobId]);

  /* ── Status update ───────────────────────────────────────────────── */
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        if (newStatus.toUpperCase() === "REJECTED") {
          setApplications((prev) => prev.filter((app) => app.id !== applicationId));
        } else {
          setApplications((prev) =>
            prev.map((app) =>
              app.id === applicationId ? { ...app, status: newStatus } : app
            )
          );
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Network error. Please check your connection.");
    }
  };

  /* ── Interview modal handlers ────────────────────────────────────── */
  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleInterviewScheduled = () => {
    fetchApplications();
  };

  /* ── Render: loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  /* ── Render: error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">{error}</div>
    );
  }

  /* ── Render: main ────────────────────────────────────────────────── */
  return (
    <div className="w-full">

      {/* ── Job Filter Dropdown ──────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground shrink-0">
          <Briefcase className="w-4 h-4 text-primary" />
          Filter by Job:
        </div>

        {/* Custom themed select */}
        <div className="relative w-full sm:w-64">
          <select
            id="job-filter-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className={[
              "w-full appearance-none",
              "pl-3 pr-9 py-2 rounded-lg text-sm",
              "bg-background text-foreground",
              "border border-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
              "transition-all cursor-pointer",
              "hover:border-primary/50",
            ].join(" ")}
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
        </div>

        {/* Result count badge */}
        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          {applications.length} applicant{applications.length !== 1 ? "s" : ""}
          {selectedJobId ? " for this job" : " total"}
          &nbsp;· sorted by ATS score
        </span>
      </div>

      {/* ── Empty State ──────────────────────────────────────────────── */}
      {applications.length === 0 && (
        <div className="py-12 text-center">
          <div className="bg-muted inline-flex p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-foreground text-lg font-medium">No applications yet</p>
          <p className="text-muted-foreground text-sm">
            {selectedJobId
              ? "No candidates have applied for this job yet."
              : "When candidates apply, they'll appear here."}
          </p>
        </div>
      )}

      {/* ── Desktop Table View ────────────────────────────────────────── */}
      {applications.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied On</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ATS Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => (
                <tr key={app.id} className="group hover:bg-muted/20 transition-colors">
                  {/* Applicant */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                        {app.applicantName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{app.applicantName}</div>
                        <div className="text-xs text-muted-foreground">{app.applicantEmail}</div>
                      </div>
                    </div>
                  </td>

                  {/* Job */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{app.job.title}</div>
                    <div className="text-xs text-muted-foreground">{app.job.employmentType}</div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</span>
                  </td>

                  {/* ATS Score */}
                  <td className="px-6 py-4">
                    {app.atsScore !== null && app.atsScore !== undefined ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getAtsScoreColor(app.atsScore)}`}
                      >
                        {app.atsScore}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all ${getStatusColor(app.status)}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="Interview">Interview</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Resume — opens PDF in a new tab */}
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="View Resume"
                      >
                        <FileText className="w-4 h-4" />
                      </a>

                      {/* Schedule / Join Interview */}
                      {app.interviewDate && app.interviewLink ? (
                        <a
                          href={app.interviewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 dark:text-green-400 hover:text-green-700 p-1"
                          title="Join Interview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          onClick={() => handleScheduleInterview(app)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Schedule Interview"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile Card View ──────────────────────────────────────────── */}
      {applications.length > 0 && (
        <div className="md:hidden space-y-4 px-4 pb-4 pt-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase shadow-sm">
                    {app.applicantName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{app.applicantName}</h3>
                    <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
                  </div>
                </div>
                {app.atsScore !== null && app.atsScore !== undefined && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ring-1 ring-inset ${getAtsScoreColor(app.atsScore)}`}>
                    {app.atsScore}% Match
                  </span>
                )}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Applying For</span>
                    <span className="font-medium text-foreground">{app.job.title}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Applied Date</span>
                    <span className="font-medium text-foreground">{formatDate(app.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-muted-foreground text-xs block mb-2">Application Status</span>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`w-full appearance-none px-4 py-2.5 rounded-lg text-sm font-medium border cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all ${getStatusColor(app.status)}`}
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="Interview">Interview Stage</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
                {/* Resume button — opens PDF in a new tab */}
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" /> Resume
                </a>

                {app.interviewDate && app.interviewLink ? (
                  <a
                    href={app.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Link
                  </a>
                ) : (
                  <button
                    onClick={() => handleScheduleInterview(app)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Calendar className="w-4 h-4" /> Interview
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Schedule Interview Modal ──────────────────────────────────── */}
      {selectedApplication && (
        <ScheduleInterviewModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          applicationId={selectedApplication.id}
          applicantName={selectedApplication.applicantName}
          jobTitle={selectedApplication.job.title}
          onSuccess={handleInterviewScheduled}
        />
      )}
    </div>
  );
}
