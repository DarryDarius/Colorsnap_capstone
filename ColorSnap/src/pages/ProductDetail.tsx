import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { getProductDetail } from '../services/api';
import type { ProductDetail as ProductDetailType, ProductRecommendation } from '../types/analysis';
import { addProductToCart } from '../utils/cart';
import { formatLabel } from '../utils/formatters';

const PageShell = styled.section`
  min-height: calc(100vh - 72px);
  background:
    radial-gradient(circle at top right, rgba(216, 100, 122, 0.09), transparent 32%),
    linear-gradient(180deg, rgba(255, 247, 245, 0.82), rgba(255, 252, 250, 0)),
    var(--bg-page);
  padding: var(--space-7) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

const Container = styled.div`
  max-width: var(--container-lg);
  margin: 0 auto;
  display: grid;
  gap: var(--space-6);
`;

const Breadcrumb = styled.div`
  color: var(--text-secondary);
  font-size: var(--font-sm);
`;

const Hero = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
  gap: var(--space-6);
  padding: var(--space-6);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  object-fit: cover;
  background: var(--surface-warm);
`;

const ImagePanel = styled.div`
  display: grid;
  gap: var(--space-3);
  align-content: start;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: var(--space-2);
`;

const GalleryThumb = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? 'var(--brand-primary-pale)' : 'var(--surface-warm)')};
  border: 1px solid ${(props) => (props.$active ? 'var(--brand-primary)' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  padding: 0;
  overflow: hidden;

  img {
    aspect-ratio: 1 / 1;
    display: block;
    object-fit: cover;
    width: 100%;
  }
`;

const ProductInfo = styled.div`
  display: grid;
  gap: var(--space-4);
  align-content: start;
`;

const Brand = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.05;
`;

const Summary = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
`;

const MetaCard = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: var(--space-4);
`;

const MetaLabel = styled.p`
  color: var(--text-muted);
  font-size: var(--font-sm);
  margin-bottom: var(--space-2);
`;

const MetaValue = styled.p`
  color: var(--text-primary);
  font-weight: 700;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const Badge = styled.span`
  background: var(--brand-primary-pale);
  border-radius: 999px;
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  padding: 0.45rem 0.8rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const ActionButton = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 700;
  padding: 0.85rem 1.15rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

const PurchaseLink = styled.a`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 700;
  padding: 0.85rem 1.15rem;
  text-decoration: none;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
    transform: translateY(-1px);
  }
`;

const SecondaryLink = styled(Link)`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 700;
  padding: 0.85rem 1.15rem;
  text-decoration: none;

  &:hover {
    background: var(--surface-warm);
    border-color: var(--brand-primary-soft);
    transform: translateY(-1px);
  }
`;

const PersonalizationNote = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
`;

const Section = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-2xl);
  margin-bottom: var(--space-4);
`;

const BodyCopy = styled.p`
  color: var(--text-secondary);
  line-height: 1.8;
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.8;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
`;

const RelatedCard = styled(Link)`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: inherit;
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  text-decoration: none;

  &:hover {
    border-color: var(--brand-primary-soft);
    transform: translateY(-2px);
  }
`;

const RelatedImage = styled.img`
  width: 100%;
  border-radius: var(--radius-md);
`;

const StatusBox = styled(Section)`
  text-align: center;
`;

const EmptyText = styled.p`
  color: var(--text-secondary);
`;

const ProductDetail: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const analysisId = searchParams.get('analysis_id');

  useEffect(() => {
    if (!slug) {
      setError('No product was specified.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const nextProduct = await getProductDetail(slug, analysisId);
        if (!isMounted) return;

        setProduct(nextProduct);
        setSelectedImage(nextProduct.image);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load product details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [analysisId, slug]);

  const handleAddToCart = (item: ProductRecommendation | ProductDetailType) => {
    const { item: cartItem } = addProductToCart(item, {
      analysisId,
      description: 'why_it_matches_you' in item ? item.short_description : item.reason,
      source: 'why_it_matches_you' in item ? 'detail' : 'recommendation'
    });
    window.alert(`${item.name} is in your cart (${cartItem.quantity}).`);
  };

  if (isLoading) {
    return (
      <PageShell>
        <Container>
          <StatusBox>
            <SectionTitle>Loading Product</SectionTitle>
            <EmptyText>We are gathering the product details and personalized matching notes.</EmptyText>
          </StatusBox>
        </Container>
      </PageShell>
    );
  }

  if (error || !product) {
    return (
      <PageShell>
        <Container>
          <StatusBox>
            <SectionTitle>Product Unavailable</SectionTitle>
            <EmptyText>{error || 'This product could not be loaded.'}</EmptyText>
            <ActionRow style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <ActionButton onClick={() => navigate(-1)}>Go Back</ActionButton>
            </ActionRow>
          </StatusBox>
        </Container>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Container>
        <Breadcrumb>
          <Link to="/result">Analysis Result</Link> / <span>{product.name}</span>
        </Breadcrumb>

        <Hero>
          <ImagePanel>
            <ProductImage src={selectedImage || product.image} alt={product.name} />
            {product.gallery.length > 1 && (
              <GalleryGrid aria-label="Product gallery">
                {product.gallery.map((image) => (
                  <GalleryThumb
                    key={image}
                    type="button"
                    $active={(selectedImage || product.image) === image}
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View ${product.name} image`}
                  >
                    <img src={image} alt="" />
                  </GalleryThumb>
                ))}
              </GalleryGrid>
            )}
          </ImagePanel>

          <ProductInfo>
            <div>
              <Brand>{product.brand}</Brand>
              <Title>{product.name}</Title>
            </div>

            <Summary>{product.short_description}</Summary>

            <MetaGrid>
              <MetaCard>
                <MetaLabel>Category</MetaLabel>
                <MetaValue>{formatLabel(product.category)}</MetaValue>
              </MetaCard>
              <MetaCard>
                <MetaLabel>Shade</MetaLabel>
                <MetaValue>{product.shade}</MetaValue>
              </MetaCard>
              <MetaCard>
                <MetaLabel>Price</MetaLabel>
                <MetaValue>{product.currency} {product.price}</MetaValue>
              </MetaCard>
              <MetaCard>
                <MetaLabel>Finish</MetaLabel>
                <MetaValue>{product.finish ? formatLabel(product.finish) : 'Not specified'}</MetaValue>
              </MetaCard>
              <MetaCard>
                <MetaLabel>Intensity</MetaLabel>
                <MetaValue>{product.intensity ? formatLabel(product.intensity) : 'Not specified'}</MetaValue>
              </MetaCard>
            </MetaGrid>

            <BadgeRow>
              {product.best_for.map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </BadgeRow>

            <ActionRow>
              <ActionButton onClick={() => handleAddToCart(product)}>Add to Cart</ActionButton>
              <SecondaryLink to="/shopping-cart">View Cart</SecondaryLink>
              <PurchaseLink href={product.retailer.url} target="_blank" rel="noreferrer">
                Buy from {product.retailer.name}
              </PurchaseLink>
            </ActionRow>
            {analysisId && (
              <PersonalizationNote>
                This detail view is using the matching context from your latest analysis.
              </PersonalizationNote>
            )}
          </ProductInfo>
        </Hero>

        <Section>
          <SectionTitle>Why It Matches You</SectionTitle>
          <BodyCopy>{product.why_it_matches_you}</BodyCopy>
        </Section>

        <TwoColumn>
          <Section>
            <SectionTitle>Product Notes</SectionTitle>
            <BodyCopy>{product.description}</BodyCopy>
          </Section>

          <Section>
            <SectionTitle>How To Use It</SectionTitle>
            <List>
              {product.use_cases.length > 0 ? product.use_cases.map((useCase) => (
                <li key={useCase}>{formatLabel(useCase)}</li>
              )) : <li>Use this as a versatile match for your personalized palette.</li>}
            </List>
          </Section>
        </TwoColumn>

        <TwoColumn>
          <Section>
            <SectionTitle>Best For</SectionTitle>
            <List>
              {product.best_for.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          </Section>

          <Section>
            <SectionTitle>Formula Highlights</SectionTitle>
            <List>
              {product.ingredients_highlights.length > 0 ? product.ingredients_highlights.map((item) => (
                <li key={item}>{formatLabel(item)}</li>
              )) : <li>No formula notes listed yet.</li>}
            </List>
          </Section>
        </TwoColumn>

        <Section>
          <SectionTitle>Related Picks</SectionTitle>
          {product.related_products.length > 0 ? (
            <RelatedGrid>
              {product.related_products.map((item) => (
                <RelatedCard
                  key={item.id}
                  to={`/products/${encodeURIComponent(item.slug)}${analysisId ? `?analysis_id=${encodeURIComponent(analysisId)}` : ''}`}
                >
                  <RelatedImage src={item.image} alt={item.name} />
                  <div>
                    <Brand>{item.brand}</Brand>
                    <h3>{item.name}</h3>
                  </div>
                  <BodyCopy>{item.short_description}</BodyCopy>
                  <BadgeRow>
                    {(item.badges || []).map((badge) => (
                      <Badge key={badge}>{badge}</Badge>
                    ))}
                  </BadgeRow>
                </RelatedCard>
              ))}
            </RelatedGrid>
          ) : (
            <EmptyText>No related products available yet.</EmptyText>
          )}
        </Section>
      </Container>
    </PageShell>
  );
};

export default ProductDetail;
