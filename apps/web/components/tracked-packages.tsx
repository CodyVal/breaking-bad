import { cn } from "@/lib/utils";
import { TrackPackage } from "./track-package";

export default function TrackedPackages({ pkgs, trackedPackagesNames = [], className }: { pkgs: any[], trackedPackagesNames?: string[], className?: string }) {
  return <ul className={cn("px-4 space-y-4 w-full", className)}>
  {pkgs.map((pkg: any) => (
    <li
      key={pkg.package.name}
      className="flex items-center justify-between gap-2 w-full max-w-7xl text-sm border-2 rounded-lg px-3 py-4 border-neutral-100 dark:border-neutral-800 "
    >
      <div className="text-foreground px-4 font-medium text-lg">
        {pkg.package.name}
      </div>
      <div>
        <TrackPackage pkg={pkg.package} isTracked={trackedPackagesNames.includes(pkg.package.name)} />
      </div>
    </li>
  ))}
  </ul>;
}