import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { createBooking, getAnalysis, getSavedLooks } from '../services/api';
import type { AnalysisResult, SavedLookRecord } from '../types/analysis';

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

const ContextStrip = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-lg);
  color: var(--accent-olive);
  line-height: 1.6;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
`;

const BriefGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: var(--space-6);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BriefItem = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: var(--space-4);
`;

const BriefLabel = styled.span`
  color: var(--text-secondary);
  display: block;
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-1);
`;

const BriefValue = styled.strong`
  color: var(--text-primary);
  line-height: 1.4;
`;

const ContextTitle = styled.strong`
  color: var(--accent-olive);
  display: block;
  margin-bottom: var(--space-1);
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

const CheckboxGrid = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const CheckboxLabel = styled.label`
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-2);
  font-weight: 700;
`;

const Checkbox = styled.input`
  accent-color: var(--brand-primary);
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

const WarningMessage = styled(SuccessMessage)`
  background: #FFF8EC;
  border-color: #E8D5B8;
  color: var(--warning);
`;

const PricePreview = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
  line-height: 1.6;
  padding: var(--space-4);

  strong {
    color: var(--text-primary);
  }

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const ErrorPanel = styled(Panel)`
  text-align: center;
`;

const ConfirmationPanel = styled(Panel)`
  text-align: center;
`;

const ConfirmationGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  margin: var(--space-5) auto 0;
  max-width: 680px;
  text-align: left;
