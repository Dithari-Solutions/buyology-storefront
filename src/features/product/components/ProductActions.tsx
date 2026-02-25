"use client";

export default function ProductActions() {
    const handleAddToCart = () => {
        // TODO: dispatch addToCart action
    };

    const handleBuyNow = () => {
        // TODO: navigate to checkout with product
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={handleAddToCart}
                className="flex-1 py-4 rounded-full border-2 border-[#FBBB14] bg-white text-gray-900 font-bold text-sm hover:bg-yellow-50 transition-colors"
            >
                Add to Cart
            </button>
            <button
                onClick={handleBuyNow}
                className="flex-1 py-4 rounded-full bg-[#FBBB14] text-gray-900 font-bold text-sm hover:brightness-95 transition-all"
            >
                Buy Now
            </button>
        </div>
    );
}
