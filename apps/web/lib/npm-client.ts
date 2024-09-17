const fetchPackage = async (pkg: string) => {
  const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${pkg}`);

  if (!response.ok) {
    throw new Error('Error fetching data');
  }

  return await response.json();
}

export const npmClient = {
  fetchPackage,
}