import { generateEmbedding } from './embedding';
import { index } from './pinecone';

// Optional: hook for logging unanswered queries in future

export async function searchKnowledge(
  query: string,
  topK = 5
): Promise<string> {
  try {
    console.log(`[v0] 🔍 Searching knowledge for: "${query}"`);

    try {
      // Generate embedding
      const queryEmbedding = await generateEmbedding(query);
      // Search Pinecone
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      const matches = searchResponse.matches ?? [];
      const context = matches
        .map((m: any, i: number) => {
          const md = m.metadata || {};
          return `- (${md.section}${
            md.subsection ? '/' + md.subsection : ''
          }) ${md.content || ''}`.trim();
        })
        .filter(Boolean)
        .join('\n');

      console.log('Context : ', context);

      return context || '';
    } catch (vectorError) {
      console.log('[v0] Vector search not available, using fallback');
      return 'I am open to discussing life, relationships, and my work. Ask me anything!';
    }
  } catch (error) {
    console.error('[v0] ❌ Knowledge search failed:', error);
    return '';
  }
}
