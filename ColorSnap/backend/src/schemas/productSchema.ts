import type { Product } from '../types/analysis';

const productCategories = new Set(['lipstick', 'blush', 'eyeshadow', 'base_makeup', 'fashion']);
const saturations = new Set(['muted', 'medium', 'bright']);
const brightnessValues = new Set(['low', 'medium-low', 'medium', 'medium-high', 'high']);

export const validateProducts = (products: Product[]) => {
  products.forEach((product) => {
    if (!product.id || !product.name || !product.category || !product.shade) {
      throw new Error(`Product ${product.id || 'unknown'} is missing required fields.`);
    }

    if (!productCategories.has(product.category)) {
      throw new Error(`Product ${product.id} has an invalid category.`);
    }

    if (!saturations.has(product.saturation)) {
      throw new Error(`Product ${product.id} has an invalid saturation.`);
    }

    if (!brightnessValues.has(product.brightness)) {
      throw new Error(`Product ${product.id} has an invalid brightness.`);
    }
  });

  return products;
};
