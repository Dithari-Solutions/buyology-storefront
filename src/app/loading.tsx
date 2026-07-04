// Static solid cover for the initial app render (root segment) — matches the branded
// intro's background so the first paint flows seamlessly into it. No animation, so Next
// removing it the moment the route is ready can't "cut off" anything. The animated intro
// plays once on page open (AppIntro); client-side route changes fall back to the
// per-route skeletons (loading.tsx), not this cover.
export default function Loading() {
  return <div className="fixed inset-0 z-[9998]" style={{ backgroundColor: "#402f75" }} aria-hidden />;
}
