"use client"

import { trackPackageAction, untrackPackageAction } from "@/app/actions";
import { Switch } from "./ui/switch";

export function TrackPackage({ pkg, isTracked }: any) {
  const formData = new FormData();
  formData.set("pkgName", pkg.name);
  formData.set("pkgScope", pkg.scope);
  formData.set("pkgRepository", pkg.links.repository);

  async function handleCheckedChange(checked: boolean) {
    checked ? await trackPackageAction(formData) : await untrackPackageAction(formData);
  }

  return <Switch checked={isTracked} onCheckedChange={handleCheckedChange} />
}