import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  align-items: center;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: minmax(0, 1fr) 380px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
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

const StatsGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: var(--space-6);

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: var(--space-4);
`;

const StatValue = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-xl);
  font-weight: 800;
`;

const StatLabel = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-sm);
`;

const SectionHeader = styled.div`
  max-width: 760px;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-3xl);
  line-height: 1.1;
  margin-bottom: var(--space-3);
`;

const ExpertsGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const ExpertCard = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-4);
  overflow: hidden;
  padding: var(--space-4);
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
    description: 'Yuna specializes in practical palette translation for daily wardrobes, makeup edits, and soft seasonal color direction.',
    image: '/images/ex1.jpg',
    specialties: ['Soft Summer', 'Light Spring', 'Wardrobe edits']
  },
  {
    id: 'ex2',
    name: 'Jisoo Park',
    title: 'Senior Color Consultant',
    location: 'Seoul, South Korea',
    description: 'Jisoo brings a structured approach to contrast, undertone, and deep winter color strategy for polished style plans.',
    image: '/images/ex2.jpg',
    specialties: ['Deep Winter', 'Cool Summer', 'Makeup mapping']
  },
  {
    id: 'ex3',
    name: 'Soojin Kwon',
    title: 'Color and Style Coach',
    location: 'Incheon, South Korea',
    description: 'Soojin blends color theory with realistic outfit planning for users who want calm, wearable seasonal palettes.',
    image: '/images/ex3.jpg',
    specialties: ['Light Summer', 'Soft Autumn', 'Outfit planning']
  },
  {
    id: 'ex4',
    name: 'Ha-eun Lim',
    title: 'Junior Color Consultant',
    location: 'Daejeon, South Korea',
    description: 'Ha-eun focuses on fresh palettes and approachable color education for first-time personal color clients.',
    image: '/images/ex4.jpg',
    specialties: ['Light Spring', 'Clear Winter', 'Beginner consults']
  },
  {
    id: 'ex5',
    name: 'Nia Brooks',
    title: 'Color Coach',
    location: 'Seoul, South Korea',
    description: 'Nia works with inclusive skin tone analysis and richer palettes for users who want confident color choices.',
    image: '/images/ex5.jpg',
    specialties: ['Deep Autumn', 'True Winter', 'Beauty marketing']
  },
  {
    id: 'ex6',
    name: 'Elizabeth Lee',
    title: 'Certified Color Analyst',
    location: 'Seoul, South Korea',
    description: 'Elizabeth helps users balance personality, undertone, and lifestyle so palette guidance feels timeless and useful.',
    image: '/images/ex6.jpg',
    specialties: ['Neutral undertones', 'Cool palettes', 'Classic style']
  },
  {
    id: 'ex7',
    name: 'Eunji Han',
    title: 'Lead Color Consultant',
    location: 'Seoul, South Korea',
    description: 'Eunji is known for precise cool-warm assessments and clear recommendations for high-impact palette changes.',
    image: '/images/ex7.jpg',
    specialties: ['Contrast analysis', 'Cool undertones', 'Color audits']
  },
  {
    id: 'ex8',
    name: 'Ara Jeong',
    title: 'Color Specialist',
    location: 'Gwangju, South Korea',
    description: 'Ara uses retail and styling experience to simplify muted wardrobes and tone-on-tone color decisions.',
    image: '/images/ex8.jpg',
    specialties: ['Muted seasons', 'Retail styling', 'Capsule wardrobes']
  },
  {
    id: 'ex9',
    name: 'Audrey Chen',
    title: 'Color Consultant',
    location: 'Shenzhen, China',
    description: 'Audrey helps users build energetic looks with clear, bright palettes for work, social, and digital presence.',
    image: '/images/ex9.jpg',
    specialties: ['Clear Spring', 'Bright Summer', 'Modern styling']
  },
  {
    id: 'ex10',
    name: 'Talia Kim',
    title: 'Color Strategy Consultant',
    location: 'Seoul, South Korea',
    description: 'Talia connects personal color with style identity, branding, and confident digital presentation.',
    image: '/images/ex10.jpg',
    specialties: ['Bright Spring', 'Clear Winter', 'Brand color']
  },
  {
    id: 'ex11',
    name: 'Olivia Bennett',
    title: 'Color Consultant',
    location: 'San Francisco, USA',
    description: 'Olivia focuses on soft summer and cool neutral palettes for polished wardrobe and personal branding choices.',
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
      <Container>
        <Hero>
          <HeroCopy>
            <Eyebrow>Expert consultations</Eyebrow>
            <Title>Turn your color report into everyday style decisions.</Title>
            <Description>
              Book a one-on-one session with a color consultant for palette validation, makeup edits,
              wardrobe planning, and clear next steps after your AI report.
            </Description>
            <StatsGrid>
              <StatCard>
                <StatValue>11</StatValue>
                <StatLabel>Consultants</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>30-60</StatValue>
                <StatLabel>Minute sessions</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>Demo</StatValue>
                <StatLabel>Booking flow</StatLabel>
              </StatCard>
            </StatsGrid>
          </HeroCopy>
          <HeroImage src="/images/consultantpagedecoration.jpg" alt="Color consultation studio preview" />
        </Hero>

        <SectionHeader>
          <Eyebrow>Choose a consultant</Eyebrow>
          <SectionTitle>Specialists for palette, makeup, wardrobe, and style strategy.</SectionTitle>
          <Description>
            Each consultant profile highlights the seasonal directions and styling contexts where they can help most.
          </Description>
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
      </Container>
    </PageShell>
  );
};

export default Consultation;
