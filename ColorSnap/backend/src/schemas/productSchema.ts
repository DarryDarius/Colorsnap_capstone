import type { Product } from '../types/analysis';

const productCategories = new Set(['lipstick', 'blush', 'eyeshadow', 'base_makeup', 'fashion']);
const undertones = new Set(['warm', 'cool', 'neutral']);
const saturations = new Set(['muted', 'medium', 'bright']);
const brightnessValues = new Set(['low', 'medium-low', 'medium', 'medium-high', 'high']);
const contrastValues = new Set(['low', 'medium', 'high']);
const finishes = new Set(['matte', 'satin', 'dewy', 'natural', 'shimmer']);
const intensities = new Set(['soft', 'medium', 'bold']);
const currencies = new Set(['USD']);

export const validateProducts = (products: Product[]) => {
  products.forEach((product) => {
    if (!product.id || !product.slug || !product.name || !product.brand || !product.category || !product.shade) {
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

    if (!currencies.has(product.currency)) {
      throw new Error(`Product ${product.id} has an invalid currency.`);
    }

    if (!Array.isArray(product.seasons) || product.seasons.length === 0) {
      throw new Error(`Product ${product.id} must include at least one season.`);
    }

    if (!Array.isArray(product.undertones) || product.undertones.length === 0) {
      throw new Error(`Product ${product.id} must include at least one undertone.`);
    }

    if (product.undertones.some((undertone) => !undertones.has(undertone))) {
      throw new Error(`Product ${product.id} has an invalid undertone.`);
    }

    if (
      product.contrast_support &&
      product.contrast_support.some((contrast) => !contrastValues.has(contrast))
    ) {
      throw new Error(`Product ${product.id} has an invalid contrast support value.`);
    }

    if (product.finish && !finishes.has(product.finish)) {
      throw new Error(`Product ${product.id} has an invalid finish.`);
    }

    if (product.intensity && !intensities.has(product.intensity)) {
      throw new Error(`Product ${product.id} has an invalid intensity.`);
    }

    if (!product.short_description || !product.description) {
      throw new Error(`Product ${product.id} is missing descriptive copy.`);
    }

    if (!product.retailer?.name || !product.retailer?.url) {
      throw new Error(`Product ${product.id} is missing retailer metadata.`);
    }

    if (product.active !== true && product.active !== false) {
      throw new Error(`Product ${product.id} must define an active flag.`);
    }
  });

  return products;
};
