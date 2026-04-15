import React from 'react';
import styled from 'styled-components';
import type { ImageQuality } from '../../types/analysis';
import { formatPercent } from '../../utils/formatters';

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

type Props = {
  quality?: ImageQuality;
};

const ImageQualityNotice: React.FC<Props> = ({ quality }) => {
  if (!quality) return null;

  return (
    <Notice $passed={quality.passed}>
      <NoticeTitle>
        Photo Quality: {quality.passed ? 'Passed' : 'Usable with Caveats'} ({formatPercent(quality.score)})
      </NoticeTitle>
      {quality.issues.length > 0 && <p>{quality.issues.join(' ')}</p>}
      {quality.retry_advice && <p>{quality.retry_advice}</p>}
    </Notice>
  );
};

export default ImageQualityNotice;
