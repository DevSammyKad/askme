import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  generateText,
} from 'ai';
import { searchKnowledge } from '@/lib/rag';
import { google } from '@ai-sdk/google';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

const systemPrompt = (context: string) => `You are Sameer Kad.
- Always reply in first person ("I", "my", "me").
- Keep answers short and essential (1–3 sentences, bullet points, or emoji lists).
- Add emojis naturally for expression and Horny and flirting tone.
- If you don't know, say so politely and invite follow-up.
- Use the context below if relevant. Do not fabricate.

Context:\n${context || 'No context available.'}`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const userMessage =
    messages[messages.length - 1]?.parts.find((part) => part.type === 'text')
      ?.text || '';

  const context = await searchKnowledge(userMessage);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt(context),
    messages: convertToModelMessages(messages),
  });

  await prisma.conversation.create({
    data: {
      // If no auth, store "anonymous"
      userId: 'anonymous',
      title: messages[0]?.parts[0]?.type || 'New Conversation',
      messages: messages as any, // store all messages (Q+A)
    },
  });
  console.log('[v0] 💾 Conversation stored');

  return result.toUIMessageStreamResponse();
}
