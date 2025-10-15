import { readFile } from 'fs/promises';
import path from 'path';
import { KnowledgeChunk, KnowledgeBase, Project } from './types';
import { generateEmbedding } from './embedding';
import { index } from './pinecone';

function normalizeText(input: string | undefined | null): string {
  if (!input) return '';
  return String(input).replace(/\s+/g, ' ').trim();
}

function safeJoin(
  list: Array<string | undefined | null> | undefined,
  sep = ', '
): string {
  if (!Array.isArray(list)) return '';
  return list
    .map((v) => normalizeText(v))
    .filter(Boolean)
    .join(sep);
}

function pushChunk(
  chunks: KnowledgeChunk[],
  id: string,
  content: string,
  metadata: KnowledgeChunk['metadata']
) {
  const trimmed = normalizeText(content);
  if (!trimmed) return;
  chunks.push({ id, content: trimmed, metadata });
}

export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  const filePath = path.join(process.cwd(), 'lib/data/about.json');
  const fileContent = await readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function chunkKnowledgeBase(data: KnowledgeBase): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  // Core Identity Processing
  if (data.identity) {
    const identity = data.identity;

    // Basic info chunk
    pushChunk(
      chunks,
      'identity_basic',
      `${identity.full_name} (${identity.preferred_name}) is a ${normalizeText(
        identity.age as any
      )}-year-old ${normalizeText(identity.occupation)} from ${normalizeText(
        identity.location
      )}. Works at ${normalizeText(identity.company)} in ${safeJoin(
        identity.industry
      )}.`,
      {
        section: 'identity',
        subsection: 'basic_info',
        category: 'personal',
        keywords: [
          'name',
          'age',
          'location',
          'occupation',
          'company',
          'sameer',
          'sammy',
          'kad',
        ],
      }
    );

    // Demographics
    pushChunk(
      chunks,
      'identity_demographics',
      `Birth date: ${normalizeText(
        identity.birth_date
      )}. Location: ${normalizeText(identity.location)}. Industries: ${safeJoin(
        identity.industry
      )}.`,
      {
        section: 'identity',
        subsection: 'demographics',
        category: 'personal',
        keywords: ['birth date', 'location', 'industry', 'demographics'],
      }
    );

    // Values and philosophy chunk
    pushChunk(
      chunks,
      'identity_values',
      `Life philosophy: ${normalizeText(
        identity.life_philosophy
      )}. Core values: ${safeJoin(identity.values)}.`,
      {
        section: 'identity',
        subsection: 'values',
        category: 'personal',
        keywords: ['values', 'philosophy', 'beliefs', 'principles'],
      }
    );
  }

  // Personality Processing
  if (data.personality) {
    const personality = data.personality;

    pushChunk(
      chunks,
      'personality_traits',
      `Personality traits: ${safeJoin(
        personality.traits
      )}. Work style: ${normalizeText(
        personality.work_style
      )}. Communication: ${normalizeText(
        personality.communication_style
      )}. Leadership: ${normalizeText(personality.leadership)}.`,
      {
        section: 'personality',
        subsection: 'traits',
        category: 'personal',
        keywords: [
          'personality',
          'traits',
          'work style',
          'communication',
          'leadership',
        ],
      }
    );
  }

  // Technical Expertise Processing
  if (data.technical_expertise) {
    const tech = data.technical_expertise;

    // Frontend chunk
    if (tech.frontend) {
      pushChunk(
        chunks,
        'tech_frontend',
        `Frontend: ${normalizeText(tech.frontend.framework)} with ${safeJoin(
          tech.frontend.styling
        )}, ${normalizeText(tech.frontend.icons)}, ${normalizeText(
          tech.frontend.animations
        )}. Expertise: ${normalizeText(tech.frontend.expertise)}.`,
        {
          section: 'technical_expertise',
          subsection: 'frontend',
          category: 'technical',
          keywords: [
            'frontend',
            'nextjs',
            'tailwind',
            'shadcn',
            'react',
            'framer motion',
          ],
        }
      );
    }

    // Backend chunk
    if (tech.backend) {
      pushChunk(
        chunks,
        'tech_backend',
        `Backend: ${normalizeText(tech.backend.database)} with ${normalizeText(
          tech.backend.orm
        )}. Architecture: ${normalizeText(
          tech.backend.architecture
        )}. Expertise: ${normalizeText(tech.backend.expertise)}.`,
        {
          section: 'technical_expertise',
          subsection: 'backend',
          category: 'technical',
          keywords: [
            'backend',
            'postgresql',
            'prisma',
            'server actions',
            'database',
          ],
        }
      );
    }

    // Authentication chunk
    if (tech.authentication) {
      pushChunk(
        chunks,
        'tech_auth',
        `Authentication: ${normalizeText(tech.authentication)}`,
        {
          section: 'technical_expertise',
          subsection: 'authentication',
          category: 'technical',
          keywords: ['authentication', 'clerk', 'kinde', 'jwt'],
        }
      );
    }

    // Payments chunk
    if (tech.payments) {
      pushChunk(
        chunks,
        'tech_payments',
        `Payments: ${safeJoin(
          tech.payments.gateways
        )}. Security: ${normalizeText(
          tech.payments.security
        )}. Features: ${safeJoin(tech.payments.features)}.`,
        {
          section: 'technical_expertise',
          subsection: 'payments',
          category: 'technical',
          keywords: ['payments', 'phonepe', 'cashfree', 'razorpay', 'security'],
        }
      );
    }

    // Cloud services chunk
    if (tech.cloud) {
      pushChunk(
        chunks,
        'tech_cloud',
        `Cloud - Databases: ${safeJoin(
          tech.cloud.databases
        )}. Storage: ${safeJoin(tech.cloud.file_storage)}. AI: ${safeJoin(
          tech.cloud.ai_services
        )}. Deployment: ${normalizeText(tech.cloud.deployment)}.`,
        {
          section: 'technical_expertise',
          subsection: 'cloud',
          category: 'technical',
          keywords: [
            'cloud',
            'supabase',
            'neon',
            'cloudinary',
            'vercel',
            'aws',
          ],
        }
      );
    }

    // Specialized skills chunk
    if (tech.specialized_skills) {
      pushChunk(
        chunks,
        'tech_specialized',
        `Specialized skills: ${safeJoin(tech.specialized_skills)}`,
        {
          section: 'technical_expertise',
          subsection: 'specialized',
          category: 'technical',
          keywords: ['ai', 'pdf', 'reports', 'saas', 'multi-tenant', 'rag'],
        }
      );
    }
  }

  // Sports Processing
  if (data.sports?.volleyball) {
    const volleyball = data.sports.volleyball;
    pushChunk(
      chunks,
      'sports_volleyball',
      `Volleyball: ${normalizeText(
        volleyball.achievement
      )}. Status: ${normalizeText(volleyball.status)}. Impact: ${normalizeText(
        volleyball.impact
      )}.`,
      {
        section: 'sports',
        subsection: 'volleyball',
        category: 'personal',
        keywords: [
          'volleyball',
          'sports',
          'state champion',
          'gold medal',
          'athlete',
          'national level',
        ],
      }
    );
  }

  // Projects Processing
  if (data.projects && Array.isArray(data.projects)) {
    // Main project (Shiksha.cloud)
    const mainProject = data.projects.find(
      (p: Project) => p.name === 'Shiksha.cloud'
    );
    if (mainProject) {
      pushChunk(
        chunks,
        'project_shiksha_overview',
        `Shiksha.cloud is a ${normalizeText(
          mainProject.type
        )} in ${normalizeText(
          mainProject.stage
        )} stage. Market: ${normalizeText(
          mainProject.market
        )}. Model: ${normalizeText(mainProject.model)}. Domain: ${normalizeText(
          mainProject.domain
        )}.`,
        {
          section: 'projects',
          subsection: 'shiksha_overview',
          category: 'professional',
          keywords: ['shiksha', 'school management', 'saas', 'edtech', 'crm'],
        }
      );

      pushChunk(
        chunks,
        'project_shiksha_tech',
        `Shiksha.cloud stack: ${safeJoin(mainProject.stack)}`,
        {
          section: 'projects',
          subsection: 'shiksha_tech',
          category: 'technical',
          keywords: [
            'shiksha',
            'nextjs',
            'prisma',
            'clerk',
            'phonepe',
            'supabase',
            'vercel',
          ],
        }
      );

      if (mainProject.features) {
        pushChunk(
          chunks,
          'project_shiksha_features',
          `Features - User: ${safeJoin(
            (mainProject.features as any).user_management
          )}. Academics: ${safeJoin(
            (mainProject.features as any).academics
          )}. Finance: ${safeJoin(
            (mainProject.features as any).finance
          )}. Communication: ${safeJoin(
            (mainProject.features as any).communication
          )}. AI: ${safeJoin(
            (mainProject.features as any).ai_features
          )}. Future: ${safeJoin((mainProject.features as any).future)}.`,
          {
            section: 'projects',
            subsection: 'shiksha_features',
            category: 'professional',
            keywords: ['features', 'attendance', 'payments', 'ai', 'reports'],
          }
        );
      }

      if (mainProject.advantages) {
        pushChunk(
          chunks,
          'project_shiksha_advantages',
          `Competitive advantages: ${safeJoin(mainProject.advantages)}`,
          {
            section: 'projects',
            subsection: 'advantages',
            category: 'professional',
            keywords: [
              'competitive',
              'advantages',
              'local market',
              'ai powered',
              'affordable',
            ],
          }
        );
      }
    }

    // Other projects summarized individually
    for (const project of data.projects) {
      if (!project || project.name === 'Shiksha.cloud') continue;
      const nameSlug = normalizeText(project.name)
        .toLowerCase()
        .replace(/\s+/g, '-');
      pushChunk(
        chunks,
        `project_${nameSlug}_overview`,
        `${normalizeText(project.name)} — ${normalizeText(
          project.type
        )}. Status: ${normalizeText(project.status)}. Domain: ${normalizeText(
          project.domain
        )}.`,
        {
          section: 'projects',
          subsection: 'overview',
          category: 'professional',
          keywords: [
            'project',
            normalizeText(project.name),
            normalizeText(project.type),
            normalizeText(project.domain),
          ],
        }
      );
    }
  }

  // Relationships Processing
  if (data.relationships) {
    const rel = data.relationships;

    // Relationship philosophy
    if (rel.relationship_goals) {
      pushChunk(
        chunks,
        'relationships_philosophy',
        `Relationship goals — Marriage: ${normalizeText(
          rel.relationship_goals.marriage
        )}. Partnership: ${normalizeText(
          rel.relationship_goals.partnership
        )}. Ideal partner: ${safeJoin(rel.ideal_partner)}.`,
        {
          section: 'relationships',
          subsection: 'philosophy',
          category: 'personal',
          keywords: [
            'relationships',
            'marriage',
            'partner',
            'qualities',
            'love',
            'dating',
          ],
        }
      );
    }

    // Feelings (person)
    if (rel.feelings) {
      pushChunk(
        chunks,
        'relationships_feelings',
        `Feelings for ${normalizeText(
          rel.feelings.person
        )} — qualities: ${safeJoin(
          rel.feelings.qualities
        )}. Status: ${normalizeText(rel.feelings.status)}.`,
        {
          section: 'relationships',
          subsection: 'feelings',
          category: 'personal',
          keywords: ['feelings', 'admiration', 'qualities', 'status'],
        }
      );
    }

    // Current feelings/crush
    if (rel.crush) {
      pushChunk(
        chunks,
        'relationships_crush',
        `Crush: ${normalizeText(rel.crush.name)}. Qualities: ${safeJoin(
          rel.crush.qualities
        )}. Status: ${normalizeText(rel.crush.status)}. ${normalizeText(
          rel.crush.feelings
        )}.`,
        {
          section: 'relationships',
          subsection: 'crush',
          category: 'personal',
          keywords: ['crush', 'feelings', 'unexpressed'],
        }
      );
    }

    // Ex-relationships
    if (rel.ex_relationships && Array.isArray(rel.ex_relationships)) {
      rel.ex_relationships.forEach((ex: any, i: number) => {
        pushChunk(
          chunks,
          `relationships_ex_${i}`,
          `Ex: ${normalizeText(ex.name)}. Qualities: ${safeJoin(
            ex.qualities
          )}. Reason: ${normalizeText(ex.reason)}. ${
            ex.note ? `Note: ${normalizeText(ex.note)}` : ''
          }`,
          {
            section: 'relationships',
            subsection: 'ex_relationships',
            category: 'personal',
            keywords: ['ex', 'past', 'relationship'],
          }
        );
      });
    }

    // Family
    if (rel.family) {
      pushChunk(
        chunks,
        'relationships_family',
        `Family — Mother: ${normalizeText(
          rel.family.mother
        )}. Father: ${normalizeText(rel.family.father)}. Sisters: ${safeJoin(
          rel.family.sisters
        )}. Brothers: ${safeJoin(rel.family.brothers)}. Friends: ${safeJoin(
          rel.family.friends
        )}.`,
        {
          section: 'relationships',
          subsection: 'family',
          category: 'personal',
          keywords: [
            'family',
            'mother',
            'father',
            'sisters',
            'brothers',
            'friends',
          ],
        }
      );
    }
  }

  // Goals Processing
  if (data.goals) {
    if (data.goals.immediate) {
      pushChunk(
        chunks,
        'goals_immediate',
        `Immediate goals: ${safeJoin(data.goals.immediate)}`,
        {
          section: 'goals',
          subsection: 'immediate',
          category: 'professional',
          keywords: ['goals', 'mvp', 'client', 'revenue', 'immediate'],
        }
      );
    }

    if (data.goals.long_term) {
      pushChunk(
        chunks,
        'goals_longterm',
        `Long-term goals: ${safeJoin(data.goals.long_term)}`,
        {
          section: 'goals',
          subsection: 'long_term',
          category: 'mixed',
          keywords: [
            'long term',
            'vision',
            'leading platform',
            'marriage',
            'impact',
          ],
        }
      );
    }
  }

  // Contact Information
  if (data.contact) {
    pushChunk(
      chunks,
      'contact_info',
      `Contact: ${normalizeText(data.contact.phone)}. ${normalizeText(
        data.contact.fallback
      )}`,
      {
        section: 'contact',
        category: 'contact',
        keywords: ['contact', 'phone', 'call', 'reach', 'ask directly'],
      }
    );
  }

  return chunks;
}

