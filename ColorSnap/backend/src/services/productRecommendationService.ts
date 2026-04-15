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

const buildBadges = (product: Product, input: RecommendationInput) => {
  const badges = new Set<string>();

  if (product.seasons.includes(input.primarySeason)) {
    badges.add(input.primarySeason);
  } else if (input.secondarySeason && product.seasons.includes(input.secondarySeason)) {
    badges.add(input.secondarySeason);
  }

  if (product.undertones.includes(input.attributes.undertone)) {
    badges.add(`${input.attributes.undertone[0].toUpperCase()}${input.attributes.undertone.slice(1)} Undertone`);
  }

  if (product.saturation === input.attributes.saturation) {
    badges.add(`${input.attributes.saturation[0].toUpperCase()}${input.attributes.saturation.slice(1)} Finish`);
  }

  if (product.contrast_support?.includes(input.attributes.contrast)) {
    badges.add(`${input.attributes.contrast[0].toUpperCase()}${input.attributes.contrast.slice(1)} Contrast`);
  }

  if (product.use_cases?.[0]) {
    badges.add(product.use_cases[0]);
  }

  return Array.from(badges).slice(0, 4);
};

const buildReason = (product: Product, input: RecommendationInput) => {
  const matchedSeason = product.seasons.includes(input.primarySeason)
    ? input.primarySeason
    : input.secondarySeason && product.seasons.includes(input.secondarySeason)
      ? input.secondarySeason
      : null;

  if (product.why_it_matches_template) {
    return product.why_it_matches_template;
  }

  const parts = [
    matchedSeason ? `fits your ${matchedSeason} palette` : 'supports your palette direction',
    product.undertones.includes(input.attributes.undertone)
      ? `works with your ${input.attributes.undertone} undertone`
      : null,
    product.saturation === input.attributes.saturation
      ? `keeps the ${input.attributes.saturation} color intensity you suit best`
      : null,
    product.brightness === input.attributes.brightness
      ? `lands at a flattering ${input.attributes.brightness} depth`
      : null
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
  const contrastMatch = product.contrast_support?.includes(input.attributes.contrast) ? 1 : 0;

  return Math.round(
    ((seasonMatch * 4) + (undertoneMatch * 3) + (saturationMatch * 2) + (brightnessMatch * 2) + contrastMatch) * 8.5
  );
};

export const getProductRecommendations = (input: RecommendationInput): ProductRecommendation[] => {
  return catalog
    .filter((product) => product.active)
    .filter((product) => !input.category || product.category === input.category)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      shade: product.shade,
      image: product.image,
      short_description: product.short_description,
      url: product.url,
      purchase_url: product.retailer.url,
      price: product.price,
      currency: product.currency,
      finish: product.finish,
      intensity: product.intensity,
      badges: buildBadges(product, input),
      reason: buildReason(product, input),
      score: scoreProduct(product, input)
    }))
    .sort((first, second) => second.score - first.score)
    .slice(0, input.limit || 6);
};
