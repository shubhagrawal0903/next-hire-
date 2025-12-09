"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, ExternalLink, Mail, User, Briefcase, FileText, CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react";
import ScheduleInterviewModal from "@/components/dashboard/ScheduleInterviewModal";

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

export default function ApplicantList({ companyId }: ApplicantListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/applications/company/${companyId}`);

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

    if (companyId) {
      fetchApplications();
    }
  }, [companyId]);

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
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return <Clock className="w-3 h-3" />;
      case "REVIEWED": return <Eye className="w-3 h-3" />;
      case "INTERVIEW": return <MessageSquare className="w-3 h-3" />;
      case "ACCEPTED": return <CheckCircle className="w-3 h-3" />;
      case "REJECTED": return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleScheduleInterview = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleInterviewScheduled = () => {
    // Refresh applications list
    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/applications/company/${companyId}`);
        if (response.status === 200) {
          const data = await response.json();
          setApplications(data || []);
        }
      } catch (err) {
        console.error("Error refreshing applications:", err);
      }
    };
    fetchApplications();
  };

  const getAtsScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "text-gray-500 dark:text-gray-400 bg-gray-500/10 ring-gray-500/20";
    if (score >= 70) {
      return "text-green-600 dark:text-green-400 bg-green-500/10 ring-green-500/20";
    } else if (score >= 40) {
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 ring-yellow-500/20";
    } else {
      return "text-red-600 dark:text-red-400 bg-red-500/10 ring-red-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // If status is REJECTED, remove from list
        if (newStatus.toUpperCase() === "REJECTED") {
          setApplications((prevApplications) =>
            prevApplications.filter((app) => app.id !== applicationId)
          );
        } else {
          // Otherwise just update the status
          setApplications((prevApplications) =>
            prevApplications.map((app) =>
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-surface inline-flex p-4 rounded-full mb-4">
          <FileText className="h-8 w-8 text-text-muted" />
        </div>
        <p className="text-text-primary text-lg font-medium">No applications yet</p>
        <p className="text-text-secondary text-sm">When candidates apply, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-left">
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Applicant</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Job Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Applied On</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">ATS Score</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => (
              <tr key={app.id} className="group hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                      {app.applicantName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary text-sm">{app.applicantName}</div>
                      <div className="text-xs text-text-muted">{app.applicantEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-primary">{app.job.title}</div>
                  <div className="text-xs text-text-muted">{app.job.employmentType}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-text-secondary">{formatDate(app.createdAt)}</span>
                </td>
                <td className="px-6 py-4">
                  {app.atsScore !== null && app.atsScore !== undefined ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getAtsScoreColor(app.atsScore)}`}>
                      {app.atsScore}%
                    </span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </td>
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
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-primary transition-colors p-1"
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
                        className="text-text-secondary hover:text-primary transition-colors p-1"
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 px-4 pb-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase shadow-sm">
                  {app.applicantName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-base">{app.applicantName}</h3>
                  <p className="text-xs text-text-muted">{app.applicantEmail}</p>
                </div>
              </div>
              {app.atsScore !== null && app.atsScore !== undefined && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${getAtsScoreColor(app.atsScore)}`}>
                  {app.atsScore}% Match
                </span>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted text-xs block mb-1">Applying For</span>
                  <span className="font-medium text-text-primary">{app.job.title}</span>
                </div>
                <div>
                  <span className="text-text-muted text-xs block mb-1">Applied Date</span>
                  <span className="font-medium text-text-primary">{formatDate(app.createdAt)}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-text-muted text-xs block mb-2">Application Status</span>
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
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-surface hover:bg-surface/80 text-text-primary border border-border rounded-lg text-sm font-medium transition-colors"
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

      {/* Schedule Interview Modal */}
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