export async function storeKnowledgeInPinecone(
  chunks: KnowledgeChunk[]
): Promise<void> {
  console.log(`[v0] Processing ${chunks.length} knowledge chunks...`);

  const vectors = [];

  for (const chunk of chunks) {
    try {
      console.log(`[v0] Generating embedding for chunk: ${chunk.id}`);
      const embedding = await generateEmbedding(chunk.content);

      vectors.push({
        id: chunk.id,
        values: embedding,
        metadata: {
          content: chunk.content,
          section: chunk.metadata.section,
          subsection: chunk.metadata.subsection || '',
          category: chunk.metadata.category,
          keywords: chunk.metadata.keywords,
        },
      });
    } catch (error) {
      console.error(`[v0] Failed to process chunk ${chunk.id}:`, error);
    }
  }

  if (vectors.length > 0) {
    console.log(`[v0] Storing ${vectors.length} vectors in Pinecone...`);
    await index.upsert(vectors);
    console.log(`[v0] Successfully stored knowledge in Pinecone`);
  }
}

export async function processAndStoreKnowledge(): Promise<void> {
  try {
    console.log('[v0] Loading knowledge base...');
    const knowledgeBase = await loadKnowledgeBase();

    console.log('[v0] Chunking knowledge...');
    const chunks = chunkKnowledgeBase(knowledgeBase);

    console.log('[v0] Storing in Pinecone...');
    await storeKnowledgeInPinecone(chunks);

    console.log('[v0] Knowledge processing complete!');
  } catch (error) {
    console.error('[v0] Knowledge processing failed:', error);
    throw error;
  }
}
