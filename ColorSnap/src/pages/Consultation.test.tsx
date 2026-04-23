import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import Consultation from './Consultation';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

beforeEach(() => {
  mockNavigate.mockReset();
});

test('navigates to the booking flow for the selected consultant', () => {
  render(
    <BrowserRouter>
      <Consultation />
    </BrowserRouter>
  );

  fireEvent.click(screen.getAllByRole('button', { name: /book consultation/i })[0]);

  expect(mockNavigate).toHaveBeenCalledWith('/booking?expert=ex1');
});
