import { NextRequest, NextResponse } from 'next/server';
import { getServerSideSEOData } from '../../../../lib/seo-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';

  try {
    const seoData = await getServerSideSEOData(path);

    return NextResponse.json({
      success: true,
      path,
      seoData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch SEO data:', error);
    return NextResponse.json(
      {
        success: false,
        path,
        error: 'Failed to fetch SEO data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}