import React from 'react';
import aboutData from '@/lib/data/about-me.json';
import { processAndStoreKnowledge } from '@/lib/knowledge-processor';
import { generateRAGResponse } from '@/lib/rag';
import AiChat from '@/components/AiChat';

const page = async () => {
  // await processAndStoreKnowledge();
  // console.log('✅ Knowledge base setup complete!');

  // await generateRAGResponse('what is your age ?');
  return (
    <div className="max-h-screen ">
      {/* <ChatInput /> */}
      {/* <ChatInterface /> */}
      <AiChat />
    </div>
  );
};

export default page;
