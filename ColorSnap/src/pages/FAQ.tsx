import React, { useState } from 'react';
import styled from 'styled-components';

const PageShell = styled.section`
  min-height: calc(100vh - 72px);
  background:
    linear-gradient(180deg, rgba(251, 238, 241, 0.72) 0%, rgba(255, 252, 250, 0) 34%),
    var(--bg-page);
  padding: var(--space-7) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

const Container = styled.div`
  max-width: var(--container-md);
  margin: 0 auto;
`;

const HeaderBlock = styled.div`
  margin-bottom: var(--space-6);
  max-width: 760px;
`;

const Eyebrow = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-3);
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2.25rem, 5vw, var(--font-4xl));
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
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

interface FAQData {
  question: string;
  answer: string;
}

const faqData: FAQData[] = [
  {
    question: 'How accurate is the AI color analysis?',
    answer: 'The current system supports a stable mock mode and an OpenAI-powered live mode. For a production product, results should be positioned as guidance and paired with expert review for high-confidence decisions.'
  },
  {
    question: 'What type of photo should I upload?',
    answer: 'Use a clear front-facing selfie in natural light. Avoid heavy filters, sunglasses, strong colored lighting, or makeup that changes your natural undertone.'
  },
  {
    question: 'How long does the analysis take?',
    answer: 'Mock mode usually returns in a few seconds. Live AI mode depends on image size, network speed, and OpenAI response time.'
  },
  {
    question: 'What happens if the backend is offline?',
    answer: 'The upload page now shows a clear service offline state and tells you to start the backend with npm.cmd run backend:dev before running a new analysis.'
  },
  {
    question: 'Are purchases completed inside ColorSnap?',
    answer: 'ColorSnap acts as a recommendation and cart-building experience. Product purchases are completed through external retailers such as Sephora, Ulta Beauty, or Amazon.'
  },
  {
    question: 'Is checkout real?',
    answer: 'No. Checkout is a demo flow for the capstone presentation and does not process real payments.'
  },
  {
    question: 'Is my photo stored permanently?',
    answer: 'In the current local version, the preview is stored in browser local storage for the session flow. A production version would need explicit consent, storage policies, and account controls.'
  },
  {
    question: 'Can I book a real consultation?',
    answer: 'The booking page is currently a demo request flow. A production version could connect it to a backend booking API, email confirmation, and calendar availability.'
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((current) => (
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    ));
  };

  return (
    <PageShell>
      <Container>
        <HeaderBlock>
          <Eyebrow>FAQ</Eyebrow>
          <Title>Frequently Asked Questions</Title>
          <Description>
            Clear answers for the analysis flow, external shopping model, demo checkout, and capstone presentation scope.
          </Description>
        </HeaderBlock>

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
      </Container>
    </PageShell>
  );
};

export default FAQ;
