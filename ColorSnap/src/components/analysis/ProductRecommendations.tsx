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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: var(--space-6);

  @media (max-width: 820px) {
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
  analysisId?: string | null;
};

type PriceFilter = 'all' | 'under-10' | '10-25' | '25-plus';
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

  if (priceFilter === 'under-10') {
    return price < 10;
  }

  if (priceFilter === '10-25') {
    return price >= 10 && price <= 25;
  }

  return price > 25;
};

const ProductRecommendations: React.FC<Props> = ({
  products = [],
  activeFilter,
  onFilterChange,
  onAddToCart,
  analysisId
}) => {
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [retailerFilter, setRetailerFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('best-match');
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const retailers = useMemo(
    () => Array.from(new Set(products.map((product) => getRetailerName(product.purchase_url)))).sort(),
    [products]
  );
  const filteredProducts = useMemo(() => {
    const nextProducts = products
      .filter((product) => activeFilter === 'all' || product.category === activeFilter)
      .filter((product) => matchesPriceFilter(product, priceFilter))
      .filter((product) => retailerFilter === 'all' || getRetailerName(product.purchase_url) === retailerFilter);

    return [...nextProducts].sort((first, second) => {
      if (sortMode === 'price-low') {
        return parseFloat(first.price) - parseFloat(second.price);
      }

      if (sortMode === 'price-high') {
        return parseFloat(second.price) - parseFloat(first.price);
      }

      return second.score - first.score;
    });
  }, [activeFilter, priceFilter, products, retailerFilter, sortMode]);

  return (
    <>
      <RecommendationIntro>
        <strong>Best Match</strong> ranks products by palette match, undertone fit, saturation, brightness,
        and contrast support. Use filters to narrow the list by category, price, or retailer.
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
            <option value="under-10">Under $10</option>
            <option value="10-25">$10-$25</option>
            <option value="25-plus">$25+</option>
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
          No products match these filters. Try broadening the category, price, or retailer selection.
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
            <ProductInfo><strong>Shade:</strong> {product.shade}</ProductInfo>
            <ProductInfo><strong>Category:</strong> {formatLabel(product.category)}</ProductInfo>
            <ProductInfo><strong>Retailer:</strong> {getRetailerName(product.purchase_url)}</ProductInfo>
            <ProductInfo><strong>Match Score:</strong> {product.score}</ProductInfo>
            <ProductInfo><strong>Price:</strong> ${product.price}</ProductInfo>
            <ProductInfo>{product.short_description || `${product.shade} selected for your palette.`}</ProductInfo>
            <ProductInfo>{product.reason}</ProductInfo>
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
