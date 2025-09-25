import { NextResponse } from 'next/server';
import { generateRobotsTxt } from '../../../lib/seo-sitemap';

export async function GET() {
  try {
    const robotsTxt = generateRobotsTxt();

    return new NextResponse(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('Error generating robots.txt', { status: 500 });
  }
}

export const dynamic = 'force-static';