import { apiClient } from "@/shared/lib/apiClient";

export interface Country {
  id: string;
  code: string;
  name: string;
  currency: string;
  isActive: boolean;
}

export async function getActiveCountries(): Promise<Country[]> {
  const { data } = await apiClient.get<{ data: Country[] }>("/api/countries/active");
  return data.data;
}

export async function updateCountryPreference(
  userId: string,
  countryCode: string,
  currency?: string
): Promise<void> {
  const params: Record<string, string> = { countryCode };
  if (currency) params.currency = currency;
  await apiClient.patch(
    `/api/users/${userId}/profile/country-preference`,
    null,
    { params }
  );
}
