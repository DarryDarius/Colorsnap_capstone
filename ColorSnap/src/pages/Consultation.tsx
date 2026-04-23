import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const StepsGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
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

const StepTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-lg);
  margin-bottom: var(--space-2);
`;

const StepCopy = styled.p`
  color: var(--text-secondary);
  line-height: 1.65;
`;

const ExpertsGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const ExpertCard = styled(SurfaceCard)`
  display: grid;
  gap: var(--space-4);
  overflow: hidden;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: var(--brand-primary-soft);
    transform: translateY(-2px);
  }
`;

const ExpertPhoto = styled.img`
  aspect-ratio: 4 / 3;
  background: var(--surface-warm);
  border-radius: var(--radius-md);
  object-fit: cover;
  width: 100%;
`;

const ExpertHeader = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const ExpertName = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-xl);
  line-height: 1.2;
`;

const ExpertTitle = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  text-transform: uppercase;
`;

const ExpertMeta = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
`;

const ExpertDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.65;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const Badge = styled.span`
  background: var(--brand-primary-pale);
  border-radius: var(--radius-md);
  color: var(--brand-primary);
  font-size: var(--font-xs);
  font-weight: 800;
  padding: 0.4rem 0.65rem;
`;

const BookButton = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }
`;

interface Expert {
  id: string;
  name: string;
  title: string;
  location: string;
  description: string;
  image: string;
  specialties: string[];
}

const experts: Expert[] = [
  {
    id: 'ex1',
    name: 'Yuna Lee',
    title: 'Personal Color Consultant',
    location: 'Busan, South Korea',
    description:
      'Yuna specializes in practical palette translation for daily wardrobes, makeup edits, and soft seasonal color direction.',
    image: '/images/ex1.jpg',
    specialties: ['Soft Summer', 'Light Spring', 'Wardrobe edits']
  },
  {
    id: 'ex2',
    name: 'Jisoo Park',
    title: 'Senior Color Consultant',
    location: 'Seoul, South Korea',
    description:
      'Jisoo brings a structured approach to contrast, undertone, and deep winter color strategy for polished style plans.',
    image: '/images/ex2.jpg',
    specialties: ['Deep Winter', 'Cool Summer', 'Makeup mapping']
  },
  {
    id: 'ex3',
    name: 'Soojin Kwon',
    title: 'Color and Style Coach',
    location: 'Incheon, South Korea',
    description:
      'Soojin blends color theory with realistic outfit planning for users who want calm, wearable seasonal palettes.',
    image: '/images/ex3.jpg',
    specialties: ['Light Summer', 'Soft Autumn', 'Outfit planning']
  },
  {
    id: 'ex4',
    name: 'Ha-eun Lim',
    title: 'Junior Color Consultant',
    location: 'Daejeon, South Korea',
    description:
      'Ha-eun focuses on fresh palettes and approachable color education for first-time personal color clients.',
    image: '/images/ex4.jpg',
    specialties: ['Light Spring', 'Clear Winter', 'Beginner consults']
  },
  {
    id: 'ex5',
    name: 'Nia Brooks',
    title: 'Color Coach',
    location: 'Seoul, South Korea',
    description:
      'Nia works with inclusive skin tone analysis and richer palettes for users who want confident color choices.',
    image: '/images/ex5.jpg',
    specialties: ['Deep Autumn', 'True Winter', 'Beauty marketing']
  },
  {
    id: 'ex6',
    name: 'Elizabeth Lee',
    title: 'Certified Color Analyst',
    location: 'Seoul, South Korea',
    description:
      'Elizabeth helps users balance personality, undertone, and lifestyle so palette guidance feels timeless and useful.',
    image: '/images/ex6.jpg',
    specialties: ['Neutral undertones', 'Cool palettes', 'Classic style']
  },
  {
    id: 'ex7',
    name: 'Eunji Han',
    title: 'Lead Color Consultant',
    location: 'Seoul, South Korea',
    description:
      'Eunji is known for precise cool-warm assessments and clear recommendations for high-impact palette changes.',
    image: '/images/ex7.jpg',
    specialties: ['Contrast analysis', 'Cool undertones', 'Color audits']
  },
  {
    id: 'ex8',
    name: 'Ara Jeong',
    title: 'Color Specialist',
    location: 'Gwangju, South Korea',
    description:
      'Ara uses retail and styling experience to simplify muted wardrobes and tone-on-tone color decisions.',
    image: '/images/ex8.jpg',
    specialties: ['Muted seasons', 'Retail styling', 'Capsule wardrobes']
  },
  {
    id: 'ex9',
    name: 'Audrey Chen',
    title: 'Color Consultant',
    location: 'Shenzhen, China',
    description:
      'Audrey helps users build energetic looks with clear, bright palettes for work, social, and digital presence.',
    image: '/images/ex9.jpg',
    specialties: ['Clear Spring', 'Bright Summer', 'Modern styling']
  },
  {
    id: 'ex10',
    name: 'Talia Kim',
    title: 'Color Strategy Consultant',
    location: 'Seoul, South Korea',
    description:
      'Talia connects personal color with style identity, branding, and confident digital presentation.',
    image: '/images/ex10.jpg',
    specialties: ['Bright Spring', 'Clear Winter', 'Brand color']
  },
  {
    id: 'ex11',
    name: 'Olivia Bennett',
    title: 'Color Consultant',
    location: 'San Francisco, USA',
    description:
      'Olivia focuses on soft summer and cool neutral palettes for polished wardrobe and personal branding choices.',
    image: '/images/ex11.jpg',
    specialties: ['Soft Summer', 'Cool Neutral', 'Personal branding']
  }
];

const Consultation: React.FC = () => {
  const navigate = useNavigate();

  const handleBookConsultation = (expertId: string) => {
    navigate(`/booking?expert=${expertId}`);
  };

  return (
    <PageShell>
      <PageContainer>
        <Hero>
          <HeroPanel>
            <Eyebrow>Expert consultations</Eyebrow>
            <Title>Turn your color report into everyday makeup, wardrobe, and style decisions.</Title>
            <Description>
              Book a one-on-one session when you want palette validation, product interpretation, wardrobe planning, or
              a clearer next step after your AI report.
            </Description>
            <StatGrid>
              <StatCard>
                <StatValue>11</StatValue>
                <StatLabel>Consultants across palette and styling specialties</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>30-60</StatValue>
                <StatLabel>Minute sessions in the current demo flow</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>1:1</StatValue>
                <StatLabel>Guided review of makeup, wardrobe, and seasonal fit</StatLabel>
              </StatCard>
            </StatGrid>
            <ActionRow>
              <PrimaryLink to="/analysis">Start With AI Analysis</PrimaryLink>
            </ActionRow>
          </HeroPanel>

          <HeroMedia>
            <HeroImage src="/images/consultantpagedecoration.jpg" alt="Color consultation studio preview" />
          </HeroMedia>
        </Hero>

        <SectionHeader>
          <Eyebrow>Session flow</Eyebrow>
          <SectionTitle>A simple bridge from report results to human guidance.</SectionTitle>
          <SectionDescription>
            The consultation path is designed to feel connected to the main product journey, not like a separate demo.
          </SectionDescription>
        </SectionHeader>

        <StepsGrid>
          <SurfaceCard>
            <StepNumber>1</StepNumber>
            <StepTitle>Review your report</StepTitle>
            <StepCopy>
              Use the AI result as a starting point, including palette, undertone, image-quality caveats, and product
              matches.
            </StepCopy>
          </SurfaceCard>
          <SurfaceCard>
            <StepNumber>2</StepNumber>
            <StepTitle>Choose a specialist</StepTitle>
            <StepCopy>
              Pick a consultant whose strengths fit your needs, from wardrobe edits to makeup mapping or muted-season
              decision making.
            </StepCopy>
          </SurfaceCard>
          <SurfaceCard>
            <StepNumber>3</StepNumber>
            <StepTitle>Submit a booking request</StepTitle>
            <StepCopy>
              The current capstone flow stores a local demo booking request so the end-to-end experience stays visible
              and testable.
            </StepCopy>
          </SurfaceCard>
        </StepsGrid>

        <SectionHeader>
          <Eyebrow>Choose a consultant</Eyebrow>
          <SectionTitle>Specialists for palette, makeup, wardrobe, and style strategy.</SectionTitle>
          <SectionDescription>
            Each profile highlights the seasonal directions and styling contexts where that consultant can help most.
          </SectionDescription>
        </SectionHeader>

        <ExpertsGrid>
          {experts.map((expert) => (
            <ExpertCard key={expert.id}>
              <ExpertPhoto src={expert.image} alt={expert.name} />
              <ExpertHeader>
                <ExpertTitle>{expert.title}</ExpertTitle>
                <ExpertName>{expert.name}</ExpertName>
                <ExpertMeta>{expert.location}</ExpertMeta>
              </ExpertHeader>
              <ExpertDescription>{expert.description}</ExpertDescription>
              <BadgeRow>
                {expert.specialties.map((specialty) => (
                  <Badge key={specialty}>{specialty}</Badge>
                ))}
              </BadgeRow>
              <BookButton type="button" onClick={() => handleBookConsultation(expert.id)}>
                Book Consultation
              </BookButton>
            </ExpertCard>
          ))}
        </ExpertsGrid>

        <DarkCta>
          <DarkCtaTitle>Prefer to get a report before choosing a consultant?</DarkCtaTitle>
          <DarkCtaCopy>
            Start with the AI analysis flow first, then come back with a season result, product list, and questions
            ready for a focused consultation.
          </DarkCtaCopy>
          <ActionRow>
            <PrimaryLink to="/analysis">Start Analysis</PrimaryLink>
          </ActionRow>
        </DarkCta>
      </PageContainer>
    </PageShell>
  );
};

export default Consultation;
