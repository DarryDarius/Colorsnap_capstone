import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const TopLine = styled.div`
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  font-size: var(--font-sm);
  font-weight: 800;
  justify-content: space-between;
`;

const Track = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  height: 12px;
  overflow: hidden;
`;

const Fill = styled.div<{ $value: number }>`
  background: linear-gradient(90deg, var(--brand-primary), var(--cool-accent, #8D98B8));
  border-radius: inherit;
  height: 100%;
  width: ${(props) => `${Math.max(0, Math.min(100, props.$value))}%`};
`;

type Props = {
  label: string;
  value: number;
};

const ProgressMeter: React.FC<Props> = ({ label, value }) => {
  const percent = Math.round(value);

  return (
    <Wrap>
      <TopLine>
        <span>{label}</span>
        <span>{percent}%</span>
      </TopLine>
      <Track aria-label={label} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <Fill $value={percent} />
      </Track>
    </Wrap>
  );
};

export default ProgressMeter;
