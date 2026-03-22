"use client";

import { useState, useRef } from "react";
import {
  X,
  Mail,
  MessageSquare,
  Loader2,
  Send,
  Users,
  Info,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { sendBulkMessages } from "@/lib/actions/application.actions";
import type { MessageRecipient } from "@/lib/actions/application.actions";

/* ─── Types ─────────────────────────────────────────────────────── */

export interface MessageTarget {
  applicantName: string;
  applicantEmail: string;
}

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: MessageTarget[];
  onSuccess?: () => void;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const PLACEHOLDER = "{{name}}";
const MAX_BODY = 2000;

/** Highlight the first occurrence of {{name}} visually in a preview string */
function previewMessage(body: string, sampleName: string): string {
  return body.replace(/\{\{name\}\}/gi, sampleName);
}

/* ─── Component ──────────────────────────────────────────────────── */

export default function BulkMessageModal({
  isOpen,
  onClose,
  targets,
  onSuccess,
}: BulkMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit =
    subject.trim().length > 0 &&
    body.trim().length > 0 &&
    targets.length > 0;

  /* inject {{name}} at cursor position */
  const insertNamePlaceholder = () => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = body.slice(0, start) + PLACEHOLDER + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + PLACEHOLDER.length, start + PLACEHOLDER.length);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const recipients: MessageRecipient[] = targets.map((t) => ({
        name: t.applicantName,
        email: t.applicantEmail,
      }));

      const result = await sendBulkMessages(subject.trim(), body.trim(), recipients);

      if (result.success) {
        if (result.failed === 0) {
          toast.success(
            `📨 ${result.sent} message${result.sent !== 1 ? "s" : ""} sent successfully!`
          );
        } else {
          toast.warning(
            `${result.sent} sent, ${result.failed} failed. Check the console for details.`
          );
          console.warn("Bulk message errors:", result.errors);
        }
        handleClose();
        onSuccess?.();
      } else {
        toast.error(result.errors[0] || "Failed to send messages.");
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
    setSubject("");
    setBody("");
    setShowPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  const sampleName = targets[0]?.applicantName ?? "Candidate";
  const previewBody = previewMessage(body, sampleName);
  const hasPlaceholder = /\{\{name\}\}/i.test(body);

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
          aria-labelledby="msg-modal-title"
          onClick={(e) => e.stopPropagation()}
          className={[
            "bg-card border border-border rounded-2xl shadow-2xl",
            "w-full max-w-2xl max-h-[92vh] flex flex-col",
            "animate-in fade-in zoom-in-95 duration-200",
          ].join(" ")}
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
            <div>
              <h2
                id="msg-modal-title"
                className="text-xl font-bold text-foreground flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5 text-primary" />
                Send Personalized Message
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {targets.length} recipient{targets.length !== 1 ? "s" : ""} selected
                &nbsp;·&nbsp; each receives a personalised copy
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Recipient chips */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Recipients ({targets.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/40 border border-border max-h-28 overflow-y-auto">
                {targets.map((t) => (
                  <span
                    key={t.applicantEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                  >
                    <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold uppercase">
                      {t.applicantName.charAt(0)}
                    </span>
                    {t.applicantName}
                  </span>
                ))}
              </div>
            </div>

            {/* Subject line */}
            <div>
              <label
                htmlFor="msg-subject"
                className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1.5"
              >
                <Mail className="w-4 h-4 text-primary" />
                Email Subject
                <span className="text-red-500">*</span>
              </label>
              <input
                id="msg-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exciting opportunity at Acme Corp — update for {{name}}"
                maxLength={200}
                required
                disabled={isSubmitting}
                className={[
                  "w-full px-4 py-2.5 rounded-lg text-sm",
                  "bg-background text-foreground border border-border",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
                  "disabled:opacity-60 transition-all",
                ].join(" ")}
              />
            </div>

            {/* Message body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="msg-body"
                  className="flex items-center gap-2 text-sm font-semibold text-foreground"
                >
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Message Body
                  <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    body.length > MAX_BODY * 0.9
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {body.length}/{MAX_BODY}
                </span>
              </div>

              <div className="relative">
                <textarea
                  id="msg-body"
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
                  placeholder={`Hi {{name}},\n\nThank you for applying to our position...\n\nBest regards,\nThe Hiring Team`}
                  rows={7}
                  required
                  disabled={isSubmitting}
                  className={[
                    "w-full px-4 py-3 rounded-lg text-sm resize-none",
                    "bg-background text-foreground border border-border",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
                    "disabled:opacity-60 transition-all",
                  ].join(" ")}
                />
              </div>

              {/* {{name}} helper row */}
              <div className="flex items-start gap-3 mt-2.5 p-3 rounded-lg bg-primary/5 border border-primary/15">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    Use{" "}
                    <code className="px-1 py-0.5 rounded bg-primary/10 text-primary font-mono text-[11px]">
                      {"{{"}"name"{"}}"}
                    </code>{" "}
                    in your message and we'll replace it with each candidate's real name!
                  </p>
                  {!hasPlaceholder && body.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tip: your message is generic right now — add{" "}
                      <code className="font-mono text-[11px]">{"{{name}}"}</code> to personalise it.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={insertNamePlaceholder}
                  disabled={isSubmitting}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  Insert {"{{name}}"}
                </button>
              </div>
            </div>

            {/* Live preview toggle */}
            {body.trim() && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                >
                  <Info className="w-3.5 h-3.5" />
                  {showPreview ? "Hide" : "Show"} preview for {sampleName}
                </button>

                {showPreview && (
                  <div className="mt-2 p-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                      Preview (as seen by {sampleName})
                    </p>
                    {previewBody}
                  </div>
                )}
              </div>
            )}

            {/* Validation warning */}
            {!canSubmit && (subject || body) && (
              <div className="flex gap-2 items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {!subject.trim()
                    ? "Please fill in the subject line."
                    : !body.trim()
                    ? "Please write a message body."
                    : "Please select at least one recipient."}
                </p>
              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="px-6 pb-5 pt-3 shrink-0 border-t border-border flex gap-3">
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
              type="button"
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
                  Send Emails ({targets.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
