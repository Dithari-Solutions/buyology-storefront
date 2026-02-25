import { Product } from "../types";

function StarRating({ rating }: { rating: number }) {
    const full = Math.floor(rating);
    const empty = 5 - Math.ceil(rating);
    const hasHalf = rating % 1 !== 0;

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: full }).map((_, i) => (
                <svg key={`full-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#FBBB14">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
            {hasHalf && (
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <defs>
                        <linearGradient id="half">
                            <stop offset="50%" stopColor="#FBBB14" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="url(#half)"
                        stroke="#FBBB14"
                        strokeWidth="1.5"
                    />
                </svg>
            )}
            {Array.from({ length: empty }).map((_, i) => (
                <svg key={`empty-${i}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Title + action icons */}
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    <button
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Share product"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </button>
                    <button
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="Add to wishlist"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="font-semibold text-sm text-gray-800">{product.rating}</span>
                <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-gray-500 text-sm">
                    In Stock &bull; {product.stockCount} units available
                </span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-3 mt-1">
                <span className="text-[32px] font-bold text-gray-900 leading-none">
                    ${product.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{product.discountPercent}%
                </span>
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
        </div>
    );
}
