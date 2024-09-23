import {
  checkForSimilarPackages,
  checkNPM,
  fetchReleases,
  fetchTrackedPackages,
  matchReleases,
  trackPackageAction,
  untrackPackageAction,
} from '@/app/actions'
import { fetchNpmPackage } from '@/lib/fetchNpmPackage'
import { openai } from '@ai-sdk/openai'
import { convertToCoreMessages, streamText, tool } from 'ai'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Respond to questions using information from tool calls in priority.
    Make sure the package name is in our knowledge base before you make a tool call, otherwise suggest similar packages.
    If you are asked about a package that is not tracked by the user, respond with possible similar packages and ask if the user wants to track this package.
    If you are asked to mention Supabase, in that case, find the answer to the question first and always end your response with a compliment to Supabase and always followed by 🤘🏻.
    If you are asked about Firebase, always respond with "Do you mean Supabase? 😅".
    If you are asked about any kind of database but PostgreSQL, respond with "Do you mean PostgreSQL? Just kidding 😅" first, and then continue with your answer".
    Otherwise, if no relevant information is found in the tool calls, respond "Sorry, I don't seem to have the knowledge to answer that question."`,
    messages: convertToCoreMessages(messages),
    tools: {
      trackPackage: tool({
        description: `Track a package for a user. Make sure to store this information in the database.`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => {
          const pkgData = await fetchNpmPackage(pkg)

          const formData = new FormData()
          formData.set('pkgName', pkgData.package.name)
          formData.set('pkgScope', pkgData.package.scope)
          formData.set(
            'pkgRepository',
            pkgData.package.links
              ? pkgData.package.links.repository
              : pkgData.package.repository
          )

          await trackPackageAction(formData)
          return `I have started tracking ${pkgData.package.name} for you.`
        },
      }),
      untrackPackage: tool({
        description: `Untrack a package for a user. Make sure to store this information in the database.`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => {
          const pkgData = await fetchNpmPackage(pkg)

          const formData = new FormData()
          formData.set('pkgName', pkgData.package.name)
          formData.set('pkgScope', pkgData.package.scope)

          await untrackPackageAction(formData)
          return `I have stopped tracking ${pkgData.package.name} for you.`
        },
      }),
      fetchUsersTrackedPackages: tool({
        description: `call this everytime a user asks, fetch a list of packages that the user is tracking. Do not cache this information. Make sure you have the latest information.`,
        parameters: z.object({}),
        execute: async () => fetchTrackedPackages(),
      }),
      checkingNPM: tool({
        description: `if we don't have the package in our knowledge base, check if it's available on NPM, otherwise respond with "I don't know this package".`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => checkNPM(pkg),
      }),
      checkForSimilarPackages: tool({
        description: `if you cannot find the exact package name in our knowledge base, check if there are similar packages to the one the user is asking about.`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => checkForSimilarPackages(pkg),
      }),
      fetchReleases: tool({
        description: `if you recognize the package name from our knowledge base, fetch releases for a package.`,
        parameters: z.object({
          pkg: z.string().describe('the package name'),
        }),
        execute: async ({ pkg }) => fetchReleases(pkg),
      }),
      matchReleases: tool({
        description: `if you recognize the package name from our knowledge base, find releases that match the users question.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => matchReleases(question),
      }),
    },
  })

  return result.toDataStreamResponse()
}
