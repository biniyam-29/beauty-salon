// src/pages/ProfessionalDashboard/services/utils.ts

/**
 * A utility for conditionally joining class names together.
 * @param classes - A list of strings, booleans, or undefined values.
 * @returns A single string of class names.
 */
export const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

/**
 * Safely parses a JSON string that might be null, undefined, or malformed.
 * @param jsonString - The string to parse.
 * @returns An array of parsed items, or an empty array if parsing fails.
 */
export const safeJsonParse = (jsonString: string | null | undefined): any[] => {
  if (!jsonString) return [];
  try {
    // Sometimes the data is double-encoded
    let parsed = JSON.parse(jsonString);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse JSON string:", jsonString, e);
    return [];
  }
};

/**
 * Formats a date string into a more readable local format.
 * @param dateString - The ISO date string.
 * @returns A formatted date and time string, or null if input is invalid.
 */
export const formatDateTime = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};