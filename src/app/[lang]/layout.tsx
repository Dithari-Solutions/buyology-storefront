import LangSync from "@/shared/components/LangSync";
import AuthBgVector from "@/assets/vectors/auth-bg-vector.png";

type Lang = "en" | "az" | "ar";

const validLangs: Lang[] = ["en", "az", "ar"];

export function generateStaticParams() {
  return validLangs.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const resolvedLang: Lang = validLangs.includes(lang as Lang)
    ? (lang as Lang)
    : "en";

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>

      {/* ─── Fixed background accent — covers Header, main and Footer ─── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0" aria-hidden="true">

        {/* Bottom-left accent */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute bottom-0 left-0 w-[320px] sm:w-[440px] md:w-[580px] lg:w-[660px]"
          style={{ opacity: 0.45, mixBlendMode: "multiply" }}
        />

        {/* Top-right accent — mirrored */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute top-0 right-0 w-[320px] sm:w-[440px] md:w-[580px] lg:w-[660px]"
          style={{ opacity: 0.4, mixBlendMode: "multiply", transform: "rotate(180deg)" }}
        />
      </div>

      {/* Page content — stacks above the fixed background */}
      <div className="relative z-10">
        <LangSync lang={resolvedLang} />
        {children}
      </div>
    </div>
  );
}
