'use client';

import { useState } from 'react';
import { X, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import { scheduleInterview } from '@/lib/actions/application.actions';
import { toast } from 'sonner';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicantName: string;
  jobTitle: string;
  onSuccess?: () => void;
}

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  applicationId,
  applicantName,
  jobTitle,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!interviewDate || !interviewLink) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await scheduleInterview(
        applicationId,
        interviewDate,
        interviewLink
      );

      if (result.success) {
        toast.success(result.message || 'Interview scheduled successfully!');
        onClose();
        if (onSuccess) onSuccess();
        
        // Reset form
        setInterviewDate('');
        setInterviewLink('');
      } else {
        toast.error(result.error || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form on close
      setInterviewDate('');
      setInterviewLink('');
    }
  };

  if (!isOpen) return null;

  // Get minimum date (current date/time)
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2
                id="modal-title"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                Schedule Interview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {applicantName} • {jobTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date & Time Input */}
            <div>
              <label
                htmlFor="interviewDate"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                <Calendar className="h-4 w-4" />
                Interview Date & Time
              </label>
              <input
                id="interviewDate"
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={minDateTime}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert"
                style={{ colorScheme: 'light dark' }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select a date and time in your local timezone
              </p>
            </div>

            {/* Meeting Link Input */}
            <div>
              <label
                htmlFor="interviewLink"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                <LinkIcon className="h-4 w-4" />
                Meeting Link
              </label>
              <input
                id="interviewLink"
                type="url"
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Google Meet, Zoom, Microsoft Teams, or any video conferencing link
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>📧 Automatic Notification:</strong> The applicant will receive an email with the interview details and meeting link.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Interview'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
