// features/auth/login/page.tsx
"use client";

import AuthForm from "@/features/auth/components/AuthForm";

export default function page() {
    return (
        <div className="w-full max-w-md">
            <AuthForm />
        </div>
    );
}
