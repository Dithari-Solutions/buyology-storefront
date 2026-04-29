import { apiClient } from "@/shared/lib/apiClient";

export interface Step1Payload {
  fullName: string;
  businessName?: string;
  sellerType: string;
  country?: string;
  city?: string;
  email: string;
  phoneNumber?: string;
  preferredContact?: "WHATSAPP" | "EMAIL" | "PHONE_CALL" | null;
}

export interface Step2Payload {
  applicationId: string;
  productCategories: string[];
  mainBrands?: string;
  productCondition?: string;
  initialListingRange?: string;
}

export interface Step3Payload {
  applicationId: string;
  sellsElsewhere?: string[];
  canProvideImages?: string;
  avgDispatchTime?: string;
  handlesReturns?: string;
  hasTradeLicense?: string;
  websiteOrSocialLink?: string;
  tradeLicense?: File | null;
}

export interface SubmitPayload {
  applicationId: string;
  whyBuyology?: string;
  declarationAccepted: boolean;
}

export const supplierApi = {
  initiateApplication: (data: Step1Payload) =>
    apiClient.post("/api/supplier/apply/step-1", data),

  verifyOtp: (applicationId: string, otpCode: string) =>
    apiClient.post("/api/supplier/apply/verify-otp", { applicationId, otpCode }),

  resendOtp: (applicationId: string) =>
    apiClient.post("/api/supplier/apply/resend-otp", { applicationId }),

  saveStep2: (data: Step2Payload) =>
    apiClient.post("/api/supplier/apply/step-2", data),

  saveStep3: (data: Step3Payload) => {
    const form = new FormData();
    form.append("applicationId", data.applicationId);
    if (data.sellsElsewhere?.length) {
      data.sellsElsewhere.forEach((v) => form.append("sellsElsewhere", v));
    }
    if (data.canProvideImages) form.append("canProvideImages", data.canProvideImages);
    if (data.avgDispatchTime) form.append("avgDispatchTime", data.avgDispatchTime);
    if (data.handlesReturns) form.append("handlesReturns", data.handlesReturns);
    if (data.hasTradeLicense) form.append("hasTradeLicense", data.hasTradeLicense);
    if (data.websiteOrSocialLink) form.append("websiteOrSocialLink", data.websiteOrSocialLink);
    if (data.tradeLicense) form.append("tradeLicense", data.tradeLicense);
    return apiClient.post("/api/supplier/apply/step-3", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  submit: (data: SubmitPayload) =>
    apiClient.post("/api/supplier/apply/submit", data),
};
