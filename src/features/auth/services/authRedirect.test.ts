import { describe, it, expect } from 'vitest';
import { getRedirectByRole, roleRedirectMap } from './authRedirect';

describe('getRedirectByRole', () => {
  it('returns correct path for CLIENTE', () => {
    expect(getRedirectByRole('CLIENTE')).toBe('/portal/cliente');
  });

  it('returns correct path for EMPRESA', () => {
    expect(getRedirectByRole('EMPRESA')).toBe('/portal/empresa');
  });

  it('returns correct path for VETERINARIO', () => {
    expect(getRedirectByRole('VETERINARIO')).toBe('/portal/veterinario');
  });

  it('returns correct path for ADMIN', () => {
    expect(getRedirectByRole('ADMIN')).toBe('/portal/admin');
  });

  it('returns correct path for REPARTIDOR', () => {
    expect(getRedirectByRole('REPARTIDOR')).toBe('/portal/repartidor');
  });

  it('returns / for unknown role', () => {
    expect(getRedirectByRole('UNKNOWN')).toBe('/');
  });

  it('returns / for empty string', () => {
    expect(getRedirectByRole('')).toBe('/');
  });
});

describe('roleRedirectMap', () => {
  it('contains all 5 roles', () => {
    expect(Object.keys(roleRedirectMap)).toHaveLength(5);
  });

  it('maps each role to /portal/ path', () => {
    Object.values(roleRedirectMap).forEach((path) => {
      expect(path).toMatch(/^\/portal\//);
    });
  });
});
