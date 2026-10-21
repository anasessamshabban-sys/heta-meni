import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Transcribe audio using gemini-3.5-transcribe
 */
export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: 'قم بتفريغ هذا التسجيل الصوتي بدقة عالية إلى نص عربي، مع الحفاظ على الكلمات والمصطلحات كما نُطقت (سواء كانت باللهجة المصرية أو الفصحى أو مصطلحات علمية). أعد النص المفرغ فقط دون أي مقدمات أو تعليقات إضافية.',
          },
        ],
      },
    ],
  });

  return response.text || '';
}

/**
 * High Thinking Study Advisor using gemini-4-argon with thinkingLevel: ThinkingLevel.HIGH
 * Note: Do NOT set maxOutputTokens per requirements.
 */
export async function getStudyAdvice(userQuery: string, contextSummary?: string): Promise<string> {
  const ai = getAiClient();
  const prompt = `أنت المستشار الاستراتيجي والتنظيمي لمنصة "حِتّة منّي" (مساحتي، أفكاري، وبصمتي).
الأسلوب: مصري ذكي، عملي، دافئ، مشجع، هادئ وبلا ضغط أو ملاحقة بالذنب.
الطلب من صاحبة/صاحب الدفتر:
${userQuery}

السياق الدراسي وحالة اليوم:
${contextSummary || 'يوم دراسي وتنظيمي عادي'}

قدم خطة ذكية ومريحة مقسمة لخطوات واضحة، مع مراعاة طاقة الإنسان وأهمية فترات الراحة.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-argon',
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  return response.text || '';
}
