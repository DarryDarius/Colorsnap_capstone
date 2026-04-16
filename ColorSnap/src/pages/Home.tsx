import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  position: relative;
  overflow: hidden;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  margin-top: 30px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/images/index1.jpg') no-repeat center center/cover;
    filter: blur(1px);
    z-index: -1;
  }

  @media (max-width: 768px) {
    min-height: 60vh;
    padding: 2rem 1rem;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: white;
  color: #f96ed6;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const IntroductionSection = styled.section`
  padding: 4rem 2rem;
  background: white;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const IntroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const IntroText = styled.div`
  flex: 1;

  h2 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 1.5rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #666;
    margin-bottom: 2rem;
  }

  a {
    color: #f96ed6;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #d9793f;
    }
  }
`;

const IntroImage = styled.div`
  flex: 1;
  text-align: center;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 2rem;
  background: #f8f9fa;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  h3 {
    font-size: 1.5rem;
    color: #f96ed6;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
`;

const CTASection = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Home: React.FC = () => {
  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Discover Your Signature Colors, Illuminate Your Style</HeroTitle>
          <HeroSubtitle>
            Personal color analysis powered by AI and expert advice to boost your confidence.
          </HeroSubtitle>
          <CTAButton to="/analysis">Start Analysis →</CTAButton>
        </HeroContent>
      </HeroSection>

      <IntroductionSection>
        <IntroContainer>
          <IntroText>
            <h2>About ColorSnap</h2>
            <p>
              ColorSnap uses advanced AI algorithms to generate personalized color palettes for you, 
              supported by professional color consultants. Whether you're updating your wardrobe or 
              choosing makeup, we help you find the perfect colors that suit you best.
            </p>
            <Link to="/about">Learn More</Link>
          </IntroText>
          <IntroImage>
            <img src="/images/hero-bg-custom.jpg" alt="ColorSnap personalized palette preview" />
          </IntroImage>
        </IntroContainer>
      </IntroductionSection>

      <FeaturesSection>
        <FeaturesContainer>
          <FeatureCard>
            <h3>Upload Photo</h3>
            <p>Upload a clear frontal photo to kickstart the AI color analysis.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>Get Your Palette</h3>
            <p>Generate your personalized color palette in seconds.</p>
          </FeatureCard>
          <FeatureCard>
            <h3>Expert Guidance</h3>
            <p>Schedule one-on-one video consultations to receive professional advice.</p>
          </FeatureCard>
        </FeaturesContainer>
      </FeaturesSection>

      <CTASection>
        <CTAContainer>
          <CTATitle>Ready to transform your color style?</CTATitle>
          <CTAButton to="/analysis">Upload Photo to Begin →</CTAButton>
        </CTAContainer>
      </CTASection>
    </>
  );
};

export default Home;
