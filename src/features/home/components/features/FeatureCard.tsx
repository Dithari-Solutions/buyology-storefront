import Image, { StaticImageData } from "next/image";
import ArrowUpward from "@/assets/icons/arrow-upward-black.png";

interface FeatureCardProps {
    title: string;
    bg: StaticImageData;
}

export default function FeatureCard({ title, bg }: FeatureCardProps) {
    const clipId = `featureClip-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div
            className="relative overflow-hidden rounded-2xl flex flex-col cursor-pointer group transition-transform duration-300 hover:scale-[1.03] w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
        >
            {/* SVG clip definition for rounded cutout */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                        <path d="
                            M 0,0
                            L 0.72,0
                            C 0.78,0 0.78,0.06 0.78,0.06
                            L 0.78,0.09
                            C 0.78,0.16 0.85,0.16 0.85,0.16
                            L 0.93,0.16
                            C 1,0.16 1,0.23 1,0.23
                            L 1,1
                            L 0,1
                            Z
                        " />
                    </clipPath>
                </defs>
            </svg>

            {/* Background image with rounded cutout */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    clipPath: `url(#${clipId})`,
                }}
            >
                <div
                    className="absolute -inset-[5px] transition-transform duration-300 group-hover:scale-110"
                    style={{
                        backgroundImage: `url(${bg.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            </div>

            {/* Arrow icon inside the cutout */}
            <div
                className="absolute top-[5px] right-[5px] flex items-center justify-center w-[35px] h-[35px] md:w-[45px] md:h-[45px] rounded-full transition-all duration-300 group-hover:bg-[#d4ccff] group-hover:rotate-45"
                style={{ backgroundColor: '#EDE9FF' }}
            >
                <Image src={ArrowUpward} alt="arrow" width={20} height={20} className="w-[14px] md:w-[20px]" />
            </div>

            {/* Bottom gradient shadow with text */}
            <div
                className="absolute bottom-0 left-0 w-full px-4 py-4 md:py-5 text-start font-semibold text-[14px] md:text-[16px] text-white"
                style={{
                    background: 'linear-gradient(to top, rgba(64,47,117,0.82) 0%, rgba(64,47,117,0.3) 60%, transparent 100%)',
                }}
            >
                {title}
            </div>
        </div>
    );
}
