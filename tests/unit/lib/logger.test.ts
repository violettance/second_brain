import { describe, it, expect } from 'bun:test';
import { scrubPII } from '../../../src/lib/logger';

describe('scrubPII', () => {
  describe('default redactions', () => {
    it('should redact API keys', () => {
      const input = 'apiKey: sk-1234567890abcdef';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('sk-1234567890abcdef');
    });

    it('should redact bearer tokens', () => {
      const input = 'authorization: Bearer example-jwt-token-12345';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('example-jwt-token-12345');
    });

    it('should redact passwords', () => {
      const input = 'password: secretpassword123';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('secretpassword123');
    });

    it('should redact secrets', () => {
      const input = 'secret: my-secret-key-123';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('my-secret-key-123');
    });

    it('should redact access tokens', () => {
      const input = 'accessToken: access-token-12345';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('access-token-12345');
    });

    it('should redact refresh tokens', () => {
      const input = 'refreshToken: refresh-token-67890';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('refresh-token-67890');
    });

    it('should redact set-cookie headers', () => {
      const input = 'Set-Cookie: sessionId=abc123; HttpOnly; Secure';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('abc123');
    });
  });

  describe('custom redactions', () => {
    it('should apply custom redaction patterns', () => {
      const input = 'customField: sensitive-data-123';
      const customRedactions = [/sensitive-data-\d+/gi];
      const result = scrubPII(input, customRedactions);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('sensitive-data-123');
    });

    it('should combine default and custom redactions', () => {
      const input = 'apiKey: sk-1234567890abcdef, customField: sensitive-data-123';
      const customRedactions = [/sensitive-data-\d+/gi];
      const result = scrubPII(input, customRedactions);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('sk-1234567890abcdef');
      expect(result).not.toContain('sensitive-data-123');
    });
  });

  describe('edge cases', () => {
    it('should handle non-string values', () => {
      const input = { number: 123, boolean: true, null: null };
      const result = scrubPII(input);
      
      expect(result).toEqual(input);
    });

    it('should handle circular references', () => {
      const input: any = { name: 'test' };
      input.self = input;
      
      const result = scrubPII(input);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle invalid JSON gracefully', () => {
      const input = { 
        valid: 'data',
        invalid: { toJSON: () => { throw new Error('Invalid JSON'); } }
      };
      
      const result = scrubPII(input);
      
      expect(result).toBeDefined();
    });

    it('should handle string input', () => {
      const input = 'apiKey: sk-1234567890abcdef';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('sk-1234567890abcdef');
    });

    it('should handle null and undefined', () => {
      expect(scrubPII(null)).toBeNull();
      expect(scrubPII(undefined)).toBeUndefined();
    });
  });

  describe('case sensitivity', () => {
    it('should handle case insensitive patterns', () => {
      const input = 'API_KEY: sk-1234567890abcdef, api_key: sk-abcdef1234567890, ApiKey: sk-9876543210fedcba';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('sk-1234567890abcdef');
      expect(result).not.toContain('sk-abcdef1234567890');
      expect(result).not.toContain('sk-9876543210fedcba');
    });
  });
});
