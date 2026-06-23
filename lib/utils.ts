import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
 
/**
 * Merges Tailwind classes safely, resolving conflicts in favour of the
 * last class. Required by every shadcn/ui component and by pulse-line.tsx.
 * Dependencies: clsx, tailwind-merge (both in package.json).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
 