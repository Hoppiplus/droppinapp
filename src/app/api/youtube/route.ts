import { NextRequest, NextResponse } from 'next/server';
import type { VideoResult, CategoryId } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const areaName = searchParams.get('area') ?? 'Jakarta';
  const category = (searchParams.get('category') ?? 'all') as CategoryId;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  // Build a discovery-focused query: area name + category terms
  // Different from WanderStreet: we want popular content, not POV footage
  const ytTerm = cat.ytTerms[0] ?? 'viral';
  const query = `${areaName} ${ytTerm}`;

  console.log('[youtube/discover] query:', query);

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: query,
    maxResults: '15',
    order: 'viewCount',     // most-viewed content about this area
    videoEmbeddable: 'true',
    relevanceLanguage: 'id',
    key: apiKey,
  });

  try {
    const res = await fetch(`${YT_BASE}/search?${params}`, { next: { revalidate: 300 } });
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: 'YouTube API error', detail: err }, { status: res.status });
    }

    const data = await res.json();

    const videos: VideoResult[] = (data.items ?? []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url ??
        '',
      description: item.snippet.description ?? '',
      category,
    }));

    return NextResponse.json({ videos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
