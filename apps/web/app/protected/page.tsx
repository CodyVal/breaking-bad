import { FindPackageForm } from '@/components/find-package-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { npmClient } from '@/lib/npm-client'
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

  const next = await npmClient.fetchPackage('next')

  console.log(JSON.stringify(next, null, 2))

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <FindPackageForm />
    </div>
  )
}
