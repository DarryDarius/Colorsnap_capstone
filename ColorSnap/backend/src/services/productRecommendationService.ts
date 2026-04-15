import products from '../data/products.json';
import { validateProducts } from '../schemas/productSchema';
import type {
  ColorAttributes,
  Product,
  ProductCategory,
  ProductRecommendation,
  Season
} from '../types/analysis';

const catalog = validateProducts(products as Product[]);

type RecommendationInput = {
  primarySeason: Season;
  secondarySeason: Season | null;
  attributes: ColorAttributes;
  category?: ProductCategory;
  limit?: number;
};

const buildReason = (product: Product, input: RecommendationInput) => {
  const matchedSeason = product.seasons.includes(input.primarySeason)
    ? input.primarySeason
    : input.secondarySeason && product.seasons.includes(input.secondarySeason)
      ? input.secondarySeason
      : null;

  const parts = [
    matchedSeason ? `matches ${matchedSeason}` : 'supports your seasonal palette',
    product.undertones.includes(input.attributes.undertone)
      ? `works with ${input.attributes.undertone} undertones`
      : null,
    product.saturation === input.attributes.saturation ? `keeps the ${input.attributes.saturation} finish` : null
  ].filter(Boolean);

  return `${product.shade} ${parts.join(', ')}.`;
};

const scoreProduct = (product: Product, input: RecommendationInput) => {
  const seasonMatch = product.seasons.includes(input.primarySeason)
    ? 1
    : input.secondarySeason && product.seasons.includes(input.secondarySeason)
      ? 0.75
      : 0;
  const undertoneMatch = product.undertones.includes(input.attributes.undertone) ? 1 : 0;
  const saturationMatch = product.saturation === input.attributes.saturation ? 1 : 0;
  const brightnessMatch = product.brightness === input.attributes.brightness ? 1 : 0;

  return Math.round(((seasonMatch * 3) + (undertoneMatch * 2) + (saturationMatch * 2) + brightnessMatch) * 12.5);
};

export const getProductRecommendations = (input: RecommendationInput): ProductRecommendation[] => {
  return catalog
    .filter((product) => !input.category || product.category === input.category)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      shade: product.shade,
      image: product.image,
      url: product.url,
      price: product.price,
      reason: buildReason(product, input),
      score: scoreProduct(product, input)
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, input.limit || 6);
};
