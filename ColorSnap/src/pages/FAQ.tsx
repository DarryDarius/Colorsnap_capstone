import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ActionRow,
  DarkCta,
  DarkCtaCopy,
  DarkCtaTitle,
  Description,
  Eyebrow,
  Hero,
  HeroPanel,
  PageContainer,
  PageShell,
  PrimaryLink,
  SecondaryLink,
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
  SurfaceCard,
  Title
} from '../components/editorial/PageScaffold';

const ContentGrid = styled.div`
  align-items: start;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 1fr) 320px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const FAQList = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
`;

const FAQItem = styled.div`
  border-bottom: 1px solid var(--border-soft);

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.button<{ $isOpen: boolean }>`
  align-items: center;
  background: ${(props) => (props.$isOpen ? 'var(--surface-warm)' : 'var(--surface)')};
  color: var(--text-primary);
  display: flex;
  font-size: var(--font-md);
  font-weight: 800;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-5);
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--brand-primary-pale);
  }
`;

const Indicator = styled.span<{ $isOpen: boolean }>`
  align-items: center;
  background: var(--brand-primary-pale);
  border-radius: var(--radius-sm);
  color: var(--brand-primary);
  display: inline-flex;
  flex: 0 0 auto;
  font-weight: 800;
  height: 28px;
  justify-content: center;
  transform: ${(props) => (props.$isOpen ? 'rotate(45deg)' : 'rotate(0deg)')};
  transition: transform 160ms ease;
  width: 28px;
`;

const Answer = styled.div<{ $isOpen: boolean }>`
  color: var(--text-secondary);
  line-height: 1.7;
  max-height: ${(props) => (props.$isOpen ? '360px' : '0')};
  overflow: hidden;
  padding: ${(props) => (props.$isOpen ? '0 var(--space-5) var(--space-5)' : '0 var(--space-5)')};
  transition: max-height 180ms ease, padding 180ms ease;
`;

const AsideStack = styled.div`
  display: grid;
  gap: var(--space-4);
`;

const AsideTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  margin-bottom: var(--space-3);
`;

const AsideCopy = styled.p`
  color: var(--text-secondary);
  line-height: 1.7;
`;

const BulletList = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-3);
  line-height: 1.7;
  margin: 0;
  padding-left: 1.1rem;
`;

interface FAQData {
  question: string;
  answer: string;
}

const faqData: FAQData[] = [
  {
    question: 'How accurate is the AI color analysis?',
    answer:
      'The current system supports a stable mock mode and an OpenAI-powered live mode. For a production product, results should be positioned as guidance and paired with expert review for high-confidence decisions.'
  },
  {
    question: 'What type of photo should I upload?',
    answer:
      'Use a clear front-facing selfie in natural light. Avoid heavy filters, sunglasses, strong colored lighting, or makeup that changes your natural undertone.'
  },
  {
    question: 'How long does the analysis take?',
    answer:
      'Mock mode usually returns in a few seconds. Live AI mode depends on image size, network speed, and OpenAI response time.'
  },
  {
    question: 'What happens if the backend is offline?',
    answer:
      'The upload page shows a clear service offline state and tells you to start the backend with npm run backend:dev before running a new analysis.'
  },
  {
    question: 'Are purchases completed inside ColorSnap?',
    answer:
      'ColorSnap acts as a recommendation and cart-building experience. Product purchases are completed through external retailers such as Sephora, Ulta Beauty, or Amazon.'
  },
  {
    question: 'Is checkout real?',
    answer: 'No. Checkout is a demo flow for the capstone presentation and does not process real payments.'
  },
  {
    question: 'Is my photo stored permanently?',
    answer:
      'In the current local version, the preview is stored in browser local storage for the session flow. A production version would need explicit consent, storage policies, and account controls.'
  },
  {
    question: 'Can I book a real consultation?',
    answer:
      'The booking page is currently a demo request flow. A production version could connect it to a backend booking API, email confirmation, and calendar availability.'
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((current) => (
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    ));
  };

  return (
    <PageShell>
      <PageContainer>
        <Hero>
          <HeroPanel>
            <Eyebrow>FAQ</Eyebrow>
            <Title>Answers for the analysis flow, shopping path, and demo scope.</Title>
            <Description>
              This page is meant to reduce friction during demos and first-time use: what to upload, what is simulated,
              and what users should expect from the current product version.
            </Description>
            <StatGrid>
              <StatCard>
                <StatValue>8</StatValue>
                <StatLabel>Common questions answered in one place</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>Mock / Live</StatValue>
                <StatLabel>Supported analysis modes in the current build</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>Demo</StatValue>
                <StatLabel>Checkout and booking flows in the capstone version</StatLabel>
              </StatCard>
            </StatGrid>
          </HeroPanel>

          <HeroPanel>
            <Eyebrow>Quick Guidance</Eyebrow>
            <AsideTitle>Before you start the analysis</AsideTitle>
            <AsideCopy>
              The strongest results come from a clear portrait, neutral lighting, and visible natural features.
            </AsideCopy>
            <BulletList>
              <li>Use a front-facing selfie with minimal shadows.</li>
              <li>Avoid heavy filters and strong colored light casts.</li>
              <li>Keep the backend running if you want a fresh analysis.</li>
              <li>Use demo checkout and booking as flow previews, not real transactions.</li>
            </BulletList>
          </HeroPanel>
        </Hero>

        <ContentGrid>
          <FAQList>
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index);

              return (
                <FAQItem key={item.question}>
                  <Question
                    type="button"
                    $isOpen={isOpen}
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                  >
                    {item.question}
                    <Indicator $isOpen={isOpen}>+</Indicator>
                  </Question>
                  <Answer $isOpen={isOpen}>{item.answer}</Answer>
                </FAQItem>
              );
            })}
          </FAQList>

          <AsideStack>
            <SurfaceCard>
              <AsideTitle>Need a guided walkthrough?</AsideTitle>
              <AsideCopy>
                Follow the cleanest demo path: upload one photo, review your report, open a product detail page, then
                continue into cart, checkout, or consultation booking.
              </AsideCopy>
            </SurfaceCard>

            <SurfaceCard>
              <AsideTitle>Current product boundaries</AsideTitle>
              <BulletList>
                <li>Purchases complete on external retailer sites.</li>
                <li>Checkout is intentionally non-payment demo logic.</li>
                <li>Booking stores requests locally for the capstone flow.</li>
                <li>Production deployment, auth, and persistent storage are future work.</li>
              </BulletList>
            </SurfaceCard>
          </AsideStack>
        </ContentGrid>

        <DarkCta>
          <DarkCtaTitle>Ready to try the flow with the expectations set clearly?</DarkCtaTitle>
          <DarkCtaCopy>
            Start the upload flow for the analysis experience, or browse expert consultations if you want the human
            support path first.
          </DarkCtaCopy>
          <ActionRow>
            <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
            <SecondaryLink to="/consultation">Explore Consultations</SecondaryLink>
          </ActionRow>
        </DarkCta>
      </PageContainer>
    </PageShell>
  );
};

export default FAQ;
