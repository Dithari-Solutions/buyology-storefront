import { apiClient } from "@/shared/lib/apiClient";
import type { UserProfile, Address, CreateAddressPayload, UpdateProfilePayload } from "../types";

function unwrap<T>(res: { data: { data: T } }): T {
    return res.data.data;
}

export async function getProfile(userId: string): Promise<UserProfile> {
    return unwrap(await apiClient.get(`/api/users/${userId}/profile`));
}

export async function updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserProfile> {
    return unwrap(await apiClient.patch(`/api/users/${userId}/profile`, payload));
}

export async function uploadAvatar(userId: string, file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("avatar", file);
    return unwrap(
        await apiClient.patch(`/api/users/${userId}/profile/avatar`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
    );
}

export async function getAddresses(userId: string): Promise<Address[]> {
    return unwrap(await apiClient.get(`/api/users/${userId}/addresses`));
}

export async function createAddress(userId: string, payload: CreateAddressPayload): Promise<Address> {
    return unwrap(await apiClient.post(`/api/users/${userId}/addresses`, payload));
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    return unwrap(await apiClient.patch(`/api/users/${userId}/addresses/${addressId}/default`));
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
    await apiClient.delete(`/api/users/${userId}/addresses/${addressId}`);
}
