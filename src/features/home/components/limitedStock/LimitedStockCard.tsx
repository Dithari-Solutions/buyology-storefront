import Image from "next/image";
import MacPro13 from "@/assets/devices/macPro13.png";
import Button from "@/shared/components/Button";

export default function LimitedStockCard() {
    return (
        <div
            style={{ background: "linear-gradient(90deg, #E9E5FC, #ECE5ED, #F6ECED, #FCF1ED, #D7C9E0, #B4A5D5, #8171B8, #7665AC, #402F75)" }}
            className="rounded-[20px] w-[95%] md:w-[90%] flex flex-col md:flex-row items-center justify-around p-6 sm:p-8 md:p-[50px] gap-6 md:gap-0">
            <div className="flex items-center justify-center">
                <Image src={MacPro13} alt="Macbook pro 13" className="w-[180px] sm:w-[220px] md:w-auto" />
            </div>
            <div className="text-center md:text-left">
                <h2 className="text-[24px] sm:text-[30px] md:text-[40px] font-bold mb-[10px] md:mb-[15px]">Limited stock available!</h2>
                <p className="text-[18px] sm:text-[20px] md:text-[25px] mb-[10px] md:mb-[15px]">MacBook Pro 13 A1708 (2017)</p>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-between gap-4">
                    <ul className="flex items-center flex-wrap justify-center md:justify-start gap-x-[15px] gap-y-1 sm:mr-[40px] text-[14px] md:text-[16px]">
                        <li>Intel core i5</li>
                        <li>8 GB RAM</li>
                        <li>128 GB SSD</li>
                        <li>13.3 inch display</li>
                        <li>MAC OS</li>
                    </ul>
                    <Button title="Buy now" />
                </div>
            </div>
        </div>
    );
}
