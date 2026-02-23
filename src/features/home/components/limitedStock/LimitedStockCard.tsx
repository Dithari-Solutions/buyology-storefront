import Image from "next/image";
import MacPro13 from "@/assets/devices/macPro13.png";
import Button from "@/shared/components/Button";

export default function LimitedStockCard() {
    const specs = ["Intel Core i5", "8 GB RAM", "128 GB SSD", "13.3″ Display", "macOS"];

    return (
        <div
            className="relative rounded-[24px] w-[95%] md:w-[90%] overflow-hidden"
            style={{ background: "linear-gradient(115deg, #EDE8FB 0%, #D9CFEF 25%, #B4A5D5 55%, #6B59A8 80%, #402F75 100%)" }}
        >
            {/* Top badges */}
            <div className="absolute top-4 start-4 sm:top-5 sm:start-6 flex gap-2 z-10">
                <span className="flex items-center gap-1 bg-[#FBBB14] text-white text-[11px] font-bold px-3 py-[5px] rounded-full shadow-md">
                    🔥 Limited Stock
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-[5px] rounded-full border border-white/30">
                    Only 5 left
                </span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-around px-6 sm:px-10 md:px-[60px] pt-16 pb-8 sm:pt-16 sm:pb-10 md:pt-[60px] md:pb-[50px] gap-6 md:gap-10">

                {/* Device image */}
                <div className="flex items-center justify-center flex-shrink-0">
                    <Image
                        src={MacPro13}
                        alt="MacBook Pro 13"
                        className="w-[180px] sm:w-[230px] md:w-[280px] drop-shadow-2xl"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-start">
                    <p className="text-white/60 text-[13px] font-medium tracking-wide uppercase mb-2">
                        MacBook Pro 13 A1708 (2017)
                    </p>
                    <h2 className="text-[26px] sm:text-[32px] md:text-[40px] font-bold text-white leading-tight mb-4">
                        Limited stock <br className="hidden sm:block" />available!
                    </h2>

                    {/* Specs */}
                    <ul className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-[6px] mb-6">
                        {specs.map((spec) => (
                            <li key={spec} className="flex items-center gap-[6px] text-white/75 text-[13px] md:text-[14px]">
                                <span className="w-[5px] h-[5px] rounded-full bg-[#FBBB14] flex-shrink-0" />
                                {spec}
                            </li>
                        ))}
                    </ul>

                    {/* Price + CTA */}
                    <div className="flex items-center gap-5 flex-wrap justify-center md:justify-start">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[32px] sm:text-[36px] font-extrabold text-white leading-none">$299</span>
                            <span className="text-white/40 line-through text-[16px] font-medium">$450</span>
                        </div>
                        <Button title="Buy now" />
                    </div>
                </div>
            </div>
        </div>
    );
}
