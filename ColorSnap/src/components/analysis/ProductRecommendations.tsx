import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Heart, Info, ShoppingBag, SlidersHorizontal, Sparkles } from 'lucide-react';
import styled from 'styled-components';
import DisclosurePanel from '../ui/DisclosurePanel';
import InsightDrawer from '../ui/InsightDrawer';
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
  display: grid;
  gap: var(--space-2);
  line-height: 1.65;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  text-align: left;

  strong {
    color: var(--text-primary);
  }
`;

const RecommendationIntroHeader = styled.div`
  align-items: center;
  color: var(--text-primary);
  display: flex;
  font-weight: 900;
  gap: var(--space-2);
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

  span {
    align-items: center;
    display: inline-flex;
    gap: var(--space-1);
  }
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
  margin-top: var(--space-4);
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

const ProductMedia = styled.div`
  position: relative;
`;

const ScoreBadge = styled.span`
  align-items: center;
  background: rgba(33, 26, 26, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--radius-md);
  bottom: var(--space-3);
  color: var(--text-inverse);
  display: inline-flex;
  font-size: var(--font-xs);
  font-weight: 900;
  gap: var(--space-1);
  left: var(--space-3);
  padding: 0.45rem 0.62rem;
  position: absolute;
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

const ProductPrimaryMeta = styled.div`
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-sm);
  gap: var(--space-2);

  span {
    background: var(--surface-warm);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-md);
    padding: 0.35rem 0.55rem;
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
  align-items: center;
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  cursor: pointer;
  display: inline-flex;
  font-size: var(--font-sm);
  font-weight: 700;
  gap: var(--space-2);
  justify-content: center;
  padding: 0.65rem 0.9rem;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

const SecondaryActionButton = styled(ActionButton)`
  background: var(--surface);
  border-color: var(--border-soft);
  color: var(--text-primary);

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const MatchButton = styled.button`
  align-items: center;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    linear-gradient(135deg, var(--brand-primary), var(--cool-accent)) border-box;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  display: inline-grid;
  font-size: var(--font-sm);
  font-weight: 900;
  gap: var(--space-2);
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 42px;
  padding: 0.5rem 0.62rem;
  position: relative;
  text-align: left;
  transition: box-shadow 160ms ease, transform 160ms ease;

  &::before {
    background: linear-gradient(135deg, rgba(200, 95, 115, 0.12), rgba(141, 152, 184, 0.14));
    border-radius: inherit;
    content: "";
    inset: 0;
    opacity: 0.72;
    position: absolute;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    box-shadow: 0 12px 28px rgba(200, 95, 115, 0.14);
    transform: translateY(-1px);
  }
`;

const MatchIcon = styled.span`
  align-items: center;
  background: var(--brand-primary);
  border-radius: var(--radius-sm);
  color: var(--text-inverse);
  display: inline-flex;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const MatchLabel = styled.span`
  display: grid;
  line-height: 1.15;
`;

const MatchSubLabel = styled.span`
  color: var(--text-secondary);
  font-size: var(--font-xs);
  font-weight: 800;
  margin-top: 0.1rem;
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
  gap: var(--space-2);
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
  gap: var(--space-2);
  padding: 0.65rem 0.9rem;
  text-decoration: none;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
    transform: translateY(-1px);
  }
`;

const DrawerContent = styled.div`
  display: grid;
  gap: var(--space-4);
`;

const DrawerSection = styled.section`
  display: grid;
  gap: var(--space-3);
`;

const DrawerTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-md);
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
  const [selectedMatchProduct, setSelectedMatchProduct] = useState<ProductRecommendation | null>(null);
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
        <RecommendationIntroHeader>
          <Sparkles aria-hidden="true" size={17} />
          Best Match ranking
        </RecommendationIntroHeader>
        <span>
          Products are ranked by palette match, undertone fit, saturation, brightness, and contrast support.
          Use filters to narrow the list by category, price, retailer, finish, or intensity.
        </span>
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

      <DisclosurePanel
        title="Refine Product List"
        description="Use advanced filters for price, retailer, finish, intensity, and sorting."
      >
        <ControlsGrid>
          <ControlGroup>
            <span><SlidersHorizontal aria-hidden="true" size={14} /> Price range</span>
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
      </DisclosurePanel>

      {filteredProducts.length === 0 && (
        <EmptyState>
          No products match these filters. Try broadening the category, price, retailer, finish, or intensity selection.
        </EmptyState>
      )}

      <ProductsGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id}>
            <ProductMedia>
              <ProductImage src={product.image} alt={product.name} />
              <ScoreBadge>
                <Sparkles aria-hidden="true" size={13} />
                {product.score}% match
              </ScoreBadge>
            </ProductMedia>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductBrand>{product.brand || 'Curated Match'}</ProductBrand>
            <BadgeRow>
              {(product.badges || []).map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </BadgeRow>
            <ProductPrimaryMeta>
              <span>{formatLabel(product.category)}</span>
              <span>{product.retailer_name || getRetailerName(product.purchase_url)}</span>
              <span>${product.price}</span>
            </ProductPrimaryMeta>
            <ProductInfo>{product.short_description || `${product.shade} selected for your palette.`}</ProductInfo>
            <ActionRow>
              <MatchButton type="button" onClick={() => setSelectedMatchProduct(product)}>
                <MatchIcon aria-hidden="true">
                  <Sparkles size={15} />
                </MatchIcon>
                <MatchLabel>
                  Why Match
                  <MatchSubLabel>{product.score}% fit insight</MatchSubLabel>
                </MatchLabel>
                <ChevronRight aria-hidden="true" size={16} />
              </MatchButton>
              {product.slug && (
                <DetailLink
                  to={`/products/${encodeURIComponent(product.slug)}${analysisId ? `?analysis_id=${encodeURIComponent(analysisId)}` : ''}`}
                >
                  <Info aria-hidden="true" size={15} />
                  View Details
                </DetailLink>
              )}
              <ActionButton type="button" onClick={() => onAddToCart(product)}>
                <ShoppingBag aria-hidden="true" size={15} />
                Add to Cart
              </ActionButton>
              {onSaveToLook && (
                <SecondaryActionButton type="button" onClick={() => onSaveToLook(product)}>
                  <Heart aria-hidden="true" size={15} />
                  Save to Look
                </SecondaryActionButton>
              )}
              {isRealExternalUrl(product.purchase_url) && (
                <PurchaseLink href={product.purchase_url} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" size={15} />
                  Buy Externally
                </PurchaseLink>
              )}
            </ActionRow>
          </ProductCard>
        ))}
      </ProductsGrid>

      <InsightDrawer
        open={Boolean(selectedMatchProduct)}
        title={selectedMatchProduct ? selectedMatchProduct.name : 'Product Match'}
        subtitle={selectedMatchProduct ? `${selectedMatchProduct.score}% palette match` : undefined}
        onClose={() => setSelectedMatchProduct(null)}
      >
        {selectedMatchProduct && (
          <DrawerContent>
            <DrawerSection>
              <DrawerTitle>Product Details</DrawerTitle>
              <MetaGrid>
                <ProductInfo><strong>Shade:</strong> {selectedMatchProduct.shade}</ProductInfo>
                <ProductInfo><strong>Category:</strong> {formatLabel(selectedMatchProduct.category)}</ProductInfo>
                <ProductInfo><strong>Retailer:</strong> {selectedMatchProduct.retailer_name || getRetailerName(selectedMatchProduct.purchase_url)}</ProductInfo>
                <ProductInfo><strong>Finish:</strong> {selectedMatchProduct.finish ? formatLabel(selectedMatchProduct.finish) : 'Any'}</ProductInfo>
                <ProductInfo><strong>Intensity:</strong> {selectedMatchProduct.intensity ? formatLabel(selectedMatchProduct.intensity) : 'Any'}</ProductInfo>
                <ProductInfo><strong>Price:</strong> ${selectedMatchProduct.price}</ProductInfo>
              </MetaGrid>
            </DrawerSection>

            <DrawerSection>
              <DrawerTitle>Why It Matches</DrawerTitle>
              <ProductInfo>{selectedMatchProduct.reason}</ProductInfo>
              {selectedMatchProduct.match_reasons && selectedMatchProduct.match_reasons.length > 0 && (
                <ReasonList aria-label={`${selectedMatchProduct.name} match reasons`}>
                  {selectedMatchProduct.match_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ReasonList>
              )}
            </DrawerSection>

            {formatScoreBreakdown(selectedMatchProduct).length > 0 && (
              <DrawerSection>
                <DrawerTitle>Score Breakdown</DrawerTitle>
                <ScoreBreakdown aria-label={`${selectedMatchProduct.name} score breakdown`}>
                  {formatScoreBreakdown(selectedMatchProduct).map((item) => (
                    <ScorePill key={item.label}>{item.label}: {item.value}</ScorePill>
                  ))}
                </ScoreBreakdown>
              </DrawerSection>
            )}

            {selectedMatchProduct.best_for?.length > 0 && (
              <DrawerSection>
                <DrawerTitle>Best For</DrawerTitle>
                <BestForList aria-label={`${selectedMatchProduct.name} best for`}>
                  {selectedMatchProduct.best_for.map((item) => (
                    <BestForPill key={item}>{item}</BestForPill>
                  ))}
                </BestForList>
              </DrawerSection>
            )}
          </DrawerContent>
        )}
      </InsightDrawer>
    </>
  );
};

export default ProductRecommendations;
