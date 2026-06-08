// A ChunkLoadError means the browser is holding HTML/JS from a previous deploy
// and asked the origin for a chunk hash that no longer exists (404). A full page
// load fetches the current HTML + matching chunks, which fixes it. We guard with
// sessionStorage so a genuinely-broken build can't trap the user in a reload loop.

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_COOLDOWN_MS = 15_000;

/** True for webpack ("Loading chunk … failed") and Turbopack ("Failed to load chunk …") errors. */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { name?: string; message?: string };
  if (err.name === "ChunkLoadError") return true;
  const msg = err.message ?? "";
  return /Loading chunk [\w-]+ failed|Failed to load chunk|importing a module script failed|error loading dynamically imported module/i.test(
    msg
  );
}

/**
 * If `error` is a stale-deploy chunk error, force one full reload to pull the
 * current build. Returns true if a reload was triggered (caller should render
 * nothing further). No-ops on the server or if we just reloaded.
 */
export function recoverFromChunkError(error: unknown): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;

  const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
  if (Date.now() - last < RELOAD_COOLDOWN_MS) {
    // Already reloaded recently and still failing — the build is genuinely
    // broken. Stop reloading and let the error UI show.
    return false;
  }

  sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  window.location.reload();
  return true;
}
