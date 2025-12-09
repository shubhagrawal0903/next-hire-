"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { Job } from '@/types/job';
import JobCard from '@/components/cards/job-card';
import JobModal from '@/components/job-modal';

interface RecommendedJobsProps {
  onRecommendationsLoad?: (jobIds: string[]) => void;
}

export default function RecommendedJobs({ onRecommendationsLoad }: RecommendedJobsProps) {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Don't fetch if user is not signed in
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        // Get Clerk authentication token
        const token = await getToken();
        
        // Fetch with Authorization header
        const response = await fetch('/api/jobs/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store', // Prevent caching issues
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
          // Notify parent of recommended job IDs
          if (onRecommendationsLoad && data.length > 0) {
            onRecommendationsLoad(data.map((job: Job) => job.id));
          }
        } else {
          // Parse JSON body to get detailed error message
          const errorData = await response.json().catch(() => ({ 
            message: response.statusText 
          }));
          console.error('Failed to fetch recommendations:', errorData.message || response.statusText);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [isSignedIn]);

  // Don't render if user not signed in, still loading, or no recommendations
  if (!isSignedIn || isLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-text-primary mb-6">
          Recommended Jobs for You
        </h2>
        <p className="text-text-secondary mb-6">
          Based on your skills and profile, we found {recommendations.length} job{recommendations.length !== 1 ? 's' : ''} that might interest you.
        </p>
        
        {/* Grid layout matching main job listing */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4'>
          {recommendations.map((job) => (
            <JobCard 
              key={job.id}
              job={job}
              onViewDetails={(job) => {
                setSelectedJob(job);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>
      
      <JobModal job={selectedJob} open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
