"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, ExternalLink, Clock, Briefcase, MapPin, Building2, Search } from "lucide-react";
import Link from "next/link";

// Type definition for Application with Job details
interface ApplicationWithJob {
  id: string;
  jobId: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  resumeUrl: string;
  coverLetter?: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  interviewDate?: Date | string | null;
  interviewLink?: string | null;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    employmentType: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    postedAt: Date | string;
    status: string;
    company: {
      id: string;
      name: string;
      logoUrl?: string | null;
      industry: string;
    };
  };
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to check if interview time has arrived
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('/api/applications/my-applications');

        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        } else if (response.status === 401) {
          console.error('Unauthorized - Please sign in');
        } else {
          console.error('Error fetching applications:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (dateString: string | Date): string => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const formatInterviewDateTime = (dateString: string | Date): string => {
    try {
      return format(new Date(dateString), 'PPP • p');
    } catch (error) {
      console.error("Error formatting interview date:", error);
      return 'Invalid Date';
    }
  };

  // Check if interview time has arrived and is still valid (15 min before to 24 hours after)
  const canJoinInterview = (interviewDate: string | Date): boolean => {
    const interviewTime = new Date(interviewDate);
    const now = currentTime;
    const timeDiff = interviewTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Allow joining 15 minutes before and up to 24 hours after scheduled time
    return minutesDiff <= 15 && hoursDiff >= -24;
  };

  // Get time remaining until interview or expiry status
  const getTimeRemaining = (interviewDate: string | Date): string => {
    const interviewTime = new Date(interviewDate);
    const now = currentTime;
    const timeDiff = interviewTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Check if interview link has expired (more than 24 hours after scheduled time)
    if (hoursDiff < -24) {
      return 'Interview link expired';
    }

    // If interview time has passed but within 24 hours
    if (timeDiff <= 0 && hoursDiff >= -24) {
      const hoursRemaining = Math.floor(24 + hoursDiff);
      return `Link expires in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Starts in ${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Starts in ${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes > 15) {
      return `Starts in ${minutes} minutes`;
    } else {
      return 'Starting soon - You can join now!';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'interview':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-screen-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pl-1">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 tracking-tight">
            My Applications
          </h1>
          <p className="text-text-secondary text-lg">
            Track and manage your job applications
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading your applications...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-16 text-center max-w-2xl mx-auto mt-8">
            <div className="bg-surface inline-flex p-4 rounded-full mb-6">
              <Search className="h-10 w-10 text-text-muted" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              No applications yet
            </h2>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto">
              You haven't applied to any jobs yet. Start exploring opportunities to find your next role!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium"
            >
              <Search className="w-4 h-4" />
              Browse Jobs
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-6">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-text-primary">{applications.length}</p>
                </div>
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {applications.filter(app => app.status.toLowerCase() === 'pending').length}
                  </p>
                </div>
                <div className="bg-yellow-500/10 p-2.5 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Interviews</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {applications.filter(app => app.status.toLowerCase() === 'interview').length}
                  </p>
                </div>
                <div className="bg-purple-500/10 p-2.5 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface border-b border-border text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Job Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Applied Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Interview Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-surface/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-text-primary text-base">{app.job.title}</div>
                          <div className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {app.job.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {app.job.company.logoUrl ? (
                              <img
                                src={app.job.company.logoUrl}
                                alt={app.job.company.name}
                                className="w-9 h-9 rounded-lg object-cover border border-border bg-white"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                                {app.job.company.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-text-primary">{app.job.company.name}</div>
                              <div className="text-xs text-text-muted">{app.job.company.industry}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {app.status.toLowerCase() === 'interview' && app.interviewDate && app.interviewLink ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatInterviewDateTime(app.interviewDate)}</span>
                              </div>

                              {canJoinInterview(app.interviewDate) ? (
                                <a
                                  href={app.interviewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex max-w-fit items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Join Meeting
                                </a>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <button
                                    disabled
                                    className="inline-flex max-w-fit items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-text-muted text-xs font-medium rounded-lg cursor-not-allowed opacity-70"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Join Meeting
                                  </button>
                                  <span className="text-[10px] text-yellow-600 dark:text-yellow-500 font-medium">
                                    {getTimeRemaining(app.interviewDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {app.job.company.logoUrl ? (
                        <img
                          src={app.job.company.logoUrl}
                          alt={app.job.company.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                          {app.job.company.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-semibold text-text-primary leading-tight">
                          {app.job.title}
                        </h3>
                        <p className="text-sm text-text-secondary">{app.job.company.name}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-text-secondary border-t border-border pt-4 mt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-muted" />
                      {app.job.location} ({app.job.employmentType})
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      Applied on {formatDate(app.createdAt)}
                    </div>
                  </div>

                  {/* Interview Card Mobile */}
                  {app.status.toLowerCase() === 'interview' && app.interviewDate && app.interviewLink && (
                    <div className="mt-4 bg-surface border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-text-primary">
                        <Calendar className="w-4 h-4 text-primary" />
                        Interview Scheduled
                      </div>
                      <p className="text-xs text-text-secondary mb-3">
                        {formatInterviewDateTime(app.interviewDate)}
                      </p>

                      {canJoinInterview(app.interviewDate) ? (
                        <a
                          href={app.interviewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg"
                        >
                          Join Now <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <div className="text-center">
                          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-500">
                            {getTimeRemaining(app.interviewDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
