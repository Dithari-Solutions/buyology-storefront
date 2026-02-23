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

      {/* ── Image container ── */}
      <div className={`relative overflow-hidden rounded-[20px] flex items-center justify-center${isList ? ' w-[180px] sm:w-[220px] flex-shrink-0 min-h-[180px]' : ' h-[200px] mb-[12px]'}`}>
        {isList ? (
          <div className="absolute inset-0 bg-[#F6F4FF]" />
        ) : (
          <>
            {/* SVG clip — stepped cutout at top-right (physical coords, never flip) */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path d="M 0,0 L 0.74,0 C 0.82,0 0.82,0.10 0.82,0.10 L 0.82,0.16 C 0.82,0.28 0.91,0.28 0.91,0.28 L 0.95,0.28 C 1,0.28 1,0.40 1,0.40 L 1,1 L 0,1 Z" />
                </clipPath>
              </defs>
            </svg>
            {/* Clipped purple background */}
            <div
              className="absolute inset-0 bg-[#F6F4FF]"
              style={{ clipPath: `url(#${clipId})` }}
            />
            {/*
              Fav button — uses physical `right-[8px]` (not logical `end-`)
              because the SVG clip path is in physical coordinates and
              always cuts the top-RIGHT corner regardless of text direction.
            */}
            <button className="absolute top-[10px] right-[10px] cursor-pointer border border-gray-200 rounded-full p-[8px] bg-white shadow-sm z-10 hover:scale-110 transition-transform">
              <Image src={FavouriteIcon} alt="favourite" width={20} height={20} />
            </button>
          </>
        )}
        <Image src={MacPro13} alt="MacBook Pro 13" className="object-contain min-h-[160px] w-auto relative z-10" />
      </div>

      {/* ── Details ── */}
      <div className={`flex flex-col${isList ? ' flex-1 justify-between py-[4px] min-w-0' : ' gap-[10px]'}`}>

        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-[8px]">
          <h2 className="font-bold text-[17px] leading-snug text-gray-900">MacBook Pro 14</h2>
          <div className="flex items-center gap-[3px] flex-shrink-0 bg-[#F6F4FF] rounded-full px-[7px] py-[3px]">
            <Image src={StarIcon} alt="star" width={12} height={12} />
            <span className="text-[12px] font-bold text-[#402F75]">4.6</span>
          </div>
        </div>

        {/* Specs */}
        <div className={`grid gap-[6px]${isList ? ' grid-cols-3' : ' grid-cols-2'}`}>
          <div className="flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px]">
            <Image src={ProccessorIcon} alt="Processor" width={13} height={13} className="flex-shrink-0 opacity-60" />
            <span className="text-[11px] text-gray-600 font-medium truncate">M3 Chip</span>
          </div>
          <div className="flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px]">
            <Image src={RamIcon} alt="RAM" width={13} height={13} className="flex-shrink-0 opacity-60" />
            <span className="text-[11px] text-gray-600 font-medium truncate">32GB RAM</span>
          </div>
          <div className={`flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px]${isList ? '' : ' col-span-2'}`}>
            <Image src={StorageIcon} alt="Storage" width={13} height={13} className="flex-shrink-0 opacity-60" />
            <span className="text-[11px] text-gray-600 font-medium truncate">1024GB SSD</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Price + Actions */}
        <div className="flex items-end justify-between gap-[8px]">

          {/* Price block */}
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-[5px]">
              <span className="bg-[#402F75] text-white text-[10px] font-bold px-[7px] py-[2px] rounded-full leading-tight">-$300</span>
              <span className="text-gray-400 line-through text-[12px]">$900</span>
            </div>
            <span className="text-[21px] text-[#402F75] font-bold leading-none">$600</span>
          </div>

          {/* Stock + Buttons */}
          <div className="flex flex-col items-end gap-[5px]">
            <span className="bg-green-50 text-green-600 border border-green-200 text-[10px] font-semibold rounded-[6px] py-[2px] px-[7px] leading-tight">
              In Stock
            </span>
            <div className="flex items-center gap-[6px]">
              {isList && (
                <button className="cursor-pointer border border-gray-200 rounded-full p-[7px] bg-white hover:bg-gray-50 transition-colors">
                  <Image src={FavouriteIcon} alt="favourite" width={18} height={18} />
                </button>
              )}
              <button className="flex items-center gap-[5px] bg-[#FBBB14] py-[8px] px-[12px] rounded-[30px] cursor-pointer text-[12px] font-bold whitespace-nowrap hover:bg-[#f0b000] transition-colors">
                <Image src={CartIcon} alt="cart" width={14} height={14} />
                Add to Cart
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
