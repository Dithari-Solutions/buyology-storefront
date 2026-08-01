"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

const STEPS = [
  {
    key: "submit",
    title: "Tell Us About It",
    body: "Fill in your device details, grade its condition and upload photos.",
  },
  {
    key: "estimate",
    title: "Get An Instant Estimate",
    body: "Our AI values your device from your photos in seconds.",
  },
  {
    key: "send",
    title: "Send It To Us",
    body: "Drop it at one of our stores, or request a courier pickup.",
  },
  {
    key: "offer",
    title: "Receive Our Offer",
    body: "We inspect the device and send you a firm price to accept or decline.",
  },
  {
    key: "paid",
    title: "Get Paid",
    body: "Accept and collect your money at our store. Decline and we send it back.",
  },
];

function StepIcon({ index }: { index: number }) {
  const icons = [
    // upload
    <path key="0" d="M12 16V4M12 4l-4 4M12 4l4 4M4 20h16" />,
    // sparkle (AI)
    <path key="1" d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />,
    // truck
    <path key="2" d="M3 7h11v8H3zM14 10h4l3 3v2h-7M6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
    // tag
    <path key="3" d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01" />,
    // wallet / cash
    <path key="4" d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M3 7h16a2 2 0 0 1 2 2v2h-5a2 2 0 0 0 0 4h5" />,
  ];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      {icons[index]}
    </svg>
  );
}

export default function SellLandingPage() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const sellSlug = PATH_SLUGS.sell[lang] ?? "sell";
  const { t } = useTranslation("sell");

  const startHref = `/${lang}/${sellSlug}/new`;
  const myHref = `/${lang}/${sellSlug}/my`;

  return (
    <main className="w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#4a3a86] to-[#2f2158] px-6 py-12 sm:px-12 sm:py-16 text-center">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/5" />
        <h1 className="relative text-[28px] sm:text-[38px] font-extrabold text-white leading-tight">
          {t("landing.heroTitle", { defaultValue: "Sell Your Device to Buyology" })}
        </h1>
        <p className="relative mx-auto mt-3 max-w-[520px] text-[13.5px] sm:text-[15px] text-white/75 leading-relaxed">
          {t("landing.heroSubtitle", {
            defaultValue:
              "Turn the device you no longer use into cash. Get an instant estimate, send it to us, and collect your money at our store.",
          })}
        </p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={startHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#FBBB14] px-8 py-[13px] text-[14px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d]"
          >
            {t("landing.startCta", { defaultValue: "Start Sell Request" })}
          </Link>
          <Link
            href={myHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-[13px] text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t("landing.viewRequests", { defaultValue: "My Sell Requests" })}
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-12">
        <h2 className="text-center text-[22px] sm:text-[26px] font-extrabold text-gray-900">
          {t("landing.howItWorks", { defaultValue: "How It Works" })}
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className="relative rounded-[18px] border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[26px] font-extrabold text-gray-200">{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FF]">
                  <StepIcon index={i} />
                </span>
              </div>
              <h3 className="text-[14px] font-bold text-gray-900">
                {t(`landing.steps.${step.key}.title`, { defaultValue: step.title })}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-500">
                {t(`landing.steps.${step.key}.body`, { defaultValue: step.body })}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-[22px] border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
        <h2 className="text-[20px] sm:text-[24px] font-extrabold text-gray-900">
          {t("landing.ctaTitle", { defaultValue: "Ready to Get Paid?" })}
        </h2>
        <p className="mx-auto mt-2 max-w-[440px] text-[13px] text-gray-500">
          {t("landing.ctaBody", {
            defaultValue: "Submit your device now and get a preliminary estimate in seconds.",
          })}
        </p>
        <Link
          href={startHref}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FBBB14] px-8 py-[13px] text-[14px] font-bold text-[#2f2158] shadow-md transition-colors hover:bg-[#eab00d]"
        >
          {t("landing.startCta", { defaultValue: "Start Sell Request" })}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
