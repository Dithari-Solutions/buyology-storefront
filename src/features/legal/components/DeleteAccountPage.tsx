import LegalLayout from "./LegalLayout";

export default function DeleteAccountPage() {
    return (
        <LegalLayout title="Delete Your Buyology Account" effectiveDate="28 July, 2026">
            <p><strong>Buyology FZ Trading LLC</strong><br />United Arab Emirates</p>
            <p>This page explains how to request deletion of your <strong>Buyology</strong> account and the personal data associated with it, for both the Buyology mobile application and the Buyology website.</p>

            <h2>1. How to Request Deletion</h2>
            <h3>Option A &mdash; From the Buyology app</h3>
            <ul>
                <li>Open the Buyology app and sign in to your account</li>
                <li>Go to the <strong>Profile</strong> tab</li>
                <li>Scroll to the bottom and tap <strong>Delete account</strong></li>
                <li>Confirm when prompted</li>
            </ul>
            <p>Your deletion request is submitted immediately and you will receive confirmation once it has been processed.</p>

            <h3>Option B &mdash; By email</h3>
            <ul>
                <li>Send an email to <a href="mailto:support@buyology.com">support@buyology.com</a></li>
                <li>Use the subject line <strong>&ldquo;Account deletion request&rdquo;</strong></li>
                <li>Include the email address or phone number registered to your Buyology account</li>
            </ul>
            <p>We may ask you to verify your identity before we act on the request, so that we do not delete an account on behalf of someone who does not own it.</p>

            <h2>2. What Happens Next</h2>
            <p>We action verified deletion requests without undue delay, and in any case within 30 days of verification. We will confirm the outcome to you and tell you about any data we are legally required to keep. Orders, deliveries, refunds or payouts that are still in progress will be completed first.</p>

            <h2>3. Data That Is Deleted</h2>
            <p>When your deletion request is completed, the following data is deleted or irreversibly anonymised:</p>
            <ul>
                <li>Account profile &mdash; name, email address, phone number, date of birth and login credentials</li>
                <li>Profile photograph</li>
                <li>Saved delivery and billing addresses</li>
                <li>Shopping cart, favourites and wishlist</li>
                <li>Product reviews, ratings and questions you have posted</li>
                <li>In-app chat messages with delivery couriers</li>
                <li>Location data collected from the app</li>
                <li>Push notification tokens and device identifiers</li>
                <li>Marketing preferences and newsletter subscriptions</li>
            </ul>

            <h2>4. Data That Is Retained, and For How Long</h2>
            <p>Some records must be kept after your account is deleted in order to meet legal, tax, accounting and regulatory obligations, to resolve disputes, and to prevent fraud. Where data is retained for these reasons, we restrict its processing to those purposes only and delete it once the applicable period expires.</p>
            <ul>
                <li>Transaction and invoice records &mdash; 7 years</li>
                <li>Seller verification (KYC) documentation, where you sold on the marketplace &mdash; 5 years after the last transaction</li>
                <li>Bank account details used for seller payouts &mdash; 5 years</li>
                <li>Refurbishment, repair and trade-in service records &mdash; 3 years</li>
                <li>Records required to establish, exercise or defend legal claims, or for fraud prevention and platform security &mdash; for as long as the relevant claim or risk remains live</li>
            </ul>

            <h2>5. Contact</h2>
            <p>For any question about deleting your account or your data, contact <a href="mailto:support@buyology.com">support@buyology.com</a>. Further detail on how we handle personal data is set out in our <a href="/en/privacy-policy">Privacy Policy</a>.</p>
        </LegalLayout>
    );
}
