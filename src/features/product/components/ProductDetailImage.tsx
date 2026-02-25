"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";

interface ProductDetailImageProps {
    images: StaticImageData[];
}

export default function ProductDetailImage({ images }: ProductDetailImageProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () =>
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    const handleNext = () =>
        setActiveIndex((prev) => (prev + 1) % images.length);

    return (
        <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative w-full rounded-2xl border border-gray-200 bg-white overflow-hidden aspect-[4/3] flex items-center justify-center">
                <Image
                    src={images[activeIndex]}
                    alt={`Product image ${activeIndex + 1}`}
                    className="object-contain p-6 w-full h-full"
                />
            </div>

            {/* Thumbnails with prev/next arrows */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handlePrev}
                    className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Previous image"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="flex gap-3 flex-1 justify-center overflow-hidden">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`flex-shrink-0 w-[120px] h-[80px] rounded-xl border-2 bg-white overflow-hidden transition-colors ${
                                activeIndex === index
                                    ? "border-gray-800"
                                    : "border-gray-200 hover:border-gray-400"
                            }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                className="object-contain w-full h-full p-2"
                            />
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Next image"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L10 8L6 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
