import { Suspense } from "react";
import B2BSetPasswordForm from "@/features/b2b/account/B2BSetPasswordForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="px-4 py-12 text-center text-sm text-gray-500">Loading…</div>}>
      <B2BSetPasswordForm />
    </Suspense>
  );
}
