"use client";

import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import JobCard from '@/components/cards/job-card';
import JobModal from '@/components/job-modal';
import EditJobForm from '@/components/EditJobForm';

export default function MyJobsPage() {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/jobs?mine=true');

        if (response.ok) {
          const data = await response.json();
          // Extract jobs array from response (API returns { jobs: [...], totalJobs: number })
          setMyJobs(data.jobs || data.data || data || []);
        } else {
          console.error('Failed to fetch jobs:', response.statusText);
          setMyJobs([]);
        }
      } catch (error) {
        console.error('Error fetching my jobs:', error);
        setMyJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  // Handle job deletion
  const handleDeleteJob = async (jobId: string) => {
    // Ask for confirmation
    const confirmed = window.confirm('Are you sure you want to delete this job posting?');
    if (!confirmed) {
      return; // User cancelled
    }

    try {
      // Make DELETE request
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      // Handle response
      if (response.ok) {
        // Success (200 or 204)
        alert('Job deleted successfully!');
        // Update state by filtering out the deleted job
        setMyJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      } else if (response.status === 403) {
        // Forbidden
        alert('You do not have permission to delete this job.');
      } else if (response.status === 404) {
        // Not found
        alert('Job not found. It may have already been deleted.');
        // Still remove from state
        setMyJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      } else if (response.status === 500) {
        // Server error
        alert('Server error. Please try again later.');
      } else {
        // Other errors
        alert('Failed to delete job. Please try again.');
      }
    } catch (error) {
      // Network error
      console.error('Error deleting job:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-8 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
            My Posted Jobs
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Manage and view all the jobs you've posted
          </p>
        </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : !Array.isArray(myJobs) || myJobs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 sm:py-20">
          <div className="max-w-md mx-auto bg-card rounded-xl border border-border p-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
              No jobs posted yet
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6">
              You haven't posted any jobs yet. Start by posting your first job!
            </p>
            <a
              href="/post-job"
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors shadow-sm text-sm sm:text-base"
            >
              Post a Job
            </a>
          </div>
        </div>
      ) : (
        /* Jobs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.isArray(myJobs) && myJobs.map((job) => (
            <div key={job.id}>
              {job.id === editingJobId ? (
                /* Edit Mode - Show EditJobForm */
                <EditJobForm
                  jobId={job.id}
                  onUpdateSuccess={() => {
                    setEditingJobId(null);
                    // Optionally refetch jobs to show updated data
                    const refetchJobs = async () => {
                      try {
                        const response = await fetch('/api/jobs?mine=true');
                        if (response.ok) {
                          const data = await response.json();
                          // Extract jobs array from response
                          setMyJobs(data.jobs || data.data || data || []);
                        }
                      } catch (error) {
                        console.error('Error refetching jobs:', error);
                      }
                    };
                    refetchJobs();
                  }}
                  onCancel={() => setEditingJobId(null)}
                />
              ) : (
                /* View Mode - Show JobCard */
                <JobCard
                  job={job}
                  onViewDetails={(job) => {
                    setSelectedJob(job);
                    setModalOpen(true);
                  }}
                  showEditButton={true}
                  onEditClick={() => setEditingJobId(job.id)}
                  onDeleteClick={() => handleDeleteJob(job.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Job Modal */}
      <JobModal
        job={selectedJob}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      </div>
    </main>
  );
}
