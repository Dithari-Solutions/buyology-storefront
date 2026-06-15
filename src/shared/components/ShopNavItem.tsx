'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AllCategory } from '@/features/product/services/productService';

const svgProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICON_KEYS = ["laptop", "phone", "tablet", "watch", "audio", "gaming", "camera", "tv", "accessories", "grid"];

function glyph(key: string) {
  switch (key) {
    case "laptop": return (<svg {...svgProps}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></svg>);
    case "phone": return (<svg {...svgProps}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>);
    case "tablet": return (<svg {...svgProps}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M11 18h2" /></svg>);
    case "watch": return (<svg {...svgProps}><circle cx="12" cy="12" r="6" /><path d="M9 2h6M9 22h6" /></svg>);
    case "audio": return (<svg {...svgProps}><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><rect x="3" y="14" width="4" height="6" rx="1" /><rect x="17" y="14" width="4" height="6" rx="1" /></svg>);
    case "gaming": return (<svg {...svgProps}><rect x="2" y="7" width="20" height="10" rx="5" /><path d="M7 12h2M8 11v2M15 11h.01M18 13h.01" /></svg>);
    case "camera": return (<svg {...svgProps}><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="3.5" /><path d="M8 6l1.5-2h5L16 6" /></svg>);
    case "tv": return (<svg {...svgProps}><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>);
    case "accessories": return (<svg {...svgProps}><path d="M4 7h16M4 12h16M4 17h10" /></svg>);
    default: return (<svg {...svgProps}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
  }
}

/** Map a category name to an icon key when no icon was assigned in the dashboard. */
function keyFromName(name: string): string {
  const n = name.toLowerCase();
  if (/(laptop|notebook|macbook)/.test(n)) return "laptop";
  if (/(phone|mobile|smartphone|iphone)/.test(n)) return "phone";
  if (/(tablet|ipad)/.test(n)) return "tablet";
  if (/(watch|wearable)/.test(n)) return "watch";
  if (/(head|audio|sound|speaker|earbud|airpod)/.test(n)) return "audio";
  if (/(game|gaming|console|playstation|xbox)/.test(n)) return "gaming";
  if (/(camera|photo)/.test(n)) return "camera";
  if (/(tv|monitor|display|screen)/.test(n)) return "tv";
  if (/(accessor|cable|charger|gadget)/.test(n)) return "accessories";
  return "grid";
}

/** Prefer the admin-assigned icon key; fall back to a name-keyword match, then a generic grid. */
export function CategoryIcon({ icon, name }: { icon?: string | null; name: string }) {
  const key = icon && ICON_KEYS.includes(icon) ? icon : keyFromName(name);
  return glyph(key);
}

/**
 * Desktop "Shop" nav item with a hover mega-dropdown that lists ALL categories
 * (icon + single-line name). Clicking a category opens its products on the shop page.
 */
export default function ShopNavItem({
  lang,
  label,
  href,
  shopSlug,
  categories,
}: {
  lang: string;
  label: string;
  href: string;
  shopSlug: string;
  categories: AllCategory[];
}) {
  const [open, setOpen] = useState(false);
  const roots = categories.filter(
    (c) => !c.parentId && (c.status ? c.status.toUpperCase() === 'ACTIVE' : true)
  );

  const catHref = (c: AllCategory) =>
    `/${lang}/${shopSlug}?categoryId=${c.id}&categoryName=${encodeURIComponent(c.name)}`;

  return (
    <li className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href={href}
        className="flex items-center gap-1 text-white/80 hover:text-white text-[14px] font-medium px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
      >
        {label}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Link>

      {open && roots.length > 0 && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="w-[260px] max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_12px_40px_rgba(64,47,117,0.18)]">
            {roots.map((c) => (
              <Link
                key={c.id}
                href={catHref(c)}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-gray-700 hover:bg-[#402F75]/5 hover:text-[#402F75] transition-colors"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#402F75]/[0.08] text-[#402F75]">
                  <CategoryIcon icon={c.icon} name={c.name} />
                </span>
                <span className="truncate font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
