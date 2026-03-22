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
  Download,
  Users,
  Mail,
} from "lucide-react";
import ScheduleInterviewModal from "@/components/dashboard/ScheduleInterviewModal";
import BulkInterviewModal from "@/components/dashboard/BulkInterviewModal";
import type { BulkCandidate } from "@/components/dashboard/BulkInterviewModal";
import BulkMessageModal from "@/components/dashboard/BulkMessageModal";
import type { MessageTarget } from "@/components/dashboard/BulkMessageModal";

/* ─── Types ─────────────────────────────────────────────────────── */

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
  companyName?: string;
}

/* ─── Colour helpers ─────────────────────────────────────────────── */

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

export default function ApplicantList({
  companyId,
  companyName = "Your Company",
}: ApplicantListProps) {
  // ── Job filter state ──────────────────────────────────────────────
  const [jobs, setJobs] = useState<Pick<Job, "id" | "title">[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // ── Application list state ────────────────────────────────────────
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Checkbox / bulk-select state ──────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);

  // ── PDF state ─────────────────────────────────────────────────────
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ── Single-interview modal state ──────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  /* ── Fetch company jobs for the dropdown ─────────────────────────── */
  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/jobs?companyId=${companyId}&status=active`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) =>
        setJobs((data.jobs ?? []).map((j: Job) => ({ id: j.id, title: j.title })))
      )
      .catch(() => {});
  }, [companyId]);

  /* ── Fetch applications ──────────────────────────────────────────── */
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
        // Clear broken selections when list refreshes
        setSelectedIds(new Set());
      } else if (response.status === 401) {
        setError("Please sign in to view applications");
      } else if (response.status === 403) {
        setError("You don't have permission to view these applications");
      } else if (response.status === 404) {
        setError("Company not found");
      } else {
        setError("Failed to load applications.");
      }
    } catch {
      setError("Failed to load applications. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedJobId]);

  /* ── Checkbox helpers ────────────────────────────────────────────── */
  const allChecked =
    applications.length > 0 && selectedIds.size === applications.length;
  const someChecked = selectedIds.size > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Build BulkCandidate list for the modal ──────────────────────── */
  const bulkCandidates: BulkCandidate[] = applications
    .filter((a) => selectedIds.has(a.id))
    .map((a) => ({
      applicationId: a.id,
      applicantName: a.applicantName,
      applicantEmail: a.applicantEmail,
      jobTitle: a.job.title,
    }));

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
          setApplications((prev) => prev.filter((a) => a.id !== applicationId));
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(applicationId);
            return next;
          });
        } else {
          setApplications((prev) =>
            prev.map((a) =>
              a.id === applicationId ? { ...a, status: newStatus } : a
            )
          );
        }
      } else {
        const err = await response.json();
        alert(err.error || "Failed to update status");
      }
    } catch {
      alert("Network error. Please check your connection.");
    }
  };

  /* ── Single-interview modal handlers ─────────────────────────────── */
  const handleScheduleInterview = (app: Application) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };
  const handleInterviewScheduled = () => fetchApplications();

  /* ── PDF ─────────────────────────────────────────────────────────── */
  const generatePDF = async () => {
    if (applications.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const selectedJob = jobs.find((j) => j.id === selectedJobId);
      const jobLabel = selectedJob ? selectedJob.title : "All Jobs";
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 32, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text(companyName, pageW / 2, 13, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.text(`Applicant Report: ${jobLabel}`, pageW / 2, 22, { align: "center" });
      doc.setFontSize(8);
      doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}`, pageW - 10, 29, { align: "right" });

      const sorted = [...applications].sort((a, b) => (b.atsScore ?? -1) - (a.atsScore ?? -1));
      const rows = sorted.map((app, i) => [
        i + 1,
        app.applicantName,
        app.applicantEmail,
        "N/A",
        app.atsScore != null ? `${app.atsScore}%` : "—",
        app.job.title,
        app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase(),
        formatDate(app.createdAt),
      ]);

      const atsColour = (s: number | null | undefined): [number, number, number] => {
        if (s == null) return [100, 116, 139];
        if (s >= 70) return [22, 163, 74];
        if (s >= 40) return [202, 138, 4];
        return [220, 38, 38];
      };

      autoTable(doc, {
        startY: 38,
        head: [["#", "Name", "Email", "Phone", "ATS Score", "Job Role", "Status", "Applied On"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: { top: 4, right: 5, bottom: 4, left: 5 }, textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.3 },
        headStyles: { fillColor: [30, 41, 59], textColor: [248, 250, 252], fontStyle: "bold", fontSize: 9, halign: "center" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          3: { halign: "center" },
          4: { halign: "center", cellWidth: 22 },
          6: { halign: "center", cellWidth: 22 },
          7: { halign: "center", cellWidth: 28 },
        },
        didParseCell(data) {
          if (data.section === "body" && data.column.index === 4) {
            const [r, g, b] = atsColour(sorted[data.row.index]?.atsScore);
            data.cell.styles.textColor = [r, g, b];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${totalPages}  ·  ${companyName}  ·  Confidential`, pageW / 2, doc.internal.pageSize.getHeight() - 6, { align: "center" });
      }

      doc.save(`applicant-report-${jobLabel.replace(/\s+/g, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /* ── Render: loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  /* ── Render: main ────────────────────────────────────────────────── */
  return (
    <div className="w-full">

      {/* ── Toolbar row 1: Job Filter + PDF ─────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground shrink-0">
          <Briefcase className="w-4 h-4 text-primary" />
          Filter by Job:
        </div>

        <div className="relative w-full sm:w-64">
          <select
            id="job-filter-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className={[
              "w-full appearance-none pl-3 pr-9 py-2 rounded-lg text-sm",
              "bg-background text-foreground border border-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
              "transition-all cursor-pointer hover:border-primary/50",
            ].join(" ")}
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        <span className="text-xs text-muted-foreground shrink-0">
          {applications.length} applicant{applications.length !== 1 ? "s" : ""}
          {selectedJobId ? " for this job" : " total"} · sorted by ATS score
        </span>

        {applications.length > 0 && (
          <button
            onClick={generatePDF}
            disabled={isGeneratingPdf}
            className={[
              "ml-auto shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
              "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
              "transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
            ].join(" ")}
            title="Download PDF report"
          >
            {isGeneratingPdf ? (
              <>
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Generating…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Toolbar row 2: Bulk action bar (only when selections exist) ── */}
      {selectedIds.size > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-primary/5 border-b border-primary/20 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Users className="w-4 h-4" />
            {selectedIds.size} candidate{selectedIds.size !== 1 ? "s" : ""} selected
          </div>

          {/* Schedule Interview */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className={[
              "ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-95 transition-all shadow-sm",
            ].join(" ")}
          >
            <Calendar className="w-4 h-4" />
            Schedule Interview ({selectedIds.size})
          </button>

          {/* Send Message */}
          <button
            onClick={() => setIsMsgModalOpen(true)}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
              "bg-muted text-foreground border border-border",
              "hover:bg-muted/80 active:scale-95 transition-all shadow-sm",
            ].join(" ")}
          >
            <Mail className="w-4 h-4" />
            Send Message ({selectedIds.size})
          </button>

          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
      )}

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

      {/* ── Desktop Table ─────────────────────────────────────────────── */}
      {applications.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                {/* Select-all checkbox */}
                <th className="pl-4 pr-2 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    aria-label="Select all applicants"
                  />
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant</th>
                <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Role</th>
                <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applied On</th>
                <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ATS Score</th>
                <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app) => {
                const checked = selectedIds.has(app.id);
                return (
                  <tr
                    key={app.id}
                    className={[
                      "group transition-colors",
                      checked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/20",
                    ].join(" ")}
                  >
                    {/* Row checkbox */}
                    <td className="pl-4 pr-2 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(app.id)}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                        aria-label={`Select ${app.applicantName}`}
                      />
                    </td>

                    {/* Applicant */}
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
                      <div className="text-sm text-foreground">{app.job.title}</div>
                      <div className="text-xs text-muted-foreground">{app.job.employmentType}</div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</span>
                    </td>

                    {/* ATS Score */}
                    <td className="px-4 py-4">
                      {app.atsScore != null ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getAtsScoreColor(app.atsScore)}`}>
                          {app.atsScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
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
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="View Resume"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile Card View ──────────────────────────────────────────── */}
      {applications.length > 0 && (
        <div className="md:hidden space-y-4 px-4 pb-4 pt-4">
          {applications.map((app) => {
            const checked = selectedIds.has(app.id);
            return (
              <div
                key={app.id}
                className={[
                  "border rounded-xl p-5 shadow-sm transition-colors",
                  checked ? "border-primary/40 bg-primary/5" : "bg-card border-border",
                ].join(" ")}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(app.id)}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0"
                      aria-label={`Select ${app.applicantName}`}
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase shadow-sm">
                      {app.applicantName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-base">{app.applicantName}</h3>
                      <p className="text-xs text-muted-foreground">{app.applicantEmail}</p>
                    </div>
                  </div>
                  {app.atsScore != null && (
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
            );
          })}
        </div>
      )}

      {/* ── Single Interview Modal ────────────────────────────────────── */}
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

      {/* ── Bulk Interview Modal ──────────────────────────────────────── */}
      <BulkInterviewModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        candidates={bulkCandidates}
        onSuccess={() => {
          setSelectedIds(new Set());
          fetchApplications();
        }}
      />

      {/* ── Bulk Message Modal ────────────────────────────────────────── */}
      <BulkMessageModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        targets={applications
          .filter((a) => selectedIds.has(a.id))
          .map<MessageTarget>((a) => ({
            applicantName: a.applicantName,
            applicantEmail: a.applicantEmail,
          }))}
        onSuccess={() => setSelectedIds(new Set())}
      />
    </div>
  );
}

