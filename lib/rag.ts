import { generateEmbedding } from './embedding';
import { index } from './pinecone';
// import { logUnansweredQuery } from './logger';
import type { SearchResult } from '@/lib/types';

interface RAGResponse {
  answer: string;
  sources: string[];
  confidence: number;
  shouldFallback: boolean;
}

export async function searchKnowledge(
  query: string,
  topK = 1
): Promise<SearchResult[]> {
  try {
    console.log(`[v0] Searching knowledge for: "${query}"`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search Pinecone for similar vectors
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    console.log(`[v0] Found ${searchResponse.matches?.length || 0} matches`);

    // Convert to SearchResult format
    const results: SearchResult[] = (searchResponse.matches || []).map(
      (match) => ({
        chunk: {
          id: match.id || '',
          content: (match.metadata?.content as string) || '',
          metadata: {
            section: (match.metadata?.section as string) || '',
            subsection: (match.metadata?.subsection as string) || '',
            category: (match.metadata?.category as string) || '',
            keywords: ((match.metadata?.keywords as string) || '')
              .split(',')
              .filter(Boolean),
          },
        },
        score: match.score || 0,
      })
    );

    console.log('answer result', results);

    return results;
  } catch (error) {
    console.error('[v0] Knowledge search failed:', error);
    return [];
  }
}

export async function generateRAGResponse(
  query: string,
  userId = 'anonymous'
): Promise<RAGResponse> {
  try {
    // Search for relevant knowledge
    const searchResults = await searchKnowledge(query, 1);

    // Define confidence threshold
    const CONFIDENCE_THRESHOLD = 0.1;
    const highConfidenceResults = searchResults.filter(
      (result) => result.score >= CONFIDENCE_THRESHOLD
    );

    console.log(
      `[v0] High confidence results: ${highConfidenceResults.length}/${searchResults.length}`
    );

    // If no high-confidence results, this should be logged as unanswered
    if (highConfidenceResults.length === 0) {
      //   await logUnansweredQuery(query, userId, {
      //     searchResults: searchResults.length,
      //     maxScore: searchResults[0]?.score || 0,
      //   });

      return {
        answer:
          "I don't have that information. Please ask him directly at 8459324821.",
        sources: [],
        confidence: 0,
        shouldFallback: true,
      };
    }

    // Generate response from high-confidence results
    const relevantContent = highConfidenceResults
      .map((result) => result.chunk.content)
      .join(' ');
    const sources = highConfidenceResults.map(
      (result) => result.chunk.metadata.section
    );
    const avgConfidence =
      highConfidenceResults.reduce((sum, result) => sum + result.score, 0) /
      highConfidenceResults.length;

    // Create contextual response
    const answer = await createContextualAnswer(
      query,
      relevantContent,
      highConfidenceResults
    );

    return {
      answer,
      sources: [...new Set(sources)], // Remove duplicates
      confidence: avgConfidence,
      shouldFallback: false,
    };
  } catch (error) {
    console.error('[v0] RAG response generation failed:', error);

    // Log as unanswered due to system error
    // await logUnansweredQuery(query, userId, {
    //   error: error instanceof Error ? error.message : 'Unknown error',
    // });

    return {
      answer:
        "I don't have that information. Please ask him directly at 8459324821.",
      sources: [],
      confidence: 0,
      shouldFallback: true,
    };
  }
}

async function createContextualAnswer(
  query: string,
  relevantContent: string,
  results: SearchResult[]
): Promise<string> {
  // Simple rule-based response generation
  const lowerQuery = query.toLowerCase();

  // Handle specific question patterns
  if (lowerQuery.includes('who is') || lowerQuery.includes("who's")) {
    const identityResult = results.find(
      (r) => r.chunk.metadata.section === 'core_identity'
    );
    if (identityResult) {
      return identityResult.chunk.content;
    }
  }

  if (lowerQuery.includes('what does') && lowerQuery.includes('do')) {
    const workResult = results.find(
      (r) =>
        r.chunk.metadata.section === 'core_identity' ||
        r.chunk.metadata.section === 'projects_portfolio'
    );
    if (workResult) {
      return workResult.chunk.content;
    }
  }

  if (
    lowerQuery.includes('technical') ||
    lowerQuery.includes('skills') ||
    lowerQuery.includes('technology')
  ) {
    const techResult = results.find(
      (r) => r.chunk.metadata.section === 'technical_expertise'
    );
    if (techResult) {
      return techResult.chunk.content;
    }
  }

  if (
    lowerQuery.includes('shiksha') ||
    lowerQuery.includes('project') ||
    lowerQuery.includes('company')
  ) {
    const projectResult = results.find(
      (r) => r.chunk.metadata.section === 'projects_portfolio'
    );
    if (projectResult) {
      return projectResult.chunk.content;
    }
  }

  if (
    lowerQuery.includes('sport') ||
    lowerQuery.includes('volleyball') ||
    lowerQuery.includes('athlete')
  ) {
    const sportsResult = results.find(
      (r) => r.chunk.metadata.section === 'sports_and_achievements'
    );
    if (sportsResult) {
      return sportsResult.chunk.content;
    }
  }

  if (
    lowerQuery.includes('relationship') ||
    lowerQuery.includes('girlfriend') ||
    lowerQuery.includes('dating') ||
    lowerQuery.includes('marriage')
  ) {
    const relationshipResult = results.find(
      (r) => r.chunk.metadata.section === 'personal_relationships'
    );
    if (relationshipResult) {
      return relationshipResult.chunk.content;
    }
  }

  if (
    lowerQuery.includes('goal') ||
    lowerQuery.includes('future') ||
    lowerQuery.includes('plan')
  ) {
    const goalsResult = results.find(
      (r) => r.chunk.metadata.section === 'goals_and_aspirations'
    );
    if (goalsResult) {
      return goalsResult.chunk.content;
    }
  }

  if (
    lowerQuery.includes('contact') ||
    lowerQuery.includes('phone') ||
    lowerQuery.includes('reach')
  ) {
    const contactResult = results.find(
      (r) => r.chunk.metadata.section === 'contact_info'
    );
    if (contactResult) {
      return contactResult.chunk.content;
    }
  }

  // Default: return the highest scoring result
  return results[0]?.chunk.content || relevantContent;
}

export function generateFollowUpSuggestion(
  answer: string,
  sources: string[]
): string | null {
  // Generate contextual follow-up suggestions
  if (sources.includes('core_identity')) {
    return 'Do you want to know about his technical expertise or current projects?';
  }

  if (sources.includes('projects_portfolio')) {
    return 'Do you want to know what inspired him to build Shiksha.cloud?';
  }

  if (sources.includes('technical_expertise')) {
    return 'Would you like to know about his specific projects or achievements?';
  }

  if (sources.includes('sports_and_achievements')) {
    return 'Do you want to know how sports influenced his professional approach?';
  }

  if (sources.includes('goals_and_aspirations')) {
    return 'Would you like to know about his current projects or technical skills?';
  }

  return null;
}

// Utility function to check if a query is likely answerable
export function isQueryAnswerable(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Patterns that are likely unanswerable
  const unanswerable = [
    'family details',
    'address',
    'salary',
    'income',
    'password',
    'bank',
    'credit card',
  ];

  return !unanswerable.some((pattern) => lowerQuery.includes(pattern));
}
