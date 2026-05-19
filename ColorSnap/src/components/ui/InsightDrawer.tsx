import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styled from 'styled-components';

const Overlay = styled(motion.div)`
  backdrop-filter: blur(10px);
  background: rgba(33, 26, 26, 0.32);
  inset: 0;
  position: fixed;
  z-index: 80;
`;

const Panel = styled(motion.div)`
  background:
    linear-gradient(180deg, rgba(251, 238, 241, 0.76) 0%, rgba(255, 255, 255, 0) 28%),
    var(--surface);
  border-left: 1px solid var(--border-soft);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  box-shadow: var(--shadow-medium);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  max-width: 460px;
  position: fixed;
  right: 0;
  top: 0;
  width: min(92vw, 460px);
  z-index: 81;

  @media (max-width: 640px) {
    border-left: 0;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    bottom: 0;
    height: min(82vh, 680px);
    max-width: none;
    top: auto;
    width: 100%;
  }
`;

const Header = styled.div`
  align-items: start;
  border-bottom: 1px solid var(--border-soft);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(0, 1fr) auto;
  padding: var(--space-5);
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  line-height: 1.55;
  margin: var(--space-2) 0 0;
`;

const CloseButton = styled.button`
  align-items: center;
  background: rgba(255, 247, 245, 0.9);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const Body = styled.div`
  overflow-y: auto;
  padding: var(--space-5);
`;

const MobileHandle = styled.div`
  background: var(--border-strong);
  border-radius: 999px;
  display: none;
  height: 4px;
  left: 50%;
  position: absolute;
  top: var(--space-3);
  transform: translateX(-50%);
  width: 44px;

  @media (max-width: 640px) {
    display: block;
  }
`;

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
};

const useIsMobileDrawer = () => {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window === 'undefined' || !window.matchMedia
      ? false
      : window.matchMedia('(max-width: 640px)').matches
  ));

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined;
    }

    const query = window.matchMedia('(max-width: 640px)');
    const handleChange = () => setIsMobile(query.matches);

    handleChange();
    if (query.addEventListener) {
      query.addEventListener('change', handleChange);
      return () => query.removeEventListener('change', handleChange);
    }

    query.addListener(handleChange);
    return () => query.removeListener(handleChange);
  }, []);

  return isMobile;
};

const InsightDrawer: React.FC<Props> = ({ open, title, subtitle, children, onClose }) => {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileDrawer();
  const contentInitial = prefersReducedMotion
    ? { opacity: 1 }
    : isMobile
      ? { opacity: 0, y: 48 }
      : { opacity: 0, x: 44 };
  const contentAnimate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0 };
  const contentExit = prefersReducedMotion
    ? { opacity: 0 }
    : isMobile
      ? { opacity: 0, y: 36 }
      : { opacity: 0, x: 36 };

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose();
    }}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <Overlay
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <Panel
                initial={contentInitial}
                animate={contentAnimate}
                exit={contentExit}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <MobileHandle aria-hidden="true" />
                <Header>
                  <div>
                    <Dialog.Title asChild>
                      <Title>{title}</Title>
                    </Dialog.Title>
                    {subtitle && (
                      <Dialog.Description asChild>
                        <Subtitle>{subtitle}</Subtitle>
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close asChild>
                    <CloseButton type="button" aria-label="Close panel">
                      <X aria-hidden="true" size={18} />
                    </CloseButton>
                  </Dialog.Close>
                </Header>
                <Body>{children}</Body>
              </Panel>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default InsightDrawer;
