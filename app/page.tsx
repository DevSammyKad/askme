import React from 'react';
import { processAndStoreKnowledge } from '@/lib/knowledge-processor';
import AiChat from '@/components/AiChat';
import { index } from '@/lib/pinecone';

const page = async () => {
  // await processAndStoreKnowledge();
  // await index.deleteAll();
  // console.log('✅ Knowledge base setup complete!');

  // await generateRAGResponse('what is your age ?');
  return (
    <div className="">
      <AiChat />
    </div>
  );
};

export default page;
