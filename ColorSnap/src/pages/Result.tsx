import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AnalysisSummary from '../components/analysis/AnalysisSummary';
import AttributeChips from '../components/analysis/AttributeChips';
import BeautyRecommendations from '../components/analysis/BeautyRecommendations';
import FashionRecommendations from '../components/analysis/FashionRecommendations';
import ImageQualityNotice from '../components/analysis/ImageQualityNotice';
import PaletteSection from '../components/analysis/PaletteSection';
import ProductRecommendations from '../components/analysis/ProductRecommendations';
import ShareResultPanel from '../components/share/ShareResultPanel';
import { ApiClientError, addProductToSavedLook, createAnalysisFeedback, getAnalysis, saveBeautyPreferences } from '../services/api';
import type {
  AnalysisFeedback,
  AnalysisResult,
  BeautyPreferenceInput,
  BudgetRange,
  MakeupStyle,
  ProductFinish,
  ProductRecommendation,
  ShoppingGoal
} from '../types/analysis';
import { addProductToCart } from '../utils/cart';
import { formatLabel, formatPercent } from '../utils/formatters';

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

const ResultContainer = styled.div`
  display: grid;
  gap: var(--space-6);
  max-width: var(--container-lg);
  margin: 0 auto;
`;

const ResultSection = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-7) var(--space-6);
  text-align: center;

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4);
  }
`;

const ResultTitle = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2.25rem, 5vw, var(--font-4xl));
  line-height: 1.05;
  margin: 0 auto var(--space-4);
  max-width: 820px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ResultDescription = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
  margin: 0 auto var(--space-5);
  max-width: 680px;
`;

const ResultImage = styled.img`
  aspect-ratio: 4 / 5;
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  margin: 0 auto var(--space-6);
  max-width: 280px;
  object-fit: cover;
  width: 100%;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-6);
`;

const InlineActions = styled(ActionButtons)`
  margin-top: var(--space-4);
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary)' : 'var(--surface)')};
  border: 1px solid ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary)' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$variant === 'primary' ? 'var(--text-inverse)' : 'var(--text-primary)')};
  font-size: var(--font-md);
  font-weight: 700;
  padding: 0.85rem 1.15rem;

  &:hover {
    background: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary-hover)' : 'var(--brand-primary-pale)')};
    border-color: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary-hover)' : 'var(--brand-primary-soft)')};
    transform: translateY(-1px);
  }
`;

const ReportSection = styled.section`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);

  @media (max-width: 768px) {
    padding: var(--space-5);
  }
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-2xl);
  line-height: 1.2;
  margin-bottom: var(--space-5);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ReportBlock = styled.div`
  margin-top: 2rem;
`;

const StatusBox = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  font-weight: 600;
  margin: var(--space-5) auto 0;
  max-width: 640px;
  padding: var(--space-4);
  text-align: left;
`;

const ErrorBox = styled(StatusBox)`
  background: #FFF4F2;
  border-color: #F0C9C3;
  color: var(--error);
`;

const StatusTitle = styled.strong`
  color: inherit;
  display: block;
  font-size: var(--font-md);
  margin-bottom: var(--space-2);
`;

const StatusCopy = styled.p`
  color: inherit;
  margin: 0;
`;

const ProcessingList = styled.ul`
  list-style: none;
  margin: 0.9rem 0 0;
  padding: 0;
  text-align: left;
  display: grid;
  gap: 0.45rem;
`;

const EvidenceGrid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const EvidenceCard = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: left;
`;

const EvidenceTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-md);
  margin-bottom: var(--space-3);
`;

const EvidenceList = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-2);
  line-height: 1.6;
  margin: 0;
  padding-left: 1.1rem;
`;

const CandidateList = styled.div`
  display: grid;
  gap: var(--space-3);
`;

const CandidateItem = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
  text-align: left;
`;

const CandidateHeader = styled.div`
  align-items: center;
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
`;

const CandidateScore = styled.span`
  color: var(--accent-olive);
  font-weight: 800;
`;

