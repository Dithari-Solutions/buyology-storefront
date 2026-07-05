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

export interface B2bActiveCountry {
  id: string;
  code: string;
  name: string;
  currency: string;
  b2bEnabled: boolean;
}

export async function getB2bActiveCountries(): Promise<B2bActiveCountry[]> {
  const { data } = await apiClient.get<{ data: B2bActiveCountry[] }>(
    "/api/countries/b2b-active"
  );
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
