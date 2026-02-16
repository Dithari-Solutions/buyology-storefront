import Image, { StaticImageData } from "next/image";
import heartIcon from "@/assets/icons/heart.png";
import cartIcon from "@/assets/icons/cart.png";
import { COLORS } from "@/shared/styles/variables";

export interface DeviceDetails {
    name: string;
    image: StaticImageData;
    specs: string[];
    price: number;
    originalPrice: number;
    discountPercent: number;
}

export default function SuperDealsCard({ device }: { device: DeviceDetails }) {
    const savings = device.originalPrice - device.price;
    const outerClipId = `superDealOuter-${device.name.replace(/\s+/g, '-').toLowerCase()}`;
    const innerClipId = `superDealInner-${device.name.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="relative max-w-[460px] h-full">
            {/* SVG clip definitions */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    {/* Outer white container clip (larger) */}
                    <clipPath id={outerClipId} clipPathUnits="objectBoundingBox">
                        <path d="
                            M 0,0
                            L 0.80,0
                            Q 0.86,0 0.86,0.08
                            L 0.86,0.14
                            Q 0.86,0.22 0.92,0.22
                            L 0.94,0.22
                            Q 1,0.22 1,0.34
                            L 1,1
                            L 0,1
                            Z
                        " />
                    </clipPath>
                    {/* Inner colored container clip (slightly inset) */}
                    <clipPath id={innerClipId} clipPathUnits="objectBoundingBox">
                        <path d="
                            M 0,0
                            L 0.78,0
                            Q 0.84,0 0.84,0.09
                            L 0.84,0.16
                            Q 0.84,0.24 0.90,0.24
                            L 0.93,0.24
                            Q 1,0.24 1,0.38
                            L 1,1
                            L 0,1
                            Z
                        " />
                    </clipPath>
                </defs>
            </svg>

            {/* Outer white container with curve */}
            <div
                className="rounded-2xl h-full p-2"
                style={{
                    clipPath: `url(#${outerClipId})`,
                    backgroundColor: 'white',
                }}
            >
                {/* Inner colored container with its own curve */}
                <div
                    className="rounded-xl h-full p-4"
                    style={{
                        clipPath: `url(#${innerClipId})`,
                        backgroundColor: '#F5F3FA',
                    }}
                >
                    {/* Card content */}
                    <div className="flex flex-col h-full">
                        {/* Title on top */}
                        <h3 className="font-bold text-lg mb-3">{device.name}</h3>

                        {/* Image and Details side by side */}
                        <div className="flex gap-4 flex-1">
                            {/* Left - Image */}
                            <div className="flex items-center justify-center min-w-[140px]">
                                <Image
                                    src={device.image}
                                    alt={device.name}
                                    width={140}
                                    height={120}
                                    className="object-contain"
                                />
                            </div>

                            {/* Vertical divider */}
                            <div className="w-px bg-gray-200" />

                            {/* Right - Details */}
                            <div className="flex flex-col justify-between flex-1 gap-3">
                                {/* Specs */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                                    {device.specs.map((spec, i) => (
                                        <span key={i}>{spec}</span>
                                    ))}
                                </div>

                                {/* Savings Badge */}
                                <span
                                    className="text-white text-xs font-semibold px-3 py-1 rounded-full w-fit"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    -${savings}
                                </span>

                                {/* Pricing */}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold">${device.price}</span>
                                    <span className="text-gray-400 line-through text-base">${device.originalPrice}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                                        <Image src={heartIcon} alt="Wishlist" width={20} height={20} />
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
                                        style={{ backgroundColor: COLORS.secondary }}
                                    >
                                        <Image src={cartIcon} alt="Cart" width={18} height={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount badge - positioned on top of both curves */}
            <div
                className="absolute top-[6px] right-[6px] flex items-center justify-center w-[50px] h-[50px] rounded-full text-white text-sm font-semibold z-10"
                style={{ backgroundColor: COLORS.primary }}
            >
                -{device.discountPercent}%
            </div>
        </div>
    );
}
