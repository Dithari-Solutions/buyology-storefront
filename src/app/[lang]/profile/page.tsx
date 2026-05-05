import ProfilePage from "@/features/profile/components/ProfilePage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("profile", {
    canonical: "profile",
    noindex: true,
});

export default function ProfileRoute() {
    return <ProfilePage />;
}
