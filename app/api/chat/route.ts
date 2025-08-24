import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { z } from 'zod/v4';
import { generateEmbedding } from '@/lib/embedding';
import { searchKnowledge } from '@/lib/rag';
import { google } from '@ai-sdk/google';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const model = google.textEmbedding('text-embedding-004');

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `You are a helpful assistant. Only answer questions using the knowledge base tool. If no relevant information is found, respond: "Sorry, I don't know."`,
    messages: convertToModelMessages(messages),
    tools: {
      getInformation: tool({
        name: 'getInformation',
        description:
          'Get information from your knowledge base to answer questions.',
        inputSchema: z.object({
          question: z.string().describe('the user question'),
        }),
        execute: async ({ question }) => {
          const answer = await searchKnowledge(question);
          return answer || "Sorry, I don't know.";
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
