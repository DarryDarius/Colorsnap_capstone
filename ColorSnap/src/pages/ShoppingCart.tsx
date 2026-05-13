import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { CartItem } from '../utils/cart';
import { clearCartItems, readCartItems, writeCartItems } from '../utils/cart';
import { DEMO_PROMO_CODE, calculateCheckoutQuote, formatMoney } from '../utils/checkout';
import { formatLabel, isRealExternalUrl } from '../utils/formatters';

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
  display: grid;
  gap: var(--space-2);
  grid-template-columns: 1fr auto;
  line-height: 1.6;
  margin-bottom: var(--space-6);
  padding: var(--space-4);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ContextTitle = styled.strong`
  color: var(--accent-olive);
`;

const ContextMeta = styled.span`
  color: var(--text-secondary);
  font-size: var(--font-sm);
`;

const CartLayout = styled.div`
  align-items: start;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 1fr) 360px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ItemsList = styled.div`
  display: grid;
  gap: var(--space-4);
`;

const CartCard = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 132px minmax(0, 1fr) auto;
  padding: var(--space-4);

  @media (max-width: 760px) {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ItemImage = styled.img`
  aspect-ratio: 1;
  background: var(--surface-warm);
  border-radius: var(--radius-md);
  object-fit: cover;
  width: 100%;
`;

const ItemBody = styled.div`
  display: grid;
  gap: var(--space-3);
`;

const Brand = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const ItemName = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  line-height: 1.2;
`;

const ItemMeta = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
`;

const MatchReason = styled.p`
  color: var(--text-secondary);
  line-height: 1.65;
`;

const ItemActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const TextLink = styled(Link)`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  padding: 0.65rem 0.8rem;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const ExternalLink = styled.a`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  padding: 0.65rem 0.8rem;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const ItemControls = styled.div`
  align-items: end;
  display: grid;
  gap: var(--space-3);
  justify-items: end;

  @media (max-width: 760px) {
    grid-column: 1 / -1;
    justify-items: stretch;
  }
`;

const ItemPrice = styled.p`
  color: var(--text-primary);
  font-size: var(--font-xl);
  font-weight: 800;
`;

const QuantityControls = styled.div`
  align-items: center;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: inline-grid;
  grid-template-columns: 40px 48px 40px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  background: var(--surface-warm);
  color: var(--text-primary);
  font-weight: 800;
  min-height: 40px;

  &:hover {
    background: var(--brand-primary-pale);
  }
`;

const QuantityValue = styled.span`
  color: var(--text-primary);
  font-weight: 800;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: transparent;
  color: var(--error);
  font-size: var(--font-sm);
  font-weight: 800;
`;

const SourceBadge = styled.span`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  display: inline-flex;
  font-size: var(--font-xs);
  font-weight: 800;
  padding: 0.35rem 0.55rem;
  width: fit-content;
`;

const SummaryCard = styled.aside`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
  position: sticky;
  top: 96px;

  @media (max-width: 980px) {
    position: static;
  }
`;

const SummaryTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  margin-bottom: var(--space-4);
`;

const SummaryLine = styled.div`
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
  padding: var(--space-3) 0;
`;

const TotalLine = styled(SummaryLine)`
  border-bottom: 0;
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: 800;
`;

const SummaryNote = styled.p`
  color: var(--text-muted);
  font-size: var(--font-sm);
  line-height: 1.6;
  margin: var(--space-4) 0;
`;

const PromoBox = styled.div`
  border-bottom: 1px solid var(--border-soft);
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4) 0;
`;

const PromoLabel = styled.label`
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 800;
`;

const PromoInputRow = styled.div`
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(0, 1fr) auto;
`;

const PromoInput = styled.input`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  min-width: 0;
  padding: 0.7rem 0.8rem;
`;

