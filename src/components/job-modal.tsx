'use client'
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Job } from '@/types/job';
import { X, MapPin, Building2, Clock, ExternalLink, DollarSign, UploadCloud, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

type JobModalProps = {
  job: Job | null;
  open: boolean;
  onClose: () => void;
};

export default function JobModal({ job, open, onClose }: JobModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'success' | 'error' | 'already_applied'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [savedResumeUrl, setSavedResumeUrl] = useState<string | null>(null);
  const [useNewResume, setUseNewResume] = useState(false);

  const { user, isSignedIn } = useUser();

  const handleClose = () => {
    setApplicationStatus('idle');
    setSelectedFile(null);
    setCoverLetter('');
    setIsApplying(false);
    setUseNewResume(false);
    onClose();
  };

  // Fetch saved resume when modal opens
  useEffect(() => {
    if (open && isSignedIn) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.resumeUrl) {
            setSavedResumeUrl(data.resumeUrl);
          }
        })
        .catch(err => console.error('Error fetching saved resume:', err));
    }
  }, [open, isSignedIn]);

  if (!job) return null;

  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const getInitial = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  const formatSalary = (amount: number): string => {
    return amount.toLocaleString('en-US');
  };

  const getSalaryDisplay = (): string | null => {
    if (!job.salaryMin && !job.salaryMax) return null;

    const currency = job.salaryCurrency || 'USD';
    const currencySymbol = currency === 'USD' ? '$' :
      currency === 'EUR' ? '€' :
        currency === 'GBP' ? '£' :
          currency === 'INR' ? '₹' :
            currency;

    if (job.salaryMin && job.salaryMax) {
      return `${currencySymbol}${formatSalary(job.salaryMin)} - ${currencySymbol}${formatSalary(job.salaryMax)} ${currency}`;
    } else if (job.salaryMax) {
      return `Up to ${currencySymbol}${formatSalary(job.salaryMax)} ${currency}`;
    } else if (job.salaryMin) {
      return `${currencySymbol}${formatSalary(job.salaryMin)}+ ${currency}`;
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload only PDF files.');
        event.target.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleApply = async () => {
    if (!isSignedIn || !user) {
      alert('Please sign in to apply for this job.');
      return;
    }
    if (!job) {
      alert('Job information is missing.');
      return;
    }
    
    // Check if using saved resume or need to upload new one
    if (useNewResume && !selectedFile) {
      alert('Please select your resume before applying.');
      return;
    }
    if (!useNewResume && !savedResumeUrl) {
      alert('No saved resume found. Please upload a new resume.');
      return;
    }

    try {
      setIsApplying(true);
      setApplicationStatus('idle');

      const formData = new FormData();
      formData.append('applicantName', user.fullName || 'N/A');
      formData.append('applicantEmail', user.primaryEmailAddress?.emailAddress || 'N/A');
      
      if (useNewResume && selectedFile) {
        formData.append('resume', selectedFile);
      } else if (savedResumeUrl) {
        // Fetch saved resume and convert to file
        const response = await fetch(savedResumeUrl);
        const blob = await response.blob();
        const file = new File([blob], 'saved_resume.pdf', { type: 'application/pdf' });
        formData.append('resume', file);
      }

      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim());
      }

      const response = await fetch(`/api/applications/apply/${job.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setApplicationStatus('success');
        setSelectedFile(null);
        setCoverLetter('');
      } else if (response.status === 409) {
        setApplicationStatus('already_applied');
      } else if (response.status === 400 || response.status === 401) {
        setApplicationStatus('error');
        const errorData = await response.json();
        alert(errorData.error || 'Error submitting application');
      } else {
        setApplicationStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setApplicationStatus('error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 bg-card border border-border rounded-xl shadow-2xl p-0 z-50 max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-200"
        >
          {/* Header Banner - Optional Pattern or Solid Color */}
          <div className="h-32 bg-surface border-b border-border relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
            {/* Close Button */}
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-text-secondary hover:text-text-primary bg-card/80 backdrop-blur p-2 rounded-full border border-border transition-colors hover:bg-surface z-10">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 md:px-8 pb-8 -mt-12 relative">
            {/* Company Logo & Title */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 bg-card p-1 rounded-xl border border-border shadow-sm">
                {job.company?.logoUrl ? (
                  <Image
                    src={job.company.logoUrl}
                    alt={`${job.company.name ?? 'Company'} logo`}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-contain bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {getInitial(job.company?.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 pt-12 md:pt-0 mt-2">
                <Dialog.Title className="text-2xl md:text-3xl font-bold text-text-primary leading-tight">
                  {job.title}
                </Dialog.Title>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-medium">{job.company?.name ?? 'Confidential'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Clock className="w-4 h-4" />
                  Employment Type
                </div>
                <span className="font-medium text-text-primary px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm">
                  {job.employmentType}
                </span>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <Clock className="w-4 h-4" />
                  Posted Date
                </div>
                <span className="font-medium text-text-primary">
                  {formatDate(job.postedAt)}
                </span>
              </div>
              {getSalaryDisplay() && (
                <div className="bg-surface border border-border rounded-lg p-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 text-text-muted text-sm">
                    <DollarSign className="w-4 h-4" />
                    Salary Range
                  </div>
                  <span className="font-medium text-text-primary text-sm md:text-base">
                    {getSalaryDisplay()}
                  </span>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  Job Description
                </h3>
                <div className="text-text-secondary leading-relaxed space-y-4 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-text-primary mb-3">Requirements</h3>
                  <ul className="list-disc list-outside ml-5 space-y-1 text-text-secondary">
                    {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-text-primary mb-3">Responsibilities</h3>
                  <ul className="list-disc list-outside ml-5 space-y-1 text-text-secondary">
                    {job.responsibilities.map((res, i) => <li key={i}>{res}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Application Form & Actions */}
            <div className="mt-10 pt-6 border-t border-border">
              {isSignedIn ? (
                <div className="bg-surface/50 border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-primary" />
                    Apply for this position
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Resume Selection */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-3">
                        Select Resume
                      </label>
                      
                      {/* Saved Resume Option */}
                      {savedResumeUrl && (
                        <div className="mb-3">
                          <button
                            type="button"
                            onClick={() => setUseNewResume(false)}
                            disabled={isApplying || applicationStatus === 'success' || applicationStatus === 'already_applied'}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              !useNewResume
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-surface hover:border-primary/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                !useNewResume ? 'border-primary' : 'border-border'
                              }`}>
                                {!useNewResume && <div className="w-3 h-3 rounded-full bg-primary" />}
                              </div>
                              <FileText className={`w-5 h-5 ${!useNewResume ? 'text-primary' : 'text-text-secondary'}`} />
                              <div>
                                <p className="font-medium text-text-primary text-sm">Use Saved Resume</p>
                                <p className="text-xs text-text-muted">Your previously uploaded resume</p>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}
                      
                      {/* New Resume Option */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setUseNewResume(true)}
                          disabled={isApplying || applicationStatus === 'success' || applicationStatus === 'already_applied'}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            useNewResume
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-surface hover:border-primary/30'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              useNewResume ? 'border-primary' : 'border-border'
                            }`}>
                              {useNewResume && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <UploadCloud className={`w-5 h-5 ${useNewResume ? 'text-primary' : 'text-text-secondary'}`} />
                            <div>
                              <p className="font-medium text-text-primary text-sm">Upload New Resume</p>
                              <p className="text-xs text-text-muted">PDF only, Max 5MB</p>
                            </div>
                          </div>
                        </button>
                        
                        {/* File Upload Input - Only show when "Upload New Resume" is selected */}
                        {useNewResume && (
                          <div className="mt-3">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              disabled={isApplying || applicationStatus === 'success' || applicationStatus === 'already_applied'}
                              className="block w-full text-sm text-text-secondary
                                       file:mr-4 file:py-2.5 file:px-4
                                       file:rounded-lg file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-primary file:text-primary-foreground
                                       hover:file:bg-primary/90
                                       cursor-pointer bg-card border border-border rounded-lg
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                     "
                            />
                            {selectedFile && (
                              <p className="mt-2 text-sm text-primary flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {selectedFile.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Cover Letter <span className="text-text-muted text-xs font-normal ml-1">(Optional)</span>
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
                        placeholder="Why are you a good fit?"
                        disabled={isApplying || applicationStatus === 'success' || applicationStatus === 'already_applied'}
                      />
                    </div>
                  </div>

                  {/* Status Messages */}
                  {applicationStatus !== 'idle' && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2
                             ${applicationStatus === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                             ${applicationStatus === 'already_applied' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                             ${applicationStatus === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : ''}
                          `}>
                      {applicationStatus === 'success' && '✓ Application sent successfully!'}
                      {applicationStatus === 'already_applied' && '⚠ You have already applied for this position.'}
                      {applicationStatus === 'error' && '✗ Something went wrong. Please try again.'}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleApply}
                      disabled={(useNewResume && !selectedFile) || (!useNewResume && !savedResumeUrl) || isApplying || applicationStatus === 'success' || applicationStatus === 'already_applied'}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                      {isApplying ? 'Sending...' : 'Submit Application'}
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl p-8 text-center bg-gradient-to-b from-surface to-background">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Ready to Apply?</h3>
                  <p className="text-text-secondary mb-6 max-w-sm mx-auto">Create an account or sign in to start your application journey.</p>
                  <SignInButton mode="modal">
                    <button className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25">
                      Sign In to Apply
                    </button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root >
  );
}