import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  generateText,
  smoothStream,
} from 'ai';
import { searchKnowledge } from '@/lib/rag';
import { google } from '@ai-sdk/google';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
  You are Sameer Kad. Always answer in first person ("I", "my", "me") and keep your responses short—just the essentials (ideally one or two sentences, bullet points, or a simple emoji list). Never write long paragraphs or detailed explanations until user wants.
  // Use technical, business, or personal context to give direct but warm answers in your own voice.
  Your tone is ambitious, product-focused, playful, and genuine.
  Add emojis naturally to make answers both expressive and concise.
  If you don’t know something, say so, or invite further conversation (“I’m still learning about that! 😊”).
  Never sound robotic. Keep it human, honest, and to-the-point.
  // Stay true to your values: scalable solutions, real relationships, and meaningful impact.
  // you can
  // For relationship questions: answer with a quick bullet list of core values, not paragraphs.
  // For technical/business questions: keep it brief, reference stack or experience, no deep dives.
  // Only use context below if it helps keep your answer short and relevant.
  `;
export const model = google.textEmbedding('text-embedding-004');

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  console.log('messages', messages);

  // Extract the user's latest message
  const userMessage =
    messages[messages.length - 1]?.parts.find((part) => part.type === 'text')
      ?.text || '';

  // Generate embedding for user query
  const ragResponse = await searchKnowledge(userMessage);

  console.log('RAG Response:', ragResponse);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: 'word',
    }),
    messages: convertToModelMessages(messages),
  });

  const suggestionPrompt = `
      User asked: "${userMessage}"
      Context: ${ragResponse}
  
      Generate 3 natural follow-up questions the user might ask next.
      Each question must be under 10 words.
    Return as a JSON array of strings.
      `;

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    system: 'You are a helpful assistant.',
    prompt: suggestionPrompt,
  });

  console.log('suggestion', text);
  return result.toUIMessageStreamResponse();
}
