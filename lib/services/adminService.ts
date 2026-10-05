import type { Order } from "@/lib/types/order";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { documentStore, DocumentQuery } from "@/lib/document-store";
import {
  notifyOrderChanges,
  type OrderRef,
} from "@/lib/notifications/orderEvents";
import { updateOrderStatus as serviceUpdateOrderStatus, getOrderById } from "./orderService";
import { restoreOrderInventory } from "./inventory.server";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  averageOrderValue: number;
  conversionRate: number;
  newUsersThisMonth: number;
  ordersByStatus: Record<string, number>;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  primaryImage: string;
  totalSold: number;
  totalRevenue: number;
  category: string;
}

export interface CustomerData {
  $id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  joinedAt: string;
  city: string;
  wishlistCount: number;
}

export interface OrderAnalytics {
  dailySales: SalesDataPoint[];
  weeklySales: SalesDataPoint[];
  monthlySales: SalesDataPoint[];
  topProducts: TopProduct[];
  categoryDistribution: { category: string; count: number; revenue: number }[];
  statusDistribution: { status: string; count: number }[];
}

/** Raw stored-document shape (union of the fields we map below). */
type OrderDocument = Record<string, unknown> & {
  $id: string;
  $createdAt: string;
};
type ProductDocument = Record<string, unknown> & {
  $id: string;
  $createdAt: string;
};

// ─── Mock Data Helpers (for demo when the document store is not configured) ───────────

function generateMockStats(): DashboardStats {
  return {
    totalUsers: 156,
    totalOrders: 342,
    totalRevenue: 489650,
    totalProducts: 89,
    activeProducts: 72,
    totalCategories: 8,
    averageOrderValue: 1432,
    conversionRate: 3.2,
    newUsersThisMonth: 23,
    ordersByStatus: {
      "Pending (COD)": 45,
      Processing: 28,
      Shipped: 34,
      Delivered: 189,
      Cancelled: 46,
    },
  };
}

function generateMockSalesData(): SalesDataPoint[] {
  const data: SalesDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.floor(Math.random() * 50000) + 5000,
      orders: Math.floor(Math.random() * 20) + 3,
    });
  }
  return data;
}

function generateMockTopProducts(): TopProduct[] {
  return [
    {
      id: "1",
      title: "Vintage Levi's Denim Jacket",
      brand: "Levi's",
      price: 2499,
      primaryImage: "",
      totalSold: 34,
      totalRevenue: 84966,
      category: "Jackets",
    },
    {
      id: "2",
      title: "Nike Air Force 1 White",
      brand: "Nike",
      price: 5999,
      primaryImage: "",
      totalSold: 28,
      totalRevenue: 167972,
      category: "Shoes",
    },
    {
      id: "3",
      title: "Adidas Originals Hoodie",
      brand: "Adidas",
      price: 3499,
      primaryImage: "",
      totalSold: 22,
      totalRevenue: 76978,
      category: "Hoodies",
    },
    {
      id: "4",
      title: "Carhartt WIP Cargo Pants",
      brand: "Carhartt",
      price: 4299,
      primaryImage: "",
      totalSold: 19,
      totalRevenue: 81681,
      category: "Cargo",
    },
    {
      id: "5",
      title: "Vintage Band T-Shirt",
      brand: "Various",
      price: 1299,
      primaryImage: "",
      totalSold: 45,
      totalRevenue: 58455,
      category: "T-Shirts",
    },
  ];
}

// ─── Admin Service ────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const ordersResponse = await documentStore.listDocuments(
      "thriftx",
      "orders",
      [DocumentQuery.limit(5000)],
    );

    const orders = ordersResponse.documents as OrderDocument[];

    const products = isDatabaseConfigured
      ? await prisma!.product.findMany({
          select: { isActive: true },
        })
      : [];

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, o) => sum + (Number(o.total) || 0),
      0,
    );
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive === true).length;
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((o) => {
      const status = (o.status as string) || "Unknown";
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    return {
      totalUsers: 0,
      totalOrders,
      totalRevenue,
      totalProducts,
      activeProducts,
      totalCategories: 8,
      averageOrderValue,
      conversionRate: 3.2,
      newUsersThisMonth: 0,
      ordersByStatus,
    };
  } catch (error) {
    console.error("getDashboardStats error, using mock data:", error);
    return generateMockStats();
  }
}

