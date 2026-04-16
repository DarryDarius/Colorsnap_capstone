import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { ProductRecommendation } from '../../types/analysis';
import { formatLabel } from '../../utils/formatters';

const FilterBar = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$active ? '#d9793f' : '#f092d8')};
  border: none;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${(props) => (props.$active ? '600' : '400')};

  &:hover {
    background: #d9793f;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: #ffebd4;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
`;

const Badge = styled.span`
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  color: #915341;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
`;

const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  margin-bottom: 1rem;
  object-fit: cover;
`;

const ProductTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  color: #c655ad;
`;

const ProductBrand = styled.p`
  color: #915341;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 0.85rem;
  text-transform: uppercase;
`;

const ProductInfo = styled.p`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  border: none;
  color: #fff;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #d9793f;
    transform: translateY(-2px);
  }
`;

const PurchaseLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 8px;
  color: #915341;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.3s ease, background 0.3s ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-2px);
  }
`;

const DetailLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(145, 83, 65, 0.1);
  border-radius: 8px;
  color: #915341;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.3s ease, background 0.3s ease;

  &:hover {
    background: rgba(145, 83, 65, 0.18);
    transform: translateY(-2px);
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
              {product.purchase_url && (
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
