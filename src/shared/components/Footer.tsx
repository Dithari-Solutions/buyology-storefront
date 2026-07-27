"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/../public/logo.png";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { conditionHref } from "@/shared/utils/categoryHref";
import AuthVector from "@/assets/vectors/auth-bg-vector.png";
import {
    BUSINESS,
    BUSINESS_ADDRESS_LINE,
    BUSINESS_TEL_HREF,
} from "@/shared/seo/config";

export default function Footer() {
    const { t } = useTranslation("footer");
    const lang = (useSelector((state: RootState) => state.language.lang) as Lang) ?? "en";
    const shopSlug = PATH_SLUGS.shop?.[lang] ?? "shop";
    const repairSlug = PATH_SLUGS.repair?.[lang] ?? "repair";
    const rentSlug = PATH_SLUGS.rent?.[lang] ?? "rent";
    const sellSlug = PATH_SLUGS.sell?.[lang] ?? "sell";
    const contactSlug = PATH_SLUGS.contact?.[lang] ?? "contact";

    return (
        <footer className="relative overflow-hidden flex flex-col items-center justify-center w-full mt-[30px] md:mt-[50px] py-[30px] md:py-[50px] px-[20px] sm:px-[40px] md:px-[60px] lg:px-[100px] rounded-t-[30px] bg-[#402F75]">
            <Image
                src={AuthVector}
                alt=""
                aria-hidden="true"
                width={500}
                height={338}
                sizes="500px"
                className="absolute bottom-0 right-0 pointer-events-none select-none z-0 w-[500px] h-auto aspect-[851/575]"
            />
            <div className="relative z-10 flex flex-col md:flex-row items-start justify-between w-full gap-8 md:gap-4">
                <div className="w-full md:w-[calc(100%/3-10px)]">
                    <Image src={Logo} alt="Buyology" className="mb-[15px] md:mb-[20px] w-[120px] md:w-auto" />
                    <p className="text-white mb-[15px] md:mb-[20px] text-[14px] md:text-[14px]">
                        {t("description")}
                    </p>

                    {/* NAP (name / address / phone). Kept in plain text and
                        matching the LocalBusiness JSON-LD verbatim — local search
                        treats a mismatch between the two as a negative signal. */}
                    <address className="not-italic mb-[15px] md:mb-[20px] space-y-1.5">
                        <p className="text-white/85 text-[13px] md:text-[14px]">
                            {BUSINESS.legalName}
                        </p>
                        <p className="text-white/85 text-[13px] md:text-[14px]">
                            {BUSINESS_ADDRESS_LINE}
                        </p>
                        {/* Phone only — no plain-text email. The audit's "Email
                            Privacy" check passes today and a mailto: in the
                            global footer would put an address on every page for
                            scrapers to harvest. Email lives on /contact. */}
                        <p className="text-[13px] md:text-[14px]">
                            <a
                                href={BUSINESS_TEL_HREF}
                                className="text-white/85 hover:text-[#FBBB14] transition-colors"
                            >
                                {BUSINESS.telephone}
                            </a>
                        </p>
                    </address>

                    <div className="flex items-center gap-3">
                        {/* Facebook */}
                        <a href="https://www.facebook.com/buyologyuae/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        {/* Instagram */}
                        <a href="http://instagram.com/buyologyuae/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#402F75" stroke="none"/></svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="https://www.linkedin.com/company/buyologytech/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        {/* YouTube */}
                        <a href="https://www.youtube.com/@Buyologytech" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
                        </a>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 md:gap-8 w-full md:w-auto md:flex">
                    <div>
                        <h2 className="text-white text-[20px] md:text-[20px] font-bold mb-[15px] md:mb-[30px]">{t("shop.heading")}</h2>
                        <ul>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${shopSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("shop.new_arrivals")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={conditionHref(lang, "REFURBISHED")} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("shop.refurbished")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${shopSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("shop.special_offer")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${shopSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("shop.reviews")}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[20px] md:text-[20px] font-bold mb-[15px] md:mb-[30px]">{t("services.heading")}</h2>
                        <ul>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${repairSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("services.fixing")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${rentSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("services.rental")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${sellSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("services.sell")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${repairSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("services.maintenance")}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[18px] md:text-[20px] font-bold mb-[15px] md:mb-[30px]">{t("company.heading")}</h2>
                        <ul>
                            <li className="my-[6px] md:my-[10px]"><a href="https://web.buyology.online" target="_blank" rel="noopener noreferrer" className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("company.aboutUs")}</a></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/${contactSlug}`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("company.contactSupport")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/privacy-policy`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("company.privacyPolicy")}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/terms-conditions`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("company.termsConditions", { defaultValue: "Terms & Conditions" })}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/returns-refunds`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("company.returnsRefunds", { defaultValue: "Returns & Refunds" })}</Link></li>
                            <li className="my-[6px] md:my-[10px]"><Link href={`/${lang}/returns-refunds-b2b`} className="text-white text-[14px] md:text-[16px] hover:text-[#FBBB14] transition-colors">{t("company.returnsRefundsB2b", { defaultValue: "Returns & Refunds (B2B)" })}</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="relative z-10 w-[100%] h-[1px] bg-gray-200 my-[10px] md:my-[20px] opacity-20" />

            <div className="relative z-10">
                <div>
                    <p className="text-white/85 text-[14px] md:text-[18px] text-center">{t("copyright")}</p>
                </div>
            </div>
        </footer>
    );
}
