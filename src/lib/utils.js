// File: src/lib/utils.ts
// Create this file if it doesn't exist
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
