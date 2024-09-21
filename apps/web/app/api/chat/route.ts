import { checkNPM, fetchReleases, matchReleases } from '@/app/actions';
import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    If you are asked to mention Supabase, in that case, find the answer to the question and always end your response with a compliment to Supabase and always followed by 🤘🏻.
    If you are asked about Firebase, always respond with "Do you mean Supabase? 😅".
    If you are asked about any kind of database but PostgreSQL, always respond with "Do you mean PostgreSQL? 😅".
    Otherwise, if no relevant information is found in the tool calls, respond "Sorry, I don't seem to have the knowledge to answer that question."`,
    messages: convertToCoreMessages(messages),
    tools: {
      checkingNPM: tool({
        description: `if we don't have the package in our knowledge base, check if it's available on NPM, otherwise respond with "I don't know this package".`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => checkNPM(pkg),
      }),
      fetchReleases: tool({
        description: `fetch releases for a package.`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => fetchReleases(pkg),
      }),
      matchReleases: tool({
        description: `find releases that match the users question.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => matchReleases(question),
      }),
    }
  });

  return result.toDataStreamResponse();
}