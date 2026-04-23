import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const PageShell = styled.section`
  min-height: calc(100vh - 72px);
  background:
    radial-gradient(circle at top left, rgba(216, 100, 122, 0.12), transparent 32%),
    linear-gradient(180deg, rgba(251, 238, 241, 0.8) 0%, rgba(255, 252, 250, 0) 34%),
    var(--bg-page);
  padding: var(--space-7) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

export const PageContainer = styled.div`
  max-width: var(--container-lg);
  margin: 0 auto;
  display: grid;
  gap: var(--space-6);
`;

export const Hero = styled.section`
  align-items: stretch;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroPanel = styled.div`
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(232, 222, 218, 0.9);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);
  backdrop-filter: blur(10px);

  @media (max-width: 640px) {
    padding: var(--space-5);
  }
`;

export const HeroMedia = styled(HeroPanel)`
  overflow: hidden;
  padding: var(--space-4);
`;

export const HeroImage = styled.img`
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-medium);
  object-fit: cover;
  width: 100%;
`;

export const Eyebrow = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-3);
  text-transform: uppercase;
`;

export const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2.4rem, 6vw, var(--font-4xl));
  line-height: 1.03;
  margin-bottom: var(--space-4);
`;

export const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.75;
`;

export const StatGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: var(--space-6);

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: var(--space-4);
`;

export const StatValue = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-xl);
  font-weight: 800;
`;

export const StatLabel = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-top: var(--space-1);
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
`;

export const PrimaryLink = styled(Link)`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  padding: 0.9rem 1.15rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

export const SecondaryLink = styled(Link)`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  padding: 0.9rem 1.15rem;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
    transform: translateY(-1px);
  }
`;

export const SurfaceCard = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-5);
`;

export const SectionHeader = styled.div`
  max-width: 760px;
`;

export const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: clamp(2rem, 5vw, var(--font-3xl));
  line-height: 1.08;
  margin-bottom: var(--space-3);
`;

export const SectionDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.75;
`;

export const DarkCta = styled.section`
  background:
    linear-gradient(135deg, rgba(216, 100, 122, 0.12), transparent 42%),
    var(--text-primary);
  border-radius: var(--radius-lg);
  color: var(--text-inverse);
  overflow: hidden;
  padding: var(--space-6);
  position: relative;

  @media (max-width: 640px) {
    padding: var(--space-5);
  }
`;

export const DarkCtaTitle = styled.h2`
  font-size: clamp(2rem, 5vw, var(--font-3xl));
  line-height: 1.08;
  margin-bottom: var(--space-3);
  max-width: 760px;
`;

export const DarkCtaCopy = styled.p`
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.75;
  margin-bottom: var(--space-5);
  max-width: 760px;
`;
