import Link from "next/link"
import Logo from "@/../public/logo.png"
import SearchIcon from "@/assets/icons/searchicon.svg"
import ArrowDown from "@/assets/icons/arrow-down.svg"
import Image from "next/image"


export default function Header() {
    return (
        <header className="py-[30px] px-[35px]">
            <nav className="flex bg-[#402F75] py-[15px] px-[35px] rounded-[40px] items-center justify-between">
                <div className=" w-[20%] cursor-pointer" >
                    <Link href={"/"}>
                        <Image src={Logo} alt="Buyology" width={100} />
                    </Link>
                </div>
                <div className=" w-[30%] ">
                    <ul className="flex text-white w-full flex justify-around items-center">
                        <li className="cursor-pointer">Home</li>
                        <li className="cursor-pointer">Shop</li>
                        <li className="cursor-pointer">Catalog</li>
                        <li className="cursor-pointer">Contact Us</li>
                    </ul>
                </div>
                <div className=" w-[50%] flex items-center justify-end">
                    <div className="flex items-center bg-white rounded-[40px] h-[35px] px-[10px] mr-[20px]  ">
                        <Image src={SearchIcon} alt="search" width={20} className="mr-[10px]" />
                        <input className="outline-none" placeholder="Search..." type="search" />
                    </div>
                    <div className="flex bg-white rounded-[40px] px-[15px] h-[35px] mr-[20px] cursor-pointer">
                        <button className="text-[12px] mr-[5px]"> EN </button>
                        <Image src={ArrowDown} alt="arrow" width={15} />
                    </div>
                    <Link href={"/auth"}>
                        <button className="bg-[#FEBF12] rounded-[40px] px-[30px] h-[35px] text-[13px] mr-[20px] cursor-pointer"> Log In </button>
                    </Link>
                </div>
            </nav>
        </header>
    )
}
