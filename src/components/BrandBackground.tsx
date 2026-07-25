// Premium, fixed full-viewport backdrop for the whole site. A soft light base
// with a few large, low-opacity color orbs (purple / gold / rose) blended like a
// mesh gradient — colorful but refined, no busy patterns. Sits behind everything
// at z-index -1; pages render transparent on top of it.
//
// The gradient stack lives in globals.css (.brand-background) rather than a
// style attribute so it ships with the cached stylesheet — inline styles are an
// audited SEO/perf smell and this element is in the HTML of every page.
export default function BrandBackground() {
  return <div aria-hidden="true" className="brand-background" />;
}
