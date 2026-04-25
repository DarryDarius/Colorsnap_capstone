import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ApiClientError, createAnalysis, getBackendHealth } from '../services/api';

const PageShell = styled.section`
  min-height: calc(100vh - 72px);
  background:
    linear-gradient(180deg, rgba(251, 238, 241, 0.72) 0%, rgba(255, 252, 250, 0) 34%),
    var(--bg-page);
  padding: var(--space-8) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

const PageHeader = styled.div`
  max-width: var(--container-sm);
  margin: 0 auto var(--space-7);
  text-align: center;
`;

const Eyebrow = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 700;
  margin-bottom: var(--space-3);
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2.25rem, 6vw, var(--font-4xl));
  font-weight: 700;
  line-height: 1.05;
  margin-bottom: var(--space-4);
`;

const Description = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.7;
  margin: 0 auto;
  max-width: 650px;
`;

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--space-6);
  max-width: var(--container-lg);
  margin: 0 auto;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const UploadPanel = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: var(--space-6);

  @media (max-width: 768px) {
    padding: var(--space-5);
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  align-items: flex-start;
  margin-bottom: var(--space-5);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const PanelTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  line-height: 1.2;
  margin-bottom: var(--space-2);
`;

const PanelCopy = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const PanelBadge = styled.span`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  flex: 0 0 auto;
  font-size: var(--font-xs);
  font-weight: 700;
  padding: var(--space-2) var(--space-3);
`;

const ServiceNotice = styled.div<{ $tone?: 'success' | 'warning' | 'danger' }>`
  background: ${(props) => (
    props.$tone === 'danger'
      ? '#FFF4F2'
      : props.$tone === 'warning'
        ? '#FFF8EC'
        : 'var(--surface-sage)'
  )};
  border: 1px solid ${(props) => (
    props.$tone === 'danger'
      ? '#F0C9C3'
      : props.$tone === 'warning'
        ? '#E8D5B8'
        : '#DDE8DA'
  )};
  border-radius: var(--radius-md);
  color: ${(props) => (
    props.$tone === 'danger'
      ? 'var(--error)'
      : props.$tone === 'warning'
        ? 'var(--warning)'
        : 'var(--accent-olive)'
  )};
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: var(--space-5);
  padding: var(--space-4);
`;

const NoticeTitle = styled.strong`
  color: inherit;
  display: block;
  margin-bottom: var(--space-1);
`;

const NoticeAction = styled.button`
  background: var(--surface);
  border: 1px solid currentColor;
  border-radius: var(--radius-md);
  color: inherit;
  font-size: var(--font-sm);
  font-weight: 800;
  margin-top: var(--space-3);
  padding: 0.65rem 0.8rem;

  &:hover {
    background: rgba(255, 255, 255, 0.68);
    transform: translateY(-1px);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const DropZone = styled.div<{ $hasPreview: boolean; $isDragging: boolean }>`
  align-items: center;
  background: ${(props) => (props.$isDragging ? 'var(--brand-primary-pale)' : 'var(--surface-warm)')};
  border: 1px dashed ${(props) => (props.$isDragging ? 'var(--brand-primary)' : 'var(--border-strong)')};
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: grid;
  gap: var(--space-5);
  grid-template-columns: ${(props) => (props.$hasPreview ? '220px minmax(0, 1fr)' : '1fr')};
  min-height: 310px;
  padding: var(--space-6);
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: var(--brand-primary);
    transform: translateY(-1px);
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewFrame = styled.div`
  aspect-ratio: 4 / 5;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 100%;
`;

const PreviewImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const UploadEmptyState = styled.div`
  margin: 0 auto;
  max-width: 460px;
  text-align: center;
`;

const UploadIcon = styled.div`
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--brand-primary);
  display: inline-flex;
  font-size: var(--font-xl);
  font-weight: 700;
  height: 56px;
  justify-content: center;
  margin-bottom: var(--space-4);
  width: 56px;
`;

const UploadTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-xl);
  margin-bottom: var(--space-2);
`;

const UploadText = styled.p`
  color: var(--text-secondary);
  margin: 0 0 var(--space-5);
`;

const FileDetails = styled.div`
  text-align: left;
`;

const FileName = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-xl);
  line-height: 1.3;
  margin-bottom: var(--space-2);
  overflow-wrap: anywhere;
`;

const FileMeta = styled.p`
  color: var(--text-secondary);
  margin-bottom: var(--space-5);
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const AnalyzeActions = styled(ButtonRow)`
  margin-top: var(--space-5);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${(props) => (props.$variant === 'secondary' ? 'var(--surface)' : 'var(--brand-primary)')};
  border: 1px solid ${(props) => (props.$variant === 'secondary' ? 'var(--border-soft)' : 'var(--brand-primary)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$variant === 'secondary' ? 'var(--text-primary)' : 'var(--text-inverse)')};
  font-size: var(--font-md);
  font-weight: 700;
  padding: 0.85rem 1.1rem;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$variant === 'secondary' ? 'var(--brand-primary-pale)' : 'var(--brand-primary-hover)')};
    border-color: ${(props) => (props.$variant === 'secondary' ? 'var(--brand-primary-soft)' : 'var(--brand-primary-hover)')};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #E4DDDA;
    border-color: #E4DDDA;
    color: var(--text-muted);
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  font-weight: 600;
  margin-top: var(--space-5);
  padding: var(--space-4);
