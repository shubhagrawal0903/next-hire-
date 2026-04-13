"use client";

import { useState, useEffect, useCallback } from 'react';
import { Job } from '@/types/job';
import JobCard from '@/components/cards/job-card';
import JobModal from '@/components/job-modal';
import EditJobForm from '@/components/EditJobForm';

const LIMIT = 9;

export default function MyJobsPage() {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Fetch a specific page and optionally append to the existing list
  const fetchJobs = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      const response = await fetch(`/api/jobs?mine=true&page=${page}&limit=${LIMIT}`);

      if (response.ok) {
        const data = await response.json();
        const fetched: Job[] = data.jobs || [];
        const total: number = data.totalJobs ?? 0;

        setTotalCount(total);
        setMyJobs(prev => append ? [...prev, ...fetched] : fetched);
      } else {
        console.error('Failed to fetch jobs:', response.statusText);
        if (!append) setMyJobs([]);
      }
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      if (!append) setMyJobs([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs(1, false);
  }, [fetchJobs]);

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchJobs(nextPage, true);
  };

  // Handle job deletion — remove from local state without a full refetch
  const handleDeleteJob = async (jobId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this job posting?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });

      if (response.ok) {
        alert('Job deleted successfully!');
        setMyJobs(prev => prev.filter(job => job.id !== jobId));
        setTotalCount(prev => Math.max(0, prev - 1));
      } else if (response.status === 403) {
        alert('You do not have permission to delete this job.');
      } else if (response.status === 404) {
        alert('Job not found. It may have already been deleted.');
        setMyJobs(prev => prev.filter(job => job.id !== jobId));
        setTotalCount(prev => Math.max(0, prev - 1));
      } else if (response.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to delete job. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // After a successful edit, refetch page 1 to get accurate data
  const handleUpdateSuccess = async () => {
    setEditingJobId(null);
    setCurrentPage(1);
    await fetchJobs(1, false);
  };

  const allLoaded = myJobs.length >= totalCount;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-8 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
            My Posted Jobs
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            {isLoading
              ? 'Loading your job postings…'
              : totalCount > 0
                ? `Showing ${myJobs.length} of ${totalCount} job${totalCount !== 1 ? 's' : ''}`
                : "Manage and view all the jobs you've posted"}
          </p>
        </div>

        {/* Loading State — initial load */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-primary" />
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
          <>
            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {myJobs.map((job) => (
                <div key={job.id}>
                  {job.id === editingJobId ? (
                    /* Edit Mode */
                    <EditJobForm
                      jobId={job.id}
                      onUpdateSuccess={handleUpdateSuccess}
                      onCancel={() => setEditingJobId(null)}
                    />
                  ) : (
                    /* View Mode */
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

            {/* Load More Button */}
            {!allLoaded && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl font-semibold text-sm sm:text-base
                             bg-primary text-primary-foreground shadow-md
                             hover:bg-primary/90 active:scale-95
                             disabled:opacity-70 disabled:cursor-not-allowed
                             transition-all duration-200"
                >
                  {isLoadingMore ? (
                    <>
                      {/* Spinner */}
                      <svg
                        className="animate-spin h-5 w-5 text-primary-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Loading…
                    </>
                  ) : (
                    <>
                      Load More
                      <span className="text-primary-foreground/70 text-xs font-normal">
                        ({totalCount - myJobs.length} remaining)
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* All-loaded indicator */}
            {allLoaded && totalCount > LIMIT && (
              <p className="text-center text-text-muted text-sm mt-8">
                ✓ All {totalCount} job{totalCount !== 1 ? 's' : ''} loaded
              </p>
            )}
          </>
        )}

        {/* Job Detail Modal */}
        <JobModal
          job={selectedJob}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </main>
  );
}
