import React from 'react';
import styled from 'styled-components';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  align-items: center;
  background: ${(props) => (
    props.$variant === 'primary'
      ? 'var(--brand-primary)'
      : props.$variant === 'danger'
        ? '#FFF4F2'
        : props.$variant === 'ghost'
          ? 'transparent'
          : 'var(--surface)'
  )};
  border: 1px solid ${(props) => (
    props.$variant === 'primary'
      ? 'var(--brand-primary)'
      : props.$variant === 'danger'
        ? '#F0C9C3'
        : props.$variant === 'ghost'
          ? 'transparent'
          : 'var(--border-soft)'
  )};
  border-radius: var(--radius-md);
  color: ${(props) => (
    props.$variant === 'primary'
      ? 'var(--text-inverse)'
      : props.$variant === 'danger'
        ? 'var(--error)'
        : 'var(--text-primary)'
  )};
  display: inline-flex;
  font-size: var(--font-sm);
  font-weight: 800;
  gap: var(--space-2);
  justify-content: center;
  min-height: 44px;
  padding: 0.72rem 1rem;
  white-space: nowrap;

  svg {
    flex: 0 0 auto;
  }

  &:hover:not(:disabled) {
    background: ${(props) => (
      props.$variant === 'primary'
        ? 'var(--brand-primary-hover)'
        : props.$variant === 'danger'
          ? '#FFE9E5'
          : 'var(--brand-primary-pale)'
    )};
    border-color: ${(props) => (
      props.$variant === 'primary'
        ? 'var(--brand-primary-hover)'
        : props.$variant === 'danger'
          ? '#E7AFA7'
          : 'var(--brand-primary-soft)'
    )};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #E4DDDA;
    border-color: #E4DDDA;
    color: var(--text-muted);
    cursor: not-allowed;
    transform: none;
  }
`;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: LucideIcon;
};

const Button: React.FC<Props> = ({ variant = 'primary', icon: Icon, children, ...props }) => (
  <StyledButton $variant={variant} {...props}>
    {Icon && <Icon aria-hidden="true" size={17} strokeWidth={2.2} />}
    <span>{children}</span>
  </StyledButton>
);

export default Button;
