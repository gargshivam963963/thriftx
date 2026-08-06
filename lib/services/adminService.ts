import {
  databases,
  account,
  AppwriteQuery,
  AppwriteID,
  APPWRITE_DATABASE_ID,
  APPWRITE_ORDERS_COLLECTION_ID,
  APPWRITE_PRODUCTS_COLLECTION_ID,
  APPWRITE_ADDRESSES_COLLECTION_ID,
  APPWRITE_WISHLIST_COLLECTION_ID,
  APPWRITE_CATEGORIES_COLLECTION_ID,
} from "@/lib/appwrite";
import type { Order } from "@/lib/types/order";

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

// ─── Mock Data Helpers (for demo when Appwrite is not configured) ───────────

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
    // Fetch orders
    const ordersResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ORDERS_COLLECTION_ID,
      [AppwriteQuery.limit(5000)],
    );

    const orders = ordersResponse.documents;

    // Fetch products
    const productsResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      [AppwriteQuery.limit(5000)],
    );

    const products = productsResponse.documents;

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (Number(o.total) || 0),
      0,
    );
    const totalProducts = products.length;
    const activeProducts = products.filter(
      (p: any) => p.isActive === true,
    ).length;
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((o: any) => {
      const status = o.status || "Unknown";
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    return {
      totalUsers: 0, // Appwrite users count not available via client SDK
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
    const ordersResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ORDERS_COLLECTION_ID,
      [AppwriteQuery.limit(5000), AppwriteQuery.orderDesc("$createdAt")],
    );

    const orders = ordersResponse.documents;

    // Daily sales for last 30 days
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyMap.set(key, { revenue: 0, orders: 0 });
    }

    orders.forEach((o: any) => {
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
    orders.forEach((o: any) => {
      let products: any[] = [];
      try {
        products =
          typeof o.products === "string"
            ? JSON.parse(o.products)
            : o.products || [];
      } catch {
        products = [];
      }
      products.forEach((p: any) => {
        const id = p.id || p.productId || "unknown";
        const existing = productSalesMap.get(id) || { count: 0, revenue: 0 };
        existing.count += p.quantity || 1;
        existing.revenue += (p.price || 0) * (p.quantity || 1);
        productSalesMap.set(id, existing);
      });
    });

    // Status distribution
    const statusMap = new Map<string, number>();
    orders.forEach((o: any) => {
      const status = o.status || "Unknown";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    // Category distribution
    const productsResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      [AppwriteQuery.limit(5000)],
    );

    const categoryMap = new Map<string, { count: number; revenue: number }>();
    productsResponse.documents.forEach((p: any) => {
      const cat = p.category || "Uncategorized";
      const existing = categoryMap.get(cat) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += Number(p.price) || 0;
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
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ORDERS_COLLECTION_ID,
      [AppwriteQuery.orderDesc("$createdAt"), AppwriteQuery.limit(5000)],
    );

    return response.documents.map((doc: any) => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      orderId: doc.orderId || doc.$id,
      status: doc.status || "Pending",
      subtotal: Number(doc.subtotal) || 0,
      shipping: Number(doc.shipping) || 0,
      total: Number(doc.total) || 0,
      firstName: doc.firstName || "",
      lastName: doc.lastName || "",
      phone: doc.phone || "",
      address: doc.address || "",
      city: doc.city || "",
      postalCode: doc.postalCode || "",
      country: doc.country || "India",
      paymentMethod: doc.paymentMethod || "cod",
      paymentId: doc.paymentId,
      signature: doc.signature,
      deliveryMethod: doc.deliveryMethod || "courier",
      products: doc.products || "[]",

      // Shipping / fulfillment fields
      shippingProvider: doc.shippingProvider || "",
      shipmentStatus: doc.shipmentStatus || "",
      pickupStatus: doc.pickupStatus || "",
      shipmentId: doc.shipmentId || "",
      trackingNumber: doc.trackingNumber || "",
      awbNumber: doc.awbNumber || "",
      courier: doc.courier || "",
      courierId: doc.courierId || "",
      estimatedDelivery: doc.estimatedDelivery || "",
      labelUrl: doc.labelUrl || "",
      invoiceUrl: doc.invoiceUrl || "",
      trackingUrl: doc.trackingUrl || "",
      pickupId: doc.pickupId || "",
      shippedAt: doc.shippedAt || "",
      deliveredAt: doc.deliveredAt || "",
    }));
  } catch (error) {
    console.error("getAllOrders error:", error);
    return [];
  }
}

export async function getAllProducts(): Promise<any[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      [AppwriteQuery.limit(5000)],
    );

    return response.documents.map((doc: any) => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,

      title: doc.title || "",
      brand: doc.brand || "",
      slug: doc.slug || "",

      category: doc.category || "",
      gender: doc.gender || "Unisex",

      price: Number(doc.price) || 0,
      retailPrice: doc.retailPrice ? Number(doc.retailPrice) : undefined,

      condition: doc.condition || "",

      size: doc.size || "",

      // ✅ ADD THESE
      chest: doc.chest ?? "",
      waist: doc.waist ?? "",
      length: doc.length ?? "",
      inseam: doc.inseam ?? "",

      color: doc.color || "",
      material: doc.material || "",

      description: doc.description || "",
      shippingInfo: doc.shippingInfo ?? "",

      primaryImage: doc.primaryImage || "",
      images: doc.images || [],

      status: doc.status || "active",
      isActive: doc.isActive !== false,
    }));
  } catch (error) {
    console.error("getAllProducts error:", error);
    return [];
  }
}

