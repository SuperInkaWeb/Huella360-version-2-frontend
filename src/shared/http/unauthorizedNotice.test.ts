import { describe, it, expect, vi } from 'vitest';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

import { getUnauthorizedNotice } from './api';

describe('getUnauthorizedNotice', () => {
  it('cuenta desactivada por el admin: muestra el mensaje del backend', () => {
    const notice = getUnauthorizedNotice({
      error: 'ACCOUNT_DISABLED',
      message: 'Tu cuenta fue desactivada. Si crees que es un error, contacta a soporte.',
    });
    expect(notice.title).toBe('Cuenta desactivada');
    expect(notice.text).toContain('desactivada');
  });

  it('cualquier otro 401 sigue siendo sesion expirada', () => {
    expect(getUnauthorizedNotice({ error: 'Unauthorized' }).title).toBe('Sesión Expirada');
    expect(getUnauthorizedNotice(undefined).title).toBe('Sesión Expirada');
  });
});
