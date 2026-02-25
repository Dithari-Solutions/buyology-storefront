"use client";

import { useState } from "react";
import { ProductColor, ProductStorage } from "../types";

interface ProductVariantsProps {
    colors: ProductColor[];
    storageOptions: ProductStorage[];
}

export default function ProductVariants({ colors, storageOptions }: ProductVariantsProps) {
    const [selectedColor, setSelectedColor] = useState(colors[0]?.value ?? "");
    const [selectedStorage, setSelectedStorage] = useState(storageOptions[0]?.value ?? "");

    const activeColorLabel = colors.find((c) => c.value === selectedColor)?.label ?? "";
    const activeStorageLabel = storageOptions.find((s) => s.value === selectedStorage)?.label ?? "";

    return (
        <div className="flex flex-col gap-5">
            {/* Color selector */}
            <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-900">
                    Color: <span className="font-semibold">{activeColorLabel}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => setSelectedColor(color.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                                selectedColor === color.value
                                    ? "border-[#402F75] text-[#402F75] bg-purple-50"
                                    : "border-gray-200 text-gray-600 bg-white hover:border-gray-400"
                            }`}
                        >
                            {color.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Storage selector */}
            <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-gray-900">
                    Storage: <span className="font-semibold">{activeStorageLabel}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                    {storageOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedStorage(option.value)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                                selectedStorage === option.value
                                    ? "bg-purple-100 text-[#402F75] border-purple-100"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
