import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  align-items: center;
  background: rgba(43, 36, 34, 0.66);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: var(--space-4);
  position: fixed;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-strong);
  display: grid;
  gap: var(--space-4);
  max-width: 760px;
  padding: var(--space-5);
  width: min(100%, 760px);
`;

const Header = styled.div`
  align-items: flex-start;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-xl);
  line-height: 1.25;
  margin: 0 0 var(--space-1);
`;

const Copy = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const VideoFrame = styled.div`
  aspect-ratio: 4 / 3;
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: grid;
  overflow: hidden;
  place-items: center;
  width: 100%;
`;

const Video = styled.video`
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  width: 100%;
`;

const LoadingText = styled.p`
  color: var(--text-secondary);
  font-weight: 700;
  margin: 0;
  padding: var(--space-5);
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: flex-end;
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

const CloseButton = styled(Button)`
  flex: 0 0 auto;
  padding: 0.65rem 0.85rem;
`;

const ErrorMessage = styled.div`
  background: #FFF4F2;
  border: 1px solid #F0C9C3;
  border-radius: var(--radius-md);
  color: var(--error);
  font-weight: 600;
  padding: var(--space-4);
`;

type CameraCaptureProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

type OptionalMediaDevices = {
  getUserMedia?: MediaDevices['getUserMedia'];
};

const getMediaDevices = () => (navigator as unknown as { mediaDevices?: OptionalMediaDevices }).mediaDevices;

const getCameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Camera permission was blocked. Allow camera access in your browser, or choose a photo from your device.';
  }

  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return 'No camera was found on this device. Choose a photo from your device instead.';
  }

  return 'Camera is unavailable in this browser. Choose a photo from your device instead.';
};

const CameraCapture: React.FC<CameraCaptureProps> = ({ open, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
    setIsStarting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      const mediaDevices = getMediaDevices();

      if (!mediaDevices?.getUserMedia) {
        setError('Camera is unavailable in this browser. Choose a photo from your device instead.');
        return;
      }

      setError(null);
      setIsStarting(true);

      try {
        const stream = await mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 960 }
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }

        setIsReady(true);
      } catch (err) {
        if (isMounted) {
          setError(getCameraErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsStarting(false);
        }
      }
    };

    void startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [open, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleCapture = () => {
    const video = videoRef.current;

    if (!video) {
      setError('Camera preview is not ready yet.');
      return;
    }

    const width = video.videoWidth || 960;
    const height = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      setError('Could not capture a photo in this browser.');
      return;
    }

    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);
    setIsCapturing(true);

    canvas.toBlob((blob) => {
      setIsCapturing(false);

      if (!blob) {
        setError('Could not capture a photo in this browser.');
        return;
      }

      const file = new File([blob], `colorsnap-camera-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      onCapture(file);
      handleClose();
    }, 'image/jpeg', 0.9);
  };

  if (!open) {
    return null;
  }

  return (
    <Overlay role="presentation" onClick={handleClose}>
      <Dialog
        aria-modal="true"
        aria-labelledby="camera-capture-title"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <Header>
          <div>
            <Title id="camera-capture-title">Take a photo</Title>
            <Copy>Use soft, even light and keep your face centered before capturing.</Copy>
          </div>
          <CloseButton type="button" $variant="secondary" onClick={handleClose}>
            Close
          </CloseButton>
        </Header>

        <VideoFrame>
          {!isReady && <LoadingText>{isStarting ? 'Starting camera...' : 'Camera preview'}</LoadingText>}
          <Video
            ref={videoRef}
            aria-label="Camera preview"
            autoPlay
            muted
            playsInline
            onLoadedMetadata={() => setIsReady(true)}
          />
        </VideoFrame>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ButtonRow>
          <Button type="button" $variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!isReady || isCapturing || Boolean(error)} onClick={handleCapture}>
            {isCapturing ? 'Capturing...' : 'Capture Photo'}
          </Button>
        </ButtonRow>
      </Dialog>
    </Overlay>
  );
};

export default CameraCapture;
