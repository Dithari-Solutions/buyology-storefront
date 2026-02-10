import AppleLogo from "@/assets/icons/AppleLogo.png"
import GoogleLogo from "@/assets/icons/GoogleLogo.png"
import SnapChatLogo from "@/assets/icons/SnapChatLogo.png"
import FaceBookLogo from "@/assets/icons/FaceBookLogo.png"
import Image from "next/image"

import React from 'react'


export default function SocialButtons() {
  return (
    <div className="flex justify-center py-[50px]">
        <Image src={AppleLogo} alt="Apple" className="mr-[20px] border border-[#F1F1F1] w-[50px] p-[10px] rounded-[10px]"  />
        <Image src={GoogleLogo} alt="Google" className="mr-[20px] border border-[#F1F1F1] w-[50px] p-[10px] rounded-[10px]"/>
        <Image src={SnapChatLogo} alt="Snapchat" className="mr-[20px] border border-[#F1F1F1] w-[50px] p-[9px] rounded-[10px]"/>
        <Image src={FaceBookLogo} alt="Facebook" className="mr-[20px] border border-[#F1F1F1] w-[50px] p-[13px] rounded-[10px]"/>

    </div>

  )
}
