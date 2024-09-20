import { Database } from '@repo/types/database'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { logger, schedules } from '@trigger.dev/sdk/v3'
import { fetchReleaseNotesTask } from '../fetch-release-notes'

export const refreshAllReleaseNotes = schedules.task({
  id: 'refresh-all-release-notes',
  // every day at midnight (UTC timezone)
  cron: '0 0 * * *',
  init: async (payload: any, { ctx }) => {
    logger.log(`Initializing ${ctx.task.id} task`, { payload, ctx })
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    return {
      supabase: createClient<Database>(supabaseUrl, supabaseServiceRoleKey),
    }
  },
  run: async (payload, { ctx, init }) => {
    const supabase = init?.supabase

    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const packages = await fetchPackagesData(supabase)

    await fetchReleaseNotesTask.batchTriggerAndWait(
      packages.map((pkg) => ({ payload: pkg }))
    )
  },
})

async function fetchPackagesData(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from('packages').select('*')

  if (error) {
    throw new Error(`Error fetching package data: ${error.message}`)
  }

  return data
}
