import React from 'react';
import styled from 'styled-components';
import type { ImageQuality, ImageQualityAssessment } from '../../types/analysis';
import { formatLabel, formatPercent } from '../../utils/formatters';

const Notice = styled.div<{ $passed: boolean }>`
  border: 1px solid ${(props) => (props.$passed ? '#b8dfbf' : '#f0c08f')};
  border-radius: 8px;
  background: ${(props) => (props.$passed ? '#f4fff6' : '#fff8ef')};
  color: #333;
  padding: 1rem;
  text-align: left;
`;

const NoticeTitle = styled.h4`
  margin-bottom: 0.35rem;
`;

const DetailList = styled.ul`
  display: grid;
  gap: 0.35rem;
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
`;

type Props = {
  quality?: ImageQuality;
  assessment?: ImageQualityAssessment;
};

const ImageQualityNotice: React.FC<Props> = ({ quality, assessment }) => {
  if (!quality) return null;

  return (
    <Notice $passed={quality.passed}>
      <NoticeTitle>
        Photo Quality: {quality.passed ? 'Passed' : 'Usable with Caveats'} ({formatPercent(quality.score)})
      </NoticeTitle>
      {quality.issues.length > 0 && <p>{quality.issues.join(' ')}</p>}
      {quality.retry_advice && <p>{quality.retry_advice}</p>}
      {assessment && (
        <DetailList>
          <li>Lighting: {formatLabel(assessment.lighting)}</li>
          <li>White balance risk: {formatLabel(assessment.white_balance_risk)}</li>
          <li>Filter/editing risk: {formatLabel(assessment.filter_or_heavy_editing_risk)}</li>
          <li>Makeup risk: {formatLabel(assessment.makeup_risk)}</li>
        </DetailList>
      )}
    </Notice>
  );
};

export default ImageQualityNotice;
