import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface TrendItem {
    id: string;
    platform: string;
    title: string;
    description: string;
    channel_title: string;
    metrics: any;
    trend_score: number;
}

const TrendsView: React.FC = () => {
    const [youtubeTrends, setYoutubeTrends] = useState<TrendItem[]>([]);
    const [googleTrends, setGoogleTrends] = useState<TrendItem[]>([]);
    const [twitchTrends, setTwitchTrends] = useState<TrendItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrends();
    }, []);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            // Fetch YouTube
            const { data: youtube } = await supabase
                .from('trends_cache')
                .select('*')
                .eq('platform', 'youtube')
                .order('trend_score', { ascending: false })
                .limit(20);

            // Fetch Google
            const { data: google } = await supabase
                .from('trends_cache')
                .select('*')
                .eq('platform', 'google_trends')
                .order('trend_score', { ascending: false })
                .limit(20);

            // Fetch Twitch
            const { data: twitch } = await supabase
                .from('trends_cache')
                .select('*')
                .eq('platform', 'twitch')
                .order('trend_score', { ascending: false })
                .limit(20);

            if (youtube) setYoutubeTrends(youtube);
            if (google) setGoogleTrends(google);
            if (twitch) setTwitchTrends(twitch);
        } catch (error) {
            console.error('Error fetching trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToRepository = async (item: TrendItem) => {
        try {
            const { error } = await supabase.from('repository').insert({
                trend_id: item.id,
                status: 'new',
                notes: `Imported from ${item.platform} trend`
            });

            if (error) throw error;
            alert("Salvo no Repositório!");
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        }
    };

    const renderTrendCard = (item: TrendItem, type: 'youtube' | 'google' | 'twitch') => {
        const colors = {
            youtube: 'from-red-500/10 to-red-600/10 text-red-400 border-red-500/20',
            google: 'from-blue-500/10 to-blue-600/10 text-blue-400 border-blue-500/20',
            twitch: 'from-purple-500/10 to-purple-600/10 text-purple-400 border-purple-500/20'
        };

        return (
            <div key={item.id} className="glass p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-2 opacity-10 font-black text-4xl ${colors[type].replace(/from-|to-|text-|border-/g, '').split(' ')[2]}`}>
                    {type === 'twitch' ? 'TV' : (type === 'youtube' ? 'YT' : 'GT')}
                </div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-gradient-to-r ${colors[type]}`}>
                        {item.channel_title.slice(0, 15)}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                        {(() => {
                            if (type === 'twitch') return `${(item.metrics.viewers / 1000).toFixed(1)}k watching`;
                            if (type === 'youtube') return `${(item.metrics.views / 1000).toFixed(0)}k views`;
                            return item.metrics.rank ? `#${item.metrics.rank}` : 'Viral';
                        })()}
                    </span>
                </div>
                <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2 relative z-10">
                    {item.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-3 mb-4 relative z-10">
                    {item.description}
                </p>
                <div className="flex justify-between items-center border-t border-white/5 pt-3 relative z-10">
                    <span className="text-[10px] text-gray-600">Score: {item.trend_score?.toFixed(0)}</span>
                    <button
                        onClick={() => handleSaveToRepository(item)}
                        className="text-[10px] bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 px-3 py-1.5 rounded-lg transition-colors uppercase font-bold tracking-wider text-gray-400"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Tendências Globais</h2>
                <p className="text-gray-400 text-sm">Monitor de viralidade em tempo real (YouTube, Google & Twitch).</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* YouTube Column */}
                <div>
                    <h3 className="flex items-center space-x-2 text-sm font-bold text-red-500 mb-4 uppercase tracking-widest border-b border-red-500/20 pb-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span>YouTube Viral</span>
                    </h3>
                    <div className="space-y-4">
                        {youtubeTrends.length > 0 ? youtubeTrends.map(t => renderTrendCard(t, 'youtube')) : (
                            <div className="text-gray-600 text-xs text-center py-8 border border-dashed border-white/5 rounded-xl">Sem dados. execute Engine.</div>
                        )}
                    </div>
                </div>

                {/* Google Trends Column (Hidden by user request due to API block) */}
                {/* 
                <div>
                    <h3 className="flex items-center space-x-2 text-sm font-bold text-blue-500 mb-4 uppercase tracking-widest border-b border-blue-500/20 pb-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Google Hype</span>
                    </h3>
                    <div className="space-y-4">
                        {googleTrends.length > 0 ? googleTrends.map(t => renderTrendCard(t, 'google')) : (
                            <div className="text-gray-600 text-xs text-center py-8 border border-dashed border-white/5 rounded-xl">Sem dados.</div>
                        )}
                    </div>
                </div> 
                */}

                {/* Twitch Column */}
                <div>
                    <h3 className="flex items-center space-x-2 text-sm font-bold text-purple-500 mb-4 uppercase tracking-widest border-b border-purple-500/20 pb-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>Twitch Live</span>
                    </h3>
                    <div className="space-y-4">
                        {twitchTrends.length > 0 ? twitchTrends.map(t => renderTrendCard(t, 'twitch')) : (
                            <div className="text-gray-600 text-xs text-center py-8 border border-dashed border-white/5 rounded-xl">Sem dados.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendsView;
