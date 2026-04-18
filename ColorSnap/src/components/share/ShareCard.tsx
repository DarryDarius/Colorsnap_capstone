import React from 'react';
import styled from 'styled-components';
import type { AnalysisResult } from '../../types/analysis';

const Card = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-4);
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: var(--brand-primary-pale);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);
`;

const Brand = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  text-transform: uppercase;
`;

const Title = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-2xl);
  line-height: 1.1;
`;

const Summary = styled.p`
  color: var(--text-secondary);
  line-height: 1.65;
`;

const PreviewPhoto = styled.img`
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  object-fit: cover;
  width: 100%;
`;

const Body = styled.div`
  display: grid;
  gap: var(--space-4);
  padding: 0 var(--space-5) var(--space-5);
`;

const Palette = styled.div`
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(5, minmax(0, 1fr));
`;

const Swatch = styled.div<{ $color: string }>`
  aspect-ratio: 1;
  background: ${(props) => props.$color};
  border: 1px solid rgba(24, 20, 20, 0.1);
  border-radius: var(--radius-sm);
`;

const ProductList = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-2);
  line-height: 1.5;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ShareUrl = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  overflow-wrap: anywhere;
`;

type Props = {
  analysis: AnalysisResult;
  shareUrl?: string;
  uploadedPhoto?: string | null;
  includePhoto?: boolean;
};

const ShareCard: React.FC<Props> = ({
  analysis,
  shareUrl,
  uploadedPhoto,
  includePhoto = false
}) => {
  const palette = (analysis.recommended_palette || []).slice(0, 5);
  const products = (analysis.products || []).slice(0, 3);

  return (
    <Card aria-label="Share card preview">
      <CardHeader>
        <Brand>ColorSnap</Brand>
        <Title>{analysis.season_result?.primary || 'Color Analysis'}</Title>
        <Summary>{analysis.summary?.one_liner || 'Your personalized color report is ready.'}</Summary>
        {includePhoto && uploadedPhoto && (
          <PreviewPhoto src={uploadedPhoto} alt="Included uploaded preview" />
        )}
      </CardHeader>

      <Body>
        <Palette aria-label="Share card palette">
          {palette.map((color) => (
            <Swatch key={`${color.name}-${color.hex}`} $color={color.hex} title={color.name} />
          ))}
        </Palette>
        <ProductList>
          {products.length > 0 ? products.map((product) => (
            <li key={product.id}>{product.name}</li>
          )) : (
            <li>Personalized beauty recommendations included.</li>
          )}
        </ProductList>
        {shareUrl && <ShareUrl>{shareUrl}</ShareUrl>}
      </Body>
    </Card>
  );
};

export default ShareCard;
