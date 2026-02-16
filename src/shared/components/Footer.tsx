import Image from "next/image";
import Logo from "@/../public/logo.png";
import { COLORS } from "../styles/variables";

export default function Footer() {
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
                        Let&apos;s build something smart together — whether you&apos;re
                        looking for your next device, exploring robotics, or
                        interested in partnering with us, we&apos;re ready when you are.
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
                        <h2 className="text-white text-[18px] md:text-[25px] font-bold mb-[15px] md:mb-[30px]">Shop</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">New Arrivals</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Refurbished</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Special Offers</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Reviews</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[18px] md:text-[25px] font-bold mb-[15px] md:mb-[30px]">Services</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Fixing & Repair</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Rental Plans</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Sell Your Device</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Maintenance</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-white text-[18px] md:text-[25px] font-bold mb-[15px] md:mb-[30px]">Company</h2>
                        <ul>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">About Us</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Contact Support</li>
                            <li className="text-white text-[14px] md:text-[18px] my-[6px] md:my-[10px]">Privacy Policy</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="w-[95%] h-[1px] bg-gray-200 my-[30px] md:my-[50px]" />

            <div>
                <div>
                    <p className="text-gray-200 text-[14px] md:text-[18px] text-center">2026 Buyology LLD. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
