import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { deleteSavedLook, getSavedLooks, updateSavedLook } from '../services/api';
import type { ProductRecommendation, SavedLookRecord } from '../types/analysis';
import { addProductToCart } from '../utils/cart';
import { formatLabel } from '../utils/formatters';

const PageShell = styled.section`
  background: var(--bg-page);
  min-height: calc(100vh - 72px);
  padding: var(--space-7) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

const Container = styled.div`
  display: grid;
  gap: var(--space-5);
  margin: 0 auto;
  max-width: var(--container-lg);
`;

const Header = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2rem, 5vw, var(--font-3xl));
  line-height: 1.1;
  margin-bottom: var(--space-3);
`;

const Copy = styled.p`
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 720px;
`;

const LookGrid = styled.div`
  display: grid;
  gap: var(--space-4);
`;

const LookCard = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
`;

const FieldGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  color: var(--text-primary);
  display: grid;
  font-size: var(--font-sm);
  font-weight: 800;
  gap: var(--space-2);
`;

const Input = styled.input`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font: inherit;
  min-height: 44px;
  padding: 0.65rem 0.8rem;
`;

const ProductGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const ProductCard = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
`;

const ProductImage = styled.img`
  aspect-ratio: 4 / 3;
  background: var(--surface);
  border-radius: var(--radius-md);
  object-fit: cover;
  width: 100%;
`;

const ProductName = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-md);
  line-height: 1.3;
`;

const Meta = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
  line-height: 1.55;
  margin: 0;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  background: ${(props) => (
    props.$variant === 'primary'
      ? 'var(--brand-primary)'
      : props.$variant === 'danger'
        ? '#FFF4F2'
        : 'var(--surface)'
  )};
  border: 1px solid ${(props) => (
    props.$variant === 'primary'
      ? 'var(--brand-primary)'
      : props.$variant === 'danger'
        ? '#F0C9C3'
        : 'var(--border-soft)'
  )};
  border-radius: var(--radius-md);
  color: ${(props) => (
    props.$variant === 'primary'
      ? 'var(--text-inverse)'
      : props.$variant === 'danger'
        ? 'var(--error)'
        : 'var(--text-primary)'
  )};
  font-size: var(--font-sm);
  font-weight: 800;
  padding: 0.65rem 0.9rem;
`;

const ActionLink = styled(Link)<{ $variant?: 'primary' }>`
  background: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary)' : 'var(--surface)')};
  border: 1px solid ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary)' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$variant === 'primary' ? 'var(--text-inverse)' : 'var(--text-primary)')};
  font-size: var(--font-sm);
  font-weight: 800;
  padding: 0.65rem 0.9rem;

  &:hover {
    background: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary-hover)' : 'var(--brand-primary-pale)')};
    border-color: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary-hover)' : 'var(--brand-primary-soft)')};
  }
`;

const StatusBox = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  padding: var(--space-4);
`;

const EmptyState = styled(StatusBox)`
  color: var(--text-secondary);
  text-align: center;
`;

