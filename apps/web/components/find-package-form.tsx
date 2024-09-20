'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import debounce from 'debounce'
import { TrackPackage } from './track-package'
import TrackedPackages from './tracked-packages'

interface FindPackageFormProps {
  trackedPackagesNames?: string[]
}

export function FindPackageForm({ trackedPackagesNames = [] }: FindPackageFormProps) {
  const [data, setData] = useState([])
  const [watchList, setWatchList] = useState([])

  const handleSearch = debounce(async (e: any) => {
    const pkg = e.target.value

    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${pkg}`
    )

    if (!response.ok) {
      throw new Error('Error fetching data')
    }

    const resData = await response.json()
    setData(resData.objects)
  }, 500)

  return (
    <>
      <form className="flex flex-col w-full max-w-md gap-2 [&>input]:mb-4">
        <Label htmlFor="password">Package Name</Label>
        <Input
          type="text"
          name="pkg"
          placeholder="next"
          onChange={handleSearch}
          required
        />
      </form>
      <TrackedPackages pkgs={data} trackedPackagesNames={trackedPackagesNames} />
    </>
  )
}