export async function getSalesAnalytics(): Promise<OrderAnalytics> {
  try {
    const ordersResponse = await documentStore.listDocuments(
      "thriftx",
      "orders",
      [DocumentQuery.limit(5000), DocumentQuery.orderDesc("$createdAt")],
    );

    const orders = ordersResponse.documents as OrderDocument[];

    // Daily sales for last 30 days
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyMap.set(key, { revenue: 0, orders: 0 });
    }

    orders.forEach((o) => {
      const date = new Date(o.$createdAt).toISOString().split("T")[0];
      if (dailyMap.has(date)) {
        const existing = dailyMap.get(date)!;
        existing.revenue += Number(o.total) || 0;
        existing.orders += 1;
      }
    });

    const dailySales: SalesDataPoint[] = Array.from(dailyMap.entries()).map(
      ([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }),
    );

    // Top products
    const productSalesMap = new Map<
      string,
      { count: number; revenue: number }
    >();
    orders.forEach((o) => {
      let products: {
        id?: string;
        productId?: string;
        quantity?: number;
        price?: number;
      }[] = [];
      try {
        const raw =
          typeof o.products === "string" ? JSON.parse(o.products) : o.products;
        products = Array.isArray(raw) ? raw : [];
      } catch {
        products = [];
      }
      products.forEach((p) => {
        const id = p.id || p.productId || "unknown";
        const existing = productSalesMap.get(id) || { count: 0, revenue: 0 };
        existing.count += p.quantity || 1;
        existing.revenue += (p.price || 0) * (p.quantity || 1);
        productSalesMap.set(id, existing);
      });
    });

    // Status distribution
    const statusMap = new Map<string, number>();
    orders.forEach((o) => {
      const status = (o.status as string) || "Unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    // Category distribution
    const products = isDatabaseConfigured
      ? await prisma!.product.findMany({
          select: { category: true, price: true },
        })
      : [];

    const categoryMap = new Map<string, { count: number; revenue: number }>();
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      const existing = categoryMap.get(cat) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += p.price || 0;
      categoryMap.set(cat, existing);
    });

    return {
      dailySales,
      weeklySales: dailySales.filter((_, i) => i % 7 === 0),
      monthlySales: [],
      topProducts: [],
      categoryDistribution: Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          count: data.count,
          revenue: data.revenue,
        }),
      ),
      statusDistribution: Array.from(statusMap.entries()).map(
        ([status, count]) => ({ status, count }),
      ),
    };
  } catch (error) {
    console.error("getSalesAnalytics error, using mock data:", error);
    return {
      dailySales: generateMockSalesData(),
      weeklySales: [],
      monthlySales: [],
      topProducts: generateMockTopProducts(),
      categoryDistribution: [
        { category: "T-Shirts", count: 28, revenue: 36372 },
        { category: "Jeans", count: 18, revenue: 44982 },
        { category: "Jackets", count: 12, revenue: 29988 },
        { category: "Hoodies", count: 15, revenue: 52485 },
        { category: "Shirts", count: 10, revenue: 12990 },
        { category: "Cargo", count: 7, revenue: 30093 },
      ],
      statusDistribution: [
        { status: "Pending (COD)", count: 45 },
        { status: "Processing", count: 28 },
        { status: "Shipped", count: 34 },
        { status: "Delivered", count: 189 },
        { status: "Cancelled", count: 46 },
      ],
    };
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await documentStore.listDocuments("thriftx", "orders", [
      DocumentQuery.limit(1000),
      DocumentQuery.orderDesc("$createdAt"),
    ]);

    return response.documents as unknown as Order[];
  } catch (error) {
    console.error("getAllOrders error:", error);
    return [];
  }
}

export async function getCustomers(): Promise<CustomerData[]> {
  try {
    const ordersResponse = await documentStore.listDocuments(
      "thriftx",
      "orders",
      [DocumentQuery.limit(5000)],
    );

    const userOrdersMap = new Map<string, OrderDocument[]>();
    ordersResponse.documents.forEach((doc) => {
      const userId =
        (doc.userId as string) || (doc.email as string) || "unknown";
      if (!userOrdersMap.has(userId)) {
        userOrdersMap.set(userId, []);
      }
      userOrdersMap.get(userId)!.push(doc);
    });

    const customers: CustomerData[] = Array.from(userOrdersMap.entries()).map(
      ([userId, userOrders]) => {
        const totalSpent = userOrders.reduce(
          (sum, o) => sum + (Number(o.total) || 0),
          0,
        );
        const sorted = [...userOrders].sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
        );
        const firstOrder = sorted[sorted.length - 1];

        return {
          $id: userId,
          name: userOrders[0]?.firstName
            ? `${userOrders[0].firstName} ${userOrders[0].lastName || ""}`
            : "Guest User",
          email: (userOrders[0]?.email as string) || "",
          phone: (userOrders[0]?.phone as string) || "",
          totalOrders: userOrders.length,
          totalSpent,
          lastOrderDate: sorted[0]?.$createdAt || null,
          joinedAt: firstOrder?.$createdAt || new Date().toISOString(),
          city: (userOrders[0]?.city as string) || "Unknown",
          wishlistCount: 0,
        };
      },
    );

    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (error) {
    console.error("getCustomers error:", error);
    return [];
  }
}

export async function updateOrderStatus(
  documentId: string,
  status: string,
): Promise<boolean> {
  try {
    const updated = await serviceUpdateOrderStatus(documentId, status);
    return Boolean(updated);
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return false;
  }
}

export async function adminUpdateOrder(
  documentId: string,
  updates: Record<string, unknown>,
): Promise<boolean> {
  try {
    const existing = await getOrderById(documentId);
    if (!existing) return false;

    await documentStore.updateDocument("thriftx", "orders", documentId, updates);

    try {
      await notifyOrderChanges(existing as unknown as OrderRef, updates);
    } catch (notifyError) {
      console.error("Order notification failed:", notifyError);
    }

    // If order was cancelled or return approved/refunded, ensure inventory restored
    if (
      (updates.status === "Cancelled" ||
        updates.returnStatus === "approved" ||
        updates.returnStatus === "item_received" ||
        updates.returnStatus === "refunded") &&
      existing.products
    ) {
      try {
        const items = JSON.parse(existing.products as string);
        if (Array.isArray(items)) {
          const productIds = items
            .map((i: { id?: string }) => i.id)
            .filter((id): id is string => typeof id === "string" && Boolean(id));
          if (productIds.length > 0) {
            await restoreOrderInventory(productIds);
            revalidatePath("/product/[slug]", "page");
            revalidatePath("/shop", "page");
          }
        }
      } catch (e) {
        console.error("Failed to restore inventory on admin order update:", e);
      }
    }

    return true;
  } catch (error) {
    console.error("adminUpdateOrder error:", error);
    return false;
  }
}

export async function deleteOrder(documentId: string): Promise<boolean> {
  try {
    await documentStore.deleteDocument("thriftx", "orders", documentId);
    return true;
  } catch (error) {
    console.error("deleteOrder error:", error);
    return false;
  }
}
