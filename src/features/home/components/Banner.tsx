import Image from "next/image";
import Banner from "@/assets/banner/banner.png";
import { COLORS } from "@/shared/styles/variables";
import ArrowUpward from "@/assets/icons/arrow-upward.png";

export default function HeroSection() {
    return (
        <section className="relative w-[95%] md:w-[90%] mt-3 md:mt-6 overflow-hidden rounded-2xl">
            <div
                className="
                    relative
                    w-full
                    p-5
                    sm:p-[30px]
                    md:p-[50px]
                    min-h-[250px]
                    sm:min-h-[350px]
                    md:min-h-[500px]
                    lg:min-h-[700px]
                "
                style={{
                    backgroundImage: `url(${Banner.src})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {/* Desktop Computer — top-left */}
                <div className="hidden md:block absolute top-[8%] left-[5%] lg:top-[10%] lg:left-[6%] max-w-xs backdrop-blur-md bg-white/20 rounded-xl p-4 lg:p-6">
                    <p className="text-base lg:text-xl font-semibold">
                        Desktop Computer
                    </p>
                    <p className="text-sm text-black mt-1">
                        High performance for home and office
                    </p>
                </div>

                {/* Tablet — top-right */}
                <div className="hidden md:block absolute top-[10%] right-[6%] lg:top-[8%] lg:right-[8%] max-w-xs backdrop-blur-md bg-white/20 rounded-xl p-4 lg:p-6">
                    <p className="text-base lg:text-xl font-semibold">
                        Tablet
                    </p>
                    <p className="text-sm text-black mt-1">
                        For reading, drawing, and entertainment
                    </p>
                </div>

                {/* Laptop — bottom-left */}
                <div className="hidden md:block absolute bottom-[25%] left-[4%] lg:bottom-[22%] lg:left-[5%] max-w-xs backdrop-blur-md bg-white/20 rounded-xl p-4 lg:p-6">
                    <p className="text-base lg:text-xl font-semibold">
                        Laptop
                    </p>
                    <p className="text-sm text-black mt-1">
                        Perfect for work, study, and travel
                    </p>
                </div>

                {/* Shop Now Button — bottom */}
                <div className="flex items-center justify-between absolute bottom-[15px] left-[15px] sm:bottom-[20px] sm:left-[120px] md:-translate-x-1/2 bg-white text-black font-semibold py-[5px] pl-[5px] pr-[15px] sm:pr-[20px] rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer text-xs sm:text-sm md:text-base">
                    <div className="flex items-center mr-[8px] sm:mr-[10px] justify-center rounded-full p-[8px] sm:p-[10px] w-[36px] h-[36px] sm:w-[50px] sm:h-[50px]" style={{
                        backgroundColor: COLORS.primary
                    }}>
                        <Image src={ArrowUpward} alt="arrow-upward" />
                    </div>
                    <button>
                        Shop Now
                    </button>
                </div>
            </div>

            {/* White overlay with rounded top-left corner for the cutout */}
            <div className="absolute bottom-0 right-0 w-[120px] h-[80px] sm:w-[140px] sm:h-[100px] md:w-[170px] md:h-[120px] bg-[#F7F7F7] rounded-tl-[30px] md:rounded-tl-[40px]" />

            {/* Inverted rounded corner — top edge */}
            <div
                className="absolute bottom-[80px] sm:bottom-[100px] md:bottom-[120px] right-0 w-[20px] h-[20px]"
                style={{
                    background: "transparent",
                    borderBottomRightRadius: "20px",
                    boxShadow: "10px 10px 0 10px #F7F7F7",
                }}
            />

            {/* Inverted rounded corner — left edge */}
            <div
                className="absolute bottom-0 right-[120px] sm:right-[140px] md:right-[170px] w-[20px] h-[20px]"
                style={{
                    background: "transparent",
                    borderBottomRightRadius: "20px",
                    boxShadow: "10px 10px 0 10px #F7F7F7",
                }}
            />

            {/* App Store Badges */}
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3 flex flex-col items-center gap-1">
                <a
                    href="#"
                    aria-label="Download on the App Store"
                    className="transition-transform hover:scale-105"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                        alt="Download on the App Store"
                        className="w-[100px] sm:w-[120px] md:w-[135px]"
                    />
                </a>
                <a
                    href="#"
                    aria-label="Get it on Google Play"
                    className="transition-transform hover:scale-105"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Get it on Google Play"
                        className="w-[100px] sm:w-[120px] md:w-[135px]"
                    />
                </a>
            </div>
        </section>
    );
}
