import React from 'react';
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

const ProductImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ProductTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #c655ad;
`;

const ProductInfo = styled.p`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #2c2c2c;
`;

const AddToCartButton = styled.button`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  border: none;
  color: #fff;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: #d9793f;
    transform: translateY(-2px);
  }
`;

type Props = {
  products?: ProductRecommendation[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAddToCart: (product: ProductRecommendation) => void;
};

const ProductRecommendations: React.FC<Props> = ({
  products = [],
  activeFilter,
  onFilterChange,
  onAddToCart
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
            <ProductInfo><strong>Shade:</strong> {product.shade}</ProductInfo>
            <ProductInfo><strong>Category:</strong> {formatLabel(product.category)}</ProductInfo>
            <ProductInfo><strong>Match Score:</strong> {product.score}</ProductInfo>
            <ProductInfo><strong>Price:</strong> ${product.price}</ProductInfo>
            <ProductInfo>{product.reason}</ProductInfo>
            <AddToCartButton onClick={() => onAddToCart(product)}>
              Add to Cart
            </AddToCartButton>
          </ProductCard>
        ))}
      </ProductsGrid>
    </>
  );
};

export default ProductRecommendations;
