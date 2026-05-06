import { apiClient } from "@/shared/lib/apiClient";

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface SetupTokenInfo {
  valid: boolean;
  memberEmail: string;
  companyName: string;
  memberName: string;
}

export interface SetPasswordResult {
  accessToken: string;
  expiresIn: number;
}

export const b2bSetupApi = {
  async validateToken(token: string): Promise<SetupTokenInfo> {
    const res = await apiClient.get<ApiResponse<SetupTokenInfo>>(
      `/api/membership/auth/validate-token`,
      { params: { token } },
    );
    return res.data.data;
  },

  async setPassword(payload: {
    token: string;
    password: string;
    confirmedPassword: string;
  }): Promise<SetPasswordResult> {
    const res = await apiClient.post<ApiResponse<SetPasswordResult>>(
      `/api/membership/auth/set-password`,
      payload,
    );
    return res.data.data;
  },
};
