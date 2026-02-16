import AppleLogo from "@/assets/icons/AppleLogo.png"
import GoogleLogo from "@/assets/icons/GoogleLogo.png"
import SnapChatLogo from "@/assets/icons/SnapChatLogo.png"
import FaceBookLogo from "@/assets/icons/FaceBookLogo.png"
import Image from "next/image"


export default function SocialButtons() {
  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      <Image src={AppleLogo} alt="Apple" className="border border-[#F1F1F1] w-[40px] sm:w-[50px] p-[8px] sm:p-[10px] rounded-[10px]" />
      <Image src={GoogleLogo} alt="Google" className="border border-[#F1F1F1] w-[40px] sm:w-[50px] p-[8px] sm:p-[10px] rounded-[10px]" />
      <Image src={SnapChatLogo} alt="Snapchat" className="border border-[#F1F1F1] w-[40px] sm:w-[50px] p-[7px] sm:p-[9px] rounded-[10px]" />
      <Image src={FaceBookLogo} alt="Facebook" className="border border-[#F1F1F1] w-[40px] sm:w-[50px] p-[10px] sm:p-[13px] rounded-[10px]" />
    </div>
  )
}
