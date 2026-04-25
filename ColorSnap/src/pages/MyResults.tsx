import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getMySavedResults, getMyShares, type SavedResultRecord, type ShareRecord } from '../services/api';

const Page = styled.section`
  background: var(--bg-page);
  min-height: calc(100vh - 72px);
  padding: var(--space-7) var(--space-4) var(--space-9);
`;

const Container = styled.div`
  display: grid;
  gap: var(--space-6);
  margin: 0 auto;
  max-width: var(--container-lg);
`;

const HeaderBlock = styled.div`
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  align-items: end;

  @media (max-width: 760px) {
    align-items: start;
    flex-direction: column;
  }
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: var(--font-3xl);
  line-height: 1.1;
`;

const Copy = styled.p`
  color: var(--text-secondary);
  margin-top: var(--space-2);
`;

const ButtonLink = styled(Link)`
  background: var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.85rem 1rem;
`;

const Grid = styled.div`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5);
`;

const CardTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-lg);
`;

const Palette = styled.div`
  display: flex;
  gap: var(--space-2);
`;

const Swatch = styled.span<{ $color: string }>`
  background: ${(props) => props.$color};
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  height: 28px;
  width: 28px;
`;

const Meta = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const Empty = styled.div`
  background: var(--surface-warm);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
`;

const LinkButton = styled.a`
  color: var(--brand-primary);
  font-weight: 800;
`;

const MyResults: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [savedResults, setSavedResults] = useState<SavedResultRecord[]>([]);
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [status, setStatus] = useState('Loading your results...');

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    Promise.all([getMySavedResults(), getMyShares()])
      .then(([savedResponse, shareResponse]) => {
        setSavedResults(savedResponse.items);
        setShares(shareResponse.items);
        setStatus('');
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : 'Unable to load your results.');
      });
  }, [isLoading, navigate, user]);

  if (isLoading || status) {
    return (
      <Page>
        <Container>
          <Empty>{status || 'Checking your account...'}</Empty>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container>
        <HeaderBlock>
          <div>
            <Title>My Results</Title>
            <Copy>Saved ColorSnap reports and unlisted share links for {user?.email}.</Copy>
          </div>
          <ButtonLink to="/analysis">Start Analysis</ButtonLink>
        </HeaderBlock>

        {savedResults.length === 0 ? (
          <Empty>
            <CardTitle>No saved results yet.</CardTitle>
            <Meta>Complete an analysis and choose Save Result to build your history.</Meta>
          </Empty>
        ) : (
          <Grid>
            {savedResults.map((result) => {
              const share = shares.find((item) => item.saved_result_id === result.saved_result_id);
              const shareUrl = share ? new URL(share.share_url, window.location.origin).toString() : null;

              return (
                <Card key={result.saved_result_id}>
                  <CardTitle>{result.primary_season}</CardTitle>
                  <Meta>{result.summary}</Meta>
                  <Palette>
                    {result.palette.slice(0, 5).map((color) => (
                      <Swatch key={`${result.saved_result_id}-${color.hex}-${color.name}`} $color={color.hex} />
                    ))}
                  </Palette>
                  <Meta>Saved {new Date(result.created_at).toLocaleDateString()}</Meta>
                  {shareUrl && <LinkButton href={shareUrl}>Open share link</LinkButton>}
                </Card>
              );
            })}
          </Grid>
        )}
      </Container>
    </Page>
  );
};

export default MyResults;
