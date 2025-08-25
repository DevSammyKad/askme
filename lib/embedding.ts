import { google } from '@ai-sdk/google';
import { embed } from 'ai';

export const model = google.textEmbedding('text-embedding-004');

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 512, // optional, number of dimensions for the embedding
        taskType: 'SEMANTIC_SIMILARITY', // optional, specifies the task type for generating embeddings
      },
    },
  });

  console.log('Embedding', embedding);

  return embedding;
}
