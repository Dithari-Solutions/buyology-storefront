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

      {/* ─── Fixed wave background — covers Header, main and Footer ─── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0" aria-hidden="true">

        {/* Soft radial colour washes */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 0% 0%,    rgba(64,47,117,0.06) 0%, transparent 48%),
              radial-gradient(ellipse at 100% 8%,  rgba(251,187,20,0.04) 0%, transparent 42%),
              radial-gradient(ellipse at 50% 52%,  rgba(64,47,117,0.03) 0%, transparent 52%),
              radial-gradient(ellipse at 100% 100%,rgba(251,187,20,0.04) 0%, transparent 44%)
            `,
          }}
        />

        {/* ① Bottom-left — natural orientation */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute bottom-0 left-0 w-[300px] sm:w-[420px] md:w-[580px] lg:w-[680px]"
          style={{ opacity: 0.38, mixBlendMode: "multiply" }}
        />

        {/* ② Top-right — rotated 180° */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute top-0 right-0 w-[300px] sm:w-[420px] md:w-[580px] lg:w-[680px]"
          style={{ opacity: 0.33, mixBlendMode: "multiply", transform: "rotate(180deg)" }}
        />

        {/* ③ Top-left — flipped vertically */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute top-0 left-0 w-[260px] sm:w-[360px] md:w-[480px] lg:w-[560px]"
          style={{ opacity: 0.22, mixBlendMode: "multiply", transform: "scaleY(-1)" }}
        />

        {/* ④ Bottom-right — flipped horizontally */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute bottom-0 right-0 w-[260px] sm:w-[360px] md:w-[480px] lg:w-[560px]"
          style={{ opacity: 0.26, mixBlendMode: "multiply", transform: "scaleX(-1)" }}
        />

        {/* ⑤ Centre-left — rotated 90° vertical accent */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute w-[220px] sm:w-[300px] md:w-[400px]"
          style={{
            opacity: 0.15,
            mixBlendMode: "multiply",
            transform: "rotate(90deg)",
            top: "38%",
            left: "-60px",
          }}
        />

        {/* ⑥ Centre-right — rotated -90° vertical accent */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AuthBgVector.src}
          alt=""
          className="absolute w-[220px] sm:w-[300px] md:w-[400px]"
          style={{
            opacity: 0.15,
            mixBlendMode: "multiply",
            transform: "rotate(-90deg)",
            top: "58%",
            right: "-60px",
          }}
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
