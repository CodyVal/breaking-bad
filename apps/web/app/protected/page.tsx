import { apiClient } from '@/lib/api-client'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = createClient()

  const data = await apiClient('/packages')

  // console.log(data)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  return <div className="flex-1 w-full flex flex-col gap-12"></div>
}
