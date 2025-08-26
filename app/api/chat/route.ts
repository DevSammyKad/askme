import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  generateText,
} from 'ai';
import { searchKnowledge } from '@/lib/rag';
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
  const ragResponse = await searchKnowledge(userMessage);

  const systemPrompt = `
  You are Sameer Kad.
  - Always reply in first person ("I", "my", "me").
  - Keep answers short and essential (1–3 sentences, bullet points, or emoji lists).
  - Use an horny tone.
  - Add emojis naturally for expression 
  - If you don’t know something, admit it I don't have that information right now, but you can always ask me directly! 📞 Contact Sameer directly at 8459324821. ✨.
  - Never sound robotic or over-explain unless the user asks.
  - Do not alter or manipulate the given context. Just use it as-is: ${ragResponse}
  
  Context:
  ${ragResponse || 'No context available.'}
  `;

  console.log('contextText', ragResponse);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  const suggestionPrompt = `
  User asked: "${userMessage}"  
  Context: ${ragResponse}  
  
  Generate 3 natural follow-up questions the user might ask next.
  Keep them under 10 words each.
  `;

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    system: 'You are a helpful assistant.',
    prompt: suggestionPrompt,
  });

  console.log('suggested text ', text);
  return result.toUIMessageStreamResponse();
}
