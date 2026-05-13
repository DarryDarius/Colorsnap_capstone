import products from '../data/products.json';
import { validateProducts } from '../schemas/productSchema';
import type {
  ColorAttributes,
  BeautyPreferenceRecord,
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
  preferences?: BeautyPreferenceRecord | null;
};

type RecommendationScoreBreakdown = {
  season: number;
  undertone: number;
  saturation: number;
  brightness: number;
  contrast: number;
  category: number;
  preference: number;
};

const scoreWeights: RecommendationScoreBreakdown = {
  season: 0.3,
  undertone: 0.25,
  saturation: 0.15,
  brightness: 0.1,
  contrast: 0.1,
  category: 0.05,
  preference: 0.05
};

const titleCase = (value: string) => `${value[0].toUpperCase()}${value.slice(1)}`;

const formatAttribute = (value: string) => value.split('-').map(titleCase).join('-');

const categoryLabels: Record<ProductCategory, string> = {
  lipstick: 'lip color',
  blush: 'cheek color',
  eyeshadow: 'eye color',
  base_makeup: 'base makeup',
  fashion: 'wardrobe color'
};

const goalToCategory: Partial<Record<BeautyPreferenceRecord['shopping_goal'], ProductCategory>> = {
  lipstick: 'lipstick',
  blush: 'blush',
  eyes: 'eyeshadow',
  base: 'base_makeup',
  fashion: 'fashion'
};

const getDerivedTags = (product: Product) => ([
  ...(product.tags || []),
  ...(product.use_cases || []),
  product.finish ? `${product.finish} finish` : null,
  product.intensity ? `${product.intensity} intensity` : null,
  product.saturation,
  product.brightness
].filter((item): item is string => Boolean(item)));

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
    badges.add(`${formatAttribute(input.attributes.saturation)} Intensity`);
  }

  if (product.contrast_support?.includes(input.attributes.contrast)) {
    badges.add(`${formatAttribute(input.attributes.contrast)} Contrast`);
  }

  if (product.use_cases?.[0]) {
    badges.add(product.use_cases[0]);
  }

  return Array.from(badges).slice(0, 4);
};

const getScoreBreakdown = (product: Product, input: RecommendationInput): RecommendationScoreBreakdown => {
  const season = product.seasons.includes(input.primarySeason)
    ? 1
    : input.secondarySeason && product.seasons.includes(input.secondarySeason)
      ? 0.78
      : 0;
  const undertone = product.undertones.includes(input.attributes.undertone)
    ? 1
    : product.undertones.includes('neutral') || input.attributes.undertone === 'neutral'
      ? 0.55
      : 0;
  const saturation = product.saturation === input.attributes.saturation ? 1 : 0;
  const brightness = product.brightness === input.attributes.brightness
    ? 1
    : (
      (product.brightness === 'medium' && input.attributes.brightness.includes('medium')) ||
      (input.attributes.brightness === 'medium' && product.brightness.includes('medium'))
    )
      ? 0.65
      : 0;
  const contrast = product.contrast_support?.includes(input.attributes.contrast)
    ? 1
    : product.contrast_support?.includes('medium') || input.attributes.contrast === 'medium'
      ? 0.5
      : 0;
  const category = input.category ? (product.category === input.category ? 1 : 0) : 1;
  const preference = getPreferenceScore(product, input.preferences || null);

  return { season, undertone, saturation, brightness, contrast, category, preference };
};

const getBudgetScore = (product: Product, budgetRange: BeautyPreferenceRecord['budget_range']) => {
  const price = Number.parseFloat(product.price);

  if (!Number.isFinite(price) || budgetRange === 'flexible') return 1;
  if (budgetRange === 'drugstore') return price <= 15 ? 1 : price <= 30 ? 0.55 : 0.2;
  if (budgetRange === 'mid_range') return price >= 12 && price <= 45 ? 1 : 0.45;
  return price >= 30 ? 1 : 0.6;
};

const getStyleScore = (product: Product, makeupStyle: BeautyPreferenceRecord['makeup_style']) => {
  if (makeupStyle === 'natural') {
    return product.intensity === 'soft' || product.finish === 'natural' || product.finish === 'dewy' ? 1 : 0.55;
  }

  if (makeupStyle === 'polished' || makeupStyle === 'soft_glam') {
    return product.intensity === 'medium' || product.finish === 'satin' || product.finish === 'natural' ? 1 : 0.65;
  }

  return product.intensity === 'bold' || product.finish === 'matte' || product.finish === 'shimmer' ? 1 : 0.55;
};

const getAvoidColorPenalty = (product: Product, avoidColors: string[]) => {
  if (avoidColors.length === 0) return 1;

  const searchable = [
    product.shade,
    product.name,
    product.short_description,
    product.description,
    ...(product.tags || []),
    ...(product.use_cases || [])
  ].join(' ').toLowerCase();

  return avoidColors.some((color) => searchable.includes(color.toLowerCase())) ? 0 : 1;
};

const getPreferenceScore = (product: Product, preferences: BeautyPreferenceRecord | null) => {
  if (!preferences) return 1;

  const finishScore = preferences.preferred_finishes.length === 0 || !product.finish
    ? 1
    : preferences.preferred_finishes.includes(product.finish) ? 1 : 0.45;
  const brandScore = preferences.preferred_brands.length === 0
    ? 1
    : preferences.preferred_brands.some((brand) => product.brand.toLowerCase().includes(brand.toLowerCase())) ? 1 : 0.55;
  const goalCategory = goalToCategory[preferences.shopping_goal];
  const goalScore = !goalCategory || product.category === goalCategory ? 1 : 0.65;
  const budgetScore = getBudgetScore(product, preferences.budget_range);
  const styleScore = getStyleScore(product, preferences.makeup_style);
  const avoidScore = getAvoidColorPenalty(product, preferences.avoid_colors);

  return Math.round((
    (finishScore * 0.2) +
    (brandScore * 0.15) +
    (goalScore * 0.2) +
    (budgetScore * 0.2) +
    (styleScore * 0.15) +
    (avoidScore * 0.1)
  ) * 100) / 100;
};

