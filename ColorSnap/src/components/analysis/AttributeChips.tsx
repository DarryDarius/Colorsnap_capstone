import React from 'react';
import styled from 'styled-components';
import type { ColorAttributes } from '../../types/analysis';
import { formatLabel } from '../../utils/formatters';

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const Chip = styled.div`
  background: #fff;
  border: 1px solid #ead3d6;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  min-width: 130px;
`;

const Label = styled.div`
  color: #777;
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
`;

const Value = styled.div`
  color: #111;
  font-weight: 700;
`;

type Props = {
  attributes?: ColorAttributes;
};

const AttributeChips: React.FC<Props> = ({ attributes }) => {
  if (!attributes) return null;

  return (
    <ChipRow>
      {Object.entries(attributes).map(([label, value]) => (
        <Chip key={label}>
          <Label>{formatLabel(label)}</Label>
          <Value>{formatLabel(value)}</Value>
        </Chip>
      ))}
    </ChipRow>
  );
};

export default AttributeChips;
