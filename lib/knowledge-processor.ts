import { readFile } from 'fs/promises';
import path from 'path';
import { KnowledgeChunk, KnowledgeBase, Project } from './types';
import { generateEmbedding } from './embedding';
import { index } from './pinecone';

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
    chunks.push({
      id: 'identity_basic',
      content: `${identity.full_name} (${identity.preferred_name}) is a ${
        identity.age
      }-year-old ${identity.occupation} from ${
        identity.location
      }. He works at ${identity.company} in the ${identity.industry?.join(
        ', '
      )} industry.`,
      metadata: {
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
      },
    });

    // Values and philosophy chunk
    chunks.push({
      id: 'identity_values',
      content: `Sameer's life philosophy: ${
        identity.life_philosophy
      }. Core values: ${identity.values?.join(', ')}.`,
      metadata: {
        section: 'identity',
        subsection: 'values',
        category: 'personal',
        keywords: ['values', 'philosophy', 'beliefs', 'principles'],
      },
    });
  }

  // Personality Processing
  if (data.personality) {
    const personality = data.personality;

    chunks.push({
      id: 'personality_traits',
      content: `Sameer's personality traits: ${personality.traits?.join(
        ', '
      )}. Work style: ${personality.work_style}. Communication: ${
        personality.communication_style
      }. Leadership: ${personality.leadership}.`,
      metadata: {
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
      },
    });
  }

  // Technical Expertise Processing
  if (data.technical_expertise) {
    const tech = data.technical_expertise;

    // Frontend chunk
    if (tech.frontend) {
      chunks.push({
        id: 'tech_frontend',
        content: `Frontend expertise: ${
          tech.frontend.framework
        } with ${tech.frontend.styling?.join(', ')}, ${tech.frontend.icons}, ${
          tech.frontend.animations
        }. Expertise level: ${tech.frontend.expertise}`,
        metadata: {
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
        },
      });
    }

    // Backend chunk
    if (tech.backend) {
      chunks.push({
        id: 'tech_backend',
        content: `Backend expertise: ${tech.backend.database} with ${tech.backend.orm}. Architecture preference: ${tech.backend.architecture}. Expertise level: ${tech.backend.expertise}`,
        metadata: {
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
        },
      });
    }

    // Authentication chunk
    if (tech.authentication) {
      chunks.push({
        id: 'tech_auth',
        content: `Authentication: ${tech.authentication}`,
        metadata: {
          section: 'technical_expertise',
          subsection: 'authentication',
          category: 'technical',
          keywords: ['authentication', 'clerk', 'kinde', 'jwt'],
        },
      });
    }

    // Payments chunk
    if (tech.payments) {
      chunks.push({
        id: 'tech_payments',
        content: `Payment gateways: ${tech.payments.gateways?.join(
          ', '
        )}. Security: ${
          tech.payments.security
        }. Features: ${tech.payments.features?.join(', ')}`,
        metadata: {
          section: 'technical_expertise',
          subsection: 'payments',
          category: 'technical',
          keywords: ['payments', 'phonepe', 'cashfree', 'razorpay', 'security'],
        },
      });
    }

    // Cloud services chunk
    if (tech.cloud) {
      chunks.push({
        id: 'tech_cloud',
        content: `Cloud services - Databases: ${tech.cloud.databases?.join(
          ', '
        )}. Storage: ${tech.cloud.file_storage?.join(
          ', '
        )}. AI: ${tech.cloud.ai_services?.join(', ')}. Deployment: ${
          tech.cloud.deployment
        }`,
        metadata: {
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
        },
      });
    }

    // Specialized skills chunk
    if (tech.specialized_skills) {
      chunks.push({
        id: 'tech_specialized',
        content: `Specialized skills: ${tech.specialized_skills.join(', ')}`,
        metadata: {
          section: 'technical_expertise',
          subsection: 'specialized',
          category: 'technical',
          keywords: ['ai', 'pdf', 'reports', 'saas', 'multi-tenant', 'rag'],
        },
      });
    }
  }

  // Sports Processing
  if (data.sports?.volleyball) {
    const volleyball = data.sports.volleyball;
    chunks.push({
      id: 'sports_volleyball',
      content: `Sameer is a ${volleyball.achievement} in volleyball. Current status: ${volleyball.status}. Impact: ${volleyball.impact}`,
      metadata: {
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
      },
    });
  }

  // Projects Processing
  if (data.projects && Array.isArray(data.projects)) {
    // Main project (Shiksha.cloud)
    const mainProject = data.projects.find(
      (p: Project) => p.name === 'Shiksha.cloud'
    );
    if (mainProject) {
      chunks.push({
        id: 'project_shiksha_overview',
        content: `Shiksha.cloud is a ${mainProject.type} in ${mainProject.stage} stage. Target market: ${mainProject.market}. Business model: ${mainProject.model}. Domain: ${mainProject.domain}`,
        metadata: {
          section: 'projects',
          subsection: 'shiksha_overview',
          category: 'professional',
          keywords: ['shiksha', 'school management', 'saas', 'edtech', 'crm'],
        },
      });

      chunks.push({
        id: 'project_shiksha_tech',
        content: `Shiksha.cloud technical stack: ${mainProject.stack?.join(
          ', '
        )}`,
        metadata: {
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
        },
      });

      if (mainProject.features) {
        chunks.push({
          id: 'project_shiksha_features',
          content: `Shiksha.cloud features - User Management: ${mainProject.features.user_management?.join(
            ', '
          )}. Academics: ${mainProject.features.academics?.join(
            ', '
          )}. Finance: ${mainProject.features.finance?.join(
            ', '
          )}. AI Features: ${mainProject.features.ai_features?.join(', ')}`,
          metadata: {
            section: 'projects',
            subsection: 'shiksha_features',
            category: 'professional',
            keywords: ['features', 'attendance', 'payments', 'ai', 'reports'],
          },
        });
      }

      if (mainProject.advantages) {
        chunks.push({
          id: 'project_shiksha_advantages',
          content: `Shiksha.cloud competitive advantages: ${mainProject.advantages.join(
            ', '
          )}`,
          metadata: {
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
          },
        });
      }
    }
  }

  // Relationships Processing
  if (data.relationships) {
    const rel = data.relationships;

    // Relationship philosophy
    if (rel.relationship_goals) {
      chunks.push({
        id: 'relationships_philosophy',
        content: `Relationship goals: Marriage - ${
          rel.relationship_goals.marriage
        }. Partnership style: ${
          rel.relationship_goals.partnership
        }. Ideal partner qualities: ${rel.ideal_partner?.join(', ')}.`,
        metadata: {
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
        },
      });
    }

    // Current feelings/crush
    if (rel.crush) {
      chunks.push({
        id: 'relationships_crush',
        content: `Sameer has unexpressed feelings for ${
          rel.crush.name
        }. He admires qualities such as ${rel.crush.qualities?.join(
          ', '
        )}. Status: ${rel.crush.status}. ${rel.crush.feelings}`,
        metadata: {
          section: 'relationships',
          subsection: 'crush',
          category: 'personal',
          keywords: ['crush', 'feelings', 'unexpressed', 'nikita'],
        },
      });
    }

    // Ex-relationships
    if (rel.ex_relationships && Array.isArray(rel.ex_relationships)) {
      rel.ex_relationships.forEach((ex: any, i: number) => {
        chunks.push({
          id: `relationships_ex_${i}`,
          content: `Ex-girlfriend: ${ex.name}. Qualities: ${ex.qualities?.join(
            ', '
          )}. Reason for breakup: ${ex.reason}. ${
            ex.note ? `Note: ${ex.note}` : ''
          }`,
          metadata: {
            section: 'relationships',
            subsection: 'ex_relationships',
            category: 'personal',
            keywords: ['ex', 'girlfriend', 'past', 'relationship'],
          },
        });
      });
    }

    // Family
    if (rel.family) {
      chunks.push({
        id: 'relationships_family',
        content: `Family: Mother - ${rel.family.mother}. Father - ${
          rel.family.father
        }. Sisters: ${rel.family.sister?.join(', ')}.`,
        metadata: {
          section: 'relationships',
          subsection: 'family',
          category: 'personal',
          keywords: ['family', 'mother', 'father', 'sister', 'sayali', 'pooja'],
        },
      });
    }
  }

  // Goals Processing
  if (data.goals) {
    if (data.goals.immediate) {
      chunks.push({
        id: 'goals_immediate',
        content: `Immediate goals: ${data.goals.immediate.join(', ')}`,
        metadata: {
          section: 'goals',
          subsection: 'immediate',
          category: 'professional',
          keywords: ['goals', 'mvp', 'client', 'revenue', 'immediate'],
        },
      });
    }

    if (data.goals.long_term) {
      chunks.push({
        id: 'goals_longterm',
        content: `Long-term goals: ${data.goals.long_term.join(', ')}`,
        metadata: {
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
        },
      });
    }
  }

  // Contact Information
  if (data.contact) {
    chunks.push({
      id: 'contact_info',
      content: `Contact Sameer directly at ${data.contact.phone}. ${data.contact.fallback}`,
      metadata: {
        section: 'contact',
        category: 'contact',
        keywords: ['contact', 'phone', 'call', 'reach', 'ask directly'],
      },
    });
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
