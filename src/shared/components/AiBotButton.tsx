import Image from "next/image";
import Robot from "@/assets/robot.png";
import Logo from "@/../public/logo.png";

export default function AiBotButton() {
    return (
        <div className="flex flex-col items-center justify-center rounded-full fixed bottom-[50px] right-[50px] w-[100px] h-[100px] bg-white cursor-pointer">
            <div className="flex flex-col items-center justify-center bg-[#402F75] rounded-full p-[20px] w-[90px] h-[90px]">
                {/* <Image src={Logo} alt="Buyology" width={50} className="mb-[10px]"/> */}
                <Image src={Robot} alt="Buyology-AI" width={50} />
            </div>
        </div>
    )
}
