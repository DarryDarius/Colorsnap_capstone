export const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const formatLabel = (value: string) => {
  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};
