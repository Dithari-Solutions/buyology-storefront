"use client";

import Image from "next/image";
import Logo from "@/../public/logo.png";
import { COLORS } from "../styles/variables";
import { useTranslation } from "react-i18next";

export default function Footer() {
    const {t} = useTranslation("footer");
    
    return (
        <footer className="flex flex-col items-center justify-center w-full mt-[30px] md:mt-[50px] py-[30px] md:py-[50px] px-[20px] sm:px-[40px] md:px-[60px] lg:px-[100px]" style={{
            backgroundColor: COLORS.primary,
            borderTopLeftRadius: "30px",
            borderTopRightRadius: "30px"
        }}>
            <div className="flex flex-col md:flex-row items-start justify-between w-full gap-8 md:gap-4">
                <div className="w-full md:w-[calc(100%/3-10px)]">
                    <Image src={Logo} alt="Buyology" className="mb-[15px] md:mb-[20px] w-[120px] md:w-auto" />
                    <p className="text-white mb-[15px] md:mb-[20px] text-[14px] md:text-[16px]">
                        {t("description")}
                    </p>
                    <div className="flex items-center gap-3 md:justify-between">
                        <div className="p-[20px] md:p-[30px] rounded-full bg-[#E7E6F2]"></div>
                        <div className="p-[20px] md:p-[30px] rounded-full bg-[#E7E6F2]"></div>
                        <div className="p-[20px] md:p-[30px] rounded-full bg-[#E7E6F2]"></div>
                        <div className="p-[20px] md:p-[30px] rounded-full bg-[#E7E6F2]"></div>
                        <div className="p-[20px] md:p-[30px] rounded-full bg-[#E7E6F2]"></div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6 md:gap-8 w-full md:w-auto md:flex">
                    <div>
                        <h2 className="text-white text-[18px] md:text-[25px] font-bold mb-[15px] md:mb-[30px]">{t("shop.heading")}</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("shop.new_arrivals")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("shop.refurbished")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("shop.special_offer")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("shop.reviews")}</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[18px] md:text-[25px] font-bold mb-[15px] md:mb-[30px]">{t("services.heading")}</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("services.fixing")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("services.rental")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("services.sell")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("services.maintenance")}</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[18px] md:text-[25px] font-bold mb-[15px] md:mb-[30px]">{t("company.heading")}</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("company.aboutUs")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("company.contactSupport")}</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">{t("company.privacyPolicy")}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="w-[95%] h-[1px] bg-gray-200 my-[30px] md:my-[50px]" />

            <div>
                <div>
                    <p className="text-gray-200 text-[14px] md:text-[18px] text-center">{t("copyright")}</p>
                </div>
            </div>
        </footer>
    );
}
