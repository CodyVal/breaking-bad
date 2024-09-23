'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import debounce from 'debounce'
import TrackedPackages from './tracked-packages'
import { Skeleton } from './ui/skeleton'

interface FindPackageFormProps {
  trackedPackagesNames?: string[]
  recommendedPackages?: any[]
}

export function FindPackageForm({
  trackedPackagesNames = [],
  recommendedPackages = [],
}: FindPackageFormProps) {
  const [value, setValue] = useState('')
  const [data, setData] = useState([])
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: any) => {
    e.preventDefault()
  }

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
    setSearching(false)
  }, 500)

  const isEmptyState = !value && !searching
  const hasNoResults = data.length === 0 && !searching && value
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md gap-y-2 [&>input]:mb-4"
      >
        <Label htmlFor="password">Package Name</Label>
        <Input
          type="text"
          name="pkg"
          placeholder="next"
          onChange={(e: any) => {
            setValue(e.target.value)
            setSearching(true)
            handleSearch(e)
          }}
          required
        />
      </form>
      {isEmptyState && (
        <div>
          <p className="text-lg font-semibold mb-3">
            Here are some from our stack you may be interested in
          </p>
          <TrackedPackages
            pkgs={recommendedPackages}
            trackedPackagesNames={trackedPackagesNames}
          />
        </div>
      )}
      {hasNoResults && <div>No results</div>}
      {searching ? (
        <ul className="space-y-4">
          <li>
            <Skeleton className="p-10" />
          </li>
          <li>
            <Skeleton className="p-10" />
          </li>
          <li>
            <Skeleton className="p-10" />
          </li>
        </ul>
      ) : (
        <TrackedPackages
          pkgs={data}
          trackedPackagesNames={trackedPackagesNames}
        />
      )}
    </>
  )
}
