import type {
  CurrencyCode,
  ProductCategory,
  ProductDetail,
  ProductRecommendation
} from '../types/analysis';

export type CartProduct = ProductRecommendation | ProductDetail;

export type CartItem = {
  id: string;
  slug?: string;
  name: string;
  brand?: string;
  category?: ProductCategory;
  shade?: string;
  price: string;
  currency: CurrencyCode;
  image: string;
  description: string;
  quantity: number;
  source: 'recommendation' | 'detail';
  addedAt: string;
  analysisId?: string | null;
  matchReason?: string;
  retailerName?: string;
  purchaseUrl?: string;
};

const CART_STORAGE_KEY = 'shoppingCart';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: unknown, fallback = '') => {
  return typeof value === 'string' ? value : fallback;
};

const normalizeCartItem = (value: unknown): CartItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const name = getString(value.name);
  const price = getString(value.price);
  const image = getString(value.image);

  if (!name || !price || !image) {
    return null;
  }

  const quantity = typeof value.quantity === 'number' && Number.isFinite(value.quantity)
    ? Math.max(1, Math.floor(value.quantity))
    : 1;
  const id = getString(value.id, getString(value.slug, name));
  const source = value.source === 'detail' ? 'detail' : 'recommendation';

  return {
    id,
    slug: getString(value.slug) || undefined,
    name,
    brand: getString(value.brand) || undefined,
    category: getString(value.category) as ProductCategory || undefined,
    shade: getString(value.shade) || undefined,
    price,
    currency: getString(value.currency, 'USD') as CurrencyCode,
    image,
    description: getString(value.description),
    quantity,
    source,
    addedAt: getString(value.addedAt, new Date().toISOString()),
    analysisId: getString(value.analysisId) || null,
    matchReason: getString(value.matchReason) || undefined,
    retailerName: getString(value.retailerName) || undefined,
    purchaseUrl: getString(value.purchaseUrl) || undefined
  };
};

export const readCartItems = (): CartItem[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeCartItem(item))
      .filter((item): item is CartItem => Boolean(item));
  } catch {
    return [];
  }
};

export const writeCartItems = (items: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const clearCartItems = () => {
  writeCartItems([]);
};

const getProductPurchaseUrl = (product: CartProduct) => {
  return 'retailer' in product ? product.retailer.url : product.purchase_url;
};

const getProductRetailerName = (product: CartProduct) => {
  return 'retailer' in product ? product.retailer.name : undefined;
};

const getProductReason = (product: CartProduct) => {
  return 'why_it_matches_you' in product ? product.why_it_matches_you : product.reason;
};

export const createCartItem = (
  product: CartProduct,
  options: {
    analysisId?: string | null;
    description?: string;
    source?: CartItem['source'];
  } = {}
): CartItem => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  brand: product.brand,
  category: product.category,
  shade: product.shade,
  price: product.price,
  currency: product.currency,
  image: product.image,
  description: options.description || product.short_description || getProductReason(product),
  quantity: 1,
  source: options.source || ('why_it_matches_you' in product ? 'detail' : 'recommendation'),
  addedAt: new Date().toISOString(),
  analysisId: options.analysisId || null,
  matchReason: getProductReason(product),
  retailerName: getProductRetailerName(product),
  purchaseUrl: getProductPurchaseUrl(product)
});

export const addProductToCart = (
  product: CartProduct,
  options: {
    analysisId?: string | null;
    description?: string;
    source?: CartItem['source'];
  } = {}
) => {
  const nextItem = createCartItem(product, options);
  const cartItems = readCartItems();
  const existingIndex = cartItems.findIndex((item) => item.id === nextItem.id);

  if (existingIndex >= 0) {
    cartItems[existingIndex] = {
      ...cartItems[existingIndex],
      ...nextItem,
      quantity: cartItems[existingIndex].quantity + 1
    };
  } else {
    cartItems.push(nextItem);
  }

  writeCartItems(cartItems);

  return {
    item: existingIndex >= 0 ? cartItems[existingIndex] : nextItem,
    items: cartItems
  };
};

export const getCartTotal = (items: CartItem[]) => {
  return items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
};
