"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Destination : components/forms/url-input-form.tsx
 * Dependencies: @/components/ui/input  (shadcn — npx shadcn@latest add input)
 *               @/components/ui/button (shadcn — npx shadcn@latest add button)
 *
 * Lightweight client-side format check only — not the full Zod schema used
 * on the /analyze page. Catches obviously malformed input before navigation.
 * On valid input, navigates to /analyze so the full submission form handles
 * the actual API call.
 */
function isLikelyValidUrl(value: string): boolean {
  try {
    const candidate = value.includes("://") ? value : `https://${value}`;
    const url = new URL(candidate);
    return Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
}

interface UrlInputFormProps {
  size?: "default" | "lg";
}

export function UrlInputForm({ size = "default" }: UrlInputFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim()) {
      setError("Enter a URL to get started.");
      return;
    }

    if (!isLikelyValidUrl(value.trim())) {
      setError("Enter a valid URL, like example.com.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    router.push("/analyze");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <label htmlFor="hero-audit-url" className="sr-only">
          Website URL
        </label>
        <Input
          id="hero-audit-url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://your-website.com"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "hero-audit-url-error" : undefined}
          className={size === "lg" ? "h-12 text-base" : undefined}
        />
        {error ? (
          <p
            id="hero-audit-url-error"
            role="alert"
            className="mt-2 text-sm text-vital-critical"
          >
            {error}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size={size === "lg" ? "lg" : "default"}
        disabled={isSubmitting}
        className="h-12 bg-signal-600 text-white hover:bg-signal-700 disabled:opacity-60"
      >
        {isSubmitting ? "Starting…" : "Run free audit"}
      </Button>
    </form>
  );
}