`;

const ErrorMessage = styled.div`
  background: #FFF4F2;
  border: 1px solid #F0C9C3;
  border-radius: var(--radius-md);
  color: var(--error);
  font-weight: 600;
  margin-top: var(--space-5);
  padding: var(--space-4);
`;

const GuidancePanel = styled.aside`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
`;

const GuidanceImage = styled.img`
  aspect-ratio: 4 / 3;
  display: block;
  object-fit: cover;
  width: 100%;
`;

const GuidanceBody = styled.div`
  padding: var(--space-5);
`;

const GuidanceTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  margin-bottom: var(--space-4);
`;

const Checklist = styled.ul`
  color: var(--text-secondary);
  display: grid;
  gap: var(--space-3);
  list-style: none;
  margin: 0 0 var(--space-5);
  padding: 0;
`;

const ChecklistItem = styled.li`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 22px minmax(0, 1fr);
`;

const CheckMark = styled.span`
  align-items: center;
  background: var(--brand-primary-pale);
  border-radius: var(--radius-sm);
  color: var(--brand-primary);
  display: inline-flex;
  font-size: var(--font-xs);
  font-weight: 700;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const PrivacyNote = styled.p`
  border-top: 1px solid var(--border-soft);
  color: var(--text-muted);
  font-size: var(--font-sm);
  margin: 0;
  padding-top: var(--space-4);
`;

const Pipeline = styled.div`
  border-top: 1px solid var(--border-soft);
  margin-top: var(--space-5);
  padding-top: var(--space-5);
`;

const PipelineTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-md);
  margin-bottom: var(--space-3);
`;

const PipelineSteps = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const PipelineStep = styled.div`
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  font-size: var(--font-sm);
  gap: var(--space-2);
`;

const StepDot = styled.span`
  background: var(--accent-sage);
  border-radius: 999px;
  height: 7px;
  width: 7px;
`;