const SavedLooks: React.FC = () => {
  const [looks, setLooks] = useState<SavedLookRecord[]>([]);
  const [status, setStatus] = useState('Loading saved looks.');
  const analysisId = localStorage.getItem('lastAnalysisId');

  useEffect(() => {
    let isMounted = true;

    const loadLooks = async () => {
      try {
        const response = await getSavedLooks(analysisId);
        if (!isMounted) return;
        setLooks(response.items);
        setStatus(response.items.length > 0 ? 'Saved looks loaded.' : 'No saved looks yet.');
      } catch (err) {
        if (isMounted) {
          setStatus(err instanceof Error ? err.message : 'Unable to load saved looks.');
        }
      }
    };

    void loadLooks();

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  const updateLookState = (nextLook: SavedLookRecord) => {
    setLooks((currentLooks) => currentLooks.map((look) => (
      look.look_id === nextLook.look_id ? nextLook : look
    )));
  };

  const handleLookFieldChange = async (
    look: SavedLookRecord,
    field: 'name' | 'occasion' | 'notes',
    value: string
  ) => {
    const nextLook = { ...look, [field]: value };
    updateLookState(nextLook);

    try {
      updateLookState(await updateSavedLook(look.look_id, { [field]: value }));
      setStatus('Look updated.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to update look.');
    }
  };

  const handleRemoveProduct = async (look: SavedLookRecord, productId: string) => {
    const nextProducts = look.products.filter((product) => product.id !== productId);
    updateLookState({ ...look, products: nextProducts });

    try {
      updateLookState(await updateSavedLook(look.look_id, { products: nextProducts }));
      setStatus('Product removed from look.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to remove product.');
    }
  };

  const handleDeleteLook = async (lookId: string) => {
    try {
      await deleteSavedLook(lookId);
      setLooks((currentLooks) => currentLooks.filter((look) => look.look_id !== lookId));
      setStatus('Look deleted.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to delete look.');
    }
  };

  const handleAddLookToCart = (look: SavedLookRecord) => {
    look.products.forEach((product: ProductRecommendation) => {
      addProductToCart(product, {
        analysisId: look.analysis_id,
        description: product.reason,
        source: 'recommendation',
        sourceLookId: look.look_id
      });
    });
    setStatus(`${look.products.length} products from ${look.name} were added to your cart.`);
  };

  return (
    <PageShell>
      <Container>
        <Header>
          <Title>Saved Looks</Title>
          <Copy>
            Build complete beauty routines from your personalized recommendations, then send a full look to cart when you are ready.
          </Copy>
        </Header>

        <StatusBox>{status}</StatusBox>

        {looks.length === 0 ? (
          <EmptyState>Save products from your analysis result to start building a look.</EmptyState>
        ) : (
          <LookGrid>
            {looks.map((look) => (
              <LookCard key={look.look_id}>
                <FieldGrid>
                  <Field>
                    Look name
                    <Input
                      value={look.name}
                      onChange={(event) => handleLookFieldChange(look, 'name', event.target.value)}
                    />
                  </Field>
                  <Field>
                    Occasion
                    <Input
                      value={look.occasion}
                      onChange={(event) => handleLookFieldChange(look, 'occasion', event.target.value)}
                    />
                  </Field>
                  <Field>
                    Notes
                    <Input
                      value={look.notes || ''}
                      onChange={(event) => handleLookFieldChange(look, 'notes', event.target.value)}
                    />
                  </Field>
                </FieldGrid>

                <ProductGrid>
                  {look.products.map((product) => (
                    <ProductCard key={product.id}>
                      <ProductImage src={product.image} alt={product.name} />
                      <ProductName>{product.name}</ProductName>
                      <Meta>{product.brand} · {formatLabel(product.category)} · ${product.price}</Meta>
                      <Meta>{product.match_summary || product.reason}</Meta>
                      <ActionRow>
                        <Button type="button" onClick={() => handleRemoveProduct(look, product.id)}>
                          Remove
                        </Button>
                      </ActionRow>
                    </ProductCard>
                  ))}
                </ProductGrid>

                <ActionRow>
                  <Button
                    type="button"
                    $variant="primary"
                    disabled={look.products.length === 0}
                    onClick={() => handleAddLookToCart(look)}
                  >
                    Add Full Look to Cart
                  </Button>
                  <ActionLink
                    $variant="primary"
                    to={`/booking?expert=ex1&analysis_id=${encodeURIComponent(look.analysis_id)}&saved_look_id=${encodeURIComponent(look.look_id)}`}
                  >
                    Book with This Look
                  </ActionLink>
                  <ActionLink to={`/result?id=${encodeURIComponent(look.analysis_id)}`}>
                    View Analysis
                  </ActionLink>
                  <Button type="button" $variant="danger" onClick={() => handleDeleteLook(look.look_id)}>
                    Delete Look
                  </Button>
                </ActionRow>
              </LookCard>
            ))}
          </LookGrid>
        )}
      </Container>
    </PageShell>
  );
};

export default SavedLooks;
