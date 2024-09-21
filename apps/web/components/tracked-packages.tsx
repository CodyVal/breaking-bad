import { cn } from "@/lib/utils";
import { TrackPackage } from "./track-package";

export default function TrackedPackages({ pkgs, trackedPackagesNames = [], className }: { pkgs: any[], trackedPackagesNames?: string[], className?: string }) {
  return <ul className={cn("space-y-4 w-full", className)}>
  {pkgs.map((pkg: any) => (
    <li
      key={pkg.package.name}
      className="flex items-center justify-between gap-2 w-full max-w-7xl text-sm border-2 rounded-lg px-3 py-4 border-neutral-100 dark:border-neutral-800 "
    >
      <div>
        <h3 className="text-lg font-medium text-foreground">
          <a href={pkg.package.links.npm} target="_blank" rel="noopener noreferrer">
            {pkg.package.name}
          </a>
        </h3>
        <p className="text-foreground/60 text-sm">{pkg.package.description}</p>
      </div>
      <div>
        <TrackPackage pkg={pkg.package} isTracked={trackedPackagesNames.includes(pkg.package.name)} />
      </div>
    </li>
  ))}
  </ul>;
}