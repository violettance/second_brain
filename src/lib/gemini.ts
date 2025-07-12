import { GoogleGenerativeAI } from '@google/generative-ai';

// Not tipini tanımla (minimum alanlar)
type ShortTermNote = {
  title: string;
  content: string;
  tags?: string[];
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function generateGeminiSummary(notes: ShortTermNote[]): Promise<string> {
  if (!notes || notes.length === 0) return 'Not enough notes.';
  const prompt = `Below are a user's short-term notes. These represent temporary ideas and thoughts in the user's mind. For each note, write an insight starting with: The note titled "...". List each insight as a bullet point (use •). At the end, provide a general recommendation for the user based on these notes. Respond only in clear English. Example format:\n\n• The note titled "..." ...\n• The note titled "..." ...\n\nRecommendation: ...\n\nNotes:\n${notes.map((n) => `Title: ${n.title}\nContent: ${n.content}\nTags: ${(n.tags || []).join(', ')}`).join('\n\n')}`;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e: any) {
    console.error('Gemini Error:', e);
    return 'AI insight could not be generated.';
  }
} 