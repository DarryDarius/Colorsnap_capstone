import React from 'react';
import styled from 'styled-components';
import type { AnalysisResult } from '../../types/analysis';
import { formatLabel } from '../../utils/formatters';

const FashionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  text-align: left;
`;

const FashionCard = styled.div`
  border: 1px solid #ead3d6;
  border-radius: 8px;
  background: #fff;
  padding: 1rem;
`;

const FashionTitle = styled.h4`
  color: #d9793f;
  margin-bottom: 0.75rem;
`;

const PillRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Pill = styled.span`
  background: #fff4f0;
  border-radius: 8px;
  color: #333;
  padding: 0.4rem 0.65rem;
  font-size: 0.85rem;
`;

type Props = {
  recommendations?: AnalysisResult['fashion_recommendations'];
};

const FashionRecommendations: React.FC<Props> = ({ recommendations }) => {
  if (!recommendations) return null;

  return (
    <FashionGrid>
      {Object.entries(recommendations).map(([category, values]) => (
        <FashionCard key={category}>
          <FashionTitle>{formatLabel(category)}</FashionTitle>
          <PillRow>
            {values.map((value) => (
              <Pill key={value}>{value}</Pill>
            ))}
          </PillRow>
        </FashionCard>
      ))}
    </FashionGrid>
  );
};

export default FashionRecommendations;
