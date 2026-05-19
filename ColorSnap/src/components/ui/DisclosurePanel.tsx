import React from 'react';
import { ChevronDown } from 'lucide-react';
import styled from 'styled-components';

const Details = styled.details`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  overflow: hidden;

  &[open] summary svg {
    transform: rotate(180deg);
  }
`;

const Summary = styled.summary`
  align-items: center;
  cursor: pointer;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(0, 1fr) auto;
  list-style: none;
  padding: var(--space-4);

  &::-webkit-details-marker {
    display: none;
  }
`;

const Title = styled.strong`
  color: var(--text-primary);
  display: block;
  font-size: var(--font-md);
`;

const Description = styled.span`
  color: var(--text-secondary);
  display: block;
  font-size: var(--font-sm);
  line-height: 1.5;
  margin-top: var(--space-1);
`;

const IconWrap = styled.span`
  align-items: center;
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  display: inline-flex;
  height: 34px;
  justify-content: center;
  width: 34px;

  svg {
    transition: transform 160ms ease;
  }
`;

const Body = styled.div`
  border-top: 1px solid var(--border-soft);
  padding: var(--space-4);
`;

type Props = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

const DisclosurePanel: React.FC<Props> = ({
  title,
  description,
  defaultOpen = false,
  children,
  className
}) => (
  <Details className={className} open={defaultOpen}>
    <Summary>
      <span>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
      </span>
      <IconWrap aria-hidden="true">
        <ChevronDown size={17} />
      </IconWrap>
    </Summary>
    <Body>{children}</Body>
  </Details>
);

export default DisclosurePanel;
