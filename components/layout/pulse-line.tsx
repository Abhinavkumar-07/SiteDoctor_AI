import { cn } from "@/lib/utils";

/**
 * Destination : components/layout/pulse-line.tsx
 * Dependencies: @/lib/utils (lib/utils.ts must exist first)
 * Imported by : app/(marketing)/_components/hero.tsx
 *               app/audit/[auditId]/_components/audit-processing-client.tsx
 *
 * The product's one signature visual motif (Frontend_Design_System.md §0,
 * UI_Blueprint.md "Design Foundations") — a hairline with a single sharp
 * deviation, like one heartbeat on a monitor.
 *
 * Used in exactly three places across the whole product:
 *   1. Landing page hero  — static, decorative
 *   2. Processing page    — sits between progress card and stage list
 *   3. Report page        — divider beneath the overall score
 *
 * Always aria-hidden — purely decorative in every context.
 */
interface PulseLineProps {
  className?: string;
}

export function PulseLine({ className }: PulseLineProps) {
  return (
    <svg
      viewBox="0 0 400 40"
      fill="none"
      aria-hidden="true"
      className={cn("w-full max-w-xs text-signal-600", className)}
    >
      <path
        d="M0 20 H160 L175 4 L190 36 L205 12 L218 20 H400"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
