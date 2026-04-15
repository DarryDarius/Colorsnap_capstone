import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ConsultationSection = styled.section`
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  padding: 3rem 2rem;
  margin: 2rem auto;
  max-width: 1200px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  text-align: center;

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 2rem 1rem;
  }
`;

const ConsultationTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ConsultationDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 3rem;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  color: #ffffff;
`;

const ExpertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  justify-items: center;
`;

const ExpertCard = styled.div`
  background: #FFF7F2;
  border: 1px solid #FFE0C6;
  border-radius: 15px;
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ExpertPhoto = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const ExpertName = styled.h3`
  font-size: 1.3rem;
  color: #f96ed6;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExpertIcon = styled.span`
  font-size: 1.3rem;
`;

const ExpertTitle = styled.h4`
  font-size: 0.9rem;
  color: #8A6D5C;
  margin-bottom: 0.75rem;
`;

const ExpertDescription = styled.p`
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const BookButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f96ed6;
  border: none;
  color: #fff;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #D9793F;
    transform: translateY(-2px);
  }
`;

interface Expert {
  id: string;
  name: string;
  title: string;
  location: string;
  description: string;
  image: string;
  icon: string;
}

const experts: Expert[] = [
  {
    id: 'ex1',
    name: 'Yuna Lee',
    title: 'Personal Color Consultant',
    location: 'Busan, South Korea',
    description: 'With 5 years of experience in personal color analysis, Yuna has helped over 200 clients discover their best tones. She specializes in soft summer and light spring palettes and is known for her calm, intuitive approach to everyday styling.',
    image: '/images/ex1.jpg',
    icon: '🌿'
  },
  {
    id: 'ex2',
    name: 'Jisoo Park',
    title: 'Senior Color Consultant',
    location: 'Seoul, South Korea',
    description: 'Jisoo has worked with ColorSnap for over 6 years, specializing in deep winter and cool summer tones. Her clients appreciate her structured yet friendly approach, helping them translate analysis into confident everyday outfits.',
    image: '/images/ex2.jpg',
    icon: '💼'
  },
  {
    id: 'ex3',
    name: 'Soojin Kwon',
    title: 'Color & Style Coach',
    location: 'Incheon, South Korea',
    description: 'Soojin has been part of the ColorSnap team for 4 years, blending personal color theory with real-life styling. She is especially skilled in light summer and soft autumn tones, making color feel both calming and empowering.',
    image: '/images/ex3.jpg',
    icon: '🌸'
  },
  {
    id: 'ex4',
    name: 'Ha-eun Lim',
    title: 'Junior Color Consultant',
    location: 'Daejeon, South Korea',
    description: 'Ha-eun joined ColorSnap after studying fashion color psychology and focuses on fresh, youthful palettes like light spring and clear winter. Her bright energy and easy-to-follow tips delight her clients.',
    image: '/images/ex4.jpg',
    icon: '🌷'
  },
  {
    id: 'ex5',
    name: 'Nia Brooks',
    title: 'Color Coach',
    location: 'Seoul, South Korea',
    description: 'Nia brings a global perspective with her background in beauty marketing and skin tone inclusivity. She specializes in deep autumn and true winter palettes, celebrating bold, rich color stories.',
    image: '/images/ex5.jpg',
    icon: '☀️'
  },
  {
    id: 'ex6',
    name: 'Elizabeth Lee',
    title: 'Certified Color Analyst',
    location: 'Seoul, South Korea',
    description: 'With 7 years of experience, Elizabeth works with neutral and cool undertones. Clients trust her for timeless advice and thoughtful guidance on balancing personality with palette.',
    image: '/images/ex6.jpg',
    icon: '💎'
  },
  {
    id: 'ex7',
    name: 'Eunji Han',
    title: 'Lead Color Consultant',
    location: 'Seoul, South Korea',
    description: 'Eunji has over 6 years at ColorSnap and is renowned for her precise cool/warm contrast assessments. Her sessions are both insightful and uplifting.',
    image: '/images/ex7.jpg',
    icon: '🌸'
  },
  {
    id: 'ex8',
    name: 'Ara Jeong',
    title: 'Color Specialist',
    location: 'Gwangju, South Korea',
    description: 'With a background in fashion retail and color consulting, Ara has spent 5 years simplifying wardrobes using muted seasonal palettes and tone-on-tone styling.',
    image: '/images/ex8.jpg',
    icon: '🍃'
  },
  {
    id: 'ex9',
    name: 'Audrey Chen',
    title: 'Color Consultant',
    location: 'Shenzhen, China',
    description: 'Audrey is known for her energetic, modern take on clear spring and bright summer palettes. She helps young professionals build fresh, color-smart wardrobes.',
    image: '/images/ex9.jpg',
    icon: '🎀'
  },
  {
    id: 'ex10',
    name: 'Talia Kim',
    title: 'Color Strategy Consultant',
    location: 'Seoul, South Korea',
    description: 'Talia combines consulting experience with digital media expertise to help clients understand color\'s role in style, branding, and identity. She specializes in bright spring and clear winter palettes.',
    image: '/images/ex10.jpg',
    icon: '🌟'
  },
  {
    id: 'ex11',
    name: 'Olivia Bennett',
    title: 'Color Consultant',
    location: 'San Francisco, USA',
    description: 'Olivia focuses on soft summer and cool neutral palettes with 4 years of experience. With expertise in wardrobe styling and personal branding, she creates looks that are fresh and polished.',
    image: '/images/ex11.jpg',
    icon: '🌼'
  }
];

const Consultation: React.FC = () => {
  const navigate = useNavigate();

  const handleBookConsultation = (expertId: string) => {
    navigate(`/booking?expert=${expertId}`);
  };

  return (
    <ConsultationSection>
      <ConsultationTitle>Expert Consultation</ConsultationTitle>
      <ConsultationDescription>
        Our professional color consultants provide one-on-one consultation via video call, 
        offering personalized advice based on your color palette results. Choose an expert 
        below to learn more about their approach and schedule your consultation.
      </ConsultationDescription>
      
      <ExpertsGrid>
        {experts.map((expert) => (
          <ExpertCard key={expert.id}>
            <ExpertPhoto src={expert.image} alt={expert.name} />
            <ExpertName>
              <ExpertIcon>{expert.icon}</ExpertIcon>
              {expert.name}
            </ExpertName>
            <ExpertTitle>{expert.title} – {expert.location}</ExpertTitle>
            <ExpertDescription>{expert.description}</ExpertDescription>
            <BookButton onClick={() => handleBookConsultation(expert.id)}>
              Book Consultation
            </BookButton>
          </ExpertCard>
        ))}
      </ExpertsGrid>
    </ConsultationSection>
  );
};

export default Consultation;
