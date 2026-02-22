import ProductCard from '@/features/product/components/ProductCard'
import Footer from '@/shared/components/Footer'
import Header from '@/shared/components/Header'
import React from 'react'

export default function page() {
  return (
    <>
    <Header />
    <main>
        <ProductCard />
    </main>
    <Footer />
    </>
  )
}
