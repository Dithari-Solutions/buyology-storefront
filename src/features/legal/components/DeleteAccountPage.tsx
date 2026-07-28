import LegalLayout from "./LegalLayout";

export default function DeleteAccountPage() {
    return (
        <LegalLayout title="Delete Your Buyology Account or Data" effectiveDate="28 July, 2026">
            <p><strong>Buyology FZ Trading LLC</strong><br />United Arab Emirates</p>
            <p>This page explains how to request deletion of your <strong>Buyology</strong> account, or of specific personal data without closing your account. It applies to both the Buyology mobile application and the Buyology website.</p>

            <h2>1. Delete Your Account and All Associated Data</h2>
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

            <h2>2. Delete Specific Data Without Closing Your Account</h2>
            <p>If you want to remove certain personal data but keep your Buyology account, you can do so in either of the following ways.</p>
            <h3>Option A &mdash; From the Buyology app</h3>
            <ul>
                <li><strong>Saved delivery addresses</strong> &mdash; go to <strong>Profile &rsaquo; Delivery addresses</strong> and delete any address</li>
                <li><strong>Shopping cart</strong> &mdash; open the <strong>Cart</strong> tab and remove items or clear the cart</li>
                <li><strong>Favourites</strong> &mdash; open the <strong>Favourites</strong> tab and remove any saved product</li>
                <li><strong>Push notifications</strong> &mdash; turn notifications off in <strong>Profile</strong> to stop use of your device notification token</li>
            </ul>
            <h3>Option B &mdash; By email</h3>
            <ul>
                <li>Send an email to <a href="mailto:support@buyology.com">support@buyology.com</a></li>
                <li>Use the subject line <strong>&ldquo;Data deletion request&rdquo;</strong></li>
                <li>Include the email address or phone number registered to your account, and describe which data you would like deleted &mdash; for example your profile photograph, your product reviews and questions, your saved addresses, your chat history with couriers, or your location data</li>
            </ul>
            <p>We may ask you to verify your identity before responding. We aim to respond within 30 days, or sooner where required by law. Your account remains active and you can continue to use Buyology.</p>

            <h2>3. What Happens Next</h2>
            <p>We action verified requests without undue delay, and in any case within 30 days of verification. We will confirm the outcome to you and tell you about any data we are legally required to keep. Orders, deliveries, refunds or payouts that are still in progress will be completed first.</p>

            <h2>4. Data That Is Deleted</h2>
            <p>When an account deletion request is completed, the following data is deleted or irreversibly anonymised. The same categories can also be deleted individually under section 2.</p>
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

            <h2>5. Data That Is Retained, and For How Long</h2>
            <p>Some records must be kept after an account or data deletion request in order to meet legal, tax, accounting and regulatory obligations, to resolve disputes, and to prevent fraud. Where data is retained for these reasons, we restrict its processing to those purposes only and delete it once the applicable period expires.</p>
            <ul>
                <li>Transaction and invoice records &mdash; 7 years</li>
                <li>Seller verification (KYC) documentation, where you sold on the marketplace &mdash; 5 years after the last transaction</li>
                <li>Bank account details used for seller payouts &mdash; 5 years</li>
                <li>Refurbishment, repair and trade-in service records &mdash; 3 years</li>
                <li>Records required to establish, exercise or defend legal claims, or for fraud prevention and platform security &mdash; for as long as the relevant claim or risk remains live</li>
            </ul>

            <h2>6. Contact</h2>
            <p>For any question about deleting your account or your data, contact <a href="mailto:support@buyology.com">support@buyology.com</a>. Further detail on how we handle personal data is set out in our <a href="/en/privacy-policy">Privacy Policy</a>.</p>
        </LegalLayout>
    );
}
