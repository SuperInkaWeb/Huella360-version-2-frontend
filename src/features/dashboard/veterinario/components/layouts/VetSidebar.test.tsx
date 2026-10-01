import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../../auth/context/useAuth', () => ({ useAuth: () => ({ logout: vi.fn() }) }));

import { VetSidebar } from './VetSidebar';

// H360-QA-VET V4: el veterinario no tenia como llegar a su suscripcion desde el portal
// (solo desde la pagina publica de Precios).
describe('VetSidebar', () => {
  it('incluye el acceso a Suscripción', () => {
    render(
      <MemoryRouter initialEntries={['/portal/veterinario']}>
        <VetSidebar isMobileOpen={false} setMobileOpen={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Suscripción/ })).toHaveAttribute('href', '/portal/veterinario/suscripcion');
  });

  // H360-UX-001: el sidebar debe dejar claro que es el portal profesional, no el del dueño de mascota.
  it('identifica el portal profesional', () => {
    render(
      <MemoryRouter initialEntries={['/portal/veterinario']}>
        <VetSidebar isMobileOpen={false} setMobileOpen={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Portal profesional')).toBeInTheDocument();
  });
});
