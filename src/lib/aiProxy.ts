import { supabase } from './supabase';

type ShortTermNote = {
  title: string;
  content: string;
  tags?: string[];
};

type NoteForTagging = {
  title: string;
  content: string;
};

export async function generateAiInsights(notes: ShortTermNote[]): Promise<{ summary: string; recommendations: { note: ShortTermNote; reason: string }[] }> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-short-term', {
      body: { notes }
    });
    if (error) throw error;
    
    // Edge function returns { summary, recommendations } directly
    if (data && typeof data.summary === 'string' && Array.isArray(data.recommendations)) {
      return data;
    }
    return { summary: 'AI insight could not be generated.', recommendations: [] };
  } catch (e) {
    console.error('ai-short-term invoke error:', e);
    return { summary: 'AI insight could not be generated.', recommendations: [] };
  }
}

export async function generateLongTermInsights(notes: ShortTermNote[]): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-long-term', {
      body: { notes }
    });
    if (error) throw error;
    return typeof data === 'string' ? data : (data?.text ?? 'AI analysis could not be generated.');
  } catch (e) {
    console.error('ai-long-term invoke error:', e);
    return 'AI analysis could not be generated.';
  }
}

export async function generateMermaidFromNote(noteTitle: string, noteContent: string): Promise<string> {
  if (!noteContent) return '';
  try {
    const { data, error } = await supabase.functions.invoke('ai-mermaid', {
      body: { title: noteTitle, content: noteContent }
    });
    if (error) throw error;
    return typeof data === 'string' ? data : (data?.code ?? '');
  } catch (e) {
    console.error('ai-mermaid invoke error:', e);
    return '';
  }
}

export async function generateTags(note: NoteForTagging): Promise<string[]> {
  if (!note.title.trim() && !note.content.trim()) return [];
  try {
    const { data, error } = await supabase.functions.invoke('ai-tags', {
      body: { note }
    });
    if (error) throw error;
    return Array.isArray(data) ? data : (data?.tags ?? []);
  } catch (e: any) {
    // Preserve special errors if your function returns them
    if (e?.message === 'SERVICE_OVERLOADED') {
      throw new Error('SERVICE_OVERLOADED');
    }
    console.error('ai-tags invoke error:', e);
    return [];
  }
}

// Optional: simple pass-through to keep API parity. If you later add an edge function, wire it here.
export async function enhanceSpeechText(rawSpeechText: string): Promise<string> {
  // For now, return the original text (voice enhancement disabled on client).
  return rawSpeechText;
}


