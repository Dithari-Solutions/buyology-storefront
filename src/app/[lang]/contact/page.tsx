import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import ContactPage from "@/features/contact/components/ContactPage";
import { makeStaticMetadata } from "@/shared/seo/staticMeta";

export const generateMetadata = makeStaticMetadata("contact", { canonical: "contact" });

export default function Contact() {
    return (
        <>
            <Header />
            <ContactPage />
            <Footer />
        </>
    );
}
