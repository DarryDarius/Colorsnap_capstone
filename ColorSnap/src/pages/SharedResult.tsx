import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getShare, type ShareRecord } from '../services/api';

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
  max-width: var(--container-md);
  margin: 0 auto;
`;

const Card = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-7) var(--space-6);
  text-align: center;

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4);
  }
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
  font-size: clamp(2.25rem, 6vw, var(--font-4xl));
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
  margin: 0 auto var(--space-6);
  max-width: 680px;
`;

const Palette = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  margin: 0 auto var(--space-6);
  max-width: 760px;
`;

const SwatchCard = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: var(--space-3);
`;

const Swatch = styled.div<{ $color: string }>`
  aspect-ratio: 1;
  background: ${(props) => props.$color};
  border: 1px solid rgba(24, 20, 20, 0.1);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
`;

const SwatchName = styled.p`
  color: var(--text-primary);
  font-size: var(--font-sm);
  font-weight: 800;
`;

const Actions = styled.div`
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

const SharedResult: React.FC = () => {
  const { shareId } = useParams();
  const [share, setShare] = useState<ShareRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shareId) {
      setError('No shared result was specified.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    getShare(shareId)
      .then((nextShare) => {
        if (!isMounted) return;
        setShare(nextShare);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load shared result.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shareId]);

  return (
    <PageShell>
      <Container>
        <Card>
          {isLoading && (
            <>
              <Eyebrow>Shared ColorSnap result</Eyebrow>
              <Title>Loading shared result</Title>
              <Description>We are preparing this shared palette.</Description>
            </>
          )}

          {!isLoading && error && (
            <>
              <Eyebrow>Shared ColorSnap result</Eyebrow>
              <Title>Result unavailable</Title>
              <Description>{error}</Description>
              <Actions>
                <PrimaryLink to="/analysis">Create Your Own Analysis</PrimaryLink>
              </Actions>
            </>
          )}

          {!isLoading && share && (
            <>
              <Eyebrow>Shared ColorSnap result</Eyebrow>
              <Title>{share.primary_season}</Title>
              <Description>{share.description}</Description>
              <Palette aria-label="Shared result palette">
                {share.palette.map((color) => (
                  <SwatchCard key={`${color.name}-${color.hex}`}>
                    <Swatch $color={color.hex} />
                    <SwatchName>{color.name}</SwatchName>
                  </SwatchCard>
                ))}
              </Palette>
              <Actions>
                <PrimaryLink to="/analysis">Create Your Own Analysis</PrimaryLink>
                <SecondaryLink to="/">Visit ColorSnap</SecondaryLink>
              </Actions>
            </>
          )}
        </Card>
      </Container>
    </PageShell>
  );
};

export default SharedResult;
