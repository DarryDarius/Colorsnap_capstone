import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { CartItem } from '../utils/cart';
import { clearCartItems, getCartTotal, readCartItems } from '../utils/cart';
import { formatLabel } from '../utils/formatters';

const PaymentContainer = styled.div`
  max-width: 1000px;
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

const PaymentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderSummary = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  height: fit-content;
`;

const SummaryTitle = styled.h3`
  color: #f96ed6;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const CartItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h4`
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  color: #333;
`;

const ItemPrice = styled.p`
  margin: 0;
  color: #f96ed6;
  font-weight: 600;
  font-size: 0.9rem;
`;

const ItemMeta = styled.p`
  margin: 0;
  color: #777;
  font-size: 0.8rem;
`;

const TotalSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  text-align: right;
`;

const TotalAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #f96ed6;
`;

const PaymentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f96ed6;
  }
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: #d9793f;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
`;

const Payment: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setCartItems(readCartItems());
  }, []);

  const calculateTotal = () => {
    return getCartTotal(cartItems);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Clear cart after successful payment
      clearCartItems();
      setCartItems([]);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          cardNumber: '',
          cardName: '',
          expiry: '',
          cvv: '',
          email: ''
        });
        setIsSuccess(false);
      }, 5000);
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <PaymentContainer>
        <Title>Payment</Title>
        <p>Your cart is empty. Please add items to your cart before proceeding to payment.</p>
      </PaymentContainer>
    );
  }

  return (
    <PaymentContainer>
      <Title>Payment</Title>
      
      {isSuccess && (
        <SuccessMessage>
          Payment successful! Thank you for your purchase. You will receive a confirmation email shortly.
        </SuccessMessage>
      )}

      <PaymentLayout>
        <PaymentForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="cardName">Cardholder Name *</Label>
            <Input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </FormGroup>

          <CardRow>
            <FormGroup>
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                type="text"
                id="expiry"
                name="expiry"
                value={formData.expiry}
                onChange={handleInputChange}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength={4}
                required
              />
            </FormGroup>
          </CardRow>

          <SubmitButton type="submit" disabled={isProcessing}>
            {isProcessing ? 'Processing Payment...' : `Pay $${calculateTotal().toFixed(2)}`}
          </SubmitButton>
        </PaymentForm>

        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          {cartItems.map((item, index) => (
            <CartItemRow key={item.id || index}>
              <ItemImage src={item.image} alt={item.name} />
              <ItemDetails>
                <ItemName>{item.name}</ItemName>
                <ItemMeta>
                  {[item.category ? formatLabel(item.category) : null, item.shade]
                    .filter(Boolean)
                    .join(' • ')}
                </ItemMeta>
                <ItemPrice>
                  {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                </ItemPrice>
              </ItemDetails>
            </CartItemRow>
          ))}
          <TotalSection>
            <TotalAmount>Total: ${calculateTotal().toFixed(2)}</TotalAmount>
          </TotalSection>
        </OrderSummary>
      </PaymentLayout>
    </PaymentContainer>
  );
};

export default Payment;
