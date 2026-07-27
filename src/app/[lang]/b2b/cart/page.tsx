import { redirect } from "next/navigation";

// The B2B cart is unified into the regular cart. For a B2B member, /cart renders the
// B2B RFQ quote cart, so this path just redirects there.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    redirect(`/${lang}/cart`);
}
