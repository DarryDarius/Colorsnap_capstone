import type { IncomingMessage } from 'http';
import { ApiError } from './errors';
import type { UploadedImage } from '../types/analysis';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type MultipartPart = {
  name: string;
  filename?: string;
  contentType?: string;
  data: Buffer;
};

const readRequestBody = async (req: IncomingMessage, maxBytes: number): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;

    if (total > maxBytes) {
      throw new ApiError(413, 'FILE_TOO_LARGE', 'Uploaded image is too large.');
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
};

const getBoundary = (contentType: string | undefined) => {
  if (!contentType?.includes('multipart/form-data')) {
    throw new ApiError(400, 'INVALID_REQUEST', 'Expected multipart/form-data.');
  }

  const boundary = contentType
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith('boundary='))
    ?.replace(/^boundary="?/, '')
    .replace(/"$/, '');

  if (!boundary) {
    throw new ApiError(400, 'INVALID_REQUEST', 'Missing multipart boundary.');
  }

  return boundary;
};

const trimTrailingCrlf = (value: Buffer) => {
  if (value.length >= 2 && value[value.length - 2] === 13 && value[value.length - 1] === 10) {
    return value.subarray(0, value.length - 2);
  }

  return value;
};

const parseContentDisposition = (header: string) => {
  const name = /name="([^"]+)"/.exec(header)?.[1];
  const filename = /filename="([^"]*)"/.exec(header)?.[1];

  return { name, filename: filename || undefined };
};

const parseMultipart = (body: Buffer, boundary: string): MultipartPart[] => {
  const delimiter = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from('\r\n\r\n');
  const parts: MultipartPart[] = [];
  let cursor = body.indexOf(delimiter);

  while (cursor !== -1) {
    let partStart = cursor + delimiter.length;

    if (body[partStart] === 45 && body[partStart + 1] === 45) {
      break;
    }

    if (body[partStart] === 13 && body[partStart + 1] === 10) {
      partStart += 2;
    }

    const nextBoundary = body.indexOf(delimiter, partStart);
    if (nextBoundary === -1) {
      break;
    }

    const rawPart = trimTrailingCrlf(body.subarray(partStart, nextBoundary));
    const headerEnd = rawPart.indexOf(headerSeparator);

    if (headerEnd !== -1) {
      const headersText = rawPart.subarray(0, headerEnd).toString('utf8');
      const data = rawPart.subarray(headerEnd + headerSeparator.length);
      const headers = headersText.split('\r\n').reduce<Record<string, string>>((acc, line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          acc[line.slice(0, separatorIndex).toLowerCase()] = line.slice(separatorIndex + 1).trim();
        }
        return acc;
      }, {});
      const disposition = parseContentDisposition(headers['content-disposition'] || '');

      if (disposition.name) {
        parts.push({
          name: disposition.name,
          filename: disposition.filename,
          contentType: headers['content-type'],
          data
        });
      }
    }

    cursor = nextBoundary;
  }

  return parts;
};

export const parseUploadedImage = async (req: IncomingMessage): Promise<UploadedImage> => {
  const boundary = getBoundary(req.headers['content-type']);
  const body = await readRequestBody(req, MAX_IMAGE_SIZE_BYTES + 1024 * 256);
  const parts = parseMultipart(body, boundary);
  const imagePart = parts.find((part) => part.name === 'image' && part.filename);
  const source = parts.find((part) => part.name === 'source')?.data.toString('utf8').trim();

  if (!imagePart) {
    throw new ApiError(400, 'MISSING_IMAGE', 'An image file is required.');
  }

  const image: UploadedImage = {
    fieldName: imagePart.name,
    originalName: imagePart.filename || 'upload',
    mimeType: imagePart.contentType || 'application/octet-stream',
    source: source === 'camera' || source === 'upload' ? source : 'web',
    size: imagePart.data.length,
    buffer: imagePart.data
  };

  validateUploadedImage(image);
  return image;
};

export const validateUploadedImage = (image: UploadedImage) => {
  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ApiError(413, 'FILE_TOO_LARGE', 'Uploaded image must be 5 MB or smaller.');
  }

  if (!SUPPORTED_MIME_TYPES.has(image.mimeType)) {
    throw new ApiError(400, 'INVALID_IMAGE', 'Unsupported image format. Please upload a JPG, PNG, or WEBP file.');
  }

  if (image.size === 0) {
    throw new ApiError(400, 'INVALID_IMAGE', 'Uploaded image is empty.');
  }
};
