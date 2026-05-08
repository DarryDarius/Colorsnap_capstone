import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const Wrapper = styled.div`
  display: grid;
  gap: var(--space-2);
`;

const ButtonMount = styled.div`
  display: flex;
  min-height: 44px;
  width: 100%;
`;

const HelperText = styled.p<{ $error?: boolean }>`
  color: ${(props) => (props.$error ? 'var(--error)' : 'var(--text-muted)')};
  font-size: var(--font-sm);
  font-weight: 700;
  margin: 0;
`;

const loadGoogleIdentityScript = () => new Promise<void>((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve();
    return;
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Google sign-in script failed to load.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = GOOGLE_SCRIPT_ID;
  script.src = GOOGLE_SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Google sign-in script failed to load.'));
  document.head.appendChild(script);
});

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => Promise<void>;
};

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onCredential }) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const onCredentialRef = useRef(onCredential);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) {
      setError('Google login is not configured for this frontend.');
      return;
    }

    let isMounted = true;
    const buttonMount = buttonRef.current;

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted || !buttonMount || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              setError('Google did not return a sign-in credential.');
              return;
            }

            setError(null);
            await onCredentialRef.current(response.credential).catch((err) => {
              setError(err instanceof Error ? err.message : 'Google login failed.');
            });
          }
        });

        buttonMount.innerHTML = '';
        window.google.accounts.id.renderButton(buttonMount, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          width: buttonMount.offsetWidth || 360
        });
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Google login is unavailable.');
        }
      });

    return () => {
      isMounted = false;

      if (buttonMount) {
        buttonMount.innerHTML = '';
      }
    };
  }, [clientId]);

  return (
    <Wrapper>
      <ButtonMount ref={buttonRef} />
      {error && <HelperText $error>{error}</HelperText>}
    </Wrapper>
  );
};

export default GoogleSignInButton;
