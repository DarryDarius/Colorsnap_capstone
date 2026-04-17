import React from 'react';
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

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
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

const ProductRecommendations: React.FC<Props> = ({
  products = [],
  activeFilter,
  onFilterChange,
  onAddToCart,
  analysisId
}) => {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter((product) => product.category === activeFilter);

  return (
    <>
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
