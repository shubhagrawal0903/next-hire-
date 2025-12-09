'use client'
import { Job } from '@/types/job';
import { ChevronRight, MapPin, Building2, Clock } from 'lucide-react';
import Image from 'next/image';

type JobCardProps = {
  job: Job;
  fromSearch?: boolean;
  onViewDetails?: (job: Job) => void;
  showEditButton?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
};

export default function JobCard({ job, fromSearch = false, onViewDetails, showEditButton = false, onEditClick, onDeleteClick }: JobCardProps) {
  const getInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  return (
    <div
      tabIndex={0}
      aria-label={`Job card for ${job.title} at ${job.company?.name}`}
      className={`
        group relative flex flex-col
        bg-card hover:bg-surface-hover/50
        border border-border hover:border-primary/50
        rounded-xl overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-1
        p-5 h-full
      `}
    >
      {/* Header: Company Logo & Title */}
      <div className="flex gap-4 mb-4">
        {/* Logo Box */}
        <div className="flex-shrink-0">
          {job.company?.logoUrl ? (
            <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-white p-1">
              <Image
                src={job.company.logoUrl}
                alt={`${job.company.name ?? 'Company'} logo`}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-bold text-lg">
                {getInitial(job.company?.name)}
              </span>
            </div>
          )}
        </div>

        {/* Title & Company Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-text-primary truncate group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 text-text-secondary text-sm mt-0.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{job.company?.name ?? 'Unknown Company'}</span>
          </div>
        </div>
      </div>

      {/* Meta Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary/10 text-secondary-foreground text-xs font-medium border border-secondary/20">
          <Clock className="w-3 h-3" />
          {job.employmentType}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border">
          <MapPin className="w-3 h-3" />
          {job.location}
        </span>
      </div>

      {/* Description Snippet */}
      <div className="flex-1 mb-5">
        <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-4 mt-auto">
        <p className="text-xs text-text-disabled">
          Posted recently
        </p>

        <div className="flex items-center gap-3">
          {showEditButton && (
            <div className="flex gap-2 mr-2">
              {onEditClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditClick(); }}
                  className="text-xs font-medium text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded hover:bg-surface"
                >
                  Edit
                </button>
              )}
              {onDeleteClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
                  className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded hover:bg-destructive/10"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(job)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/btn"
            >
              Details
              <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}