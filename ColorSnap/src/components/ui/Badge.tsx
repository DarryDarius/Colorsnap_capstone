import styled from 'styled-components';

type BadgeTone = 'brand' | 'neutral' | 'sage' | 'warning' | 'danger' | 'info';

const Badge = styled.span<{ $tone?: BadgeTone }>`
  align-items: center;
  background: ${(props) => (
    props.$tone === 'sage'
      ? 'var(--surface-sage)'
      : props.$tone === 'warning'
        ? '#FFF8EC'
        : props.$tone === 'danger'
          ? '#FFF4F2'
          : props.$tone === 'info'
            ? '#EEF6FA'
            : props.$tone === 'neutral'
              ? 'var(--surface-warm)'
              : 'var(--brand-primary-pale)'
  )};
  border: 1px solid ${(props) => (
    props.$tone === 'sage'
      ? '#DDE8DA'
      : props.$tone === 'warning'
        ? '#E8D5B8'
        : props.$tone === 'danger'
          ? '#F0C9C3'
          : props.$tone === 'info'
            ? '#C9DFE8'
            : props.$tone === 'neutral'
              ? 'var(--border-soft)'
              : 'var(--brand-primary-soft)'
  )};
  border-radius: var(--radius-md);
  color: ${(props) => (
    props.$tone === 'sage'
      ? 'var(--accent-olive)'
      : props.$tone === 'warning'
        ? 'var(--warning)'
        : props.$tone === 'danger'
          ? 'var(--error)'
          : props.$tone === 'info'
            ? 'var(--info)'
            : props.$tone === 'neutral'
              ? 'var(--text-secondary)'
              : 'var(--brand-primary)'
  )};
  display: inline-flex;
  font-size: var(--font-xs);
  font-weight: 800;
  gap: var(--space-1);
  line-height: 1;
  padding: 0.42rem 0.6rem;
  width: fit-content;
`;

export default Badge;
