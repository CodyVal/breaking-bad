import { logger, task } from '@trigger.dev/sdk/v3'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/types/database'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { stripHtml } from 'string-strip-html'
import markdown from 'markdown-it'
import { encode } from 'gpt-tokenizer'

const md = new markdown({
  html: true,
})

export const fetchReleaseNotesTask = task({
  id: 'fetch-release-notes',
  init: async (payload: any, { ctx }) => {
    logger.log(`Initializing ${ctx.task.id} task`, { payload, ctx })
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    return {
      supabase: createClient<Database>(supabaseUrl, supabaseServiceRoleKey),
      octokit: new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_PRIVATE_KEY,
          installationId: process.env.GITHUB_APP_INSTALLATION_ID,
        },
      }),
    }
  },
  run: async (payload: any, { ctx, init }) => {
    logger.log(`Starting ${ctx.task.id} task`, { payload, ctx })
    const supabase = init?.supabase
    const octokit = init?.octokit

    if (!supabase || !octokit) {
      throw new Error('Supabase or Octokit client not initialized')
    }

    logger.log(`Fetching package data for package: ${payload.id}`, { payload })
    const packageData = await fetchPackageData(supabase, payload.id)

    logger.log(`Fetching existing releases for package: ${packageData.name}`, {
      packageData,
    })
    const existingReleases = await fetchExistingReleases(supabase, packageData)

    logger.log(`Fetching releases for package: ${packageData.name}`, {
      packageData,
    })
    const githubReleases = await fetchGitHubReleases(
      octokit,
      packageData,
      existingReleases
    )

    logger.log(`Insert releases into database`, { githubReleases })
    const releases = await insertReleases(supabase, githubReleases)

    logger.log(`Fetching changelog for package: ${packageData.name}`, {
      packageData,
    })
    const result = await fetchChangelog(octokit, packageData)

    logger.log(`Insert changelog into database`, {
      changelogContent: result?.changelog,
    })
    const changelog = await insertChangelog(supabase, packageData.id, result)

    return {
      packageName: packageData.name,
      changelog,
      releases,
    }
  },
})

async function fetchPackageData(
  supabase: SupabaseClient<Database>,
  packageId: string
) {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (error) {
    throw new Error(`Error fetching package data: ${error.message}`)
  }

  return data
}

async function fetchExistingReleases(
  supabase: SupabaseClient<Database>,
  packageData: any
) {
  const { data, error } = await supabase
    .from('releases')
    .select('version')
    .eq('package_id', packageData.id)

  if (error) {
    throw new Error(`Error fetching existing releases: ${error.message}`)
  }

  return data.map((release) => release.version)
}

async function fetchChangelog(octokit: Octokit, packageData: any) {
  const [owner, repo] = packageData.repository
    .replace('https://github.com/', '')
    .split('/')

  if (!owner || !repo) {
    throw new Error('Invalid repository format')
  }

  let changelog: string | null = null
  let embedding: number[][] | null = null

  try {
    const { data: changelogContent } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'CHANGELOG.md',
    })

    if ('content' in changelogContent) {
      changelog = Buffer.from(changelogContent.content, 'base64').toString(
        'utf-8'
      )

      if (changelog) {
        embedding = await processMarkdown(changelog, packageData, null)
      }
    }
  } catch (error: any) {
    if (error?.status === 404) {
      return { changelog: null, embedding: null }
    }
    throw error
  }

  return {
    changelog,
    embedding: embedding ? embedding[0] : null,
  }
}

async function fetchGitHubReleases(
  octokit: Octokit,
  packageData: any,
  existingReleases: string[]
) {
  const [owner, repo] = packageData.repository
    .replace('https://github.com/', '')
    .split('/')

  if (!owner || !repo) {
    throw new Error('Invalid repository format')
  }

  const githubReleases = await octokit.paginate(octokit.repos.listReleases, {
    owner,
    repo,
    per_page: 100, // Adjust as needed
  })

  const filteredReleases = githubReleases.filter(
    (release: any) => !release.draft && release.body && release.published_at
  )

  const releases = await Promise.all(
    filteredReleases
      .filter((release) => !existingReleases.includes(release.tag_name))
      .map(async (release) => {
        const embedding = await processMarkdown(
          release.body as string,
          packageData,
          release
        )
        return {
          package_id: packageData.id,
          version: release.tag_name,
          release_notes: release.body as string,
          created_at: release.created_at,
          published_at: release.published_at,
          embedding: embedding[0],
        }
      })
  )

  return releases
}

async function insertReleases(
  supabase: SupabaseClient<Database>,
  githubReleases: any[]
) {
  const { data, error } = await supabase
    .from('releases')
    .upsert(githubReleases, { onConflict: 'package_id,version' })
    .select('id,version')

  if (error) {
    throw new Error(`Error inserting releases: ${error.message}`)
  }

  return data
}

async function insertChangelog(
  supabase: SupabaseClient<Database>,
  packageId: number,
  { changelog, embedding }: any
) {
  if (!changelog || !embedding) {
    return null
  }

  const { data, error } = await supabase
    .from('changelogs')
    .upsert({ package_id: packageId, changelog, embedding })
    .select('id')

  if (error) {
    throw new Error(`Error inserting changelog: ${error.message}`)
  }

  return data
}

function chunkTextByTokens(
  text: string,
  packageData: any,
  release: any
): string[] {
  const MAX_TOKENS = 1536
  const sentences = text
    .split('\n')
    .map(
      (sentence) =>
        `${packageData?.name ?? ''} · ${release?.tag_name ?? ''} · ${sentence}`
    )
  let chunks: string[] = []
  let currentChunk: string[] = []
  let currentTokenCount = 0

  for (const sentence of sentences) {
    const tokenCount = encode(sentence).length

    if (currentTokenCount + tokenCount > MAX_TOKENS) {
      chunks.push(currentChunk.join('. ') + '.')
      currentChunk = [sentence]
      currentTokenCount = tokenCount
    } else {
      currentChunk.push(sentence)
      currentTokenCount += tokenCount
    }
  }

  // Add the last chunk if there is any remaining content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('. ') + '.')
  }

  return chunks
}

async function generateEmbeddings(chunks: string[]) {
  let embeddings: any[] = []

  for (const chunk of chunks) {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: chunk,
    })
    embeddings.push(embedding)
  }

  return embeddings
}

// Function to chunk text based on token limit
async function processMarkdown(
  markdown: string,
  packageData: any,
  release: any
) {
  const parsed = await md.render(markdown)
  const text = stripHtml(parsed).result
  const chunks = chunkTextByTokens(text, packageData, release)

  const embeddings = await generateEmbeddings(chunks)

  return embeddings
}
