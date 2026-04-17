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
import { getAnalysis } from '../services/api';
import type { AnalysisResult, ProductRecommendation } from '../types/analysis';
import { addProductToCart } from '../utils/cart';

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

const ProcessingList = styled.ul`
  list-style: none;
  margin: 0.9rem 0 0;
  padding: 0;
  text-align: left;
  display: grid;
  gap: 0.45rem;
`;

const processingMessages = [
  'Checking lighting, clarity, and facial visibility.',
  'Estimating undertone, contrast, brightness, and saturation.',
  'Building your seasonal palette summary and product matches.'
];

const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingStep, setProcessingStep] = useState(0);
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
      setError('No analysis id was found. Please upload a photo first.');
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
          setError(err instanceof Error ? err.message : 'Unable to load analysis result.');
        }
      }
    };

    void poll();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [analysisId]);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Color Palette Result',
          text: 'This is my color palette result, come check it out!',
          url: window.location.href
        });
      } catch (shareError) {
        // Share failed silently.
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => window.alert('Your browser does not support direct sharing. The share link has been copied to the clipboard.'))
        .catch(() => window.alert('Unable to copy share link, please copy manually.'));
    }
  };

  const handleAddToCart = (product: ProductRecommendation) => {
    const { item } = addProductToCart(product, {
      analysisId: analysis?.analysis_id,
      description: product.reason,
      source: 'recommendation'
    });
    window.alert(`${product.name} is in your cart (${item.quantity}).`);
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

        {error && <ErrorBox>{error}</ErrorBox>}

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
          <ErrorBox>{analysis.error?.message || 'Analysis could not be completed.'}</ErrorBox>
        )}

        {analysis?.status === 'completed' && (
          <AnalysisSummary analysis={analysis} />
        )}

        <ActionButtons>
          <ActionButton $variant="primary" onClick={() => navigate('/analysis')}>
            Upload Another Photo
          </ActionButton>
          <ActionButton onClick={() => navigate('/consultation')}>
            Book Expert Consultation
          </ActionButton>
          <ActionButton onClick={handleShare}>
            Share My Color Palette
          </ActionButton>
        </ActionButtons>
      </ResultSection>

      {analysis?.status === 'completed' && (
        <>
          <ReportSection>
            <SectionTitle>Your Color Profile</SectionTitle>
            <ImageQualityNotice quality={analysis.image_quality} />
            <ReportBlock>
              <AttributeChips attributes={analysis.attributes} />
            </ReportBlock>
          </ReportSection>

          <ReportSection>
            <SectionTitle>Recommended Palette</SectionTitle>
            <PaletteSection colors={analysis.recommended_palette} />
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
            <ProductRecommendations
              products={analysis.products}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onAddToCart={handleAddToCart}
              analysisId={analysis.analysis_id}
            />
          </ReportSection>
        </>
      )}
      </ResultContainer>
    </PageShell>
  );
};

export default Result;