export async function getCustomers(): Promise<CustomerData[]> {
  try {
    const ordersResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ORDERS_COLLECTION_ID,
      [AppwriteQuery.limit(5000)],
    );

    // Group orders by user
    const userOrdersMap = new Map<string, any[]>();
    ordersResponse.documents.forEach((doc: any) => {
      const userId = doc.userId || doc.email || "unknown";
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
        const sorted = userOrders.sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),
        );
        const firstOrder = sorted[sorted.length - 1];

        return {
          $id: userId,
          name: userOrders[0]?.firstName
            ? `${userOrders[0].firstName} ${userOrders[0].lastName || ""}`
            : "Guest User",
          email: userOrders[0]?.email || "",
          phone: userOrders[0]?.phone || "",
          totalOrders: userOrders.length,
          totalSpent,
          lastOrderDate: sorted[0]?.$createdAt || null,
          joinedAt: firstOrder?.$createdAt || new Date().toISOString(),
          city: userOrders[0]?.city || "Unknown",
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
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ORDERS_COLLECTION_ID,
      documentId,
      { status },
    );
    return true;
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return false;
  }
}

export async function deleteOrder(documentId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_ORDERS_COLLECTION_ID,
      documentId,
    );
    return true;
  } catch (error) {
    console.error("deleteOrder error:", error);
    return false;
  }
}

export async function toggleProductStatus(
  documentId: string,
  isActive: boolean,
): Promise<boolean> {
  try {
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      documentId,
      { isActive },
    );
    return true;
  } catch (error) {
    console.error("toggleProductStatus error:", error);
    return false;
  }
}

export async function deleteProduct(documentId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      documentId,
    );
    return true;
  } catch (error) {
    console.error("deleteProduct error:", error);
    return false;
  }
}

export async function createProduct(
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      AppwriteID.unique(),
      {
        ...data,
        isActive: true,
        status: "active",
      },
    );
    return true;
  } catch (error) {
    console.error("createProduct error:", error);
    return false;
  }
}

export async function updateProduct(
  documentId: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_PRODUCTS_COLLECTION_ID,
      documentId,
      data,
    );
    return true;
  } catch (error) {
    console.error("updateProduct error:", error);
    return false;
  }
}
