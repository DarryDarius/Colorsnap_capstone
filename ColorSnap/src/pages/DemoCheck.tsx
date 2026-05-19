import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getBackendHealth, type BackendHealth } from '../services/api';

const PageShell = styled.section`
  min-height: calc(100vh - 72px);
  background: var(--bg-page);
  padding: var(--space-7) var(--space-6) var(--space-9);

  @media (max-width: 768px) {
    padding: var(--space-6) var(--space-4) var(--space-8);
  }
`;

const Container = styled.div`
  display: grid;
  gap: var(--space-5);
  margin: 0 auto;
  max-width: var(--container-md);
`;

const Header = styled.div`
  display: grid;
  gap: var(--space-3);
`;

const Eyebrow = styled.p`
  color: var(--brand-primary);
  font-size: var(--font-sm);
  font-weight: 800;
  text-transform: uppercase;
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: clamp(2rem, 5vw, var(--font-3xl));
  line-height: 1.1;
`;

const Copy = styled.p`
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 720px;
`;

const StatusGrid = styled.div`
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const StatusCard = styled.div<{ $tone?: 'success' | 'warning' | 'danger' }>`
  background: ${(props) => (
    props.$tone === 'danger'
      ? '#FFF4F2'
      : props.$tone === 'warning'
        ? '#FFF8EC'
        : 'var(--surface)'
  )};
  border: 1px solid ${(props) => (
    props.$tone === 'danger'
      ? '#F0C9C3'
      : props.$tone === 'warning'
        ? '#E8D5B8'
        : 'var(--border-soft)'
  )};
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
`;

const Label = styled.span`
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: 800;
`;

const Value = styled.strong`
  color: var(--text-primary);
  overflow-wrap: anywhere;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
`;

const Button = styled.button`
  background: var(--brand-primary);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.85rem 1rem;
`;

const ActionLink = styled(Link)`
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

const getTone = (ok: boolean, warning = false): 'success' | 'warning' | 'danger' => {
  if (!ok) return 'danger';
  return warning ? 'warning' : 'success';
};

const DemoCheck: React.FC = () => {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [status, setStatus] = useState('Checking backend health...');
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);

  const refreshHealth = async () => {
    setStatus('Checking backend health...');

    try {
      const nextHealth = await getBackendHealth();
      setHealth(nextHealth);
      setStatus('Backend health check passed.');
    } catch (error) {
      setHealth(null);
      setStatus(error instanceof Error ? error.message : 'Backend health check failed.');
    }
  };

  useEffect(() => {
    setLastAnalysisId(localStorage.getItem('lastAnalysisId'));
    void refreshHealth();
  }, []);

  const circuitState = health?.resilience?.openai_circuit?.state || 'unknown';
  const queueActive = health?.analysis_queue?.worker?.active || 0;
  const queuedJobs = health?.analysis_queue?.jobs?.queued || 0;
  const liveReady = Boolean(health?.ai_mode === 'openai' && health.openai_configured && health.ai_status === 'ready');

  return (
    <PageShell>
      <Container>
        <Header>
          <Eyebrow>Live demo check</Eyebrow>
          <Title>ColorSnap Readiness</Title>
          <Copy>
            Use this hidden page before a live presentation. It does not create demo results; it only checks whether
            the live analysis path is ready and recoverable.
          </Copy>
        </Header>

        <StatusCard $tone={health ? 'success' : 'danger'}>
          <Label>Health check</Label>
          <Value>{status}</Value>
        </StatusCard>

        <StatusGrid>
          <StatusCard $tone={getTone(Boolean(health))}>
            <Label>Backend</Label>
            <Value>{health ? health.status : 'offline'}</Value>
          </StatusCard>
          <StatusCard $tone={getTone(Boolean(health), health?.ai_mode === 'mock')}>
            <Label>AI mode</Label>
            <Value>{health?.ai_mode || 'unknown'}</Value>
          </StatusCard>
          <StatusCard $tone={getTone(Boolean(health?.openai_configured))}>
            <Label>OpenAI configured</Label>
            <Value>{health?.openai_configured ? 'true' : 'false'}</Value>
          </StatusCard>
          <StatusCard $tone={getTone(liveReady)}>
            <Label>Live analysis ready</Label>
            <Value>{liveReady ? 'ready' : health ? 'not ready' : 'unknown'}</Value>
          </StatusCard>
          <StatusCard $tone={getTone(circuitState !== 'open', circuitState === 'half_open')}>
            <Label>Circuit breaker</Label>
            <Value>{circuitState}</Value>
          </StatusCard>
          <StatusCard $tone={getTone(queuedJobs < 3, queuedJobs > 0 || queueActive > 0)}>
            <Label>Analysis queue</Label>
            <Value>{queueActive} active / {queuedJobs} queued</Value>
          </StatusCard>
          <StatusCard>
            <Label>Persisted cache</Label>
            <Value>{health?.persisted_cache_entries ?? 'unknown'} entries</Value>
          </StatusCard>
          <StatusCard $tone={getTone(Boolean(lastAnalysisId), !lastAnalysisId)}>
            <Label>Latest local analysis</Label>
            <Value>{lastAnalysisId || 'none in this browser'}</Value>
          </StatusCard>
        </StatusGrid>

        <ButtonRow>
          <Button type="button" onClick={refreshHealth}>Refresh Check</Button>
          <ActionLink to="/analysis">Start Live Analysis</ActionLink>
          {lastAnalysisId && (
            <ActionLink to={`/result?id=${encodeURIComponent(lastAnalysisId)}`}>
              Open Latest Result
            </ActionLink>
          )}
        </ButtonRow>
      </Container>
    </PageShell>
  );
};

export default DemoCheck;
