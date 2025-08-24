export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: {
    section: string;
    subsection?: string;
    category: string;
    keywords: string[];
  };
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
