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

export async function generateMermaidFromNote(noteTitle: string, noteContent: string): Promise<string> {
  if (!noteContent) {
    return '';
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
    Analyze the following note's title and content. Your task is to identify the core concepts, entities, and their relationships, and then represent them as the MOST APPROPRIATE Mermaid.js diagram type.

    **Choose the BEST diagram type for this content:**
    - **graph/flowchart**: For concepts, ideas, processes, decision flows, hierarchies
    - **mindmap**: For brainstorming, connected ideas, knowledge mapping
    - **timeline**: For chronological events, historical information, project phases
    - **pie**: For statistics, percentages, proportional data
    - **gitgraph**: For software development, version control, branching concepts
    - **sequence**: For interactions, conversations, step-by-step processes
    - **class**: For object-oriented concepts, relationships, inheritance
    - **state**: For states, transitions, status changes
    - **journey**: For user experiences, customer journeys, workflows

    **Instructions:**
    1.  FIRST analyze the content and decide which diagram type fits BEST
    2.  The output must be ONLY the Mermaid code (no \`\`\`mermaid wrapper, just the raw code)
    3.  Use ONLY English characters (A-Z, a-z, 0-9, spaces, hyphens) in node IDs and labels
    4.  Keep labels SHORT and SIMPLE (max 20 characters each)
    5.  Use node IDs like A, B, C or Node1, Node2, etc.
    6.  Include 5-12 meaningful elements (nodes, branches, states, etc.)
    7.  Make connections that show real relationships from the note content
    8.  If content is too simple, return empty string
    9.  AVOID special characters: àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ, parentheses (), brackets [], curly braces {}

    **Note Title:** "${noteTitle}"
    **Note Content:**
    ---
    ${noteContent}
    ---

    **Examples by type:**
    Graph: graph TD; A[Main Topic] --> B[Subtopic 1]; A --> C[Subtopic 2]; B --> D[Detail];
    Mindmap: mindmap; root((Main Idea)); A[Branch 1]; B[Branch 2]; A1[Sub-branch];
    Timeline: timeline; title Project Timeline; 2023-01 : Start; 2023-06 : Milestone; 2023-12 : End;
    Pie: pie title Distribution; Category A : 45; Category B : 30; Category C : 25;
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini AI response:', text);

    // Clean up the response - should be direct Mermaid code now
    const cleanCode = text.trim();
    
    // Check if it looks like valid Mermaid code
    const mermaidStartPatterns = [
      'graph ', 'flowchart ', 'mindmap', 'timeline', 'pie ', 'gitgraph',
      'sequenceDiagram', 'classDiagram', 'stateDiagram', 'journey'
    ];
    
    const isValidMermaid = mermaidStartPatterns.some(pattern => 
      cleanCode.toLowerCase().startsWith(pattern.toLowerCase())
    );
    
    if (isValidMermaid && cleanCode.length > 10) {
      console.log('Generated Mermaid code:', cleanCode);
      return cleanCode;
    }
    
    // Fallback: try to extract from code block if AI wrapped it anyway
    const mermaidCode = text.match(/```mermaid([\s\S]*?)```/);
    if (mermaidCode && mermaidCode[1]) {
      const extractedCode = mermaidCode[1].trim();
      console.log('Extracted from code block:', extractedCode);
      return extractedCode;
    }
    
    console.log('No valid Mermaid diagram found in response');
    return ''; // Return empty if no valid diagram is found

  } catch (error) {
    console.error('Error generating Mermaid diagram from note:', error);
    return ''; // Return empty on error
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

export async function enhanceSpeechText(rawSpeechText: string): Promise<string> {
  if (!rawSpeechText.trim()) {
    return rawSpeechText;
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('VITE_GEMINI_API_KEY is not set');
    return rawSpeechText; // Return original text if API key is missing
  }

  // Detect language from the speech text
  const text = rawSpeechText.toLowerCase();
  const isTurkish = /[çğıöşü]/.test(text) || 
    /\b(ve|ile|için|olan|olarak|bu|şu|o|bir|birkaç|çok|az|büyük|küçük|iyi|kötü|güzel|çirkin|hızlı|yavaş|kolay|zor|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)\b/.test(text);

  const prompt = isTurkish ?
    `Aşağıdaki ses tanıma metnini iyileştir. Bu metin sesli olarak söylenmiş ve ses tanıma sistemi tarafından yazıya dönüştürülmüştür.

Görevlerin:
1. Noktalama işaretlerini ekle (virgül, nokta, soru işareti, ünlem)
2. Büyük/küçük harf kullanımını düzelt
3. Açık dilbilgisi hatalarını düzelt
4. Cümle yapısını iyileştir
5. Anlamı koruyarak daha akıcı hale getir
6. Gereksiz tekrarları temizle
7. Sadece düzeltilmiş metni döndür, açıklama ekleme

Ham ses metni:
"${rawSpeechText}"

İyileştirilmiş metin:` :
    `Improve the following speech recognition text. This text was spoken aloud and converted to text by a speech recognition system.

Your tasks:
1. Add proper punctuation (commas, periods, question marks, exclamation points)
2. Fix capitalization
3. Correct obvious grammar errors
4. Improve sentence structure
5. Make it more fluent while preserving the meaning
6. Remove unnecessary repetitions
7. Return only the corrected text, no explanations

Raw speech text:
"${rawSpeechText}"

Enhanced text:`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text().trim();
    
    // Remove any quotes that AI might have added
    const cleanedText = enhancedText.replace(/^["'`]|["'`]$/g, '');
    
    return cleanedText || rawSpeechText; // Fallback to original if enhancement fails
  } catch (e: any) {
    console.error('Gemini Speech Enhancement Error:', e);
    return rawSpeechText; // Return original text on error
  }
} 