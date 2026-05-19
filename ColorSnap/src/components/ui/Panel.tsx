import styled from 'styled-components';

type PanelTone = 'default' | 'warm' | 'sage' | 'warning' | 'danger';

const Panel = styled.section<{ $tone?: PanelTone }>`
  background: ${(props) => (
    props.$tone === 'sage'
      ? 'var(--surface-sage)'
      : props.$tone === 'warning'
        ? '#FFF8EC'
        : props.$tone === 'danger'
          ? '#FFF4F2'
          : props.$tone === 'warm'
            ? 'var(--surface-warm)'
            : 'var(--surface)'
  )};
  border: 1px solid ${(props) => (
    props.$tone === 'warning'
      ? '#E8D5B8'
      : props.$tone === 'danger'
        ? '#F0C9C3'
        : props.$tone === 'sage'
          ? '#DDE8DA'
          : 'var(--border-soft)'
  )};
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);

  @media (max-width: 768px) {
    padding: var(--space-5);
  }
`;

export default Panel;
