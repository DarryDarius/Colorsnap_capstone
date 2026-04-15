import React from 'react';
import styled from 'styled-components';
import type { AnalysisResult, RecommendationItem } from '../../types/analysis';
import { formatLabel } from '../../utils/formatters';

const AdviceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  text-align: left;
`;

const AdviceCard = styled.div`
  border: 1px solid #ead3d6;
  border-radius: 8px;
  background: #fff;
  padding: 1rem;
`;

const AdviceTitle = styled.h4`
  color: #d9793f;
  margin-bottom: 0.75rem;
`;

const AdviceList = styled.ul`
  padding-left: 1.1rem;
  color: #444;
  line-height: 1.6;
`;

const itemText = (item: RecommendationItem) => {
  if (item.tip) return item.tip;
  return [item.shade, item.reason].filter(Boolean).join(': ');
};

type Props = {
  recommendations?: AnalysisResult['beauty_recommendations'];
};

const BeautyRecommendations: React.FC<Props> = ({ recommendations }) => {
  if (!recommendations) return null;

  return (
    <AdviceGrid>
      {Object.entries(recommendations).map(([category, items]) => (
        <AdviceCard key={category}>
          <AdviceTitle>{formatLabel(category)}</AdviceTitle>
          <AdviceList>
            {items.map((item) => (
              <li key={itemText(item)}>{itemText(item)}</li>
            ))}
          </AdviceList>
        </AdviceCard>
      ))}
    </AdviceGrid>
  );
};

export default BeautyRecommendations;
