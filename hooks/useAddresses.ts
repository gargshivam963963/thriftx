"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/lib/types/address";

async function addressRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    address?: T;
    addresses?: T;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Address request failed");
  }

  return (result.address ?? result.addresses) as T;
}

const addressRequests = new Map<string, Promise<Address[]>>();

function getAddressesForUser(userId: string): Promise<Address[]> {
  const existingRequest = addressRequests.get(userId);
  if (existingRequest) return existingRequest;

  const request = addressRequest<Address[]>("/api/addresses", {
    method: "GET",
  });

  addressRequests.set(userId, request);
  return request.finally(() => {
    if (addressRequests.get(userId) === request) {
      addressRequests.delete(userId);
    }
  });
}

interface UseAddressesReturn {
  addresses: Address[];
  loading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;

  createNewAddress: (data: CreateAddressPayload) => Promise<Address>;

  updateExistingAddress: (
    addressId: string,
    data: UpdateAddressPayload,
  ) => Promise<void>;

  deleteExistingAddress: (addressId: string) => Promise<void>;

  setDefault: (addressId: string) => Promise<void>;
}

export function useAddresses(userId: string): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getAddressesForUser(userId);

      setAddresses(data);
    } catch (err) {
      console.error(err);

      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createNewAddress = async (
    data: CreateAddressPayload,
  ): Promise<Address> => {
    const address = await addressRequest<Address>("/api/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });

    await fetchAddresses();

    return address;
  };

  const updateExistingAddress = async (
    addressId: string,
    data: UpdateAddressPayload,
  ) => {
    await addressRequest<void>(
      `/api/addresses/${encodeURIComponent(addressId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );

    await fetchAddresses();
  };

  const deleteExistingAddress = async (addressId: string) => {
    await addressRequest<void>(
      `/api/addresses/${encodeURIComponent(addressId)}`,
      {
        method: "DELETE",
      },
    );

    await fetchAddresses();
  };

  const setDefault = async (addressId: string) => {
    await addressRequest<void>(
      `/api/addresses/${encodeURIComponent(addressId)}/default`,
      { method: "POST" },
    );

    await fetchAddresses();
  };

  return {
    addresses,
    loading,
    error,

    fetchAddresses,

    createNewAddress,

    updateExistingAddress,

    deleteExistingAddress,

    setDefault,
  };
}
