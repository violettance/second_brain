import { GoogleGenerativeAI } from '@google/generative-ai';

// Not tipini tanımla (minimum alanlar)
type ShortTermNote = {
  title: string;
  content: string;
  tags?: string[];
};

type NoteForTagging = {
  title: string;
  content: string;
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

export async function generateTags(note: NoteForTagging): Promise<string[]> {
  if (!note.title.trim() && !note.content.trim()) {
    return [];
  }
  
  // Detect language from the note content
  const text = `${note.title} ${note.content}`.toLowerCase();
  const isTurkish = /[çğıöşü]/.test(text) || 
    /\b(ve|ile|için|olan|olarak|bu|şu|o|bir|birkaç|çok|az|büyük|küçük|iyi|kötü|güzel|çirkin|hızlı|yavaş|kolay|zor)\b/.test(text);
  
  const prompt = isTurkish ? 
    `Bu notu analiz et ve ana konuları, temaları veya kategorileri yakalayan 3-5 ilgili etiket öner.

Kurallar:
- Tek kelime veya kısa ifadeler kullan (max 2 kelime)
- Etiketleri spesifik ve anlamlı yap
- Küçük harf kullan
- "not" veya "fikir" gibi genel kelimelerden kaçın
- Gerçek içerik ve konu üzerine odaklan
- Sadece etiketleri döndür, virgülle ayır
- Türkçe etiketler üret

Not Başlığı: ${note.title}
Not İçeriği: ${note.content}

Etiketler:` :
    `Analyze this note and suggest 3-5 relevant tags that capture the main topics, themes, or categories. 

Rules:
- Use single words or short phrases (max 2 words)
- Make tags specific and meaningful
- Use lowercase
- Avoid generic words like "note" or "idea"
- Focus on the actual content and subject matter
- Return only the tags, separated by commas
- Generate tags in English

Note Title: ${note.title}
Note Content: ${note.content}

Tags:`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tagsText = response.text().trim();
    
    // Parse the response and clean up tags
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length <= 20) // Max 20 chars per tag
      .slice(0, 5); // Max 5 tags
    
    return tags;
  } catch (e: any) {
    console.error('Gemini Tag Generation Error:', e);
    return [];
  }
} 