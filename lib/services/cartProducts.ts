import { getCartItems } from "./cart";
import { getProductById, Product } from "./products";

export interface CartProduct extends Product {
  cartId: string;
  quantity: number;
}

export async function getCartProducts(): Promise<CartProduct[]> {
  const cartItems = await getCartItems();

  if (!cartItems.length) {
    return [];
  }

  const products = await Promise.all(
    cartItems.map(async (item) => {
      const product = await getProductById(item.productId);

      if (!product) {
        return null;
      }

      return {
        ...product,
        cartId: item.id,
        quantity: item.quantity,
      } satisfies CartProduct;
    }),
  );

  return products.filter((product): product is CartProduct => product !== null);
}
