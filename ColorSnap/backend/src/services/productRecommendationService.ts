import products from '../data/products.json';
import { validateProducts } from '../schemas/productSchema';
import type {
  ColorAttributes,
  ProductDetail,
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

const titleCase = (value: string) => `${value[0].toUpperCase()}${value.slice(1)}`;

const buildBadges = (product: Product, input: RecommendationInput) => {
  const badges = new Set<string>();

  if (product.seasons.includes(input.primarySeason)) {
    badges.add(input.primarySeason);
  } else if (input.secondarySeason && product.seasons.includes(input.secondarySeason)) {
    badges.add(input.secondarySeason);
  }

  if (product.undertones.includes(input.attributes.undertone)) {
    badges.add(`${titleCase(input.attributes.undertone)} Undertone`);
  }

  if (product.saturation === input.attributes.saturation) {
    badges.add(`${titleCase(input.attributes.saturation)} Finish`);
  }

  if (product.contrast_support?.includes(input.attributes.contrast)) {
    badges.add(`${titleCase(input.attributes.contrast)} Contrast`);
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

const toRecommendation = (product: Product, input: RecommendationInput): ProductRecommendation => ({
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
});

export const getProductRecommendations = (input: RecommendationInput): ProductRecommendation[] => {
  return catalog
    .filter((product) => product.active)
    .filter((product) => !input.category || product.category === input.category)
    .map((product) => toRecommendation(product, input))
    .sort((first, second) => second.score - first.score)
    .slice(0, input.limit || 6);
};

export const getProductBySlug = (slug: string) => {
  return catalog.find((product) => product.slug === slug && product.active) || null;
};

export const getRelatedProducts = (product: Product, limit = 3): ProductRecommendation[] => {
  const related = catalog
    .filter((candidate) => candidate.active && candidate.slug !== product.slug)
    .filter((candidate) => candidate.category === product.category || candidate.seasons.some((season) => product.seasons.includes(season)))
    .map((candidate) => {
      const seasonOverlap = candidate.seasons.filter((season) => product.seasons.includes(season)).length;
      const undertoneOverlap = candidate.undertones.filter((undertone) => product.undertones.includes(undertone)).length;
      const brightnessMatch = candidate.brightness === product.brightness ? 1 : 0;
      const saturationMatch = candidate.saturation === product.saturation ? 1 : 0;

      return {
        product: candidate,
        score: (candidate.category === product.category ? 3 : 0) + (seasonOverlap * 2) + undertoneOverlap + brightnessMatch + saturationMatch
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map(({ product: candidate }) => {
      const primarySeason = candidate.seasons.find((season) => product.seasons.includes(season)) || candidate.seasons[0];
      const secondarySeason = candidate.seasons.find((season) => season !== primarySeason) || null;

      return toRecommendation(candidate, {
        primarySeason,
        secondarySeason,
        attributes: {
          undertone: candidate.undertones[0],
          brightness: candidate.brightness,
          saturation: candidate.saturation,
          contrast: candidate.contrast_support?.[0] || 'medium'
        }
      });
    });

  return related;
};

export const getProductDetailBySlug = (slug: string): ProductDetail | null => {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    shade: product.shade,
    image: product.image,
    gallery: product.gallery || [product.image],
    price: product.price,
    currency: product.currency,
    description: product.description,
    short_description: product.short_description,
    finish: product.finish,
    intensity: product.intensity,
    best_for: [
      ...product.seasons.slice(0, 2),
      ...product.undertones.map((undertone) => `${titleCase(undertone)} Undertone`)
    ].slice(0, 4),
    why_it_matches_you: product.why_it_matches_template || product.short_description,
    use_cases: product.use_cases || [],
    ingredients_highlights: product.ingredients_highlights || [],
    retailer: product.retailer,
    related_products: getRelatedProducts(product)
  };
};
