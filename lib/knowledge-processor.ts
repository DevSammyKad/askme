import { readFile } from 'fs/promises';
import path from 'path';
import { KnowledgeChunk } from './types';
import { generateEmbedding } from './embedding';
import { index } from './pinecone';

export async function loadKnowledgeBase(): Promise<any> {
  const filePath = path.join(process.cwd(), 'lib/data/about.json');
  const fileContent = await readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function chunkKnowledgeBase(data: any): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  if (data.core_identity) {
    const identity = data.core_identity;

    // Basic info chunk
    chunks.push({
      id: 'identity_basic',
      content: `${identity.full_name} (${identity.preferred_name}) is a ${identity.age}-year-old ${identity.occupation} from ${identity.location.city}, ${identity.location.current}. He works at ${identity.company} in the ${identity.industry} industry.`,
      metadata: {
        section: 'core_identity',
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
        ],
      },
    });

    // Personality traits chunk
    chunks.push({
      id: 'identity_personality',
      content: `Sameer's personality traits include: ${identity.personality_traits.core_characteristics.join(
        ', '
      )}. His work style is ${
        identity.personality_traits.work_style
      }. He communicates in a ${
        identity.personality_traits.communication_style
      } manner and leads with a ${
        identity.personality_traits.leadership_approach
      } approach.`,
      metadata: {
        section: 'core_identity',
        subsection: 'personality',
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

    // Values and philosophy chunk
    chunks.push({
      id: 'identity_values',
      content: `Sameer's professional values: ${identity.values_and_principles.professional.join(
        ', '
      )}. Personal values: ${identity.values_and_principles.personal.join(
        ', '
      )}. Life philosophy: ${identity.values_and_principles.life_philosophy}`,
      metadata: {
        section: 'core_identity',
        subsection: 'values',
        category: 'personal',
        keywords: ['values', 'principles', 'philosophy', 'beliefs'],
      },
    });
  }

  if (data.technical_expertise) {
    const tech = data.technical_expertise;

    chunks.push({
      id: 'tech_frontend',
      content: `Frontend expertise: ${
        tech.primary_stack.frontend.framework
      } with ${tech.primary_stack.frontend.styling.join(', ')}, ${
        tech.primary_stack.frontend.icons
      }, ${tech.primary_stack.frontend.animations}. Expertise level: ${
        tech.primary_stack.frontend.expertise_level
      }`,
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

    chunks.push({
      id: 'tech_backend',
      content: `Backend expertise: ${tech.primary_stack.backend.database} with ${tech.primary_stack.backend.orm}. Architecture preference: ${tech.primary_stack.backend.architecture}. Expertise level: ${tech.primary_stack.backend.expertise_level}`,
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

    chunks.push({
      id: 'tech_auth_payments',
      content: `Authentication: ${tech.primary_stack.authentication.service} with ${tech.primary_stack.authentication.implementation}. Payments: ${tech.primary_stack.payments.gateway} with ${tech.primary_stack.payments.security}, features include ${tech.primary_stack.payments.features}`,
      metadata: {
        section: 'technical_expertise',
        subsection: 'integrations',
        category: 'technical',
        keywords: [
          'authentication',
          'clerk',
          'payments',
          'phonepe',
          'security',
        ],
      },
    });
  }

  if (data.sports_and_achievements?.volleyball) {
    const volleyball = data.sports_and_achievements.volleyball;
    chunks.push({
      id: 'sports_volleyball',
      content: `Sameer is a ${volleyball.achievement} in volleyball with ${volleyball.skill_level} skill level. Current status: ${volleyball.current_status}. Impact: ${volleyball.impact_on_personality}`,
      metadata: {
        section: 'sports_and_achievements',
        subsection: 'volleyball',
        category: 'personal',
        keywords: [
          'volleyball',
          'sports',
          'state champion',
          'gold medal',
          'athlete',
        ],
      },
    });
  }

  if (data.projects_portfolio?.shiksha_cloud) {
    const project = data.projects_portfolio.shiksha_cloud;

    chunks.push({
      id: 'project_shiksha_overview',
      content: `Shiksha.cloud is a ${project.project_metadata.project_type} for ${project.project_metadata.target_market}. Currently in ${project.project_metadata.development_stage} stage with ${project.project_metadata.business_model} model. Domain: ${project.project_metadata.domain}`,
      metadata: {
        section: 'projects_portfolio',
        subsection: 'shiksha_cloud',
        category: 'professional',
        keywords: ['shiksha', 'school management', 'saas', 'edtech', 'crm'],
      },
    });

    chunks.push({
      id: 'project_shiksha_tech',
      content: `Shiksha.cloud technical stack: ${project.technical_architecture.frontend}, ${project.technical_architecture.backend}, ${project.technical_architecture.authentication}, ${project.technical_architecture.ui_framework}, ${project.technical_architecture.payments}, hosted on ${project.technical_architecture.hosting}`,
      metadata: {
        section: 'projects_portfolio',
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

    chunks.push({
      id: 'project_shiksha_advantages',
      content: `Shiksha.cloud competitive advantages: ${project.competitive_advantages.join(
        ', '
      )}`,
      metadata: {
        section: 'projects_portfolio',
        subsection: 'advantages',
        category: 'professional',
        keywords: [
          'competitive',
          'advantages',
          'indian market',
          'ai powered',
          'affordable',
        ],
      },
    });
  }

  if (data.personal_relationships?.romantic_philosophy) {
    const romance = data.personal_relationships.romantic_philosophy;

    chunks.push({
      id: 'relationships_philosophy',
      content: `Relationship approach: ${
        romance.approach_to_relationships
      }. Ideal partner qualities: ${romance.ideal_partner_qualities.join(
        ', '
      )}. Marriage vision: ${
        romance.relationship_goals.marriage_vision
      }. Partnership style: ${romance.relationship_goals.partnership_style}`,
      metadata: {
        section: 'personal_relationships',
        subsection: 'philosophy',
        category: 'personal',
        keywords: [
          'relationships',
          'marriage',
          'partner',
          'love',
          'dating',
          'romance',
        ],
      },
    });
  }

  if (data.goals_and_aspirations) {
    const goals = data.goals_and_aspirations;

    if (goals.immediate_goals) {
      chunks.push({
        id: 'goals_immediate',
        content: `Immediate product goals: ${goals.immediate_goals.product_development.join(
          ', '
        )}. Business objectives: ${goals.immediate_goals.business_objectives.join(
          ', '
        )}`,
        metadata: {
          section: 'goals_and_aspirations',
          subsection: 'immediate',
          category: 'professional',
          keywords: ['goals', 'mvp', 'client', 'revenue', 'immediate'],
        },
      });
    }

    if (goals.long_term_vision) {
      chunks.push({
        id: 'goals_longterm',
        content: `Long-term business aspirations: ${goals.long_term_vision.business_aspirations.join(
          ', '
        )}. Personal goals: ${goals.long_term_vision.personal_goals.join(
          ', '
        )}`,
        metadata: {
          section: 'goals_and_aspirations',
          subsection: 'longterm',
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

  if (data.contact_info) {
    chunks.push({
      id: 'contact_info',
      content: `Contact Sameer directly at ${data.contact_info.phone}. ${data.contact_info.fallback_message}`,
      metadata: {
        section: 'contact_info',
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
          keywords: chunk.metadata.keywords.join(','),
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
