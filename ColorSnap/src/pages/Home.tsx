import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageShell = styled.div`
  background: var(--bg-page);
`;

const Hero = styled.section`
  min-height: calc(100vh - 72px);
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: var(--space-8) var(--space-6);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(24, 20, 20, 0.72), rgba(24, 20, 20, 0.34) 48%, rgba(24, 20, 20, 0.08)),
      url('/images/hero-bg-custom.jpg') center / cover no-repeat;
  }

  @media (max-width: 768px) {
    min-height: auto;
    padding: var(--space-8) var(--space-4) var(--space-7);
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  width: min(760px, 100%);
  color: var(--text-inverse);
`;

const Eyebrow = styled.p`
  color: #F5DCE2;
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-4);
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.75rem, 7vw, 5.5rem);
  font-weight: 800;
  line-height: 0.96;
  margin-bottom: var(--space-5);
  max-width: 780px;
`;

const HeroCopy = styled.p`
  color: rgba(255, 255, 255, 0.88);
  font-size: var(--font-lg);
  line-height: 1.75;
  max-width: 620px;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
`;

const PrimaryLink = styled(Link)`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  display: inline-flex;
  font-weight: 800;
  padding: 0.9rem 1.15rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

const SecondaryLink = styled(Link)`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  display: inline-flex;
  font-weight: 800;
  padding: 0.9rem 1.15rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const Section = styled.section`
  padding: var(--space-8) var(--space-6);

  @media (max-width: 768px) {
    padding: var(--space-7) var(--space-4);
  }
`;

const Container = styled.div`
  max-width: var(--container-lg);
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  max-width: 720px;
  margin-bottom: var(--space-6);
`;

const SectionEyebrow = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-3);
  text-transform: uppercase;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: clamp(2rem, 5vw, var(--font-4xl));
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const SectionCopy = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.75;
`;

const FlowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const FlowCard = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
`;

const StepNumber = styled.span`
  align-items: center;
  background: var(--brand-primary-pale);
  border-radius: var(--radius-sm);
  color: var(--brand-primary);
  display: inline-flex;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  margin-bottom: var(--space-4);
  width: 34px;
`;

const CardTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-lg);
  margin-bottom: var(--space-2);
`;

const CardCopy = styled.p`
  color: var(--text-secondary);
  line-height: 1.65;
`;

const PreviewBand = styled(Section)`
  background: var(--surface-warm);
`;

const PreviewLayout = styled.div`
  align-items: center;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewImage = styled.img`
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  object-fit: cover;
  width: 100%;
`;

const ResultPreview = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);
`;

const SeasonLabel = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-2);
  text-transform: uppercase;
`;

const PreviewTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-3xl);
  line-height: 1.1;
  margin-bottom: var(--space-4);
`;

const Palette = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
  margin: var(--space-5) 0;
`;

const Swatch = styled.div<{ $color: string }>`
  aspect-ratio: 1;
  background: ${(props) => props.$color};
  border: 1px solid rgba(24, 20, 20, 0.08);
  border-radius: var(--radius-sm);
`;

const FeatureList = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-3);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const FeatureItem = styled.li`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 24px minmax(0, 1fr);

  &::before {
    align-items: center;
    background: var(--surface-sage);
    border-radius: var(--radius-sm);
    color: var(--accent-olive);
    content: "+";
    display: inline-flex;
    font-size: var(--font-xs);
    font-weight: 800;
    height: 24px;
    justify-content: center;
    width: 24px;
  }
`;

const CtaBand = styled.section`
  background: var(--text-primary);
  color: var(--text-inverse);
  padding: var(--space-8) var(--space-6);
  text-align: center;

  @media (max-width: 768px) {
    padding: var(--space-7) var(--space-4);
  }
`;

const CtaTitle = styled.h2`
  font-size: clamp(2rem, 5vw, var(--font-4xl));
  line-height: 1.08;
  margin: 0 auto var(--space-4);
  max-width: 780px;
`;

const CtaCopy = styled.p`
  color: rgba(255, 255, 255, 0.76);
  margin: 0 auto var(--space-6);
  max-width: 620px;
`;

const Home: React.FC = () => {
  return (
    <PageShell>
      <Hero>
        <HeroContent>
          <Eyebrow>AI color analysis and curated beauty picks</Eyebrow>
          <HeroTitle>Discover Your Signature Colors</HeroTitle>
          <HeroCopy>
            ColorSnap turns one clear selfie into a seasonal color report, palette guidance,
            and product recommendations that fit your undertone, contrast, and style goals.
          </HeroCopy>
          <HeroActions>
            <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
            <SecondaryLink to="/consultation">Explore Consultations</SecondaryLink>
          </HeroActions>
        </HeroContent>
      </Hero>

      <Section>
        <Container>
          <SectionHeader>
            <SectionEyebrow>How it works</SectionEyebrow>
            <SectionTitle>A guided flow from photo to confident choices.</SectionTitle>
            <SectionCopy>
              The experience is designed for a quick demo and a real user journey: upload,
              understand your palette, then move directly into personalized recommendations.
            </SectionCopy>
          </SectionHeader>
          <FlowGrid>
            <FlowCard>
              <StepNumber>1</StepNumber>
              <CardTitle>Upload Photo</CardTitle>
              <CardCopy>Use a clear, front-facing photo in natural light for the strongest analysis signal.</CardCopy>
            </FlowCard>
            <FlowCard>
              <StepNumber>2</StepNumber>
              <CardTitle>Get Color Report</CardTitle>
              <CardCopy>Review your seasonal direction, undertone, contrast, brightness, and best colors.</CardCopy>
            </FlowCard>
            <FlowCard>
              <StepNumber>3</StepNumber>
              <CardTitle>Shop Personalized Picks</CardTitle>
              <CardCopy>Browse makeup recommendations ranked by palette fit and product attributes.</CardCopy>
            </FlowCard>
            <FlowCard>
              <StepNumber>4</StepNumber>
              <CardTitle>Book Expert Help</CardTitle>
              <CardCopy>Connect with consultants when you want a second opinion or styling support.</CardCopy>
            </FlowCard>
          </FlowGrid>
        </Container>
      </Section>

      <PreviewBand>
        <Container>
          <PreviewLayout>
            <PreviewImage src="/images/index1.jpg" alt="ColorSnap color analysis portrait preview" />
            <ResultPreview>
              <SeasonLabel>Sample result preview</SeasonLabel>
              <PreviewTitle>Warm Autumn with soft contrast</PreviewTitle>
              <SectionCopy>
                See a clear palette summary, beauty guidance, fashion notes, and product matches in one report.
              </SectionCopy>
              <Palette aria-label="Sample warm autumn color palette">
                <Swatch $color="#C96A4A" />
                <Swatch $color="#C19A6B" />
                <Swatch $color="#7A8448" />
                <Swatch $color="#E88973" />
                <Swatch $color="#8C6239" />
              </Palette>
              <FeatureList>
                <FeatureItem>Palette recommendations explain where each shade works best.</FeatureItem>
                <FeatureItem>Product cards include match badges, reasons, and external retailer links.</FeatureItem>
                <FeatureItem>Demo mode keeps the capstone presentation stable without live API risk.</FeatureItem>
              </FeatureList>
            </ResultPreview>
          </PreviewLayout>
        </Container>
      </PreviewBand>

      <CtaBand>
        <CtaTitle>Ready to build a color report that leads somewhere useful?</CtaTitle>
        <CtaCopy>
          Start with one photo, then move through palette insight, product discovery, and expert support.
        </CtaCopy>
        <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
      </CtaBand>
    </PageShell>
  );
};

export default Home;
