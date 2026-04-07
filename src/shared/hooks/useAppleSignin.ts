import { useEffect } from "react";
import { appleSignin } from "@/features/auth/services/auth.api";
import { setTokens } from "@/shared/lib/tokenManager";
import { useRouter, usePathname } from "next/navigation";

interface AppleIDAuthResponse {
  authorization: {
    code: string;
    id_token: string;
  };
  user?: {
    name?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
  };
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: {
          clientId: string | undefined;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<AppleIDAuthResponse>;
      };
    };
  }
}

export const useAppleSignin = () => {
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";

  useEffect(() => {
    // We can initialize it here if we have the config, but it's better to do it on demand or in layout.
    // However, the JS library needs to be loaded first.
  }, []);

  const handleAppleSignin = async () => {
    if (!window.AppleID) {
      throw new Error("Apple Sign In is currently unavailable. Please try again in a few seconds.");
    }

    try {
      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || window.location.origin,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      
      const { authorization, user } = response;
      
      const payload = {
        code: authorization.code,
        firstName: user?.name?.firstName,
        lastName: user?.name?.lastName,
      };

      const res = await appleSignin(payload);

      if (res.success && res.data) {
        setTokens(res.data.accessToken, res.data.expiresIn);
        router.push(`/${lang}`);
      } else {
        throw new Error(res.message || "Apple Sign In failed");
      }
    } catch (error: unknown) {
      console.error("Apple Sign In Error:", error);
      throw error;
    }
  };

  return { handleAppleSignin };
};
