import Image from "next/image";
import RamIcon from "@/assets/icons/ram.png";
import CartIcon from "@/assets/icons/cart.png";
import StarIcon from "@/assets/icons/star.png";
import StorageIcon from "@/assets/icons/storage.png";
import ProccessorIcon from "@/assets/icons/proccessor.png";

export default function ProductCard() {
  return (
    <div className="p-[10px] bg-white rounded-[20px] w-full border border-gray-300" style={{ width: "350px" }}>
      <div>

      </div>
      <div>
        <div className="flex items-center justify-between mb-[20px]">
          <h2 className="font-bold text-[20px]">MacBook Pro 14</h2>
          <div className="flex items-center">
            <p className="mr-[10px]">(4.6)</p>
            <Image src={StarIcon} alt="star" />
          </div>
        </div>
        <div className="mb-[30px]">
          <div className="flex items-center">
            <Image src={ProccessorIcon} alt="RAM" className="mr-[10px]" />
            <p>M3 Chip</p>
          </div>
          <div>
            <div className="flex items-center">
              <Image src={StorageIcon} alt="RAM" className="mr-[10px]" />
              <p>1024GB</p>
            </div>
            <div className="flex items-center">
              <Image src={RamIcon} alt="RAM" className="mr-[10px]" />
              <p>32GB</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div>
            {/* discount component */}
            <div className="w-fit bg-[#402F75] py-[5px] px-[8px] rounded-[30px]">
              <p className="text-white font-bold text-[17px]">
                $ -300
              </p>
            </div>
            {/* old price */}
            <p className="text-gray-400 line-through font-bold text-[18px]">$ 900</p>
            {/* sale price */}
            <h2 className="text-[25px] text-[#402F75] font-bold">$ 600</h2>
          </div>
          <div className="flex flex-col items-start w-[50%]">
            {/* stock status */}
            <div className="bg-gray-200 rounded-[5px] py-[3px] px-[10px] mb-[10px]">
              <p>In Stock</p>
            </div>
            <button className="flex items-center w-fit bg-[#FBBB14] py-[10px] px-[20px] rounded-[30px] cursor-pointer">
              <Image src={CartIcon} alt="cart" className="mr-[10px]" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
