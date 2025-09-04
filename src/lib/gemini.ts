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

export async function generateAiInsights(notes: ShortTermNote[]): Promise<{ summary: string; recommendations: { note: ShortTermNote; reason: string }[] }> {
  const fallbackResponse = { summary: 'AI insight could not be generated.', recommendations: [] };

  if (!notes || notes.length === 0) {
    return { summary: 'Not enough notes for analysis.', recommendations: [] };
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('VITE_GEMINI_API_KEY is not set');
    return { summary: 'AI service not configured.', recommendations: [] };
  }

  const noteCount = notes.length;
  const maxNotesToAnalyze = 15;
  const notesToAnalyze = noteCount > maxNotesToAnalyze ? notes.slice(0, maxNotesToAnalyze) : notes;

  let summaryInstructions = '';
  if (noteCount <= 5) {
    summaryInstructions = `
    - **For each note**, provide a brief insight (max 1 sentence per note).
    - Start each insight with "• The note titled '...'"
    - After the insights, give one overall recommendation.
    - Example Format:
      "summary": "• The note titled '...' suggests...\\n• The note titled '...' indicates...\\n\\nRecommendation: You seem to be focusing on..."
    `;
  } else {
    summaryInstructions = `
    - Identify key themes, patterns, and the user's current focus.
    - The summary MUST be a single string containing these headers followed by their content: '🧠 Main Themes:', '📝 Current Focus:', and '💡 Recommendation:'.
    - Use newline characters (\\n) to separate the sections.
    - Keep the entire summary under 150 words.
    `;
  }

  const prompt = `
    Analyze these ${notesToAnalyze.length} short-term notes based on the following instructions.

    ### Instructions ###
    1.  **Create a concise summary:**
        ${summaryInstructions}

    2.  **Identify up to 5 notes that should be moved to long-term memory:**
        - Criteria: Important concepts, reference info, project ideas, lasting value.
        - For each, provide a brief reason (max 25 words).

    ### Output Format ###
    Respond with a single, valid JSON object in this exact format. Do not include any other text, markdown, or code fences.
    {
      "summary": "For >5 notes, format like this: '🧠 Main Themes: ...\\n📝 Current Focus: ...\\n💡 Recommendation: ...' | For <=5 notes, format like this: '• The note titled ...\\n• The note titled ...\\n\\nRecommendation: ...'",
      "recommendations": [
        {
          "title": "Exact note title to recommend",
          "reason": "Brief reason for long-term storage."
        }
      ]
    }

    ### Notes to Analyze ###
    ${notesToAnalyze.map((n, idx) => `${idx + 1}. Title: "${n.title}"\nContent: ${n.content.substring(0, 150)}...`).join('\n\n')}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the JSON response
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error('Gemini response did not contain valid JSON.', text);
      return fallbackResponse;
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate the parsed data structure and match notes
    if (typeof parsedData.summary === 'string' && Array.isArray(parsedData.recommendations)) {
       const finalRecommendations = parsedData.recommendations
        .map((rec: any) => {
            const note = notes.find(n => n.title === rec.title);
            return note ? { note, reason: rec.reason } : null;
        })
        .filter(Boolean);
        
        return { summary: parsedData.summary, recommendations: finalRecommendations };
    } else {
      console.error('Parsed JSON has an invalid structure:', parsedData);
      return fallbackResponse;
    }

  } catch (e: any) {
    console.error('Gemini AI Insights Error:', e);
    return fallbackResponse;
  }
}

export async function generateLongTermInsights(notes: ShortTermNote[]): Promise<string> {
  const fallbackResponse = 'AI analysis could not be generated.';

  if (!notes || notes.length === 0) {
    return 'Not enough notes for a deep analysis.';
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('VITE_GEMINI_API_KEY is not set');
    return 'AI service not configured.';
  }

  const noteCount = notes.length;
  const maxNotesToAnalyze = 20; // Long-term can handle a bit more context
  const notesToAnalyze = noteCount > maxNotesToAnalyze ? notes.slice(0, maxNotesToAnalyze) : notes;

  const prompt = `
    As a knowledge synthesis assistant, analyze the user's long-term memory notes to uncover deeper connections and strategic next steps.

    ### Analysis Sections ###
    Based on the provided notes, generate insights for the following four sections:

    1.  **🔗 Hidden Connections:** Identify non-obvious relationships, thematic links, or causal chains between different notes. How do ideas from different domains intersect?
    2.  **📈 Emerging Patterns:** What are the overarching themes, recurring questions, or mental models that appear across multiple notes? What is the user subconsciously focusing on?
    3.  **🚀 Strategic Next Step:** Based on the connections and patterns, what is a single, logical, and valuable next step for the user to take? This could be a new project, a research topic, or a question to explore.
    4.  **🤔 Potential Blind Spot:** What is a missing piece, an unasked question, or a potential contradiction that the user might be overlooking based on their notes?

    ### Output Format ###
    - Respond with a clear, well-structured analysis. Do not use introductory/concluding remarks.
    - Use the exact emoji and header for each of the four sections.
    - Under each header, provide insights as a bulleted list using '•'.
    - When referencing specific notes, use their exact titles in single quotes (e.g., 'Reading Notes: Atomic Habits').
    - Do not use markdown for bolding.

    ### Example Response Structure ###
    🔗 Hidden Connections
    • The insight about the connection between 'Note Title A' and 'Note Title B'.

    📈 Emerging Patterns
    • The pattern of 'XYZ' is emerging across several notes.

    🚀 Strategic Next Step
    • Based on the theme of 'ABC', the next step should be to...

    🤔 Potential Blind Spot
    • The user might be overlooking the implications of '...' on their '...' project.


    ### Notes to Analyze ###
    ${notesToAnalyze.map((n, idx) => `${idx + 1}. Title: "${n.title}"\nContent: ${n.content.substring(0, 200)}...`).join('\n\n')}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e: any) {
    console.error('Gemini Long-Term Insights Error:', e);
    return fallbackResponse;
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
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