import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voidsleep.com';
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    // English homepage (default)
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          en: baseUrl,
          'zh-CN': `${baseUrl}/zh`,
        },
      },
    },
    // Chinese homepage
    {
      url: `${baseUrl}/zh`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          en: baseUrl,
          'zh-CN': `${baseUrl}/zh`,
        },
      },
    },
    // Apps page
    {
      url: `${baseUrl}/apps`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  return staticPages;
}
