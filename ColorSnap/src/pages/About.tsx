import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #f96ed6;
  margin-bottom: 2rem;
  font-size: 2.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Content = styled.div`
  line-height: 1.8;
  color: #333;
  font-size: 1.1rem;

  h2 {
    color: #f96ed6;
    margin: 2rem 0 1rem;
    font-size: 1.8rem;
  }

  p {
    margin-bottom: 1.5rem;
  }

  ul {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const About: React.FC = () => {
  return (
    <AboutContainer>
      <Title>About ColorSnap</Title>
      <Content>
        <h2>Our Mission</h2>
        <p>
          At ColorSnap, we believe that everyone deserves to feel confident and beautiful in their own skin. 
          Our mission is to democratize personal color analysis by combining cutting-edge AI technology 
          with expert human insight to help you discover your perfect color palette.
        </p>

        <h2>What We Do</h2>
        <p>
          ColorSnap uses advanced artificial intelligence algorithms to analyze your skin tone, 
          facial features, and natural coloring to determine your optimal color palette. 
          Our AI technology examines multiple factors including:
        </p>
        <ul>
          <li>Skin undertones (warm, cool, or neutral)</li>
          <li>Eye color and contrast</li>
          <li>Hair color and texture</li>
          <li>Natural lip and cheek tones</li>
          <li>Overall color harmony</li>
        </ul>

        <h2>Our Expert Team</h2>
        <p>
          While our AI provides the foundation, our team of certified color consultants 
          brings years of experience in personal color analysis and styling. They work 
          alongside our technology to provide personalized recommendations and one-on-one 
          consultations to help you make the most of your color palette.
        </p>

        <h2>Privacy & Security</h2>
        <p>
          We take your privacy seriously. Your photos are used solely for color analysis 
          and are not stored permanently or shared with third parties. Our AI processes 
          images securely and does not retain personal data beyond what's necessary for 
          your color analysis.
        </p>

        <h2>Our Commitment</h2>
        <p>
          We're committed to inclusivity and believe that beauty comes in all colors, 
          shapes, and sizes. Our technology is designed to work for people of all 
          ethnicities and skin tones, helping everyone discover their unique beauty.
        </p>

        <h2>Get Started</h2>
        <p>
          Ready to discover your perfect colors? Upload a photo and let our AI analyze 
          your unique features, then explore personalized product recommendations and 
          book a consultation with one of our expert color consultants.
        </p>
      </Content>
    </AboutContainer>
  );
};

export default About;
