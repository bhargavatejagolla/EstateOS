import type { SyntheticEvent } from "react";

export const DEFAULT_PROPERTY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

/**
 * Returns a valid, loadable image URL.
 * If the URL is missing or points to a non-existent Cloudinary demo mock URL from prior unconfigured sessions,
 * returns a reliable high-resolution architectural image.
 */
export function getPropertyImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return DEFAULT_PROPERTY_FALLBACK_IMAGE;
  }
  // Intercept obsolete/broken Cloudinary demo mock URLs
  if (url.includes("res.cloudinary.com/estateos-demo")) {
    return DEFAULT_PROPERTY_FALLBACK_IMAGE;
  }
  return url;
}

/**
 * Fallback event handler for img onError
 */
export function onImageError(e: SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = DEFAULT_PROPERTY_FALLBACK_IMAGE;
}
