"use client";

import MarkdownMessage from "@/components/markdown-message";
import { useChat } from "ai/react";
import { Cog } from "lucide-react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
  });
  return (
    <div>
      <h1 className="text-2xl font-medium">Chat</h1>
      <p className="text-foreground/60">Interact with your tracked packages</p>
      <div className="mt-8 space-y-4 flex flex-col w-full max-w-3xl stretch">
        <ul className="border border-gray-300 rounded-xl dark:border-gray-700 p-6 space-y-2">
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const previousMessage = index > 0 ? messages.at(index - 1) : null;

              return (
                <li key={message.id} className="whitespace-pre-wrap">
                  <div>
                    {(!previousMessage ||
                      previousMessage.role !== message.role) && (
                      <div className="font-bold">
                        {message.role === "user" ? "You" : "Breaking Bad"}
                      </div>
                    )}
                    <div>
                      {message.content.length > 0 && (
                        <MarkdownMessage content={message.content} />
                      )}
                      {message.toolInvocations &&
                        message.toolInvocations.length > 0 && (
                          <ul>
                            {message.toolInvocations.map((tool) => (
                              <li className="flex items-center space-x-1">
                                <Cog className="w-4 h-4 inline-block text-foreground/60" />
                                <span className="italic text-foreground/60 text-sm">
                                  {"Calling tool: " + tool?.toolName}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-foreground/60">
              Ask about your tracked packages
            </li>
          )}
        </ul>
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