const scoreProduct = (breakdown: RecommendationScoreBreakdown) => {
  const weightedScore = Object.entries(scoreWeights).reduce((total, [key, weight]) => {
    return total + (breakdown[key as keyof RecommendationScoreBreakdown] * weight);
  }, 0);

  return Math.round(weightedScore * 100);
};

const buildMatchReasons = (
  product: Product,
  input: RecommendationInput,
  breakdown: RecommendationScoreBreakdown
) => {
  const matchedSeason = product.seasons.includes(input.primarySeason)
    ? input.primarySeason
    : input.secondarySeason && product.seasons.includes(input.secondarySeason)
      ? input.secondarySeason
      : null;
  const reasons: string[] = [];

  if (matchedSeason) {
    reasons.push(`${product.shade} is tagged for ${matchedSeason}, so it sits inside your seasonal color direction.`);
  } else {
    reasons.push(`${product.shade} is a partial palette match; it is ranked lower because it is not tagged for ${input.primarySeason}.`);
  }

  if (breakdown.undertone >= 1) {
    reasons.push(`Its ${product.undertones.map(formatAttribute).join('/')} undertone supports your ${formatAttribute(input.attributes.undertone)} undertone.`);
  } else if (breakdown.undertone > 0) {
    reasons.push('The neutral undertone makes it flexible, but it is not the strongest undertone match.');
  }

  if (breakdown.saturation >= 1) {
    reasons.push(`The ${formatAttribute(product.saturation)} saturation matches the ${formatAttribute(input.attributes.saturation)} intensity in your profile.`);
  }

  if (breakdown.brightness >= 1) {
    reasons.push(`Its ${formatAttribute(product.brightness)} depth lines up with your ${formatAttribute(input.attributes.brightness)} brightness.`);
  } else if (breakdown.brightness > 0) {
    reasons.push(`The ${formatAttribute(product.brightness)} depth is close enough to your ${formatAttribute(input.attributes.brightness)} brightness for flexible wear.`);
  }

  if (breakdown.contrast >= 1) {
    reasons.push(`It supports ${formatAttribute(input.attributes.contrast)} contrast, so it should not overpower your natural contrast level.`);
  } else if (breakdown.contrast > 0) {
    reasons.push('Its contrast support is flexible, but not perfectly targeted to your contrast level.');
  }

  if (product.use_cases?.[0]) {
    reasons.push(`Best use: ${product.use_cases[0]}.`);
  }

  if (input.preferences) {
    const preferenceDetails = [
      input.preferences.budget_range !== 'flexible' ? `${input.preferences.budget_range.replace('_', '-')} budget` : null,
      input.preferences.makeup_style.replace('_', ' '),
      input.preferences.preferred_finishes.length > 0 ? `${input.preferences.preferred_finishes.map(formatAttribute).join('/')} finish` : null
    ].filter(Boolean).join(', ');

    if (preferenceDetails) {
      reasons.push(`Personalization: ranked with your ${preferenceDetails} preferences.`);
    }
  }

  return reasons.slice(0, 5);
};

const buildReason = (
  product: Product,
  input: RecommendationInput,
  breakdown: RecommendationScoreBreakdown
) => {
  const categoryLabel = categoryLabels[product.category];
  const matchReasons = buildMatchReasons(product, input, breakdown);
  const productContext = product.why_it_matches_template
    ? ` ${product.why_it_matches_template}`
    : '';

  return `${product.shade} works as a ${categoryLabel} match for your ${input.primarySeason} profile because it balances ${formatAttribute(product.saturation)} saturation, ${formatAttribute(product.brightness)} depth, and ${product.undertones.map(formatAttribute).join('/')} undertone.${productContext} ${matchReasons[0] || ''}`.trim();
};

const buildBestFor = (product: Product) => [
  ...product.seasons.slice(0, 2),
  ...product.undertones.map((undertone) => `${titleCase(undertone)} Undertone`),
  product.finish ? `${titleCase(product.finish)} Finish` : null,
  product.intensity ? `${titleCase(product.intensity)} Intensity` : null
].filter((item): item is string => Boolean(item)).slice(0, 5);

const toRecommendation = (product: Product, input: RecommendationInput): ProductRecommendation => {
  const scoreBreakdown = getScoreBreakdown(product, input);
  const score = scoreProduct(scoreBreakdown);
  const matchReasons = buildMatchReasons(product, input, scoreBreakdown);

  return {
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
    best_for: buildBestFor(product),
    retailer_name: product.retailer.name,
    badges: buildBadges(product, input),
    reason: buildReason(product, input, scoreBreakdown),
    score,
    score_breakdown: scoreBreakdown,
    match_reasons: matchReasons,
    match_summary: matchReasons[0],
  };
};

export const getProductCatalogSummary = () => {
  const activeProducts = catalog.filter((product) => product.active);
  const categoryCounts = activeProducts.reduce<Record<string, number>>((counts, product) => {
    counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});

  return {
    total_active_products: activeProducts.length,
    category_counts: categoryCounts,
    score_weights: scoreWeights
  };
};

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
    tags: getDerivedTags(product),
    retailer: product.retailer,
    related_products: getRelatedProducts(product)
  };
};
