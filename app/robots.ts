import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.apkey.net'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/user/', '/staff/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
