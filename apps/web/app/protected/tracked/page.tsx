import TrackedPackages from "@/components/tracked-packages";
import { getTrackedPackages, getUser } from "@/utils/supabase/queries";

export default async function TrackedPage() {
  const user = await getUser();

  const { data: trackedPackages = [] } = await getTrackedPackages(user.id);

  const trackedPackagesNames = trackedPackages?.map((pkg) => pkg?.package?.name || "");

  return <div>
    <h1 className="text-2xl font-medium">Tracked</h1>
    <p className="text-foreground/60">
      All the packages you are tracking
    </p>

    <TrackedPackages pkgs={trackedPackages || []} trackedPackagesNames={trackedPackagesNames} className="p-0 mt-12" />
  </div>
}