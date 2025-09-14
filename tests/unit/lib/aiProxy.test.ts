import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { 
  generateAiInsights, 
  generateLongTermInsights, 
  generateMermaidFromNote, 
  generateTags, 
  enhanceSpeechText 
} from '../../../src/lib/aiProxy';

// Mock supabase
const mockSupabase = {
  functions: {
    invoke: mock(() => Promise.resolve({ data: null, error: null }))
  }
};

// Mock logger
const mockLogger = {
  error: mock(() => {})
};

// Mock the modules
mock.module('../../../src/lib/supabase', () => ({
  supabase: mockSupabase
}));

mock.module('../../../src/lib/logger', () => ({
  logger: mockLogger
}));

describe('AI Proxy Functions', () => {
  beforeEach(() => {
    // Reset mocks
    mockSupabase.functions.invoke.mockClear();
    mockLogger.error.mockClear();
  });

  describe('generateAiInsights', () => {
    const mockNotes = [
      { title: 'Test Note 1', content: 'This is test content 1', tags: ['test'] },
      { title: 'Test Note 2', content: 'This is test content 2', tags: ['learning'] }
    ];

    it('should return insights when API call succeeds', async () => {
      const mockResponse = {
        summary: 'Test summary',
        recommendations: [
          { note: mockNotes[0], reason: 'Important concept' }
        ]
      };

      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateAiInsights(mockNotes);

      expect(result).toEqual(mockResponse);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-short-term', {
        body: { notes: mockNotes }
      });
    });

    it('should return fallback when API returns invalid data structure', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { invalid: 'structure' },
        error: null
      });

      const result = await generateAiInsights(mockNotes);

      expect(result).toEqual({
        summary: 'AI insight could not be generated.',
        recommendations: []
      });
    });

    it('should return fallback when API returns null data', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const result = await generateAiInsights(mockNotes);

      expect(result).toEqual({
        summary: 'AI insight could not be generated.',
        recommendations: []
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockSupabase.functions.invoke.mockRejectedValueOnce(mockError);

      const result = await generateAiInsights(mockNotes);

      expect(result).toEqual({
        summary: 'AI insight could not be generated.',
        recommendations: []
      });
      expect(mockLogger.error).toHaveBeenCalledWith('AI short-term insights failed', {
        error: mockError,
        notesCount: mockNotes.length,
        service: 'ai-short-term'
      });
    });

    it('should handle empty notes array', async () => {
      const result = await generateAiInsights([]);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-short-term', {
        body: { notes: [] }
      });
    });
  });

  describe('generateLongTermInsights', () => {
    const mockNotes = [
      { title: 'Long Term Note 1', content: 'Deep content 1', tags: ['insight'] },
      { title: 'Long Term Note 2', content: 'Deep content 2', tags: ['analysis'] }
    ];

    it('should return insights when API call succeeds with string data', async () => {
      const mockResponse = 'Long term analysis result';
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateLongTermInsights(mockNotes);

      expect(result).toBe(mockResponse);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-long-term', {
        body: { notes: mockNotes }
      });
    });

    it('should return text from object data', async () => {
      const mockResponse = { text: 'Analysis from object' };
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateLongTermInsights(mockNotes);

      expect(result).toBe('Analysis from object');
    });

    it('should return fallback when data is invalid', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { invalid: 'structure' },
        error: null
      });

      const result = await generateLongTermInsights(mockNotes);

      expect(result).toBe('AI analysis could not be generated.');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockSupabase.functions.invoke.mockRejectedValueOnce(mockError);

      const result = await generateLongTermInsights(mockNotes);

      expect(result).toBe('AI analysis could not be generated.');
      expect(mockLogger.error).toHaveBeenCalledWith('AI long-term insights failed', {
        error: mockError,
        notesCount: mockNotes.length,
        service: 'ai-long-term'
      });
    });
  });

  describe('generateMermaidFromNote', () => {
    const noteTitle = 'Test Note';
    const noteContent = 'This is test content for Mermaid generation';

    it('should return Mermaid code when API call succeeds with string data', async () => {
      const mockResponse = 'graph TD; A[Test] --> B[Result]';
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateMermaidFromNote(noteTitle, noteContent);

      expect(result).toBe(mockResponse);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-mermaid', {
        body: { title: noteTitle, content: noteContent }
      });
    });

    it('should return code from object data', async () => {
      const mockResponse = { code: 'flowchart TD; A --> B' };
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateMermaidFromNote(noteTitle, noteContent);

      expect(result).toBe('flowchart TD; A --> B');
    });

    it('should return empty string when data is invalid', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { invalid: 'structure' },
        error: null
      });

      const result = await generateMermaidFromNote(noteTitle, noteContent);

      expect(result).toBe('');
    });

    it('should return empty string for empty content', async () => {
      const result = await generateMermaidFromNote(noteTitle, '');

      expect(result).toBe('');
      expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockSupabase.functions.invoke.mockRejectedValueOnce(mockError);

      const result = await generateMermaidFromNote(noteTitle, noteContent);

      expect(result).toBe('');
      expect(mockLogger.error).toHaveBeenCalledWith('AI Mermaid generation failed', {
        error: mockError,
        noteTitle,
        contentLength: noteContent.length,
        service: 'ai-mermaid'
      });
    });
  });

  describe('generateTags', () => {
    const mockNote = { title: 'Test Note', content: 'This is test content' };

    it('should return tags when API call succeeds with array data', async () => {
      const mockResponse = ['test', 'learning', 'example'];
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateTags(mockNote);

      expect(result).toEqual(mockResponse);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-tags', {
        body: { note: mockNote }
      });
    });

    it('should return tags from object data', async () => {
      const mockResponse = { tags: ['object', 'tags'] };
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockResponse,
        error: null
      });

      const result = await generateTags(mockNote);

      expect(result).toEqual(['object', 'tags']);
    });

    it('should return empty array when data is invalid', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { invalid: 'structure' },
        error: null
      });

      const result = await generateTags(mockNote);

      expect(result).toEqual([]);
    });

    it('should return empty array for empty note', async () => {
      const emptyNote = { title: '', content: '' };
      const result = await generateTags(emptyNote);

      expect(result).toEqual([]);
      expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should return empty array for note with only whitespace', async () => {
      const whitespaceNote = { title: '   ', content: '   ' };
      const result = await generateTags(whitespaceNote);

      expect(result).toEqual([]);
      expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should handle SERVICE_OVERLOADED error specially', async () => {
      const overloadedError = new Error('SERVICE_OVERLOADED');
      mockSupabase.functions.invoke.mockRejectedValueOnce(overloadedError);

      await expect(generateTags(mockNote)).rejects.toThrow('SERVICE_OVERLOADED');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle other API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockSupabase.functions.invoke.mockRejectedValueOnce(mockError);

      const result = await generateTags(mockNote);

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith('AI tag generation failed', {
        error: mockError,
        noteTitle: mockNote.title,
        contentLength: mockNote.content.length,
        service: 'ai-tags'
      });
    });
  });

  describe('enhanceSpeechText', () => {
    it('should return original text unchanged', async () => {
      const inputText = 'This is raw speech text';
      const result = await enhanceSpeechText(inputText);

      expect(result).toBe(inputText);
    });

    it('should handle empty string', async () => {
      const result = await enhanceSpeechText('');

      expect(result).toBe('');
    });

    it('should handle special characters', async () => {
      const inputText = 'Hello! How are you? I\'m fine, thanks.';
      const result = await enhanceSpeechText(inputText);

      expect(result).toBe(inputText);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Network timeout');
      mockSupabase.functions.invoke.mockRejectedValueOnce(timeoutError);

      const result = await generateAiInsights([{ title: 'Test', content: 'Test' }]);

      expect(result.summary).toBe('AI insight could not be generated.');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle malformed responses', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: 'not an object',
        error: null
      });

      const result = await generateAiInsights([{ title: 'Test', content: 'Test' }]);

      expect(result.summary).toBe('AI insight could not be generated.');
    });

    it('should handle undefined responses', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: undefined,
        error: null
      });

      const result = await generateLongTermInsights([{ title: 'Test', content: 'Test' }]);

      expect(result).toBe('AI analysis could not be generated.');
    });
  });

  describe('input validation', () => {
    it('should handle null notes array', async () => {
      const result = await generateAiInsights(null as any);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-short-term', {
        body: { notes: null }
      });
    });

    it('should handle undefined note content', async () => {
      const result = await generateMermaidFromNote('Title', undefined as any);

      expect(result).toBe('');
      expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10000);
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: 'test',
        error: null
      });

      await generateMermaidFromNote('Title', longContent);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('ai-mermaid', {
        body: { title: 'Title', content: longContent }
      });
    });
  });
});


