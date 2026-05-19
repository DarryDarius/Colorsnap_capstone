import React from 'react';
import styled from 'styled-components';
import type { LucideIcon } from 'lucide-react';

const Card = styled.div<{ $tone?: 'default' | 'warning' | 'danger' | 'sage' }>`
  background: ${(props) => (
    props.$tone === 'danger'
      ? '#FFF4F2'
      : props.$tone === 'warning'
        ? '#FFF8EC'
        : props.$tone === 'sage'
          ? 'var(--surface-sage)'
          : 'var(--surface-warm)'
  )};
  border: 1px solid ${(props) => (
    props.$tone === 'danger'
      ? '#F0C9C3'
      : props.$tone === 'warning'
        ? '#E8D5B8'
        : props.$tone === 'sage'
          ? '#DDE8DA'
          : 'var(--border-soft)'
  )};
  border-radius: var(--radius-md);
  display: grid;
  gap: var(--space-2);
  min-height: 112px;
  padding: var(--space-4);
`;

const Header = styled.div`
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  font-size: var(--font-sm);
  font-weight: 800;
  gap: var(--space-2);
`;

const Value = styled.strong`
  color: var(--text-primary);
  font-size: var(--font-lg);
  line-height: 1.25;
`;

const Copy = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
  line-height: 1.5;
  margin: 0;
`;

type Props = {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'warning' | 'danger' | 'sage';
};

const MetricCard: React.FC<Props> = ({ label, value, description, icon: Icon, tone = 'default' }) => (
  <Card $tone={tone}>
    <Header>
      {Icon && <Icon aria-hidden="true" size={16} strokeWidth={2.2} />}
      {label}
    </Header>
    <Value>{value}</Value>
    {description && <Copy>{description}</Copy>}
  </Card>
);

export default MetricCard;
