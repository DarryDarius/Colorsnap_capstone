import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

const Page = styled.section`
  background: var(--bg-page);
  min-height: calc(100vh - 72px);
  padding: var(--space-8) var(--space-4);
`;

const Card = styled.form`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: var(--space-4);
  margin: 0 auto;
  max-width: 460px;
  padding: var(--space-6);
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: var(--font-2xl);
  line-height: 1.2;
`;

const Copy = styled.p`
  color: var(--text-secondary);
  margin: 0;
`;

const Label = styled.label`
  color: var(--text-primary);
  display: grid;
  font-weight: 700;
  gap: var(--space-2);
`;

const Input = styled.input`
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  font: inherit;
  padding: 0.85rem 1rem;
`;

const Button = styled.button`
  background: var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-weight: 800;
  padding: 0.9rem 1rem;

  &:hover {
    background: var(--brand-primary-hover);
  }
`;

const Divider = styled.div`
  align-items: center;
  color: var(--text-muted);
  display: grid;
  font-size: var(--font-sm);
  font-weight: 800;
  gap: var(--space-3);
  grid-template-columns: 1fr auto 1fr;
  text-transform: uppercase;

  &::before,
  &::after {
    background: var(--border-soft);
    content: '';
    height: 1px;
  }
`;

const Message = styled.p<{ $error?: boolean }>`
  color: ${(props) => (props.$error ? 'var(--error)' : 'var(--text-secondary)')};
  font-weight: 700;
  margin: 0;
`;

const Register: React.FC = () => {
  const { loginGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await register({ email, password, name: name || undefined });
      navigate('/my-results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    }
  };

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setError(null);
    await loginGoogle(credential);
    navigate('/my-results');
  }, [loginGoogle, navigate]);

  return (
    <Page>
      <Card onSubmit={handleSubmit}>
        <Title>Create your ColorSnap account</Title>
        <Copy>Keep your color reports private, organized, and ready to share.</Copy>
        <GoogleSignInButton onCredential={handleGoogleCredential} />
        <Divider>or</Divider>
        <Label>
          Name
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </Label>
        <Label>
          Email
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Label>
        <Label>
          Password
          <Input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Label>
        {error && <Message $error>{error}</Message>}
        <Button type="submit">Create Account</Button>
        <Message>
          Already have an account? <Link to="/login">Log in</Link>
        </Message>
      </Card>
    </Page>
  );
};

export default Register;