`;

const ConfirmationItem = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
  padding: var(--space-3);

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const PrepList = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-2);
  margin: var(--space-5) auto 0;
  max-width: 680px;
  padding-left: 1.2rem;
  text-align: left;
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

type BookingAddOn = 'wardrobe_review' | 'makeup_audit';
type SessionType = 'video' | 'in_person' | 'written_review';

const sessionTypeLabels: Record<SessionType, string> = {
  video: 'Video consultation',
  in_person: 'In-person session',
  written_review: 'Written report review'
};

const addOnLabels: Record<BookingAddOn, string> = {
  wardrobe_review: 'Wardrobe review',
  makeup_audit: 'Makeup audit'
};

const buildConsultantBrief = (look: SavedLookRecord, analysis: AnalysisResult | null) => {
  const products = look.products
    .slice(0, 5)
    .map((product) => `${product.brand} ${product.name}`)
    .join(', ');
  const season = analysis?.season_result?.primary ? ` for ${analysis.season_result.primary}` : '';
  return `Please review my saved look "${look.name}"${season}. Products: ${products || 'no products selected yet'}.`;
};

const getEstimatedPrice = (duration: string, addOns: BookingAddOn[]) => {
  const basePrice = duration === '60' ? 95 : duration === '45' ? 78 : 55;
  const addOnTotal = addOns.reduce((total, addOn) => total + (addOn === 'wardrobe_review' ? 35 : 25), 0);
  return basePrice + addOnTotal;
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
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago',
    sessionType: 'video' as SessionType,
    message: ''
  });
  const [addOns, setAddOns] = useState<BookingAddOn[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLookRecord[]>([]);
  const [selectedLookId, setSelectedLookId] = useState('');
  const [userQuestions, setUserQuestions] = useState('');

  const selectedExpert = expertId ? experts[expertId as keyof typeof experts] : null;
  const requestedAnalysisId = searchParams.get('analysis_id') || localStorage.getItem('lastAnalysisId');
  const requestedLookId = searchParams.get('saved_look_id') || '';
  const analysisId = requestedAnalysisId;
  const selectedLook = useMemo(
    () => savedLooks.find((look) => look.look_id === selectedLookId) || null,
    [savedLooks, selectedLookId]
  );

  useEffect(() => {
    let isMounted = true;

    const loadContext = async () => {
      if (!analysisId) {
        return;
      }

      try {
        const [nextAnalysis, looksResponse] = await Promise.all([
          getAnalysis(analysisId),
          getSavedLooks(analysisId)
        ]);

        if (!isMounted) return;

        setAnalysis(nextAnalysis.status === 'completed' ? nextAnalysis : null);
        setSavedLooks(looksResponse.items);
        const requestedLook = requestedLookId
          ? looksResponse.items.find((look) => look.look_id === requestedLookId)
          : null;

        if (requestedLook || looksResponse.items[0]) {
          setSelectedLookId((requestedLook || looksResponse.items[0]).look_id);
        }
      } catch {
        if (isMounted) {
          setAnalysis(null);
          setSavedLooks([]);
        }
      }
    };

    void loadContext();

    return () => {
      isMounted = false;
    };
  }, [analysisId, requestedLookId]);

  useEffect(() => {
    if (selectedLook && !userQuestions.trim()) {
      setUserQuestions(buildConsultantBrief(selectedLook, analysis));
    }
  }, [analysis, selectedLook, userQuestions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const toggleAddOn = (addOn: BookingAddOn) => {
    setAddOns((currentAddOns) => (
      currentAddOns.includes(addOn)
        ? currentAddOns.filter((currentAddOn) => currentAddOn !== addOn)
        : [...currentAddOns, addOn]
    ));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedExpert) return;

    setIsSubmitting(true);
    setSaveWarning(null);
    setBookingId(null);

    try {
      const booking = await createBooking({
        expert_id: expertId || '',
        expert_name: selectedExpert.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        date: formData.date,
        time: formData.time,
        duration: formData.duration as '30' | '45' | '60',
        timezone: formData.timezone,
        session_type: formData.sessionType,
        add_ons: addOns,
        estimated_price: getEstimatedPrice(formData.duration, addOns).toFixed(2),
        analysis_id: analysis?.analysis_id,
        saved_look_id: selectedLook?.look_id,
        user_questions: userQuestions || undefined,
        message: formData.message || undefined
      });
      setBookingId(booking.booking_id);
    } catch (error) {
      setSaveWarning(
        error instanceof Error
          ? `Demo request completed locally, but backend save failed: ${error.message}`
          : 'Demo request completed locally, but backend save failed.'
      );
    } finally {
      setIsSubmitting(false);
    }

    setIsSubmitted(true);
  };

  const estimatedPrice = getEstimatedPrice(formData.duration, addOns);

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

  if (isSubmitted) {
    return (
      <PageShell>
        <Container>
          <ConfirmationPanel>
            <Eyebrow>Booking request sent</Eyebrow>
            <Title>Consultation Requested</Title>
            <Description>
              Your demo consultation request has been captured for the capstone flow.
            </Description>
            {bookingId && (
              <SuccessMessage>
                Backend booking record saved: {bookingId}.
              </SuccessMessage>
            )}
            {saveWarning && <WarningMessage>{saveWarning}</WarningMessage>}
            <ConfirmationGrid>
              <ConfirmationItem>
                <span>Consultant</span>
                <strong>{selectedExpert.name}</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Preferred time</span>
                <strong>{formData.date} at {formData.time} ({formData.timezone})</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Session length</span>
                <strong>{formData.duration} minutes</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Session type</span>
                <strong>{sessionTypeLabels[formData.sessionType]}</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Add-ons</span>
                <strong>{addOns.length > 0 ? addOns.map((addOn) => addOnLabels[addOn]).join(', ') : 'None'}</strong>
              </ConfirmationItem>
              <ConfirmationItem>
                <span>Demo estimate</span>
                <strong>${estimatedPrice.toFixed(2)}</strong>
              </ConfirmationItem>
              {analysis && (
                <ConfirmationItem>
                  <span>Color profile</span>
                  <strong>{analysis.season_result?.primary} · {analysis.attributes?.undertone}</strong>
                </ConfirmationItem>
              )}
              {selectedLook && (
                <ConfirmationItem>
                  <span>Saved look</span>
                  <strong>{selectedLook.name} ({selectedLook.products.length} products)</strong>
                </ConfirmationItem>
              )}
            </ConfirmationGrid>
            <PrepList>
              <li>Bring your latest ColorSnap result or upload a fresh photo before the session.</li>
              <li>Prepare 2-3 outfits or products you want the consultant to review.</li>
              <li>For video sessions, use natural light so color notes stay reliable.</li>
            </PrepList>
            <ActionRow>
              <PrimaryLink to="/consultation">Choose Another Consultant</PrimaryLink>
              <SecondaryLink to="/analysis">Start Analysis</SecondaryLink>
            </ActionRow>
          </ConfirmationPanel>
        </Container>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Container>
        <HeaderBlock>
          <Eyebrow>Consultation booking</Eyebrow>
          <Title>Book Your Consultation</Title>
          <Description>
            Submit a demo booking request with your preferred time, session length, and color questions.
          </Description>
        </HeaderBlock>

        <ContextStrip>
          <ContextTitle>Expert support extends the same color-report journey.</ContextTitle>
          Bring your palette questions, product concerns, or wardrobe goals into a focused demo booking request.
        </ContextStrip>

        {(analysis || savedLooks.length > 0) && (
          <BriefGrid>
            <BriefItem>
              <BriefLabel>Color profile</BriefLabel>
              <BriefValue>
                {analysis?.season_result
                  ? `${analysis.season_result.primary}${analysis.season_result.secondary ? ` / ${analysis.season_result.secondary}` : ''}`
                  : 'No completed result attached'}
              </BriefValue>
            </BriefItem>
            <BriefItem>
              <BriefLabel>Attributes</BriefLabel>
              <BriefValue>
                {analysis?.attributes
                  ? `${analysis.attributes.undertone}, ${analysis.attributes.saturation}, ${analysis.attributes.contrast} contrast`
                  : 'No attributes attached'}
              </BriefValue>
            </BriefItem>
            <BriefItem>
              <BriefLabel>Saved look</BriefLabel>
              <BriefValue>
                {selectedLook ? `${selectedLook.name} · ${selectedLook.products.length} products` : 'No saved look selected'}
              </BriefValue>
            </BriefItem>
          </BriefGrid>
        )}

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

                <FormGroup>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                  >
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Seoul">Korea Standard Time</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select
                    id="sessionType"
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleInputChange}
                  >
                    <option value="video">Video consultation</option>
                    <option value="in_person">In-person session</option>
                    <option value="written_review">Written report review</option>
                  </Select>
                </FormGroup>

                <FullWidthGroup>
                  <Label>Add-on options</Label>
                  <CheckboxGrid>
                    <CheckboxLabel>
                      <Checkbox
                        type="checkbox"
                        checked={addOns.includes('wardrobe_review')}
                        onChange={() => toggleAddOn('wardrobe_review')}
                      />
                      Wardrobe review (+$35)
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <Checkbox
                        type="checkbox"
                        checked={addOns.includes('makeup_audit')}
                        onChange={() => toggleAddOn('makeup_audit')}
                      />
                      Makeup audit (+$25)
                    </CheckboxLabel>
                  </CheckboxGrid>
                </FullWidthGroup>

                <FullWidthGroup>
                  <PricePreview>
                    <span>Demo consultation estimate</span>
                    <strong>${estimatedPrice.toFixed(2)}</strong>
                  </PricePreview>
                </FullWidthGroup>

                <FullWidthGroup>
                  <Label htmlFor="savedLookId">Saved Look for Consultant</Label>
                  <Select
                    id="savedLookId"
                    name="savedLookId"
                    value={selectedLookId}
                    onChange={(event) => setSelectedLookId(event.target.value)}
                  >
                    <option value="">No saved look</option>
                    {savedLooks.map((look) => (
                      <option key={look.look_id} value={look.look_id}>
                        {look.name} ({look.products.length} products)
                      </option>
                    ))}
                  </Select>
                </FullWidthGroup>

                <FullWidthGroup>
                  <Label htmlFor="userQuestions">Questions for Consultant</Label>
                  <TextArea
                    id="userQuestions"
                    name="userQuestions"
                    value={userQuestions}
                    onChange={(event) => setUserQuestions(event.target.value)}
                    placeholder="Ask about your saved look, colors you are unsure about, or product swaps."
                  />
                </FullWidthGroup>

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

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Book Consultation'}
              </SubmitButton>
            </Form>
          </Panel>
        </BookingLayout>
      </Container>
    </PageShell>
  );
};

export default Booking;
