import Image from "next/image";
import Story from "@/assets/story/story.svg";

export default function Stories() {
    return (
        <section className="w-[95%] md:w-[80%] flex items-center gap-4 md:justify-between overflow-x-auto py-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0">
                    <div className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] p-1 rounded-full bg-[linear-gradient(135deg,#FBBB14,#FDE39F,#DFDFDF,#9D95B8,#402F75)] flex items-center justify-center">
                        <div className="w-[62px] h-[62px] md:w-[90px] md:h-[90px] p-1 rounded-full bg-white flex items-center justify-center">
                            <Image src={Story} alt="story" width={90} className="w-[55px] md:w-[90px]" />
                        </div>
                    </div>
                    <p className="text-[12px] md:text-[15px] mt-1 text-center">New Laptops</p>
                </div>
            ))}
        </section>
    );
}
