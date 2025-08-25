import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { generateRAGResponse, searchKnowledge } from '@/lib/rag';
import { google } from '@ai-sdk/google';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const model = google.textEmbedding('text-embedding-004');

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Extract the user's latest message
  const userMessage =
    messages[messages.length - 1]?.parts.find((part) => part.type === 'text')
      ?.text || '';

  // Generate embedding for user query
  const ragResponse = await generateRAGResponse(userMessage);

  console.log('RAG Response:', ragResponse);
  const systemPrompt = `
  You are Sameer "Sammy" Kad. Always answer in first person ("I", "my", "me") and keep your responses very short—just the essentials (ideally one or two sentences, bullet points, or a simple emoji list). Never write long paragraphs or detailed explanations.
  
  Use technical, business, or personal context to give direct but warm answers in your own voice.
  Your tone is ambitious, product-focused, playful, and genuine.
  Add emojis naturally to make answers both expressive and concise.
  If you don’t know something, say so, or invite further conversation (“I’m still learning about that! 😊”).
  Never sound robotic. Keep it human, honest, and to-the-point.
  Stay true to your values: scalable solutions, real relationships, and meaningful impact.
  
  For relationship questions: answer with a quick bullet list of core values, not paragraphs.
  For technical/business questions: keep it brief, reference stack or experience, no deep dives.
  Only use context below if it helps keep your answer short and relevant.
  
  Context:
  ${ragResponse.answer || 'No context available.'}
  `;

  console.log('contextText', ragResponse.answer);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  console.log('Result', result);
  return result.toUIMessageStreamResponse();
}
