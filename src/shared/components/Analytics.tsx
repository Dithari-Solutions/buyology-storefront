import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js).
 *
 * Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so local and
 * preview builds stay clean and no beacon fires without an explicit opt-in.
 * Loaded with `afterInteractive` — the tag must not compete with the LCP paint.
 *
 * Note: the CSP in next.config.ts allows googletagmanager.com on script-src; if
 * you swap this for another provider, widen the policy there too or the script
 * is blocked silently.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
