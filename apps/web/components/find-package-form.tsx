'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import debounce from 'debounce'

interface FindPackageFormProps {}

export function FindPackageForm({}: FindPackageFormProps) {
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
      <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
        <h1 className="text-2xl font-medium">Find Package</h1>
        <p className="text-sm text-foreground/60">
          Please enter a package name
        </p>
        <Label htmlFor="password">Package Name</Label>
        <Input
          type="text"
          name="pkg"
          placeholder="next"
          onChange={handleSearch}
          required
        />
      </form>
      {data.map((pkg: any) => (
        <div
          key={pkg.package.name}
          className="flex flex-col gap-2 w-full max-w-md text-sm"
        >
          <div className="text-foreground border-l-2 border-foreground px-4">
            {pkg.package.name}
          </div>
        </div>
      ))}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}
