import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { searchKnowledge } from '@/lib/rag';
import path from 'path';
import { readFile } from 'fs/promises';

export const maxDuration = 15;

export async function POST(req: Request) {
  const filePath = path.join(process.cwd(), 'lib/data/about.json');
  const fileContent = await readFile(filePath, 'utf-8');

  const jsonData = JSON.parse(fileContent);
  try {
    const { lastUser } = (await req.json()) as { lastUser?: string };
    const query = (lastUser || '').toString();
    const context = await searchKnowledge(query);
    const prompt = `User asked: "${query}"
Context:
${context}



Generate 3 natural follow-up questions the user might ask next based on ${jsonData} This json.
- Keep under 10 words each.
- Return only the questions, one per line.`;
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });
    const suggestions = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    console.log('suggestions', suggestions);
    return new Response(JSON.stringify({ suggestions }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
  }
}
