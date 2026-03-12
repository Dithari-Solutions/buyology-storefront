"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductDetailImageProps {
    images: string[];
}

export default function ProductDetailImage({ images }: ProductDetailImageProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () =>
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    const handleNext = () =>
        setActiveIndex((prev) => (prev + 1) % images.length);

    return (
        <div className="flex gap-3 h-full">
            {/* Vertical thumbnail strip */}
            {images.length > 1 && (
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[500px] flex-shrink-0">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`flex-shrink-0 w-[68px] h-[68px] rounded-xl overflow-hidden transition-all duration-200 ${
                                activeIndex === index
                                    ? "ring-2 ring-[#402F75] ring-offset-1 shadow-md"
                                    : "ring-1 ring-gray-200 bg-white hover:ring-gray-400 opacity-70 hover:opacity-100"
                            }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                className="object-contain w-full h-full p-1.5 bg-white"
                                width={68}
                                height={68}
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 rounded-2xl bg-white border border-gray-100 overflow-hidden aspect-square flex items-center justify-center group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="absolute inset-0 flex items-center justify-center p-8"
                    >
                        <Image
                            src={images[activeIndex]}
                            alt={`Product image ${activeIndex + 1}`}
                            className="object-contain max-w-full max-h-full"
                            width={540}
                            height={540}
                            unoptimized
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Image counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={`block rounded-full transition-all duration-200 ${
                                    i === activeIndex
                                        ? "w-5 h-1.5 bg-[#402F75]"
                                        : "w-1.5 h-1.5 bg-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label="Previous image"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label="Next image"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4L10 8L6 12" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
