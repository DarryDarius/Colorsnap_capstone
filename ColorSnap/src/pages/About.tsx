import React from 'react';
import { Link } from 'react-router-dom';
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
  max-width: var(--container-lg);
  margin: 0 auto;
  display: grid;
  gap: var(--space-6);
`;

const Hero = styled.section`
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 1fr) 380px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
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
  font-size: clamp(2.4rem, 6vw, var(--font-4xl));
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.75;
`;

const HeroImage = styled.img`
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  object-fit: cover;
  width: 100%;
`;

const ContentGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
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
  line-height: 1.75;
  margin: 0;
  padding-left: 1.25rem;
`;

const CtaPanel = styled.section`
  background: var(--text-primary);
  border-radius: var(--radius-lg);
  color: var(--text-inverse);
  padding: var(--space-6);
`;

const CtaTitle = styled.h2`
  font-size: var(--font-3xl);
  line-height: 1.1;
  margin-bottom: var(--space-3);
`;

const CtaCopy = styled.p`
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.7;
  margin-bottom: var(--space-5);
  max-width: 720px;
`;

const CtaLink = styled(Link)`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  display: inline-flex;
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
  }
`;

const About: React.FC = () => {
  return (
    <PageShell>
      <Container>
        <Hero>
          <div>
            <Eyebrow>About ColorSnap</Eyebrow>
            <Title>AI color analysis with a practical beauty and style path.</Title>
            <Description>
              ColorSnap combines image-based color analysis, product recommendation logic, and expert consultation
              workflows so users can move from palette insight to confident everyday decisions.
            </Description>
          </div>
          <HeroImage src="/images/hero-bg-custom.jpg" alt="ColorSnap palette and beauty styling preview" />
        </Hero>

        <ContentGrid>
          <ContentCard>
            <CardTitle>Our Mission</CardTitle>
            <CardCopy>
              We help people understand which colors support their natural features, then translate that insight into
              makeup, wardrobe, and shopping decisions that feel clear and usable.
            </CardCopy>
          </ContentCard>

          <ContentCard>
            <CardTitle>What We Analyze</CardTitle>
            <List>
              <li>Undertone direction: warm, cool, or neutral.</li>
              <li>Brightness, saturation, and contrast level.</li>
              <li>Seasonal color direction and palette harmony.</li>
              <li>Beauty and fashion recommendations tied to the report.</li>
            </List>
          </ContentCard>

          <ContentCard>
            <CardTitle>Expert Support</CardTitle>
            <CardCopy>
              AI gives users a fast starting point. Consultant booking adds a human layer for users who want validation,
              wardrobe planning, or help turning recommendations into a personal style system.
            </CardCopy>
          </ContentCard>

          <ContentCard>
            <CardTitle>Privacy and Demo Scope</CardTitle>
            <CardCopy>
              The current local version stores the uploaded preview in the browser and supports mock AI mode for stable
              capstone demos. A production release would add persistent consent, storage, and account controls.
            </CardCopy>
          </ContentCard>
        </ContentGrid>

        <CtaPanel>
          <CtaTitle>Ready to see the full flow?</CtaTitle>
          <CtaCopy>
            Start with one photo, review your color report, browse product matches, and book expert guidance when needed.
          </CtaCopy>
          <CtaLink to="/analysis">Start Analysis</CtaLink>
        </CtaPanel>
      </Container>
    </PageShell>
  );
};

export default About;
