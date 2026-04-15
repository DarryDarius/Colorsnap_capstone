import React from 'react';
import styled from 'styled-components';
import type { PaletteColor } from '../../types/analysis';
import { formatLabel } from '../../utils/formatters';

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const ColorItem = styled.div`
  border: 1px solid #ead3d6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  text-align: left;
`;

const Swatch = styled.div<{ $color: string }>`
  height: 90px;
  background: ${(props) => props.$color};
`;

const ColorCopy = styled.div`
  padding: 0.85rem;
`;

const ColorName = styled.div`
  font-weight: 700;
  color: #111;
`;

const ColorUse = styled.div`
  color: #666;
  font-size: 0.85rem;
`;

type Props = {
  colors?: PaletteColor[];
};

const PaletteSection: React.FC<Props> = ({ colors }) => {
  if (!colors?.length) return null;

  return (
    <PaletteGrid>
      {colors.map((color) => (
        <ColorItem key={`${color.name}-${color.hex}`}>
          <Swatch $color={color.hex} />
          <ColorCopy>
            <ColorName>{color.name}</ColorName>
            <ColorUse>{formatLabel(color.use_case)}</ColorUse>
          </ColorCopy>
        </ColorItem>
      ))}
    </PaletteGrid>
  );
};

export default PaletteSection;
