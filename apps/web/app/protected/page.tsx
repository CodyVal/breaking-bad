import { FindPackageForm } from '@/components/find-package-form'
import { getTrackedPackages, getUser } from '@/utils/supabase/queries'

export default async function ProtectedPage() {
  const user = await getUser()

  const { data: trackedPackages } = await getTrackedPackages(user.id)

  const trackedPackagesNames = trackedPackages?.map((pkg) => pkg.package.name)

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-12">
      <FindPackageForm trackedPackagesNames={trackedPackagesNames} />
    </div>
  )
}
