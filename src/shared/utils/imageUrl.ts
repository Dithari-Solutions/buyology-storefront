export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}${path}`;
}

/**
 * Hosts declared in `images.remotePatterns` (next.config.ts). Keep the two in
 * sync: a host listed here but missing there makes next/image throw at runtime;
 * a host missing here just means we skip optimization for it (safe).
 */
const OPTIMIZABLE_HOSTS = new Set([
  "5.189.132.250",
  "127.0.0.1",
  "eu2.contabostorage.com",
  "api-dev.dithari.com",
  "api.buyology.online",
]);

/**
 * Whether a remote image URL can go through Next's image optimizer.
 *
 * Product / story / banner images used to be rendered with a blanket
 * `unoptimized`, so every one of them was served at full original resolution
 * with no AVIF/WebP conversion — the single biggest contributor to the audited
 * 6.09 MB of image weight on the home page. Routing known hosts through the
 * optimizer fixes that, while unknown hosts still fall back to `unoptimized`
 * rather than throwing "hostname is not configured".
 *
 * Relative paths (same-origin, served by us) are always optimizable.
 */
export function isOptimizableImage(url: string | null | undefined): boolean {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return true;
  try {
    return OPTIMIZABLE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Convenience inverse for the `unoptimized` prop:
 * `<Image unoptimized={shouldSkipOptimization(src)} … />`
 */
export function shouldSkipOptimization(url: string | null | undefined): boolean {
  return !isOptimizableImage(url);
}
