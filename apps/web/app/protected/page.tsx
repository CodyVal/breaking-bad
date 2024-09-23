import { FindPackageForm } from '@/components/find-package-form'
import { getTrackedPackages, getUser } from '@/utils/supabase/queries'

const fetchNpmPackage = async (pkg: string) => {
  return fetch(`https://registry.npmjs.org/-/v1/search?text=${pkg}`)
    .then((res) => res.json())
    .then((res) => res.objects[0])
}

export default async function ProtectedPage() {
  const user = await getUser()

  const { data: trackedPackages } = await getTrackedPackages(user.id)

  const trackedPackagesNames = trackedPackages?.map((pkg) => pkg.package.name)

  const recommendedPackages = await Promise.all([
    fetchNpmPackage('ai'),
    fetchNpmPackage('next'),
    fetchNpmPackage('supabase'),
  ])

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col space-y-4">
      <header>
        <h1 className="text-2xl font-medium">Find a package</h1>
        <p className="text-foreground/60">
          Search for your favorite package and add it to your tracked packages
        </p>
      </header>
      <FindPackageForm
        trackedPackagesNames={trackedPackagesNames}
        recommendedPackages={recommendedPackages}
      />
    </div>
  )
}
