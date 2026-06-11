// Static solid cover for route data-loading (see app/loading.tsx). The animated intro is
// handled client-side by AppIntro + PageTransition, which always run to completion.
export default function Loading() {
  return <div className="fixed inset-0 z-[9998]" style={{ backgroundColor: "#402f75" }} aria-hidden />;
}
