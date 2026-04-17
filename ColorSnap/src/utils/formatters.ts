export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const formatLabel = (value: string) => {
  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const isRealExternalUrl = (value?: string | null) => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    const placeholderHosts = new Set(['example.com', 'www.example.com']);

    return ['http:', 'https:'].includes(url.protocol) && !placeholderHosts.has(url.hostname);
  } catch {
    return false;
  }
};
