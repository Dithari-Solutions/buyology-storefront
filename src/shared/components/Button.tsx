import Image from "next/image";
import { COLORS } from "../styles/variables";
import ArrowUpward from "@/assets/icons/arrow-upward.png";

interface ButtonProps {
    title: string;
}

export default function Button({ title }: ButtonProps) {
    return (
        <div className="flex items-center justify-between bg-white text-black font-semibold py-[4px] sm:py-[5px] ps-[4px] sm:ps-[5px] pe-[15px] sm:pe-[20px] rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer text-xs sm:text-sm md:text-base">
            <div className="flex items-center me-[8px] sm:me-[10px] justify-center rounded-full p-[8px] sm:p-[10px] w-[36px] h-[36px] sm:w-[50px] sm:h-[50px]" style={{
                backgroundColor: COLORS.primary
            }}>
                <Image src={ArrowUpward} alt="arrow-upward" />
            </div>
            <button>
                {title}
            </button>
        </div>
    );
}
