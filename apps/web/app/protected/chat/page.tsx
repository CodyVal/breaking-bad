"use client";

import MarkdownMessage from "@/components/markdown-message";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });
  return (
    <div>
      <h1 className="text-2xl font-medium">Chat</h1>
      <p className="text-foreground/60">
        Interact with your tracked packages
      </p>
      <div className="mt-8 space-y-4 flex flex-col w-full max-w-3xl stretch">
        <div className="border border-gray-300 rounded-xl dark:border-gray-700 p-6 space-y-4">
          {messages.length > 0 ? messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <div>
                <div className="font-bold">{m.role === 'user' ? 'You' : 'Breaking Bad'}</div>
                <p>
                {m.content.length > 0 && (
                  <MarkdownMessage content={m.content} />
                )}
                {(m.toolInvocations && m.toolInvocations.length > 0) && (
                  <span className="italic font-light text-sm">
                    {'Calling tool: ' + m?.toolInvocations?.[0]!.toolName}
                  </span>
                )}
              </p>
              </div>
            </div>
          )) : <div className="text-sm text-foreground/60">Ask about your tracked packages</div>}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full max-w-md p-2 mb-8 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
