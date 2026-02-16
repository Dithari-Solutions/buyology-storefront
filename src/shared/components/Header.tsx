"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";
import ArrowDown from "@/assets/icons/arrow-down.svg";
import SearchIcon from "@/assets/icons/searchicon.svg";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="py-5 md:py-[40px] flex items-center justify-center">
            <nav className="flex flex-wrap bg-[#402F75] w-[95%] md:w-[90%] py-[10px] md:py-[15px] px-[15px] md:px-[35px] rounded-[40px] items-center justify-between relative">
                {/* Logo */}
                <div className="cursor-pointer">
                    <Link href={"/"}>
                        <Image src={Logo} alt="Buyology" width={80} className="md:w-[100px]" />
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:block">
                    <ul className="flex text-white gap-6 items-center">
                        <li className="cursor-pointer">Home</li>
                        <li className="cursor-pointer">Shop</li>
                        <li className="cursor-pointer">Catalog</li>
                        <li className="cursor-pointer">Contact Us</li>
                    </ul>
                </div>

                {/* Desktop Right Section */}
                <div className="hidden lg:flex items-center">
                    <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] mr-[10px] xl:mr-[20px]">
                        <Image src={SearchIcon} alt="search" width={20} className="mr-[10px]" />
                        <input className="outline-none w-[120px] xl:w-auto" placeholder="Search..." type="search" />
                    </div>
                    <div className="flex bg-white rounded-[40px] px-[15px] h-[35px] mr-[10px] xl:mr-[20px] cursor-pointer items-center">
                        <button className="text-[12px] mr-[5px]"> EN </button>
                        <Image src={ArrowDown} alt="arrow" width={15} />
                    </div>
                    <Link href={"/auth"}>
                        <button className="bg-[#FEBF12] rounded-[40px] px-[20px] xl:px-[30px] h-[35px] text-[13px] cursor-pointer"> Log In </button>
                    </Link>
                </div>

                {/* Mobile Right: Search + Hamburger */}
                <div className="flex lg:hidden items-center gap-3">
                    <Link href={"/auth"}>
                        <button className="bg-[#FEBF12] rounded-[40px] px-[20px] h-[32px] text-[12px] cursor-pointer"> Log In </button>
                    </Link>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-white p-1 cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {menuOpen ? (
                                <path d="M6 6L18 18M6 18L18 6" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="lg:hidden w-full mt-3 pb-3">
                        <ul className="flex flex-col text-white gap-3 mb-4">
                            <li className="cursor-pointer py-1">Home</li>
                            <li className="cursor-pointer py-1">Shop</li>
                            <li className="cursor-pointer py-1">Catalog</li>
                            <li className="cursor-pointer py-1">Contact Us</li>
                        </ul>
                        <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] w-full mb-3">
                            <Image src={SearchIcon} alt="search" width={20} className="mr-[10px]" />
                            <input className="outline-none w-full" placeholder="Search..." type="search" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-white rounded-[40px] px-[15px] h-[35px] cursor-pointer items-center">
                                <button className="text-[12px] mr-[5px]"> EN </button>
                                <Image src={ArrowDown} alt="arrow" width={15} />
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
