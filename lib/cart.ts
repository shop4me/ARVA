/**
 * Cart item shape. Used by CartContext and checkout.
 */

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export const SHIPPING_FREE_THRESHOLD = 0; // Free shipping always
export const SHIPPING_LABEL = "Free";
