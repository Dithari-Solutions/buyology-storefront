import { StaticImageData } from "next/image";
import Link from "next/link";

interface FeatureCardProps {
    id: string;
    title: string;
    description: string;
    bg: StaticImageData;
    variant?: "tall" | "wide" | "normal";
    href?: string;
}

export default function FeatureCard({ title, description, bg, variant = "normal", href }: FeatureCardProps) {
    const Wrapper = href
        ? ({ children }: { children: React.ReactNode }) => <Link href={href} className="relative overflow-hidden rounded-3xl cursor-pointer group w-full h-full block">{children}</Link>
        : ({ children }: { children: React.ReactNode }) => <div className="relative overflow-hidden rounded-3xl cursor-pointer group w-full h-full">{children}</div>;

    return (
        <Wrapper>
            {/* Background image */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    style={{
                        backgroundImage: `url(${bg.src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f40]/95 via-[#2a1860]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#402F75]/20 to-transparent" />
            </div>

            {/* Arrow button */}
            <div className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#FBBB14] group-hover:border-[#FBBB14] group-hover:rotate-45 group-hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 start-0 end-0 p-5 md:p-6">
                {/* Service badge */}
                <div className="inline-flex items-center gap-[5px] bg-[#FBBB14]/20 border border-[#FBBB14]/40 backdrop-blur-sm rounded-full px-3 py-[5px] mb-3">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#FBBB14] flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-[#FBBB14] uppercase tracking-wider">Service</span>
                </div>

                <h3 className={`text-white font-bold leading-tight mb-2 ${variant === "tall" ? "text-[22px] md:text-[26px]" : "text-[18px] md:text-[20px]"}`}>
                    {title}
                </h3>
                <p className={`text-white/65 leading-relaxed ${variant === "tall" ? "text-[13px] md:text-[14px]" : "text-[12px] md:text-[13px]"} line-clamp-2`}>
                    {description}
                </p>

                {/* CTA link */}
                <div className="flex items-center gap-[6px] mt-3 group-hover:gap-[10px] transition-all duration-300">
                    <span className="text-[12px] font-semibold text-white/80 group-hover:text-white transition-colors">Learn more</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-[#FBBB14] transition-colors">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Wrapper>
    );
}