const ConfidenceBadge = styled.span<{ $level: 'confident' | 'likely' | 'tentative' }>`
  background: ${(props) => (
    props.$level === 'confident'
      ? 'var(--surface-sage)'
      : props.$level === 'likely'
        ? '#FFF8EC'
        : '#FFF4F2'
  )};
  border: 1px solid ${(props) => (
    props.$level === 'confident'
      ? '#DDE8DA'
      : props.$level === 'likely'
        ? '#E8D5B8'
        : '#F0C9C3'
  )};
  border-radius: var(--radius-md);
  color: ${(props) => (
    props.$level === 'confident'
      ? 'var(--accent-olive)'
      : props.$level === 'likely'
        ? 'var(--warning)'
        : 'var(--error)'
  )};
  display: inline-flex;
  font-size: var(--font-sm);
  font-weight: 800;
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
`;

const FeedbackPanel = styled.div`
  display: grid;
  gap: var(--space-4);
  margin: 0 auto;
  max-width: 760px;
  text-align: left;
`;

const FeedbackButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const FeedbackButton = styled.button<{ $selected?: boolean }>`
  background: ${(props) => (props.$selected ? 'var(--brand-primary)' : 'var(--surface)')};
  border: 1px solid ${(props) => (props.$selected ? 'var(--brand-primary)' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$selected ? 'var(--text-inverse)' : 'var(--text-primary)')};
  font-weight: 700;
  padding: 0.75rem 1rem;
`;

const FeedbackStatus = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const PreferenceIntro = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0 auto var(--space-5);
  max-width: 880px;
  padding: var(--space-4);
  text-align: left;

  strong {
    color: var(--text-primary);
  }
`;

const PreferenceGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 auto var(--space-4);
  max-width: 880px;
  text-align: left;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const PreferenceField = styled.label`
  color: var(--text-primary);
  display: grid;
  font-size: var(--font-sm);
  font-weight: 800;
  gap: var(--space-2);
`;

const PreferenceSelect = styled.select`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font: inherit;
  min-height: 44px;
  padding: 0.65rem 0.8rem;
`;

const PreferenceInput = styled.input`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font: inherit;
  min-height: 44px;
  padding: 0.65rem 0.8rem;
`;

const FinishChoices = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-4);
`;

const processingMessages = [
  'Checking lighting, clarity, and facial visibility.',
  'Estimating undertone, contrast, brightness, and saturation.',
  'Building your seasonal palette summary and product matches.'
];

const finishOptions: ProductFinish[] = ['matte', 'satin', 'dewy', 'natural', 'shimmer'];

const splitPreferenceText = (value: string) => (
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
);

type ResultErrorState = {
  title: string;
  message: string;
};

const getFriendlyLoadError = (error: unknown): ResultErrorState => {
  if (error instanceof ApiClientError) {
    if (error.code === 'ANALYSIS_NOT_FOUND') {
      return {
        title: 'Analysis not found',
        message: 'This report is no longer available in the demo backend. Start a new analysis to generate a fresh result.'
      };
    }

    return {
      title: 'Unable to load this result',
      message: `${error.message} (${error.code || `HTTP ${error.status}`})`
    };
  }

  if (error instanceof TypeError) {
    return {
      title: 'Backend connection lost',
      message: 'The result page could not reach the analysis backend. Start it with npm run backend:dev, then try again.'
    };
  }

  return {
    title: 'Unable to load this result',
    message: 'The result could not be loaded. Please try again.'
  };
};

const getFriendlyFailedAnalysis = (code?: string, message?: string): ResultErrorState => {
  if (code === 'OPENAI_CONFIG_MISSING') {
    return {
      title: 'OpenAI is not configured',
      message: 'Live OpenAI mode is active, but OPENAI_API_KEY is missing in backend/.env. Add the key or switch MOCK_AI=true for demo mode, then upload again.'
    };
  }

  if (code === 'IMAGE_QUALITY_BLOCKED') {
    return {
      title: 'Photo needs a clearer retake',
      message: message || 'The image quality check could not safely continue. Use an evenly lit, front-facing photo with your face unobstructed.'
    };
  }

  if (code === 'MODEL_TIMEOUT') {
    return {
      title: 'Analysis timed out',
      message: 'The AI request took too long to finish. Try again with a smaller image or switch to demo mode for the presentation.'
    };
  }

  if (code?.startsWith('OPENAI_') || code?.startsWith('MODEL_')) {
    return {
      title: 'AI analysis could not finish',
      message: message || 'The AI service returned an unexpected response. Try again, or use demo mode for a stable capstone flow.'
    };
  }

  return {
    title: 'Analysis could not be completed',
    message: message || 'Please try again with a clear natural-light photo.'
  };
};

