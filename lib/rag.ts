import { generateEmbedding } from './embedding';
import { index } from './pinecone';
import type { SearchResult } from '@/lib/types';
import { prisma } from './prisma';

async function logUnansweredQuery(
  query: string,
  userId: string,
  { searchResults, maxScore }: { searchResults: number; maxScore: number }
) {
  try {
    await prisma.unansweredQuery.create({
      data: { query, userId, searchResults, maxScore },
    });
    console.log(`[v0] Logged unanswered query: "${query}"`);
  } catch (err) {
    console.error('[v0] Failed to log unanswered query:', err);
  }
}

export async function searchKnowledge(query: string, topK = 1) {
  try {
    console.log(`[v0] 🔍 Searching knowledge for: "${query}"`);

    // Generate embedding
    const queryEmbedding = await generateEmbedding(query);
    // Search Pinecone
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    const matches = searchResponse.matches ?? [];

    const contextText = matches
      .map((m: any) => m.metadata?.content || '')
      .filter(Boolean)
      .join('\n\n--\n\n');

    return contextText;
  } catch (error) {
    console.error('[v0] ❌ Knowledge search failed:', error);
    return [];
  }
}
