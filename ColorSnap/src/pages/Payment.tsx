import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { createDemoOrder } from '../services/api';
import type { CartItem } from '../utils/cart';
import { clearCartItems, readCartItems } from '../utils/cart';
import { calculateCheckoutQuote, formatMoney, type CheckoutQuote, type ShippingMethod } from '../utils/checkout';
import { formatLabel } from '../utils/formatters';

const PageShell = styled.section`
  min-height: calc(100vh - 72px);
  background:
    linear-gradient(180deg, rgba(251, 238, 241, 0.72) 0%, rgba(255, 252, 250, 0) 34%),
    var(--bg-page);
  padding: var(--space-7) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

const Container = styled.div`
  max-width: var(--container-lg);
  margin: 0 auto;
`;

const HeaderBlock = styled.div`
  margin-bottom: var(--space-6);
  max-width: 760px;
`;

const Eyebrow = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-3);
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2.25rem, 5vw, var(--font-4xl));
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
`;

const ContextStrip = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-lg);
  color: var(--accent-olive);
  line-height: 1.6;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
`;

const ContextTitle = styled.strong`
  color: var(--accent-olive);
  display: block;
  margin-bottom: var(--space-1);
`;

const CheckoutLayout = styled.div`
  align-items: start;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 1fr) 380px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);

  @media (max-width: 640px) {
    padding: var(--space-5);
  }
`;

const PanelTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  margin-bottom: var(--space-4);
`;

const DemoNotice = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
`;

const PaymentForm = styled.form`
  display: grid;
  gap: var(--space-4);
`;

const FieldGroup = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const Label = styled.label`
  color: var(--text-primary);
  font-weight: 800;
`;

const Input = styled.input`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-md);
  padding: 0.85rem 1rem;

  &:focus {
    border-color: var(--brand-primary);
  }
`;

const Select = styled.select`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-md);
  padding: 0.85rem 1rem;

  &:focus {
    border-color: var(--brand-primary);
  }
`;

const CheckboxLabel = styled.label`
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-2);
  font-weight: 700;
`;

const Checkbox = styled.input`
  accent-color: var(--brand-primary);
`;

const FieldRow = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr 1fr;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  margin-top: var(--space-2);
  padding: 0.95rem 1.1rem;

  &:hover:not(:disabled) {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    background: #E4DDDA;
    border-color: #E4DDDA;
    color: var(--text-muted);
    cursor: not-allowed;
  }
`;

const Summary = styled(Panel)`
  position: sticky;
  top: 96px;

  @media (max-width: 980px) {
    position: static;
  }
`;

const SummaryList = styled.div`
  display: grid;
  gap: var(--space-4);
`;

const SummaryItem = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 64px minmax(0, 1fr);
`;

const ItemImage = styled.img`
  aspect-ratio: 1;
  background: var(--surface-warm);
  border-radius: var(--radius-md);
  object-fit: cover;
  width: 100%;
`;

const ItemName = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-md);
  line-height: 1.25;
`;

const ItemMeta = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-top: var(--space-1);
`;

const ItemPrice = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  margin-top: var(--space-1);
`;

const TotalLine = styled.div`
  border-top: 1px solid var(--border-soft);
  color: var(--text-primary);
  display: flex;
  font-size: var(--font-lg);
  font-weight: 800;
  justify-content: space-between;
  margin-top: var(--space-5);
  padding-top: var(--space-4);
`;

const SummaryLine = styled.div`
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-3);
`;

const EmptyPanel = styled(Panel)`
  text-align: center;
`;

const EmptyCopy = styled.p`
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
`;

const PrimaryLink = styled(Link)`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
  }
`;

const SecondaryLink = styled(Link)`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const ConfirmationPanel = styled(Panel)`
  text-align: center;
