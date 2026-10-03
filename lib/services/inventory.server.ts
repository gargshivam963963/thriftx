import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const CHECKOUT_RESERVATION_TTL_MS = 20 * 60 * 1000;

export class InventoryUnavailableError extends Error {
  constructor() {
    super("One or more items in your cart are no longer available.");
    this.name = "InventoryUnavailableError";
  }
}

export class InventoryReservationSchemaError extends Error {
  constructor() {
    super(
      "Online payment is temporarily unavailable. Please use Cash on Delivery or contact support.",
    );
    this.name = "InventoryReservationSchemaError";
  }
}

let reservationSchemaCheck: Promise<boolean> | null = null;

async function hasInventoryReservationSchema(): Promise<boolean> {
  if (!prisma) throw new Error("Database is not configured");
  reservationSchemaCheck ??= prisma
    .$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Product'
        AND column_name IN (
          'reservedBy',
          'reservationId',
          'reservationExpiresAt'
        )
    `
    .then(([row]) => row?.count === 3)
    .catch((error: unknown) => {
      reservationSchemaCheck = null;
      throw error;
    });

  return reservationSchemaCheck;
}

function isMissingReservationColumn(error: unknown): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    error.code !== "P2022" ||
    !("meta" in error) ||
    typeof error.meta !== "object" ||
    error.meta === null
  ) {
    return false;
  }

  const meta = error.meta;
  const driverError =
    "driverAdapterError" in meta &&
    typeof meta.driverAdapterError === "object" &&
    meta.driverAdapterError !== null
      ? meta.driverAdapterError
      : null;
  const cause =
    driverError &&
    "cause" in driverError &&
    typeof driverError.cause === "object" &&
    driverError.cause !== null
      ? driverError.cause
      : null;
  const column =
    (cause && "column" in cause && typeof cause.column === "string"
      ? cause.column
      : "") ||
    ("column" in meta && typeof meta.column === "string" ? meta.column : "");

  return (
    column.includes("reservedBy") ||
    column.includes("reservationId") ||
    column.includes("reservationExpiresAt")
  );
}

function uniqueProductIds(productIds: string[]): string[] {
  const ids = [...new Set(productIds)];
  if (
    ids.length === 0 ||
    ids.length !== productIds.length ||
    ids.some((id) => !id.trim())
  ) {
    throw new InventoryUnavailableError();
  }
  return ids;
}

export async function assertCheckoutInventoryAvailable(
  userId: string,
  productIds: string[],
): Promise<void> {
  if (!prisma) throw new Error("Database is not configured");
  const ids = uniqueProductIds(productIds);
  if (!(await hasInventoryReservationSchema())) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        status: "active",
      },
      select: { id: true },
    });
    if (products.length !== ids.length) {
      throw new InventoryUnavailableError();
    }
    return;
  }

  let products: {
    id: string;
    reservedBy: string | null;
    reservationExpiresAt: Date | null;
  }[];
  try {
    products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        status: "active",
      },
      select: {
        id: true,
        reservedBy: true,
        reservationExpiresAt: true,
      },
    });
  } catch (error) {
    if (!isMissingReservationColumn(error)) throw error;

    const legacyProducts = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        status: "active",
      },
      select: { id: true },
    });
    if (legacyProducts.length !== ids.length) {
      throw new InventoryUnavailableError();
    }
    return;
  }
  const now = new Date();

  if (
    products.length !== ids.length ||
    products.some(
      (product) =>
        product.reservationExpiresAt &&
        product.reservationExpiresAt > now &&
        product.reservedBy !== userId,
    )
  ) {
    throw new InventoryUnavailableError();
  }
}

export async function reserveCheckoutInventory(
  userId: string,
  productIds: string[],
  reservationId: string,
): Promise<void> {
  if (!prisma) throw new Error("Database is not configured");
  if (!(await hasInventoryReservationSchema())) {
    throw new InventoryReservationSchemaError();
  }
  const ids = uniqueProductIds(productIds);
  const now = new Date();
  const reservationExpiresAt = new Date(
    now.getTime() + CHECKOUT_RESERVATION_TTL_MS,
  );

  try {
    await prisma.$transaction(async (transaction) => {
      const reserved = await transaction.product.updateMany({
        where: {
          id: { in: ids },
          isActive: true,
          status: "active",
          OR: [
            { reservationExpiresAt: null },
            { reservationExpiresAt: { lte: now } },
          ],
        },
        data: {
          reservedBy: userId,
          reservationId,
          reservationExpiresAt,
        },
      });
      if (reserved.count !== ids.length) {
        throw new InventoryUnavailableError();
      }
    });
  } catch (error) {
    if (isMissingReservationColumn(error)) {
      throw new InventoryReservationSchemaError();
    }
    throw error;
  }
}

export async function releaseCheckoutInventory(
  userId: string,
  reservationId: string,
): Promise<void> {
  if (!prisma) throw new Error("Database is not configured");
  if (!(await hasInventoryReservationSchema())) {
    throw new InventoryReservationSchemaError();
  }
  await prisma.product.updateMany({
    where: {
      reservedBy: userId,
      reservationId,
      status: "active",
    },
    data: {
      reservedBy: null,
      reservationId: null,
      reservationExpiresAt: null,
    },
  });
}

export async function claimCheckoutInventory(
  transaction: Prisma.TransactionClient,
  userId: string,
  productIds: string[],
  reservationId?: string,
): Promise<void> {
  const ids = uniqueProductIds(productIds);
  const hasReservationSchema = await hasInventoryReservationSchema();
  if (!hasReservationSchema && reservationId) {
    throw new InventoryReservationSchemaError();
  }
  if (!hasReservationSchema) {
    const claimed = await transaction.product.updateMany({
      where: {
        id: { in: ids },
        isActive: true,
        status: "active",
      },
      data: { status: "sold", isActive: false },
    });
    if (claimed.count !== ids.length) {
      throw new InventoryUnavailableError();
    }
    return;
  }

  const now = new Date();
  const reservationFilter = reservationId
    ? {
        reservedBy: userId,
        reservationId,
        reservationExpiresAt: { gt: now },
      }
    : {
        OR: [
          { reservationExpiresAt: null },
          { reservationExpiresAt: { lte: now } },
        ],
      };

  const claimed = await transaction.product.updateMany({
    where: {
      id: { in: ids },
      isActive: true,
      status: "active",
      ...reservationFilter,
    },
    data: {
      status: "sold",
      isActive: false,
      reservedBy: null,
      reservationId: null,
      reservationExpiresAt: null,
    },
  });
  if (claimed.count !== ids.length) {
    throw new InventoryUnavailableError();
  }
}
