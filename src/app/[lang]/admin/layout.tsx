'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    label: 'Courier Map',
    href: (lang: string) => `/${lang}/admin/couriers/map`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        className="w-5 h-5">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as string) ?? 'en';

  return (
    <div className="flex fixed inset-0 overflow-hidden bg-gray-50 z-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#1e1535] text-white flex flex-col">
        {/* Logo / brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-[#402F75] flex items-center justify-center text-xs font-bold">B</div>
          <span className="text-sm font-semibold tracking-wide">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const href = item.href(lang);
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#402F75] text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer hint */}
        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/30">
          Buyology · Admin
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
