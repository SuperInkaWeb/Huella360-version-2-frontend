import { describe, it, expect } from 'vitest';

// Antes este test tenia su propia copia de isPublicEndpoint y no probaba el codigo real.
import { isPublicEndpoint } from './publicEndpoints';

describe('isPublicEndpoint', () => {
  describe('always public endpoints', () => {
    it('returns true for /auth/login', () => {
      expect(isPublicEndpoint('/auth/login', 'post')).toBe(true);
    });

    it('returns true for /auth/register', () => {
      expect(isPublicEndpoint('/auth/register', 'post')).toBe(true);
    });

    it('returns true for /public/plans', () => {
      expect(isPublicEndpoint('/public/plans', 'get')).toBe(true);
    });

    it('returns true for /payments/webhook', () => {
      expect(isPublicEndpoint('/payments/webhook', 'post')).toBe(true);
    });

    it('POST /reclamos es publico (Libro de Reclamaciones sin cuenta)', () => {
      expect(isPublicEndpoint('/reclamos', 'post')).toBe(true);
    });

    it('GET /reclamos NO es publico (listado del admin, necesita token)', () => {
      expect(isPublicEndpoint('/reclamos', 'get')).toBe(false);
      expect(isPublicEndpoint('/reclamos/5/status', 'patch')).toBe(false);
    });
  });

  describe('public GET endpoints', () => {
    it('returns true for GET /services', () => {
      expect(isPublicEndpoint('/services', 'get')).toBe(true);
    });

    it('returns true for GET /services/1', () => {
      expect(isPublicEndpoint('/services/1', 'get')).toBe(true);
    });

    it('returns true for GET /adoptions', () => {
      expect(isPublicEndpoint('/adoptions', 'get')).toBe(true);
    });

    it('returns true for GET /categories', () => {
      expect(isPublicEndpoint('/categories', 'get')).toBe(true);
    });

    it('returns true for GET /subscriptions/plans', () => {
      expect(isPublicEndpoint('/subscriptions/plans', 'get')).toBe(true);
    });
  });

  describe('protected endpoints override', () => {
    it('returns false for POST /auth/sync', () => {
      expect(isPublicEndpoint('/auth/sync', 'post')).toBe(false);
    });

    it('returns false for GET /me', () => {
      expect(isPublicEndpoint('/me', 'get')).toBe(false);
    });

    it('returns false for GET /users/me', () => {
      expect(isPublicEndpoint('/users/me', 'get')).toBe(false);
    });

    it('returns false for GET /applications', () => {
      expect(isPublicEndpoint('/applications', 'get')).toBe(false);
    });

    it('returns false for GET /applications/1', () => {
      expect(isPublicEndpoint('/applications/1', 'get')).toBe(false);
    });
  });

  describe('non-public endpoints', () => {
    it('returns false for POST /services', () => {
      expect(isPublicEndpoint('/services', 'post')).toBe(false);
    });

    it('returns false for PATCH /users/me/role', () => {
      expect(isPublicEndpoint('/users/me/role', 'patch')).toBe(false);
    });

    it('returns false for DELETE /subscriptions', () => {
      expect(isPublicEndpoint('/subscriptions', 'delete')).toBe(false);
    });

    it('returns false for unknown endpoint', () => {
      expect(isPublicEndpoint('/unknown', 'get')).toBe(false);
    });
  });
});
