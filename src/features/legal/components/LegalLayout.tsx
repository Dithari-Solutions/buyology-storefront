import type { ReactNode } from "react";

/**
 * Shared document chrome for the static legal pages (privacy, terms, refund policies).
 * Child elements (h2/h3/p/ul/li) are styled via arbitrary-variant selectors so the page
 * components can stay plain semantic HTML.
 */
export default function LegalLayout({
    title,
    effectiveDate = "[Insert Effective Date]",
    children,
}: {
    title: string;
    effectiveDate?: string;
    children: ReactNode;
}) {
    return (
        <main className="min-h-screen w-full flex justify-center px-4 py-10 md:py-16">
            <article
                className="w-full max-w-3xl bg-white/95 backdrop-blur rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10
                    text-[14px] leading-relaxed text-gray-700
                    [&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:text-[#402F75] [&_h2]:mt-7 [&_h2]:mb-2
                    [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-4 [&_h3]:mb-1
                    [&_p]:mb-3
                    [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:mb-3 [&_ul]:space-y-1
                    [&_a]:text-[#402F75] [&_a]:underline"
            >
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#402F75] mb-1">{title}</h1>
                <p className="text-[13px] text-gray-400 mb-6">Effective Date: {effectiveDate}</p>
                {children}
            </article>
        </main>
    );
}