const getConfidenceLevel = (confidence: number): 'confident' | 'likely' | 'tentative' => {
  if (confidence >= 0.8) return 'confident';
  if (confidence >= 0.65) return 'likely';
  return 'tentative';
};

const getConfidenceLabel = (confidence: number) => {
  const level = getConfidenceLevel(confidence);
  return level === 'confident' ? 'Confident' : level === 'likely' ? 'Likely' : 'Tentative';
};

const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<ResultErrorState | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingStep, setProcessingStep] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [feedbackRating, setFeedbackRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [feedbackTags, setFeedbackTags] = useState<AnalysisFeedback['issue_tags']>([]);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [makeupStyle, setMakeupStyle] = useState<MakeupStyle>('natural');
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('flexible');
  const [shoppingGoal, setShoppingGoal] = useState<ShoppingGoal>('full_look');
  const [preferredFinishes, setPreferredFinishes] = useState<ProductFinish[]>([]);
  const [preferredBrands, setPreferredBrands] = useState('');
  const [avoidColors, setAvoidColors] = useState('');
  const [preferenceStatus, setPreferenceStatus] = useState<string | null>(null);
  const [preferenceSaving, setPreferenceSaving] = useState(false);
  const [lookStatus, setLookStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const analysisId = searchParams.get('id') || localStorage.getItem('lastAnalysisId');

  useEffect(() => {
    const photo = localStorage.getItem('uploadedPhoto');
    if (photo) {
      setUploadedPhoto(photo);
    }
  }, []);

  useEffect(() => {
    if (!analysisId) {
      setError({
        title: 'No analysis selected',
        message: 'Upload a photo first so ColorSnap can prepare a color report.'
      });
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let pollDelay = 1000;

    const poll = async () => {
      try {
        const nextAnalysis = await getAnalysis(analysisId);
        if (!isMounted) return;

        setAnalysis(nextAnalysis);
        setError(null);

        if (nextAnalysis.status === 'processing') {
          timeoutId = setTimeout(poll, pollDelay);
          pollDelay = Math.min(pollDelay + 500, 3000);
        }
      } catch (err) {
        if (isMounted) {
          setError(getFriendlyLoadError(err));
          setAnalysis(null);
        }
      }
    };

    void poll();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [analysisId, retryCount]);

  useEffect(() => {
    if (analysis?.status && analysis.analysis_id) {
      localStorage.setItem('lastAnalysisId', analysis.analysis_id);
    }
  }, [analysis]);

  useEffect(() => {
    if (analysis?.status !== 'processing') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setProcessingStep((currentStep) => (currentStep + 1) % processingMessages.length);
    }, 1800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [analysis?.status]);

  const handleAddToCart = (product: ProductRecommendation) => {
    const { item } = addProductToCart(product, {
      analysisId: analysis?.analysis_id,
      description: product.reason,
      source: 'recommendation'
    });
    window.alert(`${product.name} is in your cart (${item.quantity}).`);
  };

  const handleSaveToLook = async (product: ProductRecommendation) => {
    if (!analysis?.analysis_id) {
      return;
    }

    try {
      const look = await addProductToSavedLook({
        analysis_id: analysis.analysis_id,
        product
      });
      setLookStatus(`${product.name} saved to ${look.name}.`);
    } catch (err) {
      setLookStatus(err instanceof Error ? err.message : 'Unable to save this product to a look.');
    }
  };

  const handleRetry = () => {
    setError(null);
    setAnalysis(null);
    setRetryCount((current) => current + 1);
  };

  const toggleFeedbackTag = (tag: AnalysisFeedback['issue_tags'][number]) => {
    setFeedbackTags((currentTags) => (
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    ));
  };

  const submitFeedback = async () => {
    if (!analysis?.analysis_id || !feedbackRating) {
      return;
    }

    try {
      await createAnalysisFeedback(analysis.analysis_id, {
        rating: feedbackRating,
        issue_tags: feedbackTags
      });
      setFeedbackStatus('Feedback saved for future quality tuning.');
    } catch (err) {
      setFeedbackStatus(err instanceof Error ? err.message : 'Unable to save feedback.');
    }
  };

  const togglePreferredFinish = (finish: ProductFinish) => {
    setPreferredFinishes((currentFinishes) => (
      currentFinishes.includes(finish)
        ? currentFinishes.filter((currentFinish) => currentFinish !== finish)
        : [...currentFinishes, finish]
    ));
  };

  const submitBeautyPreferences = async () => {
    if (!analysis?.analysis_id) {
      return;
    }

    const input: BeautyPreferenceInput = {
      analysis_id: analysis.analysis_id,
      makeup_style: makeupStyle,
      budget_range: budgetRange,
      shopping_goal: shoppingGoal,
      preferred_finishes: preferredFinishes,
      preferred_brands: splitPreferenceText(preferredBrands),
      avoid_colors: splitPreferenceText(avoidColors)
    };

    setPreferenceSaving(true);
    setPreferenceStatus(null);

    try {
      const response = await saveBeautyPreferences(input);
      setAnalysis((currentAnalysis) => (
        currentAnalysis
          ? { ...currentAnalysis, products: response.products }
          : currentAnalysis
      ));
      setPreferenceStatus('Preferences saved. Product recommendations have been re-ranked for your shopping style.');
    } catch (err) {
      setPreferenceStatus(err instanceof Error ? err.message : 'Unable to save beauty preferences.');
    } finally {
      setPreferenceSaving(false);
    }
  };

  const title = analysis?.status === 'completed' && analysis.season_result
    ? `Analysis Result: ${analysis.season_result.primary}`
    : 'Analysis Result';

  return (
    <PageShell>
      <ResultContainer>
      <ResultSection>
        <ResultTitle>{title}</ResultTitle>
        {uploadedPhoto && (
          <>
            <ResultDescription>This is the photo you uploaded:</ResultDescription>
            <ResultImage src={uploadedPhoto} alt="Uploaded" />
          </>
        )}

        {error && (
          <ErrorBox>
            <StatusTitle>{error.title}</StatusTitle>
            <StatusCopy>{error.message}</StatusCopy>
            <InlineActions>
              {analysisId && (
                <ActionButton type="button" onClick={handleRetry}>
                  Try Again
                </ActionButton>
              )}
              <ActionButton type="button" $variant="primary" onClick={() => navigate('/analysis')}>
                Start New Analysis
              </ActionButton>
            </InlineActions>
          </ErrorBox>
        )}

        {!error && (!analysis || analysis.status === 'processing') && (
          <StatusBox>
            We are preparing your personalized color report. This usually takes a few seconds.
            <ProcessingList>
              {processingMessages.map((message, index) => (
                <li key={message}>
                  {index === processingStep ? '• ' : '○ '}
                  {message}
                </li>
              ))}
            </ProcessingList>
          </StatusBox>
        )}

        {analysis?.status === 'failed' && (
          <ErrorBox>
            <StatusTitle>
              {getFriendlyFailedAnalysis(analysis.error?.code, analysis.error?.message).title}
            </StatusTitle>
            <StatusCopy>
              {getFriendlyFailedAnalysis(analysis.error?.code, analysis.error?.message).message}
            </StatusCopy>
            <InlineActions>
              <ActionButton type="button" onClick={handleRetry}>
                Try Again
              </ActionButton>
              <ActionButton type="button" $variant="primary" onClick={() => navigate('/analysis')}>
                Upload Another Photo
              </ActionButton>
            </InlineActions>
          </ErrorBox>
        )}

        {analysis?.status === 'completed' && (
          <>
            {analysis.season_result && (
              <ConfidenceBadge $level={getConfidenceLevel(analysis.season_result.confidence)}>
                {getConfidenceLabel(analysis.season_result.confidence)} result
              </ConfidenceBadge>
            )}
            <AnalysisSummary analysis={analysis} />
          </>
        )}

        <ActionButtons>
          <ActionButton $variant="primary" onClick={() => navigate('/analysis')}>
            Upload Another Photo
          </ActionButton>
          <ActionButton onClick={() => navigate('/consultation')}>
            Book Expert Consultation
          </ActionButton>
        </ActionButtons>
      </ResultSection>

      {analysis?.status === 'completed' && (
        <>
          <ReportSection>
            <SectionTitle>Your Color Profile</SectionTitle>
            <ImageQualityNotice quality={analysis.image_quality} assessment={analysis.quality_assessment} />
            <ReportBlock>
              <AttributeChips attributes={analysis.attributes} />
            </ReportBlock>
          </ReportSection>

          {analysis.evidence && (
            <ReportSection>
              <SectionTitle>Why This Result</SectionTitle>
              <EvidenceGrid>
                {Object.entries(analysis.evidence.observable_traits).map(([label, items]) => (
                  <EvidenceCard key={label}>
                    <EvidenceTitle>{formatLabel(label.replace('_evidence', ''))}</EvidenceTitle>
                    <EvidenceList>
                      {items.length > 0
                        ? items.map((item) => <li key={item}>{item}</li>)
                        : <li>Not enough visible evidence to make this trait highly certain.</li>}
                    </EvidenceList>
                  </EvidenceCard>
                ))}
              </EvidenceGrid>
              {analysis.evidence.uncertainty_factors.length > 0 && (
                <ReportBlock>
                  <EvidenceCard>
                    <EvidenceTitle>Uncertainty Factors</EvidenceTitle>
                    <EvidenceList>
                      {analysis.evidence.uncertainty_factors.map((factor) => (
                        <li key={factor}>{factor}</li>
                      ))}
                    </EvidenceList>
                  </EvidenceCard>
                </ReportBlock>
              )}
            </ReportSection>
          )}

          {analysis.evidence?.top_season_candidates && (
            <ReportSection>
              <SectionTitle>Season Candidates</SectionTitle>
              <CandidateList>
                {analysis.evidence.top_season_candidates.map((candidate) => (
                  <CandidateItem key={candidate.season}>
                    <CandidateHeader>
                      <strong>{candidate.season}</strong>
                      <CandidateScore>{formatPercent(candidate.score)}</CandidateScore>
                    </CandidateHeader>
                    {candidate.evidence_for.length > 0 && (
                      <EvidenceList>
                        {candidate.evidence_for.map((evidence) => (
                          <li key={evidence}>{evidence}</li>
                        ))}
                      </EvidenceList>
                    )}
                  </CandidateItem>
                ))}
              </CandidateList>
            </ReportSection>
          )}

          <ReportSection>
            <SectionTitle>Recommended Palette</SectionTitle>
            <PaletteSection colors={analysis.recommended_palette} />
          </ReportSection>

          <ReportSection>
            <SectionTitle>Save and Share Your Result</SectionTitle>
            <ShareResultPanel analysis={analysis} uploadedPhoto={uploadedPhoto} />
          </ReportSection>

          <ReportSection>
            <SectionTitle>Result Feedback</SectionTitle>
            <FeedbackPanel>
              <FeedbackStatus>How accurate did this result feel?</FeedbackStatus>
              <FeedbackButtonRow>
                {([
                  [5, 'Accurate'],
                  [3, 'Somewhat'],
                  [1, 'Not Accurate']
                ] as Array<[1 | 3 | 5, string]>).map(([rating, label]) => (
                  <FeedbackButton
                    key={rating}
                    type="button"
                    $selected={feedbackRating === rating}
                    onClick={() => setFeedbackRating(rating)}
                  >
                    {label}
                  </FeedbackButton>
                ))}
              </FeedbackButtonRow>
              <FeedbackStatus>What felt off?</FeedbackStatus>
              <FeedbackButtonRow>
                {([
                  ['season', 'Season'],
                  ['undertone', 'Undertone'],
                  ['palette', 'Palette'],
                  ['makeup', 'Makeup'],
                  ['fashion', 'Fashion'],
                  ['photo_quality', 'Photo Quality']
                ] as Array<[AnalysisFeedback['issue_tags'][number], string]>).map(([tag, label]) => (
                  <FeedbackButton
                    key={tag}
                    type="button"
                    $selected={feedbackTags.includes(tag)}
                    onClick={() => toggleFeedbackTag(tag)}
                  >
                    {label}
                  </FeedbackButton>
                ))}
              </FeedbackButtonRow>
              <ActionButton
                type="button"
                $variant="primary"
                disabled={!feedbackRating}
                onClick={submitFeedback}
              >
                Save Feedback
              </ActionButton>
              {feedbackStatus && <FeedbackStatus>{feedbackStatus}</FeedbackStatus>}
            </FeedbackPanel>
          </ReportSection>

          <ReportSection>
            <SectionTitle>Beauty Recommendations</SectionTitle>
            <BeautyRecommendations recommendations={analysis.beauty_recommendations} />
          </ReportSection>

          <ReportSection>
            <SectionTitle>Fashion Recommendations</SectionTitle>
            <FashionRecommendations recommendations={analysis.fashion_recommendations} />
          </ReportSection>

          <ReportSection>
            <SectionTitle>Product Recommendations</SectionTitle>
            <PreferenceIntro>
              <strong>Personalize your picks</strong> by adding shopping intent, budget, finish, brand, and avoid-color preferences.
            </PreferenceIntro>
            <PreferenceGrid>
              <PreferenceField>
                Makeup style
                <PreferenceSelect value={makeupStyle} onChange={(event) => setMakeupStyle(event.target.value as MakeupStyle)}>
                  <option value="natural">Natural</option>
                  <option value="polished">Polished</option>
                  <option value="soft_glam">Soft glam</option>
                  <option value="bold">Bold</option>
                  <option value="glam">Glam</option>
                </PreferenceSelect>
              </PreferenceField>
              <PreferenceField>
                Budget
                <PreferenceSelect value={budgetRange} onChange={(event) => setBudgetRange(event.target.value as BudgetRange)}>
                  <option value="flexible">Flexible</option>
                  <option value="drugstore">Drugstore</option>
                  <option value="mid_range">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </PreferenceSelect>
              </PreferenceField>
              <PreferenceField>
                Shopping goal
                <PreferenceSelect value={shoppingGoal} onChange={(event) => setShoppingGoal(event.target.value as ShoppingGoal)}>
                  <option value="full_look">Full look</option>
                  <option value="lipstick">Lipstick</option>
                  <option value="blush">Blush</option>
                  <option value="eyes">Eyeshadow</option>
                  <option value="base">Base makeup</option>
                  <option value="fashion">Fashion colors</option>
                </PreferenceSelect>
              </PreferenceField>
              <PreferenceField>
                Preferred brands
                <PreferenceInput
                  value={preferredBrands}
                  onChange={(event) => setPreferredBrands(event.target.value)}
                  placeholder="Rare Beauty, MAC"
                />
              </PreferenceField>
              <PreferenceField>
                Avoid colors
                <PreferenceInput
                  value={avoidColors}
                  onChange={(event) => setAvoidColors(event.target.value)}
                  placeholder="icy pink, orange"
                />
              </PreferenceField>
            </PreferenceGrid>
            <FinishChoices aria-label="Preferred finishes">
              {finishOptions.map((finish) => (
                <FeedbackButton
                  key={finish}
                  type="button"
                  $selected={preferredFinishes.includes(finish)}
                  onClick={() => togglePreferredFinish(finish)}
                >
                  {formatLabel(finish)}
                </FeedbackButton>
              ))}
            </FinishChoices>
            <InlineActions>
              <ActionButton
                type="button"
                $variant="primary"
                disabled={preferenceSaving}
                onClick={submitBeautyPreferences}
              >
                {preferenceSaving ? 'Saving Preferences' : 'Personalize Recommendations'}
              </ActionButton>
            </InlineActions>
            {preferenceStatus && <FeedbackStatus>{preferenceStatus}</FeedbackStatus>}
            {lookStatus && <FeedbackStatus>{lookStatus}</FeedbackStatus>}
            <ReportBlock>
            <ProductRecommendations
              products={analysis.products}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onAddToCart={handleAddToCart}
              onSaveToLook={handleSaveToLook}
              analysisId={analysis.analysis_id}
            />
            </ReportBlock>
          </ReportSection>
        </>
      )}
      </ResultContainer>
    </PageShell>
  );
};

export default Result;
