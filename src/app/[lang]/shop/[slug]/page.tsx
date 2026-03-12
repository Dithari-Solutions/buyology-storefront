import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ProductDetailClient from "@/features/product/components/ProductDetailClient";
import { MOCK_REVIEWS } from "@/features/product/constant";
import { getProductBySlug, getImageUrl } from "@/features/product/services/productService";
import type { Lang } from "@/config/pathSlugs";

type PageProps = {
    params: Promise<{ lang: string; slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
    const { lang, slug } = await params;

    try {
        const product = await getProductBySlug(slug, lang as Lang);
        const images = [...product.media]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((m) => getImageUrl(m.url));

        return (
            <>
                <Header />
                <main className="bg-gray-50 min-h-screen">
                    <ProductDetailClient
                        product={product}
                        images={images}
                        reviews={MOCK_REVIEWS}
                    />
                </main>
                <Footer />
            </>
        );
    } catch {
        return (
            <>
                <Header />
                <main className="bg-gray-50 min-h-screen flex items-center justify-center">
                    <p className="text-gray-500 text-[15px]">Product not found.</p>
                </main>
                <Footer />
            </>
        );
    }
}
