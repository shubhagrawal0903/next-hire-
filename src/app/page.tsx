"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import JobCard from '@/components/cards/job-card';
import JobModal from '@/components/job-modal';
import { Job } from '@/types/job';
import RecommendedJobs from '@/components/RecommendedJobs';
import FilterSidebar from '@/components/filter-side-bar';
import { HeroSection } from '@/components/home/hero-section';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [fetchedJobs, setFetchedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const [recommendedJobIds, setRecommendedJobIds] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const search = searchParams?.get('search') || "";
  const page = parseInt(searchParams.get('page') || '1');

  const router = useRouter();
  const pathname = usePathname();

  const JOBS_PER_PAGE = 8;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        const trimmed = search?.trim();
        if (trimmed) params.append('search', trimmed);
        if (employmentType) params.append('employmentType', employmentType);
        params.append('page', page.toString());
        if (recommendedJobIds.length > 0) {
          params.append('excludeIds', recommendedJobIds.join(','));
        }

        const url = '/api/jobs' + (params.toString() ? `?${params.toString()}` : '');

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setFetchedJobs(data.jobs);
          setTotalJobs(data.totalJobs);
        } else {
          console.error('Failed to fetch jobs:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [search, employmentType, page, recommendedJobIds]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    const newPage = direction === 'prev' ? page - 1 : page + 1;
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasPrevPage = page > 1;
  const hasNextPage = page * JOBS_PER_PAGE < totalJobs;

  return (
    <main className="min-h-screen bg-background" role="main">
      <HeroSection />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-screen-2xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <FilterSidebar onTypeChange={setEmploymentType} />

              {/* Recommended Jobs - Moved to sidebar for better layout or kept in main flow? 
                  Keeping in main flow for now, but sidebar could be good too. 
              */}
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0 space-y-8">

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">
                {search ? `Results for "${search}"` : "Latest Opportunities"}
              </h2>
              <p className="text-text-secondary text-sm">
                Showing {fetchedJobs.length} {fetchedJobs.length === 1 ? 'job' : 'jobs'}
              </p>
            </div>

            {/* Recommended Section (conditionally rendered inside component) */}
            <RecommendedJobs onRecommendationsLoad={setRecommendedJobIds} />

            {/* Job Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4' aria-live="polite">
              {isLoading ? (
                // Skeleton Loading State
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-muted animate-pulse border border-border"></div>
                ))
              ) : fetchedJobs.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-surface border border-dashed border-border rounded-xl">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">No jobs found</h3>
                  <p className="text-text-secondary max-w-sm mt-2">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      router.push('/');
                      setEmploymentType("");
                    }}
                    className="mt-6 text-primary hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                fetchedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={(job) => {
                      setSelectedJob(job);
                      setModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && fetchedJobs.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={!hasPrevPage}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="text-sm font-medium text-text-secondary">
                  Page {page} of {Math.ceil(totalJobs / JOBS_PER_PAGE) || 1}
                </span>

                <button
                  onClick={() => handlePageChange('next')}
                  disabled={!hasNextPage}
                  className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>

        <JobModal job={selectedJob} open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </main>
  );
}

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}