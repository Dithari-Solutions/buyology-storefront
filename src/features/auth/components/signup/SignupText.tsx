import Image from "next/image";
import CartIcon from "@/assets/icons/cart.png";
import ToolIcon from "@/assets/icons/tool.png";
import HeartIcon from "@/assets/icons/heart.png";
import CalendarIcon from "@/assets/icons/calendar.png";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";

export default function SignupText() {
    return (
        <div className="w-[60%]">
            <h1>
                Your Tech Journey, <br />
                All in One Place
            </h1>

            <p>
                From the latest flagships to certified pre-owned <br />
                devices, we’ve got you covered.
            </p>

            <div>
                <Image src={CartIcon} alt="cart" />
                <p>Buy New (Latest arrivals)</p>
            </div>

            <div>
                <Image src={CartIcon} alt="cart" />
                <p>Second Hand (Certified & Tested)</p>
            </div>

            <div>
                <Image src={CartIcon} alt="cart" />
                <p>Rent (Flexible plans)</p>
            </div>

            <div>
                <Image src={CartIcon} alt="cart" />
                <p>Repair (Fast & Professional)</p>
            </div>

            <button>
                <Image src={ArrowLeftIcon} alt="arrow-left" />
                Back to Website
            </button>

        </div>
    )
}
