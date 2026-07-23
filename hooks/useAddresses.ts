"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/lib/types/address";

import { createAddress } from "@/lib/services/address/create";
import { deleteAddress } from "@/lib/services/address/delete";
import { getAddresses } from "@/lib/services/address/get";
import { setDefaultAddress } from "@/lib/services/address/setDefault";
import { updateAddress } from "@/lib/services/address/update";

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

      const data = await getAddresses(userId);

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
    const address = await createAddress({
      userId,
      data,
    });

    await fetchAddresses();

    return address;
  };

  const updateExistingAddress = async (
    addressId: string,
    data: UpdateAddressPayload,
  ) => {
    await updateAddress({
      addressId,
      data,
    });

    await fetchAddresses();
  };

  const deleteExistingAddress = async (addressId: string) => {
    await deleteAddress(addressId);

    await fetchAddresses();
  };

  const setDefault = async (addressId: string) => {
    await setDefaultAddress({
      userId,
      addressId,
    });

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
