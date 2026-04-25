import type { CartItem } from './cart';
import { getCartTotal } from './cart';

export type ShippingMethod = 'standard' | 'express';

export type CheckoutQuote = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promoApplied: boolean;
};

export const DEMO_PROMO_CODE = 'COLOR10';

const TAX_RATE = 0.0825;

export const calculateCheckoutQuote = (
  items: CartItem[],
  promoCode = '',
  shippingMethod: ShippingMethod = 'standard'
): CheckoutQuote => {
  const subtotal = getCartTotal(items);
  const promoApplied = promoCode.trim().toUpperCase() === DEMO_PROMO_CODE;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const discountedSubtotal = Math.max(subtotal - discount, 0);
  const shipping = shippingMethod === 'express'
    ? 14.95
    : discountedSubtotal >= 50 || discountedSubtotal === 0
      ? 0
      : 6.95;
  const tax = discountedSubtotal * TAX_RATE;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: discountedSubtotal + shipping + tax,
    promoApplied
  };
};

export const formatMoney = (value: number) => `$${value.toFixed(2)}`;
