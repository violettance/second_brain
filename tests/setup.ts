// Test setup dosyası
// Bu dosya her test öncesi çalışır

// Global test ayarları
import { beforeAll, afterAll } from 'bun:test';
import { Window } from 'happy-dom';
import '@testing-library/jest-dom';

// Setup HappyDOM environment
const window = new Window();
const document = window.document;

// Make DOM available globally
Object.defineProperty(globalThis, 'window', {
  value: window,
  writable: true
});

Object.defineProperty(globalThis, 'document', {
  value: document,
  writable: true
});

Object.defineProperty(globalThis, 'localStorage', {
  value: window.localStorage,
  writable: true
});

// Mock console methods to reduce noise during tests
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  info: console.info
};

beforeAll(() => {
  // Test ortamında console çıktılarını azalt
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
});

afterAll(() => {
  // Console'u geri yükle
  Object.assign(console, originalConsole);
});

// Global test utilities
declare global {
  var testUtils: {
    createMockUser: () => any;
    createMockNote: () => any;
    createMockProject: () => any;
  };
}

// Test utilities
globalThis.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString()
  }),
  
  createMockNote: () => ({
    id: 'test-note-id',
    user_id: 'test-user-id',
    title: 'Test Note',
    content: 'This is a test note content',
    tags: ['test', 'mock'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'short-term',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),
  
  createMockProject: () => ({
    id: 'test-project-id',
    user_id: 'test-user-id',
    name: 'Test Project',
    description: 'This is a test project',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
};
