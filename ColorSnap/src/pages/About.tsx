import React from 'react';
import styled from 'styled-components';
import {
  ActionRow,
  DarkCta,
  DarkCtaCopy,
  DarkCtaTitle,
  Description,
  Eyebrow,
  Hero,
  HeroImage,
  HeroMedia,
  HeroPanel,
  PageContainer,
  PageShell,
  PrimaryLink,
  SecondaryLink,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
  SurfaceCard,
  Title
} from '../components/editorial/PageScaffold';

const ContentGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const CardTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  margin-bottom: var(--space-3);
`;

const CardCopy = styled.p`
  color: var(--text-secondary);
  line-height: 1.75;
`;

const List = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-3);
  line-height: 1.75;
  margin: 0;
  padding-left: 1.25rem;
`;

const HighlightsGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HighlightTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-lg);
  margin-bottom: var(--space-2);
`;

const HighlightCopy = styled.p`
  color: var(--text-secondary);
  line-height: 1.65;
`;

const About: React.FC = () => {
  return (
    <PageShell>
      <PageContainer>
        <Hero>
          <HeroPanel>
            <Eyebrow>About ColorSnap</Eyebrow>
            <Title>AI color analysis with a practical path into beauty, wardrobe, and shopping choices.</Title>
            <Description>
              ColorSnap combines image-based color analysis, explainable recommendation logic, and a guided
              consultation flow so users can move from curiosity to concrete next steps in one session.
            </Description>
            <StatGrid>
              <StatCard>
                <StatValue>2</StatValue>
                <StatLabel>AI modes for demo stability and live testing</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>6</StatValue>
                <StatLabel>Ranked products returned per report</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>Guest</StatValue>
                <StatLabel>Current product flow without account friction</StatLabel>
              </StatCard>
            </StatGrid>
            <ActionRow>
              <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
              <SecondaryLink to="/consultation">Meet the Consultants</SecondaryLink>
            </ActionRow>
          </HeroPanel>

          <HeroMedia>
            <HeroImage src="/images/hero-bg-custom.jpg" alt="ColorSnap palette and beauty styling preview" />
          </HeroMedia>
        </Hero>

        <SectionHeader>
          <Eyebrow>Product Story</Eyebrow>
          <SectionTitle>A capstone built around one clear full-stack story.</SectionTitle>
          <SectionDescription>
            The goal is not only to classify seasonal palettes, but to show how analysis, recommendations, and guided
            action can live inside one coherent product experience.
          </SectionDescription>
        </SectionHeader>

        <HighlightsGrid>
          <SurfaceCard>
            <HighlightTitle>Readable analysis</HighlightTitle>
            <HighlightCopy>
              Reports explain season, undertone, contrast, brightness, palette confidence, and image-quality caveats in
              language that feels usable instead of model-centric.
            </HighlightCopy>
          </SurfaceCard>
          <SurfaceCard>
            <HighlightTitle>Explainable commerce</HighlightTitle>
            <HighlightCopy>
              Product ranking stays deterministic so users can see why a blush, lipstick, or fashion pick matches their
              palette rather than treating the storefront like a black box.
            </HighlightCopy>
          </SurfaceCard>
          <SurfaceCard>
            <HighlightTitle>Demo-first reliability</HighlightTitle>
            <HighlightCopy>
              Mock mode, local persistence, and clear service states keep the capstone usable for reviews and live
              presentations even when external services are unavailable.
            </HighlightCopy>
          </SurfaceCard>
        </HighlightsGrid>

        <ContentGrid>
          <SurfaceCard>
            <CardTitle>What We Analyze</CardTitle>
            <List>
              <li>Undertone direction: warm, cool, or neutral.</li>
              <li>Brightness, saturation, and contrast level.</li>
              <li>Seasonal color direction and palette harmony.</li>
              <li>Beauty and fashion recommendations tied to the report.</li>
            </List>
          </SurfaceCard>

          <SurfaceCard>
            <CardTitle>How Expert Support Fits In</CardTitle>
            <CardCopy>
              AI provides a quick starting point. Consultant booking adds a human layer for users who want palette
              validation, wardrobe planning, event styling, or help translating recommendations into a repeatable system.
            </CardCopy>
          </SurfaceCard>

          <SurfaceCard>
            <CardTitle>Privacy and Demo Scope</CardTitle>
            <CardCopy>
              The current local version stores the uploaded preview in the browser and supports mock AI mode for stable
              demos. A production release would add persistent consent, storage policies, and account controls.
            </CardCopy>
          </SurfaceCard>

          <SurfaceCard>
            <CardTitle>Why This Matters</CardTitle>
            <CardCopy>
              Personal color guidance is often expensive, fragmented, or disconnected from shopping behavior. ColorSnap
              is designed to make the first step accessible, visual, and immediately actionable.
            </CardCopy>
          </SurfaceCard>
        </ContentGrid>

        <DarkCta>
          <DarkCtaTitle>See the full user journey instead of isolated pages.</DarkCtaTitle>
          <DarkCtaCopy>
            Start with one photo, review your report, browse product matches, and book expert guidance when you want a
            second opinion.
          </DarkCtaCopy>
          <ActionRow>
            <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
            <SecondaryLink to="/faq">Read the FAQ</SecondaryLink>
          </ActionRow>
        </DarkCta>
      </PageContainer>
    </PageShell>
  );
};

export default About;
