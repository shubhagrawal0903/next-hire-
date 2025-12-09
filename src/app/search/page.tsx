"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import JobCard from '@/components/cards/job-card';
import { Job } from '@/types/job';
import { Loader2, SearchX } from 'lucide-react';

function SearchPageContent() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const searchParams = useSearchParams();
    const q = searchParams?.get('q') || "";

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/jobs?search=${encodeURIComponent(q)}`);

                if (response.ok) {
                    const data = await response.json();
                    // Ensure data is an array before setting state
                    if (Array.isArray(data)) {
                        setJobs(data);
                    } else if (data.jobs && Array.isArray(data.jobs)) {
                        // Handle case where API returns object with jobs array
                        setJobs(data.jobs);
                    } else {
                        console.error('API returned unexpected format:', data);
                        setJobs([]);
                    }
                } else {
                    console.error('Failed to fetch jobs:', response.statusText);
                    setJobs([]);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [q]);

    return (
        <main className='min-h-screen bg-background py-10 px-4'>
            <div className='max-w-7xl mx-auto'>
                <h1 className="text-3xl font-bold text-text-primary mb-8 px-2">
                    {q ? `Search Results for "${q}"` : 'All Jobs'}
                </h1>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-text-secondary">Searching for opportunities...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl p-8">
                        <div className="bg-surface p-4 rounded-full mb-4">
                            <SearchX className="w-8 h-8 text-text-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">No jobs found</h2>
                        <p className="text-text-secondary max-w-sm">
                            We couldn't find any positions matching "{q}". Try adjusting your search terms or browse all jobs.
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20'>
                        {jobs.map((job) => (
                            <JobCard fromSearch={false} key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <SearchPageContent />
        </Suspense>
    );
}