'use client';

import React, { useEffect, useState } from 'react';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
//
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/source';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { Suggestion, Suggestions } from './ai-elements/suggestion';
import { Image } from '@/components/ai-elements/image';
import { Sparkles, Heart } from 'lucide-react';

const AiChat = () => {
  const [input, setInput] = useState('');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const { messages, sendMessage, status } = useChat();

  const [imageData, setImageData] = useState<any>(null);

  const suggestions = [
    'Do you believe in one lifelong relationship?',
    'Who was your first love?',
    'Do you currently have a crush?',
    'What do you expect from a relationship?',
    'Have you ever told your crush about your feelings?',
    'Do you prefer emotional connection or physical attraction?',
    "What's your vision of marriage?",
    'Do you still think about your exes?',
  ];

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
      <div className="mb-8 relative">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-yellow-800" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
        Hey there! I'm Sameer 👋
      </h1>

      <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md">
        Ready to dive into some real talk about love, relationships, and life?
        Ask me anything or pick a question below! 💕
      </p>
    </div>
  );

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };
  // Update dynamic suggestions whenever a new assistant message arrives
  React.useEffect(() => {
    const lastUser = messages.filter((m) => m.role === 'user').at(-1);
    if (!lastUser) return;
    const lastUserText =
      (lastUser.parts.find((p) => p.type === 'text') as any)?.text || '';
    if (!lastUserText) return;

    fetch('/api/chat/suggestions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lastUser: lastUserText }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.suggestions)) {
          setDynamicSuggestions(data.suggestions.slice(0, 6));
        }
      })
      .catch((err) => console.error('❌ Suggestion fetch failed:', err));
  }, [messages.length]);

  console.log('backend Suggestion ', dynamicSuggestions);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 relative size-full min-h-screen">
      <div className="flex flex-col h-full min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)]">
        <Conversation className="flex-1 relative">
          <ConversationContent>
            {messages.length === 0 && <EmptyState />}

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && (
                  <Sources>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'source-url':
                          return (
                            <div key={`${message.id}-${i}`}>
                              <SourcesTrigger
                                count={
                                  message.parts.filter(
                                    (part) => part.type === 'source-url'
                                  ).length
                                }
                              />
                              <SourcesContent>
                                <Source href={part.url} title={part.url} />
                              </SourcesContent>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </Sources>
                )}
                {imageData && (
                  <div className="flex justify-center">
                    <Image
                      {...imageData}
                      alt="Generated image"
                      className="h-[300px] aspect-square border rounded-lg"
                    />
                  </div>
                )}
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === 'streaming'}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mt-4 mb-4">
          <Suggestions className="">
            {(dynamicSuggestions.length ? dynamicSuggestions : suggestions).map(
              (suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion}
                  className="text-sm p-3 hover:scale-[1.02] transition-transform"
                />
              )
            )}
          </Suggestions>
        </div>

        <PromptInput
          onSubmit={handleFormSubmit}
          className="flex items-center px-3 py-2 bg-background border rounded-lg shadow-sm"
        >
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="Ask me anything about, profession love, relationships, or life... 💕"
            className="flex-1 resize-none border-0 bg-transparent focus:ring-0 text-sm md:text-base"
          />
          <PromptInputSubmit
            disabled={!input}
            status={status}
            className="ml-2 shrink-0"
          />
        </PromptInput>
      </div>
    </div>
  );
};

export default AiChat;
