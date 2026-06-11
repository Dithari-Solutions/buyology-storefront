// Shared, module-level coordination between the two loaders so they never play at the same
// time. AppIntro flips `introDone` true when the page-open intro finishes; PageTransition
// only reacts to navigations after that — so the initial load (and any lang redirect during
// it) shows the intro exactly once instead of twice.
export const loaderState = { introDone: false };
