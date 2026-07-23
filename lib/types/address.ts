export type AddressType = "Home" | "Work" | "Other";

export interface Address {
  $id: string;
  $createdAt: string;
  $updatedAt: string;

  userId: string;

  fullName: string;
  phone: string;
  alternatePhone?: string;

  addressLine1: string;
  addressLine2?: string;
  landmark?: string;

  city: string;
  state: string;
  pincode: string;

  type: AddressType;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  alternatePhone?: string;

  addressLine1: string;
  addressLine2?: string;
  landmark?: string;

  city: string;
  state: string;
  pincode: string;

  type: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {}