`;

const ConfirmationNote = styled.div<{ $tone?: 'warning' }>`
  background: ${(props) => (props.$tone === 'warning' ? '#FFF8EC' : 'var(--surface-sage)')};
  border: 1px solid ${(props) => (props.$tone === 'warning' ? '#E8D5B8' : '#DDE8DA')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$tone === 'warning' ? 'var(--warning)' : 'var(--success)')};
  font-weight: 700;
  line-height: 1.6;
  margin: var(--space-5) auto 0;
  max-width: 680px;
  padding: var(--space-4);
`;

const ConfirmationGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  margin: var(--space-5) auto;
  max-width: 680px;
  text-align: left;
`;

const ConfirmationItem = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
`;

const formatCardNumber = (value: string) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const Payment: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);
  const [confirmedQuote, setConfirmedQuote] = useState<CheckoutQuote | null>(null);
  const [confirmedShippingMethod, setConfirmedShippingMethod] = useState<ShippingMethod>('standard');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  useEffect(() => {
    setCartItems(readCartItems());
  }, []);

  const promoCode = localStorage.getItem('checkoutPromoCode') || '';
  const quote = calculateCheckoutQuote(cartItems, promoCode, shippingMethod);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const nextValue = name === 'cardNumber'
      ? formatCardNumber(value)
      : name === 'expiry'
        ? formatExpiry(value)
        : name === 'cvv'
          ? value.replace(/\D/g, '').slice(0, 4)
          : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setOrderId(null);
    setSaveWarning(null);

    try {
      const order = await createDemoOrder(formData.email, cartItems);
      setOrderId(order.order_id);
    } catch (error) {
      setSaveWarning(
        error instanceof Error
          ? `Demo checkout completed locally, but backend order save failed: ${error.message}`
          : 'Demo checkout completed locally, but backend order save failed.'
      );
    }

    window.setTimeout(() => {
      setConfirmedItems(cartItems);
      setConfirmedQuote(quote);
      setConfirmedShippingMethod(shippingMethod);
      setIsProcessing(false);
      setIsSuccess(true);
      clearCartItems();
      setCartItems([]);
      setFormData({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      });
    }, 1200);
  };

  if (isSuccess) {
    return (
      <PageShell>
        <Container>
          <ConfirmationPanel>
            <Eyebrow>Demo order confirmed</Eyebrow>
            <Title>Checkout complete</Title>
            <Description>
              This demo checkout was processed locally for the capstone flow. No real payment was charged.
            </Description>
            {orderId && (
              <ConfirmationNote>
                Backend order record saved: {orderId}.
              </ConfirmationNote>
            )}
            {saveWarning && (
              <ConfirmationNote $tone="warning">
                {saveWarning}
              </ConfirmationNote>
            )}
            <ConfirmationGrid>
              <ConfirmationItem>
                <span>Confirmation number</span>
                <strong>{orderId || 'LOCAL-DEMO-ORDER'}</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Shipping method</span>
                <strong>{confirmedShippingMethod === 'express' ? 'Express demo shipping' : 'Standard demo shipping'}</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Estimated delivery</span>
                <strong>{confirmedShippingMethod === 'express' ? '2-3 demo business days' : '5-7 demo business days'}</strong>
              </ConfirmationItem>
              {confirmedItems.map((item) => (
                <ConfirmationItem key={item.id}>
                  <span>{item.name} x {item.quantity}</span>
                  <strong>${(parseFloat(item.price) * item.quantity).toFixed(2)}</strong>
                </ConfirmationItem>
              ))}
              <ConfirmationItem>
                <span>Total</span>
                <strong>{formatMoney(confirmedQuote?.total || 0)}</strong>
              </ConfirmationItem>
            </ConfirmationGrid>
            <ActionRow>
              <PrimaryLink to="/analysis">Start Another Analysis</PrimaryLink>
              <SecondaryLink to="/">Back Home</SecondaryLink>
            </ActionRow>
          </ConfirmationPanel>
        </Container>
      </PageShell>
    );
  }

  if (cartItems.length === 0) {
    return (
      <PageShell>
        <Container>
          <EmptyPanel>
            <Eyebrow>Demo checkout</Eyebrow>
            <Title>Your cart is empty</Title>
            <EmptyCopy>Add personalized products before continuing to checkout.</EmptyCopy>
            <ActionRow>
              <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
              <SecondaryLink to="/shopping-cart">Back to Cart</SecondaryLink>
            </ActionRow>
          </EmptyPanel>
        </Container>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Container>
        <HeaderBlock>
          <Eyebrow>Demo checkout</Eyebrow>
          <Title>Demo Checkout</Title>
          <Description>
            Complete the capstone checkout flow while keeping real purchases available through retailer links.
          </Description>
        </HeaderBlock>

        <ContextStrip>
          <ContextTitle>Checkout is part of the demo product loop.</ContextTitle>
          No real payment will be processed; the order summary is saved locally and, when available, mirrored to the demo backend.
        </ContextStrip>

        <CheckoutLayout>
          <Panel>
            <PanelTitle>Contact, shipping, and payment</PanelTitle>
            <DemoNotice>
              Demo checkout - no real payment will be processed. Test card: 4242 4242 4242 4242, any future expiry, any CVV.
            </DemoNotice>
            <PaymentForm onSubmit={handleSubmit}>
              <FieldGroup>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="address">Shipping Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Color Studio Ave"
                  required
                />
              </FieldGroup>
              <FieldRow>
                <FieldGroup>
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="state">State</Label>
                  <Input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    maxLength={2}
                    placeholder="IL"
                    required
                  />
                </FieldGroup>
              </FieldRow>
              <FieldRow>
                <FieldGroup>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    type="text"
                    id="zip"
                    name="zip"
                    inputMode="numeric"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="shippingMethod">Shipping Method</Label>
                  <Select
                    id="shippingMethod"
                    value={shippingMethod}
                    onChange={(event) => setShippingMethod(event.target.value as ShippingMethod)}
                  >
                    <option value="standard">Standard - {quote.shipping === 0 ? 'Free' : formatMoney(quote.shipping)}</option>
                    <option value="express">Express - $14.95</option>
                  </Select>
                </FieldGroup>
              </FieldRow>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                />
                Billing address same as shipping
              </CheckboxLabel>
              <FieldGroup>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  inputMode="numeric"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </FieldGroup>
              <FieldRow>
                <FieldGroup>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    type="text"
                    id="expiry"
                    name="expiry"
                    inputMode="numeric"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    type="text"
                    id="cvv"
                    name="cvv"
                    inputMode="numeric"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                  />
                </FieldGroup>
              </FieldRow>
              <SubmitButton type="submit" disabled={isProcessing}>
                {isProcessing ? 'Processing Demo Checkout...' : `Pay ${formatMoney(quote.total)}`}
              </SubmitButton>
            </PaymentForm>
          </Panel>

          <Summary>
            <PanelTitle>Order Summary</PanelTitle>
            <SummaryList>
              {cartItems.map((item) => (
                <SummaryItem key={item.id}>
                  <ItemImage src={item.image} alt={item.name} />
                  <div>
                    <ItemName>{item.name}</ItemName>
                    <ItemMeta>
                      {[item.category ? formatLabel(item.category) : null, item.shade]
                        .filter(Boolean)
                        .join(' | ')}
                    </ItemMeta>
                    <ItemPrice>
                      {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                    </ItemPrice>
                  </div>
                </SummaryItem>
              ))}
            </SummaryList>
            {quote.discount > 0 && (
              <SummaryLine>
                <span>Promo discount</span>
                <span>-{formatMoney(quote.discount)}</span>
              </SummaryLine>
            )}
            <SummaryLine>
              <span>Shipping</span>
              <span>{quote.shipping === 0 ? 'Free' : formatMoney(quote.shipping)}</span>
            </SummaryLine>
            <SummaryLine>
              <span>Estimated tax</span>
              <span>{formatMoney(quote.tax)}</span>
            </SummaryLine>
            <TotalLine>
              <span>Total</span>
              <span>{formatMoney(quote.total)}</span>
            </TotalLine>
          </Summary>
        </CheckoutLayout>
      </Container>
    </PageShell>
  );
};

export default Payment;
