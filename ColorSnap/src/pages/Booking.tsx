import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
`;

const HeaderBlock = styled.div`
  margin-bottom: var(--space-6);
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
  font-size: clamp(2.25rem, 5vw, var(--font-4xl));
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
`;

const BookingLayout = styled.div`
  align-items: start;
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 360px minmax(0, 1fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);

  @media (max-width: 640px) {
    padding: var(--space-5);
  }
`;

const ExpertPanel = styled(Panel)`
  position: sticky;
  top: 96px;

  @media (max-width: 900px) {
    position: static;
  }
`;

const ExpertLabel = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-2);
  text-transform: uppercase;
`;

const ExpertName = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-2xl);
  line-height: 1.15;
  margin-bottom: var(--space-3);
`;

const ExpertDetails = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
`;

const DemoNote = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  font-size: var(--font-sm);
  font-weight: 700;
  line-height: 1.6;
  padding: var(--space-4);
`;

const Form = styled.form`
  display: grid;
  gap: var(--space-4);
`;

const FormGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  color: var(--text-primary);
  font-weight: 800;
`;

const Input = styled.input`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-md);
  padding: 0.85rem 1rem;

  &:focus {
    border-color: var(--brand-primary);
  }
`;

const Select = styled.select`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-md);
  padding: 0.85rem 1rem;

  &:focus {
    border-color: var(--brand-primary);
  }
`;

const TextArea = styled.textarea`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--font-md);
  min-height: 130px;
  padding: 0.85rem 1rem;
  resize: vertical;

  &:focus {
    border-color: var(--brand-primary);
  }
`;

const SubmitButton = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.95rem 1.1rem;

  &:hover:not(:disabled) {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    background: #E4DDDA;
    border-color: #E4DDDA;
    color: var(--text-muted);
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--success);
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
`;

const ErrorPanel = styled(Panel)`
  text-align: center;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-5);
`;

const PrimaryLink = styled(Link)`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-hover);
    border-color: var(--brand-primary-hover);
  }
`;

const SecondaryLink = styled(Link)`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover {
    background: var(--brand-primary-pale);
    border-color: var(--brand-primary-soft);
  }
`;

const experts = {
  ex1: { name: 'Yuna Lee', title: 'Personal Color Consultant', location: 'Busan, South Korea' },
  ex2: { name: 'Jisoo Park', title: 'Senior Color Consultant', location: 'Seoul, South Korea' },
  ex3: { name: 'Soojin Kwon', title: 'Color and Style Coach', location: 'Incheon, South Korea' },
  ex4: { name: 'Ha-eun Lim', title: 'Junior Color Consultant', location: 'Daejeon, South Korea' },
  ex5: { name: 'Nia Brooks', title: 'Color Coach', location: 'Seoul, South Korea' },
  ex6: { name: 'Elizabeth Lee', title: 'Certified Color Analyst', location: 'Seoul, South Korea' },
  ex7: { name: 'Eunji Han', title: 'Lead Color Consultant', location: 'Seoul, South Korea' },
  ex8: { name: 'Ara Jeong', title: 'Color Specialist', location: 'Gwangju, South Korea' },
  ex9: { name: 'Audrey Chen', title: 'Color Consultant', location: 'Shenzhen, China' },
  ex10: { name: 'Talia Kim', title: 'Color Strategy Consultant', location: 'Seoul, South Korea' },
  ex11: { name: 'Olivia Bennett', title: 'Color Consultant', location: 'San Francisco, USA' }
};

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

  const selectedExpert = expertId ? experts[expertId as keyof typeof experts] : null;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);

    window.setTimeout(() => {
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
      <PageShell>
        <Container>
          <ErrorPanel>
            <Eyebrow>Booking unavailable</Eyebrow>
            <Title>No consultant selected</Title>
            <Description>Please choose a consultant before opening the booking form.</Description>
            <ActionRow>
              <PrimaryLink to="/consultation">Choose Consultant</PrimaryLink>
              <SecondaryLink to="/analysis">Start Analysis</SecondaryLink>
            </ActionRow>
          </ErrorPanel>
        </Container>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Container>
        <HeaderBlock>
          <Eyebrow>Consultation booking</Eyebrow>
          <Title>Book Consultation</Title>
          <Description>
            Submit a demo booking request with your preferred time, session length, and color questions.
          </Description>
        </HeaderBlock>

        <BookingLayout>
          <ExpertPanel>
            <ExpertLabel>Selected consultant</ExpertLabel>
            <ExpertName>{selectedExpert.name}</ExpertName>
            <ExpertDetails>
              {selectedExpert.title} | {selectedExpert.location}
            </ExpertDetails>
            <DemoNote>
              Demo booking flow: this request is confirmed in the browser for capstone presentation purposes.
            </DemoNote>
          </ExpertPanel>

          <Panel>
            {isSubmitted && (
              <SuccessMessage>
                Thank you. Your booking request has been submitted. In a production version, a confirmation email would follow.
              </SuccessMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="name">Full Name</Label>
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
                  <Label htmlFor="email">Email Address</Label>
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
                  <Label htmlFor="date">Preferred Date</Label>
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
                  <Label htmlFor="time">Preferred Time</Label>
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

                <FullWidthGroup>
                  <Label htmlFor="message">Additional Notes</Label>
                  <TextArea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Share your color report questions, wardrobe goals, or makeup concerns."
                  />
                </FullWidthGroup>
              </FormGrid>

              <SubmitButton type="submit" disabled={isSubmitted}>
                {isSubmitted ? 'Submitting...' : 'Book Consultation'}
              </SubmitButton>
            </Form>
          </Panel>
        </BookingLayout>
      </Container>
    </PageShell>
  );
};

export default Booking;
