import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        if (!YOUTUBE_API_KEY) {
            return new Response(JSON.stringify({ error: 'YOUTUBE_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // 1. Fetch YouTube Trends (US)
        const region = 'US';
        const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=50&key=${YOUTUBE_API_KEY}`;

        const ytResponse = await fetch(ytUrl);
        const ytData = await ytResponse.json();

        if (ytData.error) {
            throw new Error(`YouTube API Error: ${JSON.stringify(ytData.error)}`);
        }

        const trends = ytData.items.map((item: any) => {
            // Basic Trend Score Calculation
            // (viewCount / days_since_published) * region_weight
            const publishedAt = new Date(item.snippet.publishedAt);
            const now = new Date();
            const daysSincePublished = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
            const viewCount = parseInt(item.statistics.viewCount || '0');

            const velocity = viewCount / daysSincePublished;
            const regionWeight = region === 'US' ? 1.5 : 1.0;
            const trendScore = velocity * regionWeight;

            return {
                platform: 'youtube',
                external_id: item.id,
                title: item.snippet.title,
                description: item.snippet.description,
                channel_title: item.snippet.channelTitle,
                category: item.snippet.categoryId, // Needs mapping, but ID is fine for now
                region: region,
                published_at: item.snippet.publishedAt,
                metrics: {
                    views: viewCount,
                    likes: parseInt(item.statistics.likeCount || '0'),
                    comments: parseInt(item.statistics.commentCount || '0')
                },
                trend_score: trendScore,
                last_updated: new Date().toISOString()
            };
        });

        // 2. Upsert into trends_cache
        const { error } = await supabase
            .from('trends_cache')
            .upsert(trends, { onConflict: 'platform,external_id' });

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify({
            success: true,
            count: trends.length,
            first_item: trends[0]
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
