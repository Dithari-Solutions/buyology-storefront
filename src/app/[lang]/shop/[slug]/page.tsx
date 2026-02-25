import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ProductDetailImage from "@/features/product/components/ProductDetailImage";
import ProductInfo from "@/features/product/components/ProductInfo";
import ProductVariants from "@/features/product/components/ProductVariants";
import ProductFeaturesBadges from "@/features/product/components/ProductFeaturesBadges";
import ProductActions from "@/features/product/components/ProductActions";
import ProductSpecs from "@/features/product/components/ProductSpecs";
import ProductReviews from "@/features/product/components/ProductReviews";
import { MOCK_PRODUCT, MOCK_REVIEWS } from "@/features/product/constant";
import MacBookPro1 from "@/assets/products/macpro14/1.png";
import MacBookPro2 from "@/assets/products/macpro14/2.png";
import MacBookPro3 from "@/assets/products/macpro14/3.png";

// Static image assets for the current mock product
// TODO: replace with product.imageUrls once the API is wired up
const PRODUCT_IMAGES = [MacBookPro1, MacBookPro2, MacBookPro3];

type PageProps = {
    params: Promise<{ lang: string; slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
    // TODO: const { slug } = await params;
    // TODO: const [product, reviews] = await Promise.all([getProductBySlug(slug), getReviews(slug)]);
    await params;
    const product = MOCK_PRODUCT;
    const reviews = MOCK_REVIEWS;

    return (
        <>
            <Header />
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
                        {/* Left — image gallery */}
                        <ProductDetailImage images={PRODUCT_IMAGES} />

                        {/* Right — product details */}
                        <div className="flex flex-col gap-6">
                            <ProductInfo product={product} />

                            <ProductVariants
                                colors={product.colors}
                                storageOptions={product.storageOptions}
                            />

                            <hr className="border-gray-100" />

                            <ProductFeaturesBadges />

                            <hr className="border-gray-100" />

                            <ProductActions />
                        </div>
                    </div>

                    {/* ── Technical specs + key features ── */}
                    <div className="mt-12 border-t border-gray-200 pt-10">
                        <ProductSpecs
                            specs={product.specs}
                            keyFeatures={product.keyFeatures}
                        />
                    </div>

                    {/* ── Customer reviews & questions ── */}
                    <div className="mt-10 pb-10">
                        <ProductReviews reviews={reviews} />
                    </div>

                </div>
            </main>
            <Footer />
        </>
    );
}
