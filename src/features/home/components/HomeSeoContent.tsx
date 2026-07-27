import Link from "next/link";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { HOME_SEO_COPY } from "../data/homeSeoCopy";

/**
 * Server-rendered editorial + FAQ block for the home page.
 *
 * Every other home section is a client component, so before this existed the
 * server HTML carried very little prose. This one renders on the server for all
 * locales, which (a) lifts the crawlable word count, (b) puts the target
 * keywords into real H2/H3 tags, and (c) gives LLMs and AI search engines an
 * unrendered, plain-HTML description of what the site actually does.
 *
 * The FAQ answers are duplicated verbatim into FAQPage JSON-LD on the page —
 * keep the two in sync (both read from `HOME_SEO_COPY`).
 */
export default function HomeSeoContent({ lang }: { lang: Lang }) {
  const copy = HOME_SEO_COPY[lang] ?? HOME_SEO_COPY.en;
  const slug = (name: string) => PATH_SLUGS[name]?.[lang] ?? name;

  const links: Array<{ href: string; label: string }> = [
    { href: `/${lang}/${slug("shop")}`, label: LINK_LABELS[lang].shop },
    { href: `/${lang}/${slug("rent")}`, label: LINK_LABELS[lang].rent },
    { href: `/${lang}/${slug("repair")}`, label: LINK_LABELS[lang].repair },
    { href: `/${lang}/${slug("sell")}`, label: LINK_LABELS[lang].sell },
    {
      href: `/${lang}/${slug("quick-delivery")}`,
      label: LINK_LABELS[lang].quickDelivery,
    },
  ];

  return (
    <section className="w-[95%] md:w-[90%] mt-10 md:mt-16">
      <div className="rounded-[24px] bg-white/70 ring-1 ring-black/[0.04] px-5 sm:px-8 md:px-10 py-8 md:py-12">
        <h2 className="text-[22px] sm:text-[26px] md:text-[32px] font-bold leading-tight text-gray-900 max-w-3xl">
          {copy.title}
        </h2>
        <p className="mt-3 md:mt-4 text-[14px] md:text-[16px] leading-relaxed text-gray-600 max-w-3xl">
          {copy.intro}
        </p>
        {/* Recency line — a visible Content Freshness signal to pair with the
            dateModified in the page's WebPage JSON-LD. */}
        <p className="mt-3 inline-flex items-center gap-2 text-[12px] md:text-[13px] font-medium text-[#402F75]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FBBB14]" aria-hidden="true" />
          {copy.freshness}
        </p>

        <div className="mt-8 md:mt-10 grid gap-6 md:gap-8 md:grid-cols-3">
          {copy.blocks.map((block) => (
            <article key={block.heading}>
              <h3 className="text-[16px] md:text-[18px] font-bold text-gray-900 leading-snug">
                {block.heading}
              </h3>
              <p className="mt-2 text-[13px] md:text-[15px] leading-relaxed text-gray-600">
                {block.body}
              </p>
            </article>
          ))}
        </div>

        {/* Descriptive internal links — readable slugs, meaningful anchor text. */}
        <nav
          aria-label={copy.title}
          className="mt-8 md:mt-10 flex flex-wrap gap-2"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full bg-[#EDE9FF] px-4 py-2 text-[12px] md:text-[13px] font-semibold text-[#402F75] transition-colors duration-200 hover:bg-[#402F75] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402F75] focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <h2 className="mt-10 md:mt-14 text-[20px] sm:text-[24px] md:text-[28px] font-bold text-gray-900">
          {copy.faqTitle}
        </h2>
        <div className="mt-5 md:mt-7 grid gap-5 md:gap-7 md:grid-cols-2">
          {copy.faq.map((item) => (
            <div key={item.question}>
              <h3 className="text-[15px] md:text-[16px] font-semibold text-gray-900 leading-snug">
                {item.question}
              </h3>
              <p className="mt-1.5 text-[13px] md:text-[15px] leading-relaxed text-gray-600">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const LINK_LABELS: Record<
  Lang,
  {
    shop: string;
    rent: string;
    repair: string;
    sell: string;
    quickDelivery: string;
  }
> = {
  en: {
    shop: "Shop all products",
    rent: "Rent a device",
    repair: "Book a repair",
    sell: "Sell your device",
    quickDelivery: "Quick delivery",
  },
  az: {
    shop: "Bütün məhsullar",
    rent: "Cihaz icarəyə götür",
    repair: "Təmir sifariş et",
    sell: "Cihazını sat",
    quickDelivery: "Tez çatdırılma",
  },
  ar: {
    shop: "تسوق كل المنتجات",
    rent: "استأجر جهازاً",
    repair: "احجز إصلاحاً",
    sell: "بِع جهازك",
    quickDelivery: "توصيل سريع",
  },
};
