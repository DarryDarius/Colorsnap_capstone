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

const ResultSection = styled.section`
  background: linear-gradient(135deg, #f96ed6, #eff66f);
  padding: 3rem 2rem;
  margin: 2rem auto;
  max-width: 900px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  text-align: center;

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 2rem 1rem;
  }
`;

const ResultTitle = styled.h2`
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ResultDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  color: #2c2c2c;
`;

const ResultImage = styled.img`
  max-width: 300px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
  margin: 1rem 0 2rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  color: #f886dc;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0cee8;
    transform: translateY(-2px);
  }
`;

const ReportSection = styled.section`
  background: #fffdfb;
  padding: 3rem 2rem;
  margin: 2rem auto;
  max-width: 1200px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 2rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 2rem;
  color: #000000;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ReportBlock = styled.div`
  margin-top: 2rem;
`;

const StatusBox = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  color: #333;
  margin: 1rem auto 0;
  max-width: 640px;
  padding: 1rem;
`;

const ErrorBox = styled(StatusBox)`
  color: #b42318;
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
    <>
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
          <ActionButton onClick={() => navigate('/analysis')}>
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
    </>
  );
};

export default Result;
