import Image from "next/image";
import MacPro13 from "@/assets/devices/macPro13.png";
import Button from "@/shared/components/Button";

export default function LimitedStockCard() {
    return (
        <div
            style={{ background: "linear-gradient(90deg, #E9E5FC, #ECE5ED, #F6ECED, #FCF1ED, #D7C9E0, #B4A5D5, #8171B8, #7665AC, #402F75)" }}
            className="rounded-[20px] w-[90%] flex items-center justify-around p-[50px]">
            <div>
                <Image src={MacPro13} alt="Macbook pro 13" />
            </div>
            <div>
                <h2 className="text-[40px] font-bold mb-[15px]">Limited stock available!</h2>
                <p className="text-[25px] font-500 mb-[15px]">MacBook Pro 13 A1708 (2017)</p>

                <div className="flex items-center justify-between">
                    <ul className="flex items-center w-[300px] flex-wrap mr-[40px]">
                        <li className="mr-[15px]">Intel core i5</li>
                        <li className="mr-[15px]">8 GB RAM</li>
                        <li className="mr-[15px]">128 GB SSD</li>
                        <li className="mr-[15px]">13.3 inch display</li>
                        <li className="mr-[15px]">MAC OS</li>
                    </ul>
                    <Button title="Buy now" />
                </div>
            </div>
        </div>
    )
}
