export const fetchNpmPackage = async (pkg: string) => {
  return fetch(`https://registry.npmjs.org/-/v1/search?text=${pkg}`)
    .then((res) => res.json())
    .then((res) => res.objects[0])
}
