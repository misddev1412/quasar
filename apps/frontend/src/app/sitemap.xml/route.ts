import { NextResponse } from 'next/server';
import { generateSitemap } from '../../../lib/seo-sitemap';

export async function GET() {
  try {
    const sitemap = await generateSitemap();

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

export const dynamic = 'force-static';