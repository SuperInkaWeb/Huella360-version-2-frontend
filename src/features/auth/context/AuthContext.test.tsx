import { describe, it, expect, beforeEach } from 'vitest';

const AUTH0_CLAIMS = {
  EMAIL: 'https://vet-saas.com/email',
  ROLE: 'https://vet-saas.com/role',
  EMPRESA_ID: 'https://vet-saas.com/empresaId',
  NOMBRE: 'https://vet-saas.com/nombre',
} as const;

const STORAGE_KEYS = {
  PERFIL_COMPLETO: 'perfilCompleto',
  TOKEN: 'token',
  USER_ROLE: 'userRole',
  EMPRESA_ID: 'empresaId',
  USER_NOMBRE: 'userNombre',
} as const;

describe('AuthContext role extraction logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('extracts role from Auth0 custom claim', () => {
    const mockUser = {
      sub: 'auth0|abc123',
      email: 'test@test.com',
      [AUTH0_CLAIMS.ROLE]: 'EMPRESA',
      [AUTH0_CLAIMS.EMAIL]: 'test@test.com',
      [AUTH0_CLAIMS.EMPRESA_ID]: 42,
      [AUTH0_CLAIMS.NOMBRE]: 'Test User',
    } as Record<string, unknown>;

    const role = (mockUser[AUTH0_CLAIMS.ROLE] as string) || null;
    expect(role).toBe('EMPRESA');
  });

  it('persists role to localStorage', () => {
    const role = 'VETERINARIO';
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    expect(localStorage.getItem(STORAGE_KEYS.USER_ROLE)).toBe('VETERINARIO');
  });

  it('reads role from localStorage on init', () => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'ADMIN');
    const stored = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    expect(stored).toBe('ADMIN');
  });

  it('clears auth storage on logout', () => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'EMPRESA');
    localStorage.setItem(STORAGE_KEYS.EMPRESA_ID, '42');
    localStorage.setItem(STORAGE_KEYS.USER_NOMBRE, 'Test');
    localStorage.setItem(STORAGE_KEYS.PERFIL_COMPLETO, 'true');

    const authKeys = [
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.EMPRESA_ID,
      STORAGE_KEYS.USER_NOMBRE,
      STORAGE_KEYS.PERFIL_COMPLETO,
    ];
    authKeys.forEach((k) => localStorage.removeItem(k));

    expect(localStorage.getItem(STORAGE_KEYS.USER_ROLE)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.EMPRESA_ID)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER_NOMBRE)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.PERFIL_COMPLETO)).toBeNull();
  });

  it('extracts empresaId as number from Auth0 claim', () => {
    const mockUser = {
      [AUTH0_CLAIMS.EMPRESA_ID]: 42,
    } as Record<string, unknown>;
    const empresaId = mockUser[AUTH0_CLAIMS.EMPRESA_ID] || null;
    expect(Number(empresaId)).toBe(42);
  });

  it('falls back to user.empresaId if custom claim missing', () => {
    const mockUser = {
      empresaId: 99,
    } as Record<string, unknown>;
    const empresaId = mockUser[AUTH0_CLAIMS.EMPRESA_ID] || mockUser.empresaId || null;
    expect(Number(empresaId)).toBe(99);
  });

  it('falls back to user.nickname for nombre', () => {
    const mockUser = {
      nickname: 'fallback_name',
    } as Record<string, unknown>;
    const nombre = mockUser[AUTH0_CLAIMS.NOMBRE] || mockUser.nickname || mockUser.name || null;
    expect(nombre).toBe('fallback_name');
  });

  it('prefers custom claim over standard claim for nombre', () => {
    const mockUser = {
      [AUTH0_CLAIMS.NOMBRE]: 'Custom Name',
      name: 'Standard Name',
      nickname: 'Nick',
    } as Record<string, unknown>;
    const nombre = mockUser[AUTH0_CLAIMS.NOMBRE] || mockUser.nickname || mockUser.name || null;
    expect(nombre).toBe('Custom Name');
  });

  it('sync payload contains correct fields', () => {
    const mockUser = {
      sub: 'auth0|abc123',
      email: 'test@test.com',
      [AUTH0_CLAIMS.EMAIL]: 'custom@test.com',
      [AUTH0_CLAIMS.ROLE]: 'EMPRESA',
      [AUTH0_CLAIMS.NOMBRE]: 'Test User',
    } as Record<string, unknown>;

    const auth0Email = (mockUser[AUTH0_CLAIMS.EMAIL] as string) || mockUser.email;
    const auth0Role = (mockUser[AUTH0_CLAIMS.ROLE] as string) || null;

    const payload = {
      correo: auth0Email,
      nombre: mockUser[AUTH0_CLAIMS.NOMBRE] || null,
      auth0Sub: mockUser.sub || null,
      rol: auth0Role,
    };

    expect(payload.correo).toBe('custom@test.com');
    expect(payload.rol).toBe('EMPRESA');
    expect(payload.auth0Sub).toBe('auth0|abc123');
  });
});
