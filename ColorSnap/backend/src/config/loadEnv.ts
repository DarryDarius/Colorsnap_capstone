import fs from 'fs';
import path from 'path';

const stripWrappingQuotes = (value: string) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const stripInlineComment = (value: string) => {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (character === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (character === '#' && !inSingleQuote && !inDoubleQuote) {
      return value.slice(0, index).trimEnd();
    }
  }

  return value;
};

const parseEnvLine = (line: string) => {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = stripWrappingQuotes(stripInlineComment(trimmed.slice(separatorIndex + 1).trim()));

  if (!key) {
    return null;
  }

  return { key, value };
};

const resolveEnvPath = () => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env')
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

const loadEnvFile = () => {
  const envPath = resolveEnvPath();

  if (!envPath) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const entry = parseEnvLine(line);

    if (!entry) {
      continue;
    }

    if (process.env[entry.key] === undefined) {
      process.env[entry.key] = entry.value;
    }
  }
};

loadEnvFile();