const PromoButton = styled.button`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 800;
  padding: 0.7rem 0.8rem;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const PromoStatus = styled.p<{ $applied?: boolean }>`
  color: ${(props) => (props.$applied ? 'var(--success)' : 'var(--text-muted)')};
  font-size: var(--font-sm);
  margin: 0;
`;

const ButtonStack = styled.div`
  display: grid;
  gap: var(--space-3);
`;

const PrimaryButton = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
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

const EmptyState = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-7) var(--space-6);
  text-align: center;
`;

const EmptyTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-2xl);
  margin-bottom: var(--space-3);
`;

const EmptyCopy = styled.p`
  color: var(--text-secondary);
  margin: 0 auto var(--space-5);
  max-width: 560px;
`;

const EmptyActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
`;

const EmptyLink = styled(Link)`
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

const EmptySecondaryLink = styled(Link)`
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

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(readCartItems());
    setLastAnalysisId(localStorage.getItem('lastAnalysisId'));
    setAppliedPromoCode(localStorage.getItem('checkoutPromoCode') || '');
  }, []);

  const syncCart = (items: CartItem[]) => {
    setCartItems(items);
    writeCartItems(items);
  };

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    const nextItems = cartItems
      .map((item) => (
        item.id === itemId
          ? { ...item, quantity: Math.max(0, nextQuantity) }
          : item
      ))
      .filter((item) => item.quantity > 0);

    syncCart(nextItems);
  };

  const removeItem = (itemId: string) => {
    syncCart(cartItems.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all personalized picks from your cart?')) {
      setCartItems([]);
      clearCartItems();
    }
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const quote = calculateCheckoutQuote(cartItems, appliedPromoCode);

  const applyPromo = () => {
    const normalizedCode = promoCode.trim().toUpperCase();
    setAppliedPromoCode(normalizedCode);
    localStorage.setItem('checkoutPromoCode', normalizedCode);
  };

  const handleCheckout = () => {
    localStorage.setItem('checkoutPromoCode', appliedPromoCode);
    navigate('/payment');
  };

  return (
    <PageShell>
      <Container>
        <HeaderBlock>
          <Eyebrow>Personalized cart</Eyebrow>
          <Title>Your Shopping Cart</Title>
          <Description>
            Review the color-matched products you saved, adjust quantities, or purchase through trusted retailers.
          </Description>
        </HeaderBlock>

        <ContextStrip>
          <div>
            <ContextTitle>Personalized recommendations stay connected to your color report.</ContextTitle>
            <br />
            Cart items keep their shade, category, and match reason so checkout feels like part of the same consultation flow.
          </div>
          <ContextMeta>{itemCount} saved item{itemCount === 1 ? '' : 's'}</ContextMeta>
        </ContextStrip>

        {cartItems.length === 0 ? (
          <EmptyState>
            <EmptyTitle>Your cart is ready for personalized picks.</EmptyTitle>
            <EmptyCopy>
              Start a color analysis to generate product recommendations, or return to your latest report.
            </EmptyCopy>
            <EmptyActions>
              <EmptyLink to="/analysis">Start Analysis</EmptyLink>
              {lastAnalysisId && (
                <EmptySecondaryLink to={`/result?id=${encodeURIComponent(lastAnalysisId)}`}>
                  View Latest Result
                </EmptySecondaryLink>
              )}
            </EmptyActions>
          </EmptyState>
        ) : (
          <CartLayout>
            <ItemsList>
              {cartItems.map((item) => {
                const detailsUrl = item.slug
                  ? `/products/${encodeURIComponent(item.slug)}${item.analysisId ? `?analysis_id=${encodeURIComponent(item.analysisId)}` : ''}`
                  : null;

                return (
                  <CartCard key={item.id}>
                    <ItemImage src={item.image} alt={item.name} />
                    <ItemBody>
                      <div>
                        <Brand>{item.brand || 'Curated Match'}</Brand>
                        <ItemName>{item.name}</ItemName>
                      </div>
                      <ItemMeta>
                        {[item.category ? formatLabel(item.category) : null, item.shade]
                          .filter(Boolean)
                          .join(' | ')}
                      </ItemMeta>
                      {item.analysisId && <SourceBadge>Saved from analysis result</SourceBadge>}
                      {item.sourceLookId && <SourceBadge>Part of a saved look</SourceBadge>}
                      {typeof item.matchScore === 'number' && <SourceBadge>{item.matchScore}% match</SourceBadge>}
                      <MatchReason>{item.matchReason || item.description}</MatchReason>
                      <ItemActions>
                        {detailsUrl && <TextLink to={detailsUrl}>View Details</TextLink>}
                        {isRealExternalUrl(item.purchaseUrl) && (
                          <ExternalLink href={item.purchaseUrl} target="_blank" rel="noreferrer">
                            Buy from {item.retailerName || 'Retailer'}
                          </ExternalLink>
                        )}
                      </ItemActions>
                    </ItemBody>
                    <ItemControls>
                      <ItemPrice>${(parseFloat(item.price) * item.quantity).toFixed(2)}</ItemPrice>
                      <QuantityControls aria-label={`${item.name} quantity`}>
                        <QuantityButton type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          -
                        </QuantityButton>
                        <QuantityValue>{item.quantity}</QuantityValue>
                        <QuantityButton type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          +
                        </QuantityButton>
                      </QuantityControls>
                      <RemoveButton type="button" onClick={() => removeItem(item.id)}>
                        Remove
                      </RemoveButton>
                    </ItemControls>
                  </CartCard>
                );
              })}
            </ItemsList>

            <SummaryCard>
              <SummaryTitle>Order Summary</SummaryTitle>
              <SummaryLine>
                <span>Items</span>
                <span>{itemCount}</span>
              </SummaryLine>
              <SummaryLine>
                <span>Subtotal</span>
                <span>{formatMoney(quote.subtotal)}</span>
              </SummaryLine>
              <PromoBox>
                <PromoLabel htmlFor="promoCode">Promo code</PromoLabel>
                <PromoInputRow>
                  <PromoInput
                    id="promoCode"
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder={DEMO_PROMO_CODE}
                  />
                  <PromoButton type="button" onClick={applyPromo}>Apply</PromoButton>
                </PromoInputRow>
                <PromoStatus $applied={quote.promoApplied}>
                  {quote.promoApplied
                    ? `${DEMO_PROMO_CODE} applied for 10% off.`
                    : `Demo code: ${DEMO_PROMO_CODE}`}
                </PromoStatus>
              </PromoBox>
              {quote.discount > 0 && (
                <SummaryLine>
                  <span>Discount</span>
                  <span>-{formatMoney(quote.discount)}</span>
                </SummaryLine>
              )}
              <SummaryLine>
                <span>Estimated shipping</span>
                <span>{quote.shipping === 0 ? 'Free' : formatMoney(quote.shipping)}</span>
              </SummaryLine>
              <SummaryLine>
                <span>Estimated tax</span>
                <span>{formatMoney(quote.tax)}</span>
              </SummaryLine>
              <TotalLine>
                <span>Estimated total</span>
                <span>{formatMoney(quote.total)}</span>
              </TotalLine>
              <SummaryNote>
                ColorSnap helps you build a personalized cart. Purchases are completed through trusted retailers,
                while checkout remains a demo flow for this capstone.
              </SummaryNote>
              <ButtonStack>
                <PrimaryButton type="button" onClick={handleCheckout}>
                  Continue to Demo Checkout
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => navigate('/analysis')}>
                  Continue Shopping
                </SecondaryButton>
                <SecondaryButton type="button" onClick={handleClearCart}>
                  Clear Cart
                </SecondaryButton>
              </ButtonStack>
            </SummaryCard>
          </CartLayout>
        )}
      </Container>
    </PageShell>
  );
};

export default ShoppingCart;
