import Link from "next/link";
import Image from "next/image";
import CartIcon from "@/assets/icons/cart.png";
import ToolIcon from "@/assets/icons/tool.png";
import HeartIcon from "@/assets/icons/heart.png";
import CalendarIcon from "@/assets/icons/calendar.png";
import ArrowLeftIcon from "@/assets/icons/Arrow-left.png";

export default function AuthText() {
    return (
        <div className="h-full flex flex-col justify-center pr-[10px] sm:pr-10 md:pr-[20px] lg:pr-[25px] xl:pr-[30px]">
            {/* Heading */}
            <h1 className="leading-[1.1] text-white text-[30px] sm:text-[35px] md:text-[40px] lg:text-[50px] font-bold mb-[12px] sm:mb-[20px] leading-snug">
                Your Tech Journey, <br />
                All in One Place
            </h1>

            {/* Description */}
            <p className="text-white mb-[12px] sm:mb-[25px] text-[14px] sm:text-[15px] md:text-[20px] leading-relaxed">
                From the latest flagships to certified pre-owned <br className="hidden sm:inline" />
                devices, we’ve got you covered.
            </p>

            {/* Feature List */}
            <div className="flex flex-col gap-4 sm:gap-5 mb-[50px]">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Image src={CartIcon} alt="Cart" className="w-5 h-5 sm:w-6 sm:h-6" />
                    <p className="text-white text-[13px] sm:text-[14px] md:text-[15px]">Buy New (Latest arrivals)</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <Image src={HeartIcon} alt="Heart" className="w-5 h-5 sm:w-6 sm:h-6" />
                    <p className="text-white text-[13px] sm:text-[14px] md:text-[15px]">Second Hand (Certified & Tested)</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <Image src={CalendarIcon} alt="Calendar" className="w-5 h-5 sm:w-6 sm:h-6" />
                    <p className="text-white text-[13px] sm:text-[14px] md:text-[15px]">Rent (Flexible plans)</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <Image src={ToolIcon} alt="Tool" className="w-5 h-5 sm:w-6 sm:h-6" />
                    <p className="text-white text-[13px] sm:text-[14px] md:text-[15px]">Repair (Fast & Professional)</p>
                </div>
            </div>

            {/* Back Button */}
            <Link href={"/"}>
                <div className="flex items-center justify-center border border-[#FBBB14] w-full sm:w-[220px] py-3 px-5 bg-[#FBBB14] rounded-full cursor-pointer transition hover:opacity-90">
                    <Image src={ArrowLeftIcon} alt="Arrow Left" className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="ml-3 text-[14px] sm:text-[15px] font-medium text-black">Back to Website</span>
                </div>
            </Link>
        </div>
    );
}
