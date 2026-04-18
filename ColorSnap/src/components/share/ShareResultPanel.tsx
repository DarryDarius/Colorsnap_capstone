import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  createSavedResult,
  createShare,
  type SavedResultRecord,
  type ShareRecord
} from '../../services/api';
import type { AnalysisResult } from '../../types/analysis';
import { copyToClipboard, createShareCardBlob, downloadBlob, shareWithNativeSheet } from '../../utils/share';
import ShareCard from './ShareCard';

const PanelLayout = styled.div`
  display: grid;
  gap: var(--space-5);
  grid-template-columns: minmax(0, 1fr) 340px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Copy = styled.div`
  text-align: left;
`;

const Intro = styled.p`
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-4);
`;

const PrivacyNote = styled.div`
  background: var(--surface-sage);
  border: 1px solid #DDE8DA;
  border-radius: var(--radius-md);
  color: var(--accent-olive);
  font-size: var(--font-sm);
  font-weight: 700;
  line-height: 1.6;
  margin-bottom: var(--space-4);
  padding: var(--space-4);
`;

const ToggleLabel = styled.label`
  align-items: center;
  color: var(--text-primary);
  display: flex;
  font-weight: 700;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const Button = styled.button<{ $variant?: 'primary' }>`
  background: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary)' : 'var(--surface)')};
  border: 1px solid ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary)' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$variant === 'primary' ? 'var(--text-inverse)' : 'var(--text-primary)')};
  font-weight: 800;
  padding: 0.85rem 1rem;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary-hover)' : 'var(--brand-primary-pale)')};
    border-color: ${(props) => (props.$variant === 'primary' ? 'var(--brand-primary-hover)' : 'var(--brand-primary-soft)')};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #E4DDDA;
    border-color: #E4DDDA;
    color: var(--text-muted);
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ $tone?: 'error' | 'success' }>`
  background: ${(props) => (props.$tone === 'error' ? '#FFF4F2' : 'var(--surface-warm)')};
  border: 1px solid ${(props) => (props.$tone === 'error' ? '#F0C9C3' : 'var(--border-soft)')};
  border-radius: var(--radius-md);
  color: ${(props) => (props.$tone === 'error' ? 'var(--error)' : 'var(--text-secondary)')};
  font-weight: 700;
  line-height: 1.6;
  margin-top: var(--space-4);
  padding: var(--space-4);
`;

const PreviewWrap = styled.div`
  text-align: left;
`;

type Props = {
  analysis: AnalysisResult;
  uploadedPhoto?: string | null;
};

const getAbsoluteShareUrl = (share?: ShareRecord | null) => {
  if (!share) {
    return window.location.href;
  }

  return new URL(share.share_url, window.location.origin).toString();
};

const ShareResultPanel: React.FC<Props> = ({ analysis, uploadedPhoto }) => {
  const [includePhoto, setIncludePhoto] = useState(false);
  const [savedResult, setSavedResult] = useState<SavedResultRecord | null>(null);
  const [shareRecord, setShareRecord] = useState<ShareRecord | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareUrl = useMemo(() => getAbsoluteShareUrl(shareRecord), [shareRecord]);

  const ensureSavedResult = async () => {
    if (savedResult) {
      return savedResult;
    }

    const nextSavedResult = await createSavedResult(analysis.analysis_id, includePhoto);
    setSavedResult(nextSavedResult);
    return nextSavedResult;
  };

  const ensureShareRecord = async () => {
    if (shareRecord) {
      return shareRecord;
    }

    const nextSavedResult = await ensureSavedResult();
    const nextShareRecord = await createShare({
      analysis_id: analysis.analysis_id,
      saved_result_id: nextSavedResult.saved_result_id,
      include_photo: includePhoto
    });
    setShareRecord(nextShareRecord);
    return nextShareRecord;
  };

  const runAction = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Share action failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSave = () => runAction(async () => {
    const nextSavedResult = await ensureSavedResult();
    setStatusMessage(`Result saved: ${nextSavedResult.saved_result_id}.`);
  });

  const handleCopyLink = () => runAction(async () => {
    const nextShareRecord = await ensureShareRecord();
    await copyToClipboard(getAbsoluteShareUrl(nextShareRecord));
    setStatusMessage('Share link copied to clipboard.');
  });

  const handleDownload = () => runAction(async () => {
    const nextShareRecord = await ensureShareRecord();
    const nextShareUrl = getAbsoluteShareUrl(nextShareRecord);
    const blob = await createShareCardBlob({
      analysis,
      shareUrl: nextShareUrl,
      uploadedPhoto,
      includePhoto
    });
    downloadBlob(blob, `colorsnap-${analysis.season_result?.primary || 'result'}.png`);
    setStatusMessage('Share card downloaded.');
  });

  const handleNativeShare = () => runAction(async () => {
    const nextShareRecord = await ensureShareRecord();
    const nextShareUrl = getAbsoluteShareUrl(nextShareRecord);
    const blob = await createShareCardBlob({
      analysis,
      shareUrl: nextShareUrl,
      uploadedPhoto,
      includePhoto
    });
    const file = new File([blob], 'colorsnap-result.png', { type: 'image/png' });
    const result = await shareWithNativeSheet({
      title: `My ColorSnap Result: ${analysis.season_result?.primary || 'Color Analysis'}`,
      text: analysis.summary?.one_liner || 'I discovered my personal color palette with ColorSnap.',
      url: nextShareUrl,
      file
    });

    if (result === 'unsupported') {
      await copyToClipboard(nextShareUrl);
      setStatusMessage('Native sharing is not supported here. Share link copied instead.');
      return;
    }

    if (result === 'cancelled') {
      setStatusMessage('Share cancelled.');
      return;
    }

    setStatusMessage('Share sheet opened.');
  });

  return (
    <PanelLayout>
      <Copy>
        <Intro>
          Save your result, generate a social-ready ColorSnap card, or share an unlisted link.
          The uploaded photo is excluded unless you choose to include it.
        </Intro>
        <PrivacyNote>
          Privacy default: your uploaded photo is not included in the share card or public share link unless this option is enabled.
        </PrivacyNote>
        <ToggleLabel>
          <input
            type="checkbox"
            checked={includePhoto}
            onChange={(event) => {
              setIncludePhoto(event.target.checked);
              setShareRecord(null);
              setSavedResult(null);
            }}
          />
          Include uploaded photo in share card
        </ToggleLabel>
        <Actions>
          <Button type="button" onClick={handleSave} disabled={isBusy}>
            Save Result
          </Button>
          <Button type="button" $variant="primary" onClick={handleNativeShare} disabled={isBusy}>
            Share Result
          </Button>
          <Button type="button" onClick={handleDownload} disabled={isBusy}>
            Download Card
          </Button>
          <Button type="button" onClick={handleCopyLink} disabled={isBusy}>
            Copy Link
          </Button>
        </Actions>
        {statusMessage && <StatusMessage $tone="success">{statusMessage}</StatusMessage>}
        {errorMessage && <StatusMessage $tone="error">{errorMessage}</StatusMessage>}
      </Copy>
      <PreviewWrap>
        <ShareCard
          analysis={analysis}
          uploadedPhoto={uploadedPhoto}
          includePhoto={includePhoto}
          shareUrl={shareUrl}
        />
      </PreviewWrap>
    </PanelLayout>
  );
};

export default ShareResultPanel;
