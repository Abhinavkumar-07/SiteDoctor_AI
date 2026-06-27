"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import {
  auditUrlSchema,
  type AuditUrlInput,
  type AuditUrlOutput,
} from "@/lib/validations/audit-url.schema";
import {
  type CreateAuditResponse,
  type ApiErrorBody,
  type ApiErrorCode,
  type SubmissionStatus,
  SUBMISSION_ERROR_MESSAGES,
  SUBMISSION_FALLBACK_ERROR,
} from "@/lib/types/audit";

// ── Constants ──────────────────────────────────────────────────────────────────

const EXAMPLE_URLS = [
  "https://stripe.com",
  "https://vercel.com",
  "https://notion.so",
] as const;

const REQUEST_TIMEOUT_MS = 20_000;
const TIMEOUT_ERROR_MESSAGE =
  "That's taking longer than expected. Please try again.";

// ── Animation variants ─────────────────────────────────────────────────────────

import type { Variants } from "framer-motion";

const errorVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    height: 0,
    marginTop: 0,
  },

  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    marginTop: 12,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -8,
    height: 0,
    marginTop: 0,
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

export function UrlSubmissionForm() {
  const router = useRouter();
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const isDisabled = status === "submitting" || status === "redirecting";

  // Tracks whether the component is still mounted and lets an in-flight
  // request be cancelled (on unmount, or after REQUEST_TIMEOUT_MS) so we
  // never call setState on an unmounted component or leave the button
  // stuck on "Preparing audit…" forever if the server hangs.
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Third generic (AuditUrlOutput) tells react-hook-form that the value
  // handed to onSubmit is the POST-transform value from the zod schema
  // (already normalized to include a scheme), not the raw input shape.
  const form = useForm<AuditUrlInput, any, AuditUrlOutput>({
    resolver: zodResolver(auditUrlSchema),
    defaultValues: { url: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Autofill an example URL and move focus into the input
  function handleExampleClick(url: string) {
    form.setValue("url", url, { shouldValidate: false });
    form.clearErrors("url");
    setServerError(null);
    document.getElementById("analyze-url")?.focus();
  }

  async function onSubmit(data: AuditUrlOutput) {
    setServerError(null);
    setStatus("submitting");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const res = await fetch("/api/v1/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Read the body exactly once. The original version read it again
        // for the generic error case below, which throws ("body stream
        // already read") for any non-AUDIT_IN_PROGRESS 409.
        const body = (await res.json().catch(() => null)) as
          | ApiErrorBody
          | null;

        /**
         * 409 AUDIT_IN_PROGRESS — not an error, redirect to the existing
         * job. The details object optionally carries the existing audit's id.
         */
        if (res.status === 409 && body?.error?.code === "AUDIT_IN_PROGRESS") {
          const id = (body.error.details as { id?: string } | undefined)?.id;
          if (!isMountedRef.current) return;
          setStatus("redirecting");
          router.push(
            id
              ? `/audit/${id}?url=${encodeURIComponent(data.url)}`
              : "/analyze"
          );
          return;
        }

        if (!isMountedRef.current) return;
        setServerError(
          SUBMISSION_ERROR_MESSAGES[body?.error?.code as ApiErrorCode] ??
            SUBMISSION_FALLBACK_ERROR
        );
        setStatus("error");
        return;
      }

      const result = await res.json() as CreateAuditResponse;

if (!isMountedRef.current) return;

if (!result.id) {
  throw new Error("Invalid response");
}

setStatus("redirecting");

router.push(
  `/audit/${result.id}?url=${encodeURIComponent(data.url)}`
);
    } catch (err) {
      if (!isMountedRef.current) return;

      // Surface unexpected failures (bad JSON, CORS, DNS, etc.) to the
      // console/error monitor instead of swallowing them silently — the
      // user only ever sees the friendly fallback message either way.
      if (controller.signal.aborted) {
        console.error("Audit submission timed out", err);
        setServerError(TIMEOUT_ERROR_MESSAGE);
      } else {
        console.error("Audit submission failed", err);
        setServerError(SUBMISSION_FALLBACK_ERROR);
      }
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const hasFieldError = Boolean(form.formState.errors.url);
  const hasAnyError = hasFieldError || Boolean(serverError);

  return (
    <div className="flex flex-col gap-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          aria-label="Website audit submission"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel
                  htmlFor="analyze-url"
                  className="font-body text-sm font-medium text-ink"
                >
                  Website URL
                </FormLabel>

                {/* Input + button row */}
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <FormControl>
                    <div className="relative flex-1">
                      <Globe
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        id="analyze-url"
                        type="text"
                        inputMode="url"
                        autoComplete="url"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        autoFocus
                        placeholder="https://your-website.com"
                        disabled={isDisabled}
                        aria-invalid={hasAnyError}
                        aria-describedby={
                          hasFieldError
                            ? "analyze-url-field-error"
                            : serverError
                              ? "analyze-url-server-error"
                              : undefined
                        }
                        className={cn(
                          "h-12 pl-9 font-data text-sm",
                          hasAnyError &&
                            "border-vital-critical focus-visible:ring-vital-critical"
                        )}
                        onChange={(e) => {
                          field.onChange(e);
                          if (serverError) setServerError(null);
                        }}
                      />
                    </div>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isDisabled}
                    className={cn(
                      "h-12 min-w-[168px] shrink-0",
                      "bg-signal-600 font-body text-sm font-medium text-white",
                      "transition-colors hover:bg-signal-700",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    {status === "submitting" && (
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    {status === "redirecting"
                      ? "Opening report…"
                      : status === "submitting"
                        ? "Preparing audit…"
                        : "Analyze Website"}
                  </Button>
                </div>

                {/* Field-level validation error */}
                <FormMessage
                  id="analyze-url-field-error"
                  className="mt-2 font-body text-sm text-vital-critical"
                />
              </FormItem>
            )}
          />

          {/* Server / network error — animated in/out */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                key="server-error"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="analyze-url-server-error"
                role="alert"
                aria-live="assertive"
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-md border border-vital-critical/25 bg-vital-critical-bg px-3 py-2.5">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-vital-critical"
                    aria-hidden="true"
                  />
                  <p className="font-body text-sm text-vital-critical">
                    {serverError}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>

      {/* Example URL chips ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-body text-xs text-slate">Try an example:</span>
        {EXAMPLE_URLS.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => handleExampleClick(url)}
            disabled={isDisabled}
            className={cn(
              "rounded-full border border-neutral-200 px-3 py-1",
              "font-data text-xs text-slate",
              "transition-colors hover:border-signal-600 hover:text-signal-600",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-600 focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            {url.replace("https://", "")}
          </button>
        ))}
      </div>
    </div>
  );
}
