// Static solid cover for route data-loading. No animation, so Next removing it the moment
// the route is ready can't "cut off" anything. The animated intro is handled client-side
// by AppIntro (page open) and PageTransition (route changes), which always run to completion.
export default function Loading() {
  return <div className="fixed inset-0 z-[9998]" style={{ backgroundColor: "#402f75" }} aria-hidden />;
}
