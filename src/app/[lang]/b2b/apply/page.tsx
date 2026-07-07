import { redirect } from "next/navigation";

type PageProps = {
    params: Promise<{ lang: string }>;
};

// The B2B membership application now lives in the sign-up flow (no login required).
// This route is retained only to redirect existing "Apply for B2B membership" links
// and bookmarks to the Business sign-up tab.
export default async function B2BApplyPage({ params }: PageProps) {
    const { lang } = await params;
    redirect(`/${lang}/auth?type=business`);
}
