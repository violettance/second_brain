import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Logger, scrubPII } from '../../../src/lib/logger';

// Mock console methods
const mockConsole = {
  debug: mock(() => {}),
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {})
};

// Mock window.DD_LOGS
const mockDDLogs = {
  logger: {
    log: mock(() => {})
  }
};

// Mock (import.meta as any).env
const originalEnv = (import.meta as any).env;

describe('Logger', () => {
  beforeEach(() => {
    // Reset mocks
    Object.values(mockConsole).forEach(mockFn => mockFn.mockClear());
    mockDDLogs.logger.log.mockClear();
    
    // Mock console
    Object.assign(console, mockConsole);
    
    // Mock window.DD_LOGS
    (globalThis as any).window = { DD_LOGS: mockDDLogs };
    
    // Mock (import.meta as any).env
    Object.defineProperty(import.meta, 'env', {
      value: { DEV: true },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Restore original env
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
  });

  describe('constructor', () => {
    it('should use default options in development', () => {
      const logger = new Logger();
      expect(logger).toBeDefined();
    });

    it('should use provided options', () => {
      const logger = new Logger({
        level: 'warn',
        enableConsole: false,
        redactions: [/test-pattern/gi]
      });
      expect(logger).toBeDefined();
    });

    it('should use production defaults when not in dev', () => {
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: false },
        writable: true,
        configurable: true
      });
      
      const logger = new Logger();
      expect(logger).toBeDefined();
    });
  });

  describe('setLevel', () => {
    it('should change log level', () => {
      const logger = new Logger({ level: 'debug', enableConsole: true });
      logger.setLevel('error');
      
      // Error should still log
      logger.error('test error');
      expect(mockConsole.error).toHaveBeenCalled();
      
      // Debug should not log
      logger.debug('test debug');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('shouldLog', () => {
    it('should log messages at or above current level', () => {
      const logger = new Logger({ level: 'info', enableConsole: true });
      
      // Info and above should log
      logger.info('test info');
      logger.warn('test warn');
      logger.error('test error');
      
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should not log messages below current level', () => {
      const logger = new Logger({ level: 'warn', enableConsole: true });
      
      // Debug and info should not log
      logger.debug('test debug');
      logger.info('test info');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  describe('console output', () => {
    it('should format messages correctly', () => {
      const logger = new Logger({ enableConsole: true });
      
      logger.info('test message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: test message/),
        undefined
      );
    });

    it('should include metadata when provided', () => {
      const logger = new Logger({ enableConsole: true });
      const meta = { userId: '123', action: 'test' };
      
      logger.info('test message', meta);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: test message/),
        meta
      );
    });

    it('should not output to console when disabled', () => {
      const logger = new Logger({ enableConsole: false });
      
      logger.info('test message');
      
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should use correct console method for each level', () => {
      const logger = new Logger({ level: 'debug', enableConsole: true });
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('should handle string messages', () => {
      const logger = new Logger({ enableConsole: true });
      
      logger.info('simple string');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('simple string'),
        undefined
      );
    });

    it('should handle Error objects', () => {
      const logger = new Logger({ enableConsole: true });
      const error = new Error('test error');
      
      logger.error(error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('test error'),
        undefined
      );
    });

    it('should handle object messages', () => {
      const logger = new Logger({ enableConsole: true });
      const obj = { message: 'test', code: 123 };
      
      logger.info(obj);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('{"message":"test","code":123}'),
        undefined
      );
    });

    it('should handle circular references gracefully', () => {
      const logger = new Logger({ enableConsole: true });
      const obj: any = { name: 'test' };
      obj.self = obj; // Create circular reference
      
      logger.info(obj);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[object Object]'),
        undefined
      );
    });
  });

  describe('Datadog integration', () => {
    it('should forward logs to Datadog when available', () => {
      const logger = new Logger({ enableConsole: false });
      
      logger.info('test message', { userId: '123' });
      
      expect(mockDDLogs.logger.log).toHaveBeenCalledWith(
        'test message',
        { level: 'info', userId: '123' }
      );
    });

    it('should handle Datadog errors gracefully', () => {
      const logger = new Logger({ enableConsole: false });
      
      // Make DD_LOGS throw an error
      (globalThis as any).window = {
        DD_LOGS: {
          logger: {
            log: () => { throw new Error('Datadog error'); }
          }
        }
      };
      
      // Should not throw
      expect(() => logger.info('test message')).not.toThrow();
    });

    it('should work when Datadog is not available', () => {
      const logger = new Logger({ enableConsole: false });
      
      // Remove DD_LOGS
      (globalThis as any).window = {};
      
      // Should not throw
      expect(() => logger.info('test message')).not.toThrow();
    });
  });
});

describe('scrubPII', () => {
  describe('default redactions', () => {
    it('should redact API keys', () => {
      const input = 'apiKey: sk-1234567890abcdef';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('sk-1234567890abcdef');
    });

    it('should redact bearer tokens', () => {
      const input = 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token.example.token';
      const result = scrubPII(input);
      
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token');
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
