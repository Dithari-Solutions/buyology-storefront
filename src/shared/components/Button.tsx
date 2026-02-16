import Image from "next/image";
import { COLORS } from "../styles/variables";
import ArrowUpward from "@/assets/icons/arrow-upward.png";

interface ButtonProps {
    title: string;
}

export default function Button({ title }: ButtonProps) {
    return (
        <div className="flex items-center justify-between md:bottom-[20px] bg-white text-black font-semibold py-[5px] pl-[5px] pr-[20px] rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer text-sm md:text-base cursor-pointer">
            <div className="flex items-center mr-[10px] justify-center rounded-full p-[10px] w-[50px] h-[50px]" style={{
                backgroundColor: COLORS.primary
            }}>
                <Image src={ArrowUpward} alt="arrow-upward" />
            </div>
            <button>
                {title}
            </button>
        </div>
    )
}
