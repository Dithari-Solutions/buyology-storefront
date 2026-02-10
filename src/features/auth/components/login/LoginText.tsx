import CartIcon from "@/assets/icons/cart.png"
import HeartIcon from "@/assets/icons/heart.png"
import CalendarIcon from "@/assets/icons/calendar.png"
import ToolIcon from "@/assets/icons/tool.png"
import Image from "next/image"

import React from 'react'

export default function LoginText() {
    return (
        <div>
            <h1>
                Your Tech Journey, <br />
                All in One Place
            </h1>
            <p>
                From the latest flagships to certified pre-owned <br />
                devices, we’ve got you covered.
            </p>
            <div>
                <Image src={CartIcon} alt="Cart"/>
                <Image src={HeartIcon} alt="Cart"/>
                <Image src={} alt="Cart"/>
                <Image src={CartIcon} alt="Cart"/>
            </div>
        </div>
    )
}
