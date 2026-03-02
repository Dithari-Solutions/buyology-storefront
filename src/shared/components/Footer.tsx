"use client";

import Image from "next/image";
import Logo from "@/../public/logo.png";
import { COLORS } from "../styles/variables";
import { useTranslation } from "react-i18next";
import AuthVector from "@/assets/vectors/auth-bg-vector.png";

export default function Footer() {
    const { t } = useTranslation("footer");

    return (
        <footer className="relative overflow-hidden flex flex-col items-center justify-center w-full mt-[30px] md:mt-[50px] py-[30px] md:py-[50px] px-[20px] sm:px-[40px] md:px-[60px] lg:px-[100px]" style={{
            backgroundColor: COLORS.primary,
            borderTopLeftRadius: "30px",
            borderTopRightRadius: "30px"
        }}>
            <Image
                src={AuthVector}
                alt=""
                aria-hidden="true"
                className="absolute bottom-0 right-0 pointer-events-none select-none z-0"
                style={{ width: "500px", height: "auto" }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-start justify-between w-full gap-8 md:gap-4">
                <div className="w-full md:w-[calc(100%/3-10px)]">
                    <Image src={Logo} alt="Buyology" className="mb-[15px] md:mb-[20px] w-[120px] md:w-auto" />
                    <p className="text-white mb-[15px] md:mb-[20px] text-[14px] md:text-[14px]">
                        {t("description")}
                    </p>
                    <div className="flex items-center gap-3">
                        {/* Facebook */}
                        <a href="#" aria-label="Facebook" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        {/* X (Twitter) */}
                        <a href="#" aria-label="X" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" aria-label="Instagram" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#402F75" stroke="none"/></svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="#" aria-label="LinkedIn" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        {/* YouTube */}
                        <a href="#" aria-label="YouTube" className="p-[10px] rounded-full bg-[#E7E6F2] hover:bg-white transition-colors flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#402F75"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
                        </a>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 md:gap-8 w-full md:w-auto md:flex">
                    <div>
                        <h2 className="text-white text-[20px] md:text-[20px] font-bold mb-[15px] md:mb-[30px]">{t("shop.heading")}</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("shop.new_arrivals")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("shop.refurbished")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("shop.special_offer")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("shop.reviews")}</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[20px] md:text-[20px] font-bold mb-[15px] md:mb-[30px]">{t("services.heading")}</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("services.fixing")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("services.rental")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("services.sell")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("services.maintenance")}</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[18px] md:text-[20px] font-bold mb-[15px] md:mb-[30px]">{t("company.heading")}</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("company.aboutUs")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("company.contactSupport")}</li>
                            <li className="text-white text-[14px] md:text-[16px] my-[6px] md:my-[10px] cursor-pointer">{t("company.privacyPolicy")}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="relative z-10 w-[100%] h-[1px] bg-gray-200 my-[10px] md:my-[20px] opacity-20" />

            <div className="relative z-10">
                <div>
                    <p className="text-gray-100 opacity-40 text-[14px] md:text-[18px] text-center">{t("copyright")}</p>
                </div>
            </div>
        </footer>
    );
}
