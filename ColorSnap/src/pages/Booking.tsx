import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const BookingContainer = styled.div`
  max-width: 800px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f96ed6;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f96ed6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f96ed6;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background: #d9793f;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ExpertInfo = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  border-left: 4px solid #f96ed6;
`;

const ExpertName = styled.h3`
  color: #f96ed6;
  margin-bottom: 0.5rem;
`;

const ExpertDetails = styled.p`
  color: #666;
  margin: 0;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
`;

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const expertId = searchParams.get('expert');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    duration: '30',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const experts = {
    ex1: { name: 'Yuna Lee', title: 'Personal Color Consultant', location: 'Busan, South Korea' },
    ex2: { name: 'Jisoo Park', title: 'Senior Color Consultant', location: 'Seoul, South Korea' },
    ex3: { name: 'Soojin Kwon', title: 'Color & Style Coach', location: 'Incheon, South Korea' },
    ex4: { name: 'Ha-eun Lim', title: 'Junior Color Consultant', location: 'Daejeon, South Korea' },
    ex5: { name: 'Nia Brooks', title: 'Color Coach', location: 'Seoul, South Korea' },
    ex6: { name: 'Elizabeth Lee', title: 'Certified Color Analyst', location: 'Seoul, South Korea' },
    ex7: { name: 'Eunji Han', title: 'Lead Color Consultant', location: 'Seoul, South Korea' },
    ex8: { name: 'Ara Jeong', title: 'Color Specialist', location: 'Gwangju, South Korea' },
    ex9: { name: 'Audrey Chen', title: 'Color Consultant', location: 'Shenzhen, China' },
    ex10: { name: 'Talia Kim', title: 'Color Strategy Consultant', location: 'Seoul, South Korea' },
    ex11: { name: 'Olivia Bennett', title: 'Color Consultant', location: 'San Francisco, USA' }
  };

  const selectedExpert = expertId ? experts[expertId as keyof typeof experts] : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the booking data to your backend
    // console.log('Booking submitted:', { expert: selectedExpert, ...formData });
    setIsSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        duration: '30',
        message: ''
      });
      setIsSubmitted(false);
    }, 3000);
  };

  if (!selectedExpert) {
    return (
      <BookingContainer>
        <Title>Booking Error</Title>
        <p>No expert selected. Please return to the consultation page to select an expert.</p>
      </BookingContainer>
    );
  }

  return (
    <BookingContainer>
      <Title>Book Consultation</Title>
      
      {isSubmitted && (
        <SuccessMessage>
          Thank you! Your booking request has been submitted. We'll contact you within 24 hours to confirm your appointment.
        </SuccessMessage>
      )}

      <ExpertInfo>
        <ExpertName>{selectedExpert.name}</ExpertName>
        <ExpertDetails>
          {selectedExpert.title} • {selectedExpert.location}
        </ExpertDetails>
      </ExpertInfo>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="date">Preferred Date *</Label>
          <Input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="time">Preferred Time *</Label>
          <Select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a time</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="duration">Session Duration</Label>
          <Select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="message">Additional Notes</Label>
          <TextArea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Any specific questions or topics you'd like to discuss during your consultation..."
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitted}>
          {isSubmitted ? 'Submitting...' : 'Book Consultation'}
        </SubmitButton>
      </Form>
    </BookingContainer>
  );
};

export default Booking;
