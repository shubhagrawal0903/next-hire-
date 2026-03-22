"use client";

import { useState } from "react";
import {
  X,
  Link as LinkIcon,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { scheduleInterviewsBulk } from "@/lib/actions/application.actions";
import type { BulkInterviewEntry } from "@/lib/actions/application.actions";

/* ─── Types ─────────────────────────────────────────────────────── */

export interface BulkCandidate {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
}

interface BulkInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: BulkCandidate[];
  onSuccess?: () => void;
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function BulkInterviewModal({
  isOpen,
  onClose,
  candidates,
  onSuccess,
}: BulkInterviewModalProps) {
  const [meetLink, setMeetLink] = useState("");
  const [times, setTimes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // minimum date = now (local)
  const minDateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60_000
  )
    .toISOString()
    .slice(0, 16);

  const handleTimeChange = (applicationId: string, value: string) => {
    setTimes((prev) => ({ ...prev, [applicationId]: value }));
  };

  const allTimesFilled = candidates.every((c) => !!times[c.applicationId]);
  const canSubmit = meetLink.trim().startsWith("http") && allTimesFilled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const entries: BulkInterviewEntry[] = candidates.map((c) => ({
        applicationId: c.applicationId,
        applicantName: c.applicantName,
        applicantEmail: c.applicantEmail,
        scheduledTime: times[c.applicationId],
      }));

      const result = await scheduleInterviewsBulk(meetLink.trim(), entries);

      if (result.success) {
        if (result.failed === 0) {
          toast.success(
            `🎉 ${result.scheduled} interview${result.scheduled > 1 ? "s" : ""} scheduled & emails sent!`
          );
        } else {
          toast.warning(
            `${result.scheduled} scheduled, ${result.failed} failed. Check console for details.`
          );
          console.warn("Bulk schedule errors:", result.errors);
        }
        handleClose();
        onSuccess?.();
      } else {
        toast.error(result.errors[0] || "Failed to schedule interviews.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setMeetLink("");
    setTimes({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* ── Modal ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-modal-title"
          onClick={(e) => e.stopPropagation()}
          className={[
            "bg-card border border-border rounded-2xl shadow-2xl",
            "w-full max-w-2xl max-h-[90vh] flex flex-col",
            "animate-in fade-in zoom-in-95 duration-200",
          ].join(" ")}
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
            <div>
              <h2
                id="bulk-modal-title"
                className="text-xl font-bold text-foreground flex items-center gap-2"
              >
                <Users className="w-5 h-5 text-primary" />
                Bulk Interview Scheduling
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} selected
                &nbsp;·&nbsp; each will receive a personalised email
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Global Meet Link */}
            <div>
              <label
                htmlFor="bulk-meet-link"
                className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2"
              >
                <LinkIcon className="w-4 h-4 text-primary" />
                Google Meet Link
                <span className="text-red-500">*</span>
              </label>
              <input
                id="bulk-meet-link"
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                required
                disabled={isSubmitting}
                className={[
                  "w-full px-4 py-2.5 rounded-lg text-sm",
                  "bg-background text-foreground",
                  "border border-border",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
                  "disabled:opacity-60 transition-all",
                ].join(" ")}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                This link will be shared with all selected candidates.
              </p>
            </div>

            {/* Per-candidate time slots */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Individual Time Slots
                  <span className="text-red-500 ml-0.5">*</span>
                </span>
              </div>

              <div className="space-y-3">
                {candidates.map((c, idx) => {
                  const filled = !!times[c.applicationId];
                  return (
                    <div
                      key={c.applicationId}
                      className={[
                        "flex flex-col sm:flex-row sm:items-center gap-3",
                        "p-4 rounded-xl border transition-colors",
                        filled
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-muted/30",
                      ].join(" ")}
                    >
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                          {c.applicantName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {c.applicantName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.applicantEmail}
                          </p>
                        </div>
                        {/* Tick once a time is set */}
                        {filled && (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-auto sm:ml-0" />
                        )}
                      </div>

                      {/* Datetime picker */}
                      <div className="sm:w-52 shrink-0">
                        <input
                          id={`bulk-time-${idx}`}
                          type="datetime-local"
                          value={times[c.applicationId] ?? ""}
                          onChange={(e) =>
                            handleTimeChange(c.applicationId, e.target.value)
                          }
                          min={minDateTime}
                          required
                          disabled={isSubmitting}
                          style={{ colorScheme: "light dark" }}
                          className={[
                            "w-full px-3 py-2 rounded-lg text-sm",
                            "bg-background text-foreground",
                            "border border-border",
                            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
                            "disabled:opacity-60 transition-all",
                            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                            "[&::-webkit-calendar-picker-indicator]:dark:invert",
                          ].join(" ")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info banner */}
            <div className="flex gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <Send className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Each candidate will receive a <strong>personalised email</strong> with
                their specific interview time and the shared meeting link. Their
                application status will be updated to <strong>Interview</strong>.
              </p>
            </div>

            {/* Validation hint */}
            {!canSubmit && (meetLink || Object.keys(times).length > 0) && (
              <div className="flex gap-2 items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {!meetLink.trim().startsWith("http")
                    ? "Please enter a valid meeting link starting with http."
                    : "Please set a unique time slot for every candidate."}
                </p>
              </div>
            )}
          </form>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="p-6 pt-0 shrink-0 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={[
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold",
                "border border-border text-foreground",
                "hover:bg-muted transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="" // triggers the <form> above via onSubmit on the form element
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={[
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-all active:scale-[.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                "flex items-center justify-center gap-2",
              ].join(" ")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirm &amp; Send Emails ({candidates.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
