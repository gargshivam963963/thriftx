export interface Order {
    $id: string;
    $createdAt: string;

    orderId: string;
    status: string;
    paymentStatus: "Paid" | "Pending" | "Failed";

    total: number;

    firstName: string;
    lastName: string;
    city: string;

    productImage: string;
    productName: string;
    brand: string;
    size: string;
    color: string;

    quantity: number;
    itemsCount: number;
}