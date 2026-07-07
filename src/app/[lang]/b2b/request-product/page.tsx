'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import B2BProductRequestForm from '@/features/b2b/components/B2BProductRequestForm';
import Footer from '@/shared/components/Footer';
import Header from '@/shared/components/Header';
import { useB2bMembership } from '@/features/b2b/hooks/useB2bMembership';
import { PATH_SLUGS, type Lang } from '@/config/pathSlugs';

// Dedicated "Request a product" page. The B2B products page links here via a CTA
// button; the form itself adapts to the visitor (guest → log in, non-member →
// apply, active member → submit).
function B2BRequestProductContent() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const b2bSlug = PATH_SLUGS.b2b[lang] ?? 'b2b';
  const { t } = useTranslation('b2b');
  const { isActiveMember, loading: membershipLoading } = useB2bMembership();

  return (
    <main className="w-[90%] max-w-[720px] mx-auto py-[40px]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          href={`/${lang}/${b2bSlug}/products`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#402F75] hover:underline"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t('productRequest.backToProducts', { defaultValue: 'Back to products' })}
        </Link>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#402F75]/8 px-3 py-[5px] rounded-full">
          {t('badge', { defaultValue: 'B2B Wholesale' })}
        </span>
      </div>

      <B2BProductRequestForm
        isActiveMember={isActiveMember}
        membershipLoading={membershipLoading}
        lang={lang}
      />
    </main>
  );
}

export default function B2BRequestProductPage() {
  return (
    <>
      <Header />
      <B2BRequestProductContent />
      <Footer />
    </>
  );
}
