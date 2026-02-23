"use client";

import { useId } from "react";
import Image from "next/image";
import RamIcon from "@/assets/icons/ram.png";
import CartIcon from "@/assets/icons/cart.png";
import StarIcon from "@/assets/icons/star.png";
import StorageIcon from "@/assets/icons/storage.png";
import ProccessorIcon from "@/assets/icons/proccessor.png";
import FavouriteIcon from "@/assets/icons/favourite.png";
import MacPro13 from "@/assets/devices/macPro13.png";

export default function ProductCard({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  const id = useId();
  const clipId = `productImageClip-${id.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const isList = view === 'list';

  return (
    <div className={`p-[10px] bg-white rounded-[20px] w-full border border-gray-300${isList ? ' flex flex-row gap-[16px]' : ''}`}>
      {/* image container */}
      <div className={`relative overflow-hidden rounded-[20px] flex items-center justify-center${isList ? ' w-[180px] sm:w-[220px] flex-shrink-0 min-h-[180px]' : ' h-[200px] mb-[15px]'}`}>
        {isList ? (
          <div className="absolute inset-0 bg-[#F6F4FF]" />
        ) : (
          <>
            {/* SVG clip definition for stepped cutout at top-right */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path d="M 0,0 L 0.74,0 C 0.82,0 0.82,0.10 0.82,0.10 L 0.82,0.16 C 0.82,0.28 0.91,0.28 0.91,0.28 L 0.95,0.28 C 1,0.28 1,0.40 1,0.40 L 1,1 L 0,1 Z" />
                </clipPath>
              </defs>
            </svg>
            {/* background with clipped top-right corner */}
            <div
              className="absolute inset-0 bg-[#F6F4FF]"
              style={{ clipPath: `url(#${clipId})` }}
            />
            {/* fav button nested inside the cutout (shows white card bg behind) */}
            <button className="absolute top-[6px] right-[6px] cursor-pointer border border-gray-300 rounded-full p-[9px] bg-white z-10">
              <Image src={FavouriteIcon} alt="favourite" width={24} height={24} />
            </button>
          </>
        )}

        {/* centered product image */}
        <Image src={MacPro13} alt="MacBook Pro 13" className="object-contain min-h-[160px] w-auto relative z-10" />
      </div>

      {/* details */}
      <div className={isList ? 'flex-1 flex flex-col justify-between py-[5px] min-w-0' : ''}>
        <div className={`flex items-center justify-between${isList ? ' mb-[12px]' : ' mb-[20px]'}`}>
          <h2 className="font-bold text-[20px] truncate">MacBook Pro 14</h2>
          <div className="flex items-center flex-shrink-0 ms-[8px]">
            <p className="me-[10px]">(4.6)</p>
            <Image src={StarIcon} alt="star" />
          </div>
        </div>

        <div className={isList ? 'mb-[12px]' : 'mb-[30px]'}>
          <div className="flex items-center">
            <Image src={ProccessorIcon} alt="RAM" className="me-[10px]" />
            <p>M3 Chip</p>
          </div>
          <div>
            <div className="flex items-center">
              <Image src={StorageIcon} alt="RAM" className="me-[10px]" />
              <p>1024GB</p>
            </div>
            <div className="flex items-center">
              <Image src={RamIcon} alt="RAM" className="me-[10px]" />
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
            <div className="flex items-center gap-[8px]">
              {isList && (
                <button className="cursor-pointer border border-gray-300 rounded-full p-[9px] bg-white">
                  <Image src={FavouriteIcon} alt="favourite" width={24} height={24} />
                </button>
              )}
              <button className="flex items-center w-fit bg-[#FBBB14] py-[10px] px-[20px] rounded-[30px] cursor-pointer">
                <Image src={CartIcon} alt="cart" className="me-[10px]" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
