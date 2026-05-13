import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { ProductRecommendation } from '../../types/analysis';
import { formatLabel, isRealExternalUrl } from '../../utils/formatters';

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-6);
`;

const FilterButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? 'var(--brand-primary)' : 'var(--surface)')};
  border: 1px solid ${(props) => (props.$active ? 'var(--brand-primary)' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$active ? 'var(--text-inverse)' : 'var(--text-secondary)')};
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 700;
  padding: 0.65rem 0.9rem;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;

  &:hover {
    background: ${(props) => (props.$active ? 'var(--brand-primary-hover)' : 'var(--brand-primary-pale)')};
    border-color: ${(props) => (props.$active ? 'var(--brand-primary-hover)' : 'var(--brand-primary-soft)')};
    color: ${(props) => (props.$active ? 'var(--text-inverse)' : 'var(--brand-primary)')};
    transform: translateY(-1px);
  }
`;

const RecommendationIntro = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  text-align: left;

  strong {
    color: var(--text-primary);
  }
`;

const ControlsGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: var(--space-6);

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ControlGroup = styled.label`
  color: var(--text-primary);
  display: grid;
  font-size: var(--font-sm);
  font-weight: 800;
  gap: var(--space-2);
  text-align: left;
`;

const Select = styled.select`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font: inherit;
  min-height: 44px;
  padding: 0.65rem 0.8rem;

  &:focus {
    border-color: var(--brand-primary);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
`;

const EmptyState = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  padding: var(--space-6);
  text-align: center;
`;

const ProductCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-3);
  overflow: hidden;
  padding: var(--space-4);
  text-align: left;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: var(--brand-primary-soft);
    transform: translateY(-2px);
  }
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const Badge = styled.span`
  background: var(--brand-primary-pale);
  border-radius: var(--radius-md);
  color: var(--brand-primary);
  font-size: var(--font-xs);
  font-weight: 700;
  padding: 0.35rem 0.65rem;
`;

const ProductImage = styled.img`
  aspect-ratio: 4 / 3;
  background: var(--surface-warm);
  border-radius: var(--radius-md);
  object-fit: cover;
  width: 100%;
`;

const ProductTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-lg);
  line-height: 1.25;
`;

const ProductBrand = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const ProductInfo = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
  line-height: 1.6;
  margin: 0;

  strong {
    color: var(--text-primary);
  }
`;

const ReasonList = styled.ul`
  color: var(--text-secondary);
  display: grid;
  font-size: var(--font-sm);
  gap: var(--space-2);
  line-height: 1.55;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    border-left: 3px solid var(--brand-primary-soft);
    padding-left: var(--space-2);
  }
`;

const ScoreBreakdown = styled.div`
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ScorePill = styled.span`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-xs);
  font-weight: 800;
  padding: 0.35rem 0.55rem;
`;

const MetaGrid = styled.div`
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const BestForList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const BestForPill = styled.span`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  font-size: var(--font-xs);
  font-weight: 800;
  padding: 0.35rem 0.55rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
`;

const ActionButton = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 700;
  padding: 0.65rem 0.9rem;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

const PurchaseLink = styled.a`
  display: inline-flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  padding: 0.65rem 0.9rem;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
    transform: translateY(-1px);
  }
`;

const DetailLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  padding: 0.65rem 0.9rem;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
    transform: translateY(-1px);
  }
