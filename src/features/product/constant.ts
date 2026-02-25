import { Product, Review } from "./types";

// Temporary mock — replace with API calls once the product service is ready

export const MOCK_PRODUCT: Product = {
    id: "macbook-pro-14",
    slugs: {
        en: "macbook-pro-14",
        az: "macbook-pro-14",
        ar: "macbook-pro-14",
    },
    title: "MacBook Pro 14",
    rating: 4.8,
    reviewCount: 384,
    inStock: true,
    stockCount: 12,
    price: 2499,
    originalPrice: 2799,
    discountPercent: 11,
    description:
        "Experience groundbreaking performance with the new MacBook Pro 14, powered by the revolutionary M4 chip. Featuring a stunning Liquid Retina XDR display, up to 22 hours of battery life, and an advanced thermal design. Perfect for professionals, creators, and power users.",
    colors: [
        { label: "Space Gray", value: "space-gray" },
        { label: "Silver", value: "silver" },
        { label: "Midnight", value: "midnight" },
    ],
    storageOptions: [
        { label: "256GB", value: "256gb" },
        { label: "512GB", value: "512gb" },
        { label: "1TB", value: "1tb" },
        { label: "2TB", value: "2tb" },
    ],
    specs: [
        { label: "Processor", value: "Apple M4 Chip", iconKey: "processor" },
        { label: "Display", value: '14.2" Liquid Retina XDR', iconKey: "display" },
        { label: "RAM", value: "16GB Unified Memory", iconKey: "ram" },
        { label: "Battery", value: "Up to 22 hours", iconKey: "battery" },
        { label: "GPU", value: "10-core GPU", iconKey: "gpu" },
        { label: "Connectivity", value: "Wi-Fi 6E, Bluetooth 5.3", iconKey: "connectivity" },
    ],
    keyFeatures: [
        "Three Thunderbolt 4 ports, HDMI port, SDXC card slot",
        "Six-speaker sound system with force-cancelling woofers",
        "Magic Keyboard with Touch ID for secure unlock and payments",
        "1080p FaceTime HD camera with advanced image signal processor",
        "Studio-quality three-mic array with high signal-to-noise ratio",
        "macOS Sonoma with advanced productivity and creativity features",
    ],
};

export const MOCK_REVIEWS: Review[] = [
    {
        id: "1",
        author: "Sarah Johnson",
        content:
            "Absolutely love this MacBook! The M4 chip is incredibly fast and the battery life is outstanding. Perfect for my video editing work.",
        timeAgo: "2 days ago",
        likes: 24,
        replies: [
            {
                id: "1-1",
                author: "Mike Chen",
                content: "Totally agree! What video editing software are you using?",
                timeAgo: "1 day ago",
                likes: 3,
            },
        ],
    },
    {
        id: "2",
        author: "Alex Martinez",
        content:
            "Great product! Shipping was fast and the packaging was excellent. The display quality is stunning.",
        timeAgo: "2 days ago",
        likes: 24,
    },
];
