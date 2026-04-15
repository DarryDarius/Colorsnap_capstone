import React, { useState } from 'react';
import styled from 'styled-components';

const FAQContainer = styled.div`
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

const FAQItem = styled.div`
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;

  &:last-child {
    border-bottom: none;
  }
`;

const Question = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  text-align: left;
  padding: 1.5rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  span {
    color: #f96ed6;
    font-size: 1.5rem;
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  }
`;

const Answer = styled.div<{ $isOpen: boolean }>`
  padding: ${props => props.$isOpen ? '0 1.5rem 1.5rem' : '0 1.5rem'};
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  color: #666;
  line-height: 1.6;
`;

interface FAQData {
  question: string;
  answer: string;
}

const faqData: FAQData[] = [
  {
    question: "How accurate is the AI color analysis?",
    answer: "Our AI technology has been trained on thousands of color analysis cases and achieves over 90% accuracy. However, we recommend booking a consultation with our expert color consultants for the most personalized and detailed analysis."
  },
  {
    question: "What type of photo should I upload?",
    answer: "For best results, upload a clear frontal selfie taken in natural daylight. Avoid heavy makeup, filters, or artificial lighting. Your face should be unobstructed and show your natural hair and eye colors."
  },
  {
    question: "How long does the analysis take?",
    answer: "The AI analysis typically takes 2-3 seconds to process your photo and generate your personalized color palette. The entire process from upload to results usually takes less than a minute."
  },
  {
    question: "What if I don't agree with my color analysis results?",
    answer: "We understand that color analysis can be subjective. You can upload multiple photos for analysis, or book a consultation with our expert color consultants who can provide more detailed and personalized guidance."
  },
  {
    question: "Is my photo stored permanently?",
    answer: "No, your photos are used solely for analysis and are not stored permanently. We process images securely and do not retain personal data beyond what's necessary for your color analysis."
  },
  {
    question: "How much does a consultation cost?",
    answer: "Consultation prices vary by expert and session length. Most consultations range from $50-$150 for a 30-60 minute session. You can view specific pricing when booking with individual consultants."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "We offer a satisfaction guarantee for all consultations. If you're not satisfied with your session, we'll work with you to address your concerns or provide a refund within 7 days of your consultation."
  },
  {
    question: "Do you ship products internationally?",
    answer: "Currently, we focus on color analysis and consultation services. The product recommendations we provide are suggestions for items you can purchase from your preferred retailers."
  },
  {
    question: "How often should I get a color analysis?",
    answer: "Your basic color palette remains relatively stable throughout your life, but factors like hair color changes, aging, or seasonal variations might affect your optimal colors. We recommend a new analysis every 2-3 years or after significant appearance changes."
  },
  {
    question: "Can the analysis work for all skin tones?",
    answer: "Yes! Our AI technology is designed to work for people of all ethnicities and skin tones. We're committed to inclusivity and believe that beauty comes in all colors."
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <FAQContainer>
      <Title>Frequently Asked Questions</Title>
      
      {faqData.map((item, index) => (
        <FAQItem key={index}>
          <Question 
            $isOpen={openItems.includes(index)}
            onClick={() => toggleItem(index)}
          >
            {item.question}
            <span>+</span>
          </Question>
          <Answer $isOpen={openItems.includes(index)}>
            {item.answer}
          </Answer>
        </FAQItem>
      ))}
    </FAQContainer>
  );
};

export default FAQ;
