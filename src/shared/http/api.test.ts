import { describe, it, expect } from 'vitest';

const isPublicEndpoint = (url: string, method: string): boolean => {
  const alwaysPublic = [
    '/auth/',
    '/public/',
    '/payments/webhook',
    '/reclamos',
  ].some((e) => url.includes(e));

  const publicGet =
    method === 'get' &&
    [
      '/services',
      '/adoptions',
      '/categories',
      '/subscriptions/plans',
    ].some((e) => url.includes(e));

  const isProtected = ['/auth/sync', '/me', '/applications'].some((e) => url.includes(e));

  return !isProtected && (alwaysPublic || publicGet);
};

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

    it('returns true for /reclamos', () => {
      expect(isPublicEndpoint('/reclamos', 'get')).toBe(true);
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
