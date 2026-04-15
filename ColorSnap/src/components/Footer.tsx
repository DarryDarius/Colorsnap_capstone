import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-accent) 100%);
  color: var(--text-primary);
  padding: var(--spacing-xxl) 0 var(--spacing-lg);
  margin-top: auto;
  border-top: 1px solid rgba(232, 180, 184, 0.2);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

const FooterSection = styled.div`
  h3 {
    color: var(--text-primary);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    letter-spacing: 0.5px;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: var(--spacing-sm);
    font-size: 0.95rem;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: var(--spacing-xs);
  }

  a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 0.95rem;

    &:hover {
      color: var(--primary-rose);
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(232, 180, 184, 0.2);
  padding-top: var(--spacing-lg);
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
`;

const Contact = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
`;

const SocialLink = styled.a`
  color: var(--text-secondary);
  font-size: 1.2rem;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-rose);
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.5px;
`;

const Description = styled.p`
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.95rem;
  max-width: 300px;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <Logo>ColorSnap</Logo>
            <Description>
              Discover your perfect color palette with AI-powered analysis and expert guidance. 
              Transform your style with personalized recommendations.
            </Description>
          </FooterSection>
          
          <FooterSection>
            <h3>Services</h3>
            <ul>
              <li><a href="/analysis">AI Color Analysis</a></li>
              <li><a href="/consultation">Expert Consultation</a></li>
              <li><a href="/shopping-cart">Product Recommendations</a></li>
              <li><a href="/about">About Our Process</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Support</h3>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/consultation">Book Consultation</a></li>
              <li><a href="mailto:support@ColorSnap.com">Contact Support</a></li>
            </ul>
          </FooterSection>
          
          <FooterSection>
            <h3>Connect</h3>
            <SocialLinks>
              <SocialLink href="#" aria-label="Instagram">📷</SocialLink>
              <SocialLink href="#" aria-label="Facebook">📘</SocialLink>
              <SocialLink href="#" aria-label="Twitter">🐦</SocialLink>
              <SocialLink href="#" aria-label="YouTube">📺</SocialLink>
            </SocialLinks>
          </FooterSection>
        </FooterGrid>
        
        <FooterBottom>
          <Copyright>&copy; 2025 ColorSnap. All rights reserved.</Copyright>
          <Contact>Contact: support@ColorSnap.com</Contact>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