`;

type Props = {
  products?: ProductRecommendation[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAddToCart: (product: ProductRecommendation) => void;
  onSaveToLook?: (product: ProductRecommendation) => void;
  analysisId?: string | null;
};

type PriceFilter = 'all' | 'under-25' | '25-50' | '50-plus';
type SortMode = 'best-match' | 'price-low' | 'price-high';

const getRetailerName = (purchaseUrl?: string) => {
  if (!purchaseUrl) {
    return 'Other';
  }

  try {
    const host = new URL(purchaseUrl).hostname.toLowerCase();

    if (host.includes('sephora')) return 'Sephora';
    if (host.includes('ulta')) return 'Ulta Beauty';
    if (host.includes('amazon')) return 'Amazon';

    return host.replace(/^www\./, '');
  } catch {
    return 'Other';
  }
};

const matchesPriceFilter = (product: ProductRecommendation, priceFilter: PriceFilter) => {
  const price = parseFloat(product.price);

  if (!Number.isFinite(price) || priceFilter === 'all') {
    return true;
  }

  if (priceFilter === 'under-25') {
    return price < 25;
  }

  if (priceFilter === '25-50') {
    return price >= 25 && price <= 50;
  }

  return price > 50;
};

const formatScoreBreakdown = (product: ProductRecommendation) => {
  if (!product.score_breakdown) {
    return [];
  }

  return Object.entries(product.score_breakdown).map(([key, value]) => ({
    label: formatLabel(key),
    value: `${Math.round(value * 100)}%`
  }));
};

const ProductRecommendations: React.FC<Props> = ({
  products = [],
  activeFilter,
  onFilterChange,
  onAddToCart,
  onSaveToLook,
  analysisId
}) => {
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [retailerFilter, setRetailerFilter] = useState('all');
  const [finishFilter, setFinishFilter] = useState('all');
  const [intensityFilter, setIntensityFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('best-match');
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const retailers = useMemo(
    () => Array.from(new Set(products.map((product) => product.retailer_name || getRetailerName(product.purchase_url)))).sort(),
    [products]
  );
  const finishes = useMemo(
    () => Array.from(new Set(products.map((product) => product.finish).filter((finish): finish is NonNullable<typeof finish> => Boolean(finish)))).sort(),
    [products]
  );
  const intensities = useMemo(
    () => Array.from(new Set(products.map((product) => product.intensity).filter((intensity): intensity is NonNullable<typeof intensity> => Boolean(intensity)))).sort(),
    [products]
  );
  const filteredProducts = useMemo(() => {
    const nextProducts = products
      .filter((product) => activeFilter === 'all' || product.category === activeFilter)
      .filter((product) => matchesPriceFilter(product, priceFilter))
      .filter((product) => retailerFilter === 'all' || (product.retailer_name || getRetailerName(product.purchase_url)) === retailerFilter)
      .filter((product) => finishFilter === 'all' || product.finish === finishFilter)
      .filter((product) => intensityFilter === 'all' || product.intensity === intensityFilter);

    return [...nextProducts].sort((first, second) => {
      if (sortMode === 'price-low') {
        return parseFloat(first.price) - parseFloat(second.price);
      }

      if (sortMode === 'price-high') {
        return parseFloat(second.price) - parseFloat(first.price);
      }

      return second.score - first.score;
    });
  }, [activeFilter, finishFilter, intensityFilter, priceFilter, products, retailerFilter, sortMode]);

  return (
    <>
      <RecommendationIntro>
        <strong>Best Match</strong> ranks products by palette match, undertone fit, saturation, brightness,
        and contrast support. Use filters to narrow the list by category, price, retailer, finish, or intensity.
      </RecommendationIntro>

      <FilterBar>
        <FilterButton $active={activeFilter === 'all'} onClick={() => onFilterChange('all')}>
          All
        </FilterButton>
        {categories.map((category) => (
          <FilterButton
            key={category}
            $active={activeFilter === category}
            onClick={() => onFilterChange(category)}
          >
            {formatLabel(category)}
          </FilterButton>
        ))}
      </FilterBar>

      <ControlsGrid>
        <ControlGroup>
          Price range
          <Select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}>
            <option value="all">All prices</option>
            <option value="under-25">Under $25</option>
            <option value="25-50">$25-$50</option>
            <option value="50-plus">$50+</option>
          </Select>
        </ControlGroup>
        <ControlGroup>
          Retailer
          <Select value={retailerFilter} onChange={(event) => setRetailerFilter(event.target.value)}>
            <option value="all">All retailers</option>
            {retailers.map((retailer) => (
              <option key={retailer} value={retailer}>{retailer}</option>
            ))}
          </Select>
        </ControlGroup>
        <ControlGroup>
          Finish
          <Select value={finishFilter} onChange={(event) => setFinishFilter(event.target.value)}>
            <option value="all">All finishes</option>
            {finishes.map((finish) => (
              <option key={finish} value={finish}>{formatLabel(finish)}</option>
            ))}
          </Select>
        </ControlGroup>
        <ControlGroup>
          Intensity
          <Select value={intensityFilter} onChange={(event) => setIntensityFilter(event.target.value)}>
            <option value="all">All intensities</option>
            {intensities.map((intensity) => (
              <option key={intensity} value={intensity}>{formatLabel(intensity)}</option>
            ))}
          </Select>
        </ControlGroup>
        <ControlGroup>
          Sort
          <Select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="best-match">Best Match</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
          </Select>
        </ControlGroup>
      </ControlsGrid>

      {filteredProducts.length === 0 && (
        <EmptyState>
          No products match these filters. Try broadening the category, price, retailer, finish, or intensity selection.
        </EmptyState>
      )}

      <ProductsGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id}>
            <ProductImage src={product.image} alt={product.name} />
            <ProductTitle>{product.name}</ProductTitle>
            <ProductBrand>{product.brand || 'Curated Match'}</ProductBrand>
            <BadgeRow>
              {(product.badges || []).map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </BadgeRow>
            <MetaGrid>
              <ProductInfo><strong>Shade:</strong> {product.shade}</ProductInfo>
              <ProductInfo><strong>Category:</strong> {formatLabel(product.category)}</ProductInfo>
              <ProductInfo><strong>Retailer:</strong> {product.retailer_name || getRetailerName(product.purchase_url)}</ProductInfo>
              <ProductInfo><strong>Match Score:</strong> {product.score}%</ProductInfo>
              <ProductInfo><strong>Finish:</strong> {product.finish ? formatLabel(product.finish) : 'Any'}</ProductInfo>
              <ProductInfo><strong>Intensity:</strong> {product.intensity ? formatLabel(product.intensity) : 'Any'}</ProductInfo>
              <ProductInfo><strong>Price:</strong> ${product.price}</ProductInfo>
            </MetaGrid>
            {formatScoreBreakdown(product).length > 0 && (
              <ScoreBreakdown aria-label={`${product.name} score breakdown`}>
                {formatScoreBreakdown(product).map((item) => (
                  <ScorePill key={item.label}>{item.label}: {item.value}</ScorePill>
                ))}
              </ScoreBreakdown>
            )}
            {product.best_for?.length > 0 && (
              <BestForList aria-label={`${product.name} best for`}>
                {product.best_for.map((item) => (
                  <BestForPill key={item}>{item}</BestForPill>
                ))}
              </BestForList>
            )}
            <ProductInfo>{product.short_description || `${product.shade} selected for your palette.`}</ProductInfo>
            <ProductInfo>{product.reason}</ProductInfo>
            {product.match_reasons && product.match_reasons.length > 0 && (
              <ReasonList aria-label={`${product.name} match reasons`}>
                {product.match_reasons.slice(0, 3).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ReasonList>
            )}
            <ActionRow>
              {product.slug && (
                <DetailLink
                  to={`/products/${encodeURIComponent(product.slug)}${analysisId ? `?analysis_id=${encodeURIComponent(analysisId)}` : ''}`}
                >
                  View Details
                </DetailLink>
              )}
              <ActionButton onClick={() => onAddToCart(product)}>
                Add to Cart
              </ActionButton>
              {onSaveToLook && (
                <ActionButton onClick={() => onSaveToLook(product)}>
                  Save to Look
                </ActionButton>
              )}
              {isRealExternalUrl(product.purchase_url) && (
                <PurchaseLink href={product.purchase_url} target="_blank" rel="noreferrer">
                  Buy Externally
                </PurchaseLink>
              )}
            </ActionRow>
          </ProductCard>
        ))}
      </ProductsGrid>
    </>
  );
};

export default ProductRecommendations;
