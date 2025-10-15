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

export interface Project {
  name: string;
  domain?: string;
  type: string;
  status?: string;
  stage?: string;
  market?: string;
  model?: string;
  stack?: string[];
  features?: Record<string, string[]> & { ai_features?: string[] };
  advantages?: string[];
}

export interface KnowledgeBase {
  identity?: {
    full_name: string;
    preferred_name: string;
    birth_date?: string;
    age?: string | number;
    location?: string;
    occupation?: string;
    company?: string;
    industry?: string[];
    life_philosophy?: string;
    values?: string[];
  };
  personality?: {
    traits?: string[];
    work_style?: string;
    communication_style?: string;
    leadership?: string;
  };
  technical_expertise?: {
    frontend?: {
      framework?: string;
      styling?: string[];
      icons?: string;
      animations?: string;
      expertise?: string;
    };
    backend?: {
      database?: string;
      orm?: string;
      architecture?: string;
      expertise?: string;
    };
    authentication?: string;
    payments?: {
      gateways?: string[];
      security?: string;
      features?: string[];
    };
    cloud?: {
      databases?: string[];
      file_storage?: string[];
      ai_services?: string[];
      deployment?: string;
    };
    specialized_skills?: string[];
  };
  sports?: {
    volleyball?: { achievement?: string; status?: string; impact?: string };
  };
  projects?: Project[];
  relationships?: {
    ideal_partner?: string[];
    relationship_goals?: { marriage?: string; partnership?: string };
    feelings?: {
      person?: string;
      qualities?: string[];
      status?: string;
    };
    family?: {
      mother?: string;
      father?: string;
      friends?: string[];
      brothers?: string[];
      sisters?: string[];
    };
    crush?: {
      name?: string;
      status?: string;
      qualities?: string[];
      feelings?: string;
      reason?: string;
    };
    ex_relationships?: Array<{
      name?: string;
      status?: string;
      qualities?: string[];
      reason?: string;
      note?: string;
    }>;
  };
  goals?: { immediate?: string[]; long_term?: string[] };
  contact?: { phone?: string; fallback?: string };
}
