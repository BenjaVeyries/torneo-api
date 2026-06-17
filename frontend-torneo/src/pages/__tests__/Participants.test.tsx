// src/pages/__tests__/Participants.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Participants from '../../pages/Participants';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock server handlers
const server = setupServer(
  http.get('/participantes', async () => {
    return HttpResponse.json([
      { id: 1, nombre: 'Juan', edad: 25, equipoId: 1 },
      { id: 2, nombre: 'Ana', edad: 22, equipoId: 2 },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithClient(ui) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

test('renders participants list after loading', async () => {
  renderWithClient(<Participants />);

  // Loading indicator should appear initially
  expect(screen.getByText(/cargando.../i)).toBeInTheDocument();

  // Wait for participants to be displayed
  await waitFor(() => {
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });
});
