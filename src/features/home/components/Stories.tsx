import Story from "@/assets/story/story.svg"
import Image from "next/image"

import React from 'react'

export default function Stories() {
    return (
        <section className="px-[60px]">
            <div>
                <div className="w-[100px] h-[100px] p-1 rounded-full bg-[linear-gradient(135deg,#FBBB14,#FDE39F,#DFDFDF,#9D95B8,#402F75)] flex items-center justify-center">
                    <div className="w-[90px] h-[90px] p-1 rounded-full bg-white flex items-center justify-center">
                        <Image src={Story} alt="story" width={90} />
                    </div>
                </div>
                <p className="text-[15px] ">New Laptops</p>
            </div>

        </section>
    )
}