type AiMode = 'mock' | 'openai' | 'offline' | 'unknown';
type AiStatus = 'ready' | 'missing_config' | 'unknown';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const getFriendlyAnalysisStartError = (error: unknown) => {
  if (error instanceof ApiClientError) {
    if (error.code === 'OPENAI_CONFIG_MISSING') {
      return 'Live OpenAI mode is selected, but OPENAI_API_KEY is missing in backend/.env. Add the key or switch MOCK_AI=true for demo mode.';
    }

    if (error.code === 'FILE_TOO_LARGE') {
      return 'That image is larger than the 5 MB backend limit. Try a smaller JPG, PNG, or WEBP file.';
    }

    if (error.code === 'INVALID_IMAGE' || error.code === 'INVALID_REQUEST' || error.code === 'MISSING_IMAGE') {
      return error.message;
    }

    return `${error.message} (${error.code || `HTTP ${error.status}`})`;
  }

  if (error instanceof TypeError) {
    return 'Could not reach the analysis backend. Start it with npm run backend:dev, then retry the service check.';
  }

  return 'Unable to start analysis. Please try again.';
};

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Analysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>('unknown');
  const [aiStatus, setAiStatus] = useState<AiStatus>('unknown');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const refreshBackendHealth = useCallback(async () => {
    try {
      const health = await getBackendHealth();
      setAiMode(health.ai_mode);
      setAiStatus(health.ai_status || 'ready');
      setError(null);
    } catch {
      setAiMode('offline');
      setAiStatus('unknown');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      if (isMounted) {
        await refreshBackendHealth();
      }
    };

    void checkHealth();
    return () => {
      isMounted = false;
    };
  }, [refreshBackendHealth]);

  const modeLabel = aiMode === 'openai' && aiStatus === 'missing_config'
    ? 'OpenAI key missing'
    : aiMode === 'openai'
    ? 'Live OpenAI analysis'
    : aiMode === 'mock'
      ? 'Demo analysis mode'
      : aiMode === 'offline'
        ? 'Service offline'
        : 'Checking service';

  const pipelineTitle = aiMode === 'openai'
    ? 'Live AI flow'
    : aiMode === 'mock'
      ? 'Demo AI flow'
      : aiMode === 'offline'
        ? 'Offline flow'
        : 'Analysis flow';

  const isServiceOffline = aiMode === 'offline';
  const isOpenAiMissingConfig = aiMode === 'openai' && aiStatus === 'missing_config';
  const isAnalysisUnavailable = isServiceOffline || isOpenAiMissingConfig;

  const setFile = (file: File) => {
    if (!allowedTypes.has(file.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Please upload an image smaller than 5 MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      localStorage.setItem('uploadedPhoto', result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    if (isServiceOffline) {
      setError('Analysis service is offline. Start the backend with npm run backend:dev and try again.');
      return;
    }

    if (isOpenAiMissingConfig) {
      setError('Live OpenAI mode is selected, but OPENAI_API_KEY is missing in backend/.env. Add the key or switch MOCK_AI=true for demo mode.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await createAnalysis(selectedFile);
      localStorage.setItem('lastAnalysisId', response.analysis_id);
      navigate(`/result?id=${encodeURIComponent(response.analysis_id)}`);
    } catch (err) {
      setError(getFriendlyAnalysisStartError(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <PageShell>
      <PageHeader>
        <Eyebrow>AI Color Analysis</Eyebrow>
        <Title>Upload a clear selfie for your color report.</Title>
        <Description>
          Get a seasonal color estimate, palette guidance, and product recommendations from your uploaded photo.
        </Description>
      </PageHeader>

      <Workspace>
        <UploadPanel>
          <PanelHeader>
            <div>
              <PanelTitle>Start with one natural-light photo</PanelTitle>
              <PanelCopy>Use a front-facing image with your face unobstructed.</PanelCopy>
            </div>
            <PanelBadge>{modeLabel}</PanelBadge>
          </PanelHeader>

          {aiMode === 'offline' && (
            <ServiceNotice $tone="danger">
              <NoticeTitle>Analysis backend is offline.</NoticeTitle>
              Start the backend with npm run backend:dev before starting a new analysis.
              <NoticeAction type="button" onClick={refreshBackendHealth}>Retry Service Check</NoticeAction>
            </ServiceNotice>
          )}

          {isOpenAiMissingConfig && (
            <ServiceNotice $tone="warning">
              <NoticeTitle>OpenAI live mode needs configuration.</NoticeTitle>
              MOCK_AI=false is active, but OPENAI_API_KEY is not set in backend/.env. Add the key or switch to MOCK_AI=true for a stable demo.
              <NoticeAction type="button" onClick={refreshBackendHealth}>Retry Config Check</NoticeAction>
            </ServiceNotice>
          )}

          {aiMode === 'mock' && (
            <ServiceNotice>
              Demo mode is active. Results are deterministic so the local capstone flow stays stable.
            </ServiceNotice>
          )}

          <FileInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
          />

          <DropZone
            $hasPreview={Boolean(previewUrl)}
            $isDragging={isDragging}
            onClick={handleUploadClick}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleUploadClick();
              }
            }}
            role="button"
            tabIndex={0}
          >
            {previewUrl ? (
              <>
                <PreviewFrame>
                  <PreviewImage src={previewUrl} alt="Selected selfie preview" />
                </PreviewFrame>
                <FileDetails>
                  <FileName>{selectedFile?.name}</FileName>
                  {selectedFile && (
                    <FileMeta>
                      {formatFileSize(selectedFile.size)} - {selectedFile.type.replace('image/', '').toUpperCase()}
                    </FileMeta>
                  )}
                  <ButtonRow>
                    <Button type="button" $variant="secondary" onClick={handleUploadClick}>
                      Choose Different Photo
                    </Button>
                  </ButtonRow>
                </FileDetails>
              </>
            ) : (
              <UploadEmptyState>
                <UploadIcon>+</UploadIcon>
                <UploadTitle>Drop your photo here</UploadTitle>
                <UploadText>JPG, PNG, or WEBP. Keep the file under 5 MB for the fastest analysis.</UploadText>
                <Button type="button" $variant="secondary">
                  Choose Photo
                </Button>
              </UploadEmptyState>
            )}
          </DropZone>

          <AnalyzeActions>
            <Button
              type="button"
              disabled={!selectedFile || isAnalyzing || isAnalysisUnavailable}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? 'Starting Analysis...' : 'Start Analysis'}
            </Button>
          </AnalyzeActions>

          {isAnalyzing && (
            <StatusMessage>
              Uploading your photo, checking image quality, and preparing your report.
            </StatusMessage>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </UploadPanel>

        <GuidancePanel>
          <GuidanceImage src="/images/index1.jpg" alt="Color study portrait" />
          <GuidanceBody>
            <GuidanceTitle>Photo checklist</GuidanceTitle>
            <Checklist>
              <ChecklistItem>
                <CheckMark>1</CheckMark>
                <span>Use soft natural light near a window.</span>
              </ChecklistItem>
              <ChecklistItem>
                <CheckMark>2</CheckMark>
                <span>Keep your face centered and visible.</span>
              </ChecklistItem>
              <ChecklistItem>
                <CheckMark>3</CheckMark>
                <span>Avoid heavy filters, sunglasses, or strong colored lighting.</span>
              </ChecklistItem>
            </Checklist>

            <PrivacyNote>
              Your photo is used for this analysis flow only. The current version stores the preview locally in your browser.
            </PrivacyNote>

            <Pipeline>
              <PipelineTitle>{pipelineTitle}</PipelineTitle>
              <PipelineSteps>
                <PipelineStep><StepDot /> Photo quality check</PipelineStep>
                <PipelineStep><StepDot /> Seasonal color estimate</PipelineStep>
                <PipelineStep><StepDot /> Palette and product ranking</PipelineStep>
              </PipelineSteps>
            </Pipeline>
          </GuidanceBody>
        </GuidancePanel>
      </Workspace>
    </PageShell>
  );
};

export default Analysis;
