import React from 'react';
import styled from 'styled-components';
import type { AnalysisResult } from '../../types/analysis';
import { formatPercent } from '../../utils/formatters';

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
  gap: 1.5rem;
  align-items: start;
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCopy = styled.div`
  color: #2c2c2c;
`;

const Headline = styled.h3`
  font-size: 2rem;
  color: #111;
  margin-bottom: 0.75rem;
`;

const OneLiner = styled.p`
  color: #444;
  font-size: 1.05rem;
  margin-bottom: 1rem;
`;

const ExplanationList = styled.ul`
  padding-left: 1.25rem;
  color: #444;
  line-height: 1.7;
`;

const ConfidenceBox = styled.div`
  border: 1px solid #ead3d6;
  border-radius: 8px;
  padding: 1rem;
  background: #fffafb;
`;

const ConfidenceLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
`;

const ConfidenceValue = styled.div`
  color: #d9793f;
  font-size: 2rem;
  font-weight: 700;
`;

type Props = {
  analysis: AnalysisResult;
};

const AnalysisSummary: React.FC<Props> = ({ analysis }) => {
  if (!analysis.summary || !analysis.season_result) return null;

  return (
    <SummaryGrid>
      <SummaryCopy>
        <Headline>{analysis.summary.headline}</Headline>
        <OneLiner>{analysis.summary.one_liner}</OneLiner>
        <ExplanationList>
          {analysis.summary.explanations.map((explanation) => (
            <li key={explanation}>{explanation}</li>
          ))}
        </ExplanationList>
      </SummaryCopy>

      <ConfidenceBox>
        <ConfidenceLabel>Primary Season</ConfidenceLabel>
        <strong>{analysis.season_result.primary}</strong>
        {analysis.season_result.secondary && (
          <>
            <ConfidenceLabel style={{ marginTop: '1rem' }}>Secondary Season</ConfidenceLabel>
            <strong>{analysis.season_result.secondary}</strong>
          </>
        )}
        <ConfidenceLabel style={{ marginTop: '1rem' }}>Confidence</ConfidenceLabel>
        <ConfidenceValue>{formatPercent(analysis.season_result.confidence)}</ConfidenceValue>
      </ConfidenceBox>
    </SummaryGrid>
  );
};

export default AnalysisSummary;
