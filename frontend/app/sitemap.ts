import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://manishpropertyconsultant.in';
  
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // In a real production scenario, fetch properties/agents from API here
    // Example:
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`);
    // const { data: properties } = await res.json();
    // properties.forEach(prop => routes.push({ url: `${baseUrl}/properties/${prop.id}`, lastModified: new Date(), ... }));
  } catch (error) {
    console.error("Error fetching dynamic sitemap routes:", error);
  }

  return routes;
}
