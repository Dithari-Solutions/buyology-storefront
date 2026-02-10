import CartIcon from "@/assets/icons/cart.png"
import HeartIcon from "@/assets/icons/heart.png"
import CalendarIcon from "@/assets/icons/calendar.png"
import ToolIcon from "@/assets/icons/tool.png"
import ArrowLeftIcon from "@/assets/icons/Arrow-left.png"
import Image from "next/image"

import React from 'react'

export default function LoginText() {
    return (
        <div className="bg-[#402F75] h-screen w-[60%] py-[110px] px-[55px]">
            <h1 className="text-white text-[50px] font-bold mb-[40px] ">
                Your Tech Journey, <br />
                All in One Place
            </h1>
            <p className="text-white mb-[50px]">
                From the latest flagships to certified pre-owned <br />
                devices, we’ve got you covered.
            </p>
            <div className="flex mb-[15px]">
                <Image src={CartIcon} alt="Cart" className="mr-[10px]" />
                <p className="text-white">Buy New (Latest arrivals)</p>
            </div>
            <div className="flex mb-[15px]">
                <Image src={HeartIcon} alt="Heart" className="mr-[10px]"/>
                <p className="text-white">Second Hand (Certified & Tested)</p>
            </div>
            <div className="flex mb-[15px]">
                <Image src={CalendarIcon} alt="Calendar" className="mr-[10px]"/>
                <p className="text-white">Rent (Flexible plans)</p>
            </div>
            <div className="flex mb-[60px]">
                <Image src={ToolIcon} alt="Tool" className="mr-[10px]"/>
                <p className="text-white">Repair (Fast & Professional)</p>
            </div>
            <div className="flex items-center justify-center border border-[#FBBB14] w-[200px] py-[15px] px-[17px] bg-[#FBBB14] rounded-full cursor-pointer">
                <Image src={ArrowLeftIcon} alt="Arrowleft" className="w-[20px] h-[20px]" />
                <button className="ml-[10px]">Back to Website</button>
            </div>
        </div>
    )
}