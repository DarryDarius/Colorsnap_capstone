import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CameraCapture from './CameraCapture';

const originalMediaDevices = navigator.mediaDevices;

afterEach(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: originalMediaDevices
  });
});

test('shows a camera unavailable message when media devices are unsupported', async () => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: undefined
  });

  render(<CameraCapture open onClose={jest.fn()} onCapture={jest.fn()} />);

  expect(screen.getByRole('dialog', { name: /take a photo/i })).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText(/camera is unavailable/i)).toBeInTheDocument();
  });
  expect(screen.getByRole('button', { name: /capture photo/i })).toBeDisabled();
});
