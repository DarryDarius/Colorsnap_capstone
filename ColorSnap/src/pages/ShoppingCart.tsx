import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #f96ed6;
  margin-bottom: 2rem;
  font-size: 2.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CartItems = styled.div`
  margin-top: 2rem;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 1.5rem 0;
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
`;

const ItemDetails = styled.div`
  flex: 1;
  margin-left: 1rem;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ItemName = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #333;
`;

const ItemDescription = styled.p`
  margin: 0;
  color: #888;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ItemPrice = styled.div`
  font-size: 1.2rem;
  color: #f96ed6;
  font-weight: 600;
`;

const TotalSection = styled.div`
  text-align: right;
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  padding-top: 1rem;
  border-top: 2px solid #eee;
`;

const Actions = styled.div`
  text-align: right;
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #d9793f;
    transform: translateY(-2px);
  }

  &.secondary {
    background: #6c757d;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  margin-top: 2rem;
  padding: 2rem;
`;

interface CartItem {
  name: string;
  price: string;
  image: string;
  description: string;
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    setCartItems(items);
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price);
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      window.alert('Your cart is empty!');
    } else {
      navigate('/payment');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      setCartItems([]);
      localStorage.setItem('shoppingCart', JSON.stringify([]));
    }
  };

  return (
    <Container>
      <Title>Your Shopping Cart</Title>
      
      <CartItems>
        {cartItems.length === 0 ? (
          <EmptyMessage>Your cart is empty.</EmptyMessage>
        ) : (
          cartItems.map((item, index) => (
            <CartItem key={index}>
              <ItemImage src={item.image} alt={item.name} />
              <ItemDetails>
                <ItemName>{item.name}</ItemName>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemDetails>
              <ItemPrice>${parseFloat(item.price).toFixed(2)}</ItemPrice>
            </CartItem>
          ))
        )}
      </CartItems>
      
      {cartItems.length > 0 && (
        <TotalSection>
          Total: ${calculateTotal().toFixed(2)}
        </TotalSection>
      )}
      
      <Actions>
        <ActionButton 
          className="secondary" 
          onClick={handleClearCart}
        >
          Clear Cart
        </ActionButton>
        <ActionButton onClick={handleCheckout}>
          Checkout
        </ActionButton>
      </Actions>
    </Container>
  );
};

export default ShoppingCart;
