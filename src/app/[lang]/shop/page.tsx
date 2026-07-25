import { Suspense } from 'react';
import Footer from '@/shared/components/Footer';
import Header from '@/shared/components/Header';
import ShopBrowser from '@/features/product/components/ShopBrowser';

// The browsing UI itself lives in ShopBrowser so /shop and the readable
// /shop/category/[slug] route can share it.
export default function ShopPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <ShopBrowser />
      </Suspense>
      <Footer />
    </>
  );
}
