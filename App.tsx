
import React, { useState, useMemo, useEffect } from 'react';
import {
  Video, Platform, Category, VideoStatus, ViewType,
  ShortStatus, ShortPlatform, Short, SearchMode, Period, Region
} from './types';
import { INITIAL_VIDEOS } from './constants';
import Sidebar from './components/Sidebar';
import BottomMenu from './components/BottomMenu';
import Header from './components/Header';
import VideoCard from './components/VideoCard';
import ShortsTable from './components/ShortsTable';
import Auth from './components/Auth';
import TrendsView from './components/TrendsView';
import { ImportView } from './components/ImportView';
import { geminiService } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { Inbox, Database, Youtube, Wand2, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewType>('INBOX');
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'All'>(Platform.YOUTUBE);
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [searchMode, setSearchMode] = useState<SearchMode>(SearchMode.GENERAL);
  const [period, setPeriod] = useState<Period>(Period.LAST_WEEK);
  const [region, setRegion] = useState<Region>(Region.US);

  // AI Editor State
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Pagination
  const [ytLimit, setYtLimit] = useState(24);
  const [twLimit, setTwLimit] = useState(24);

  // Navigation Items
  const navItems = [
    { id: 'inbox', label: 'Vídeos Virais', icon: Inbox },
    { id: 'repository', label: 'Repositório', icon: Database },
    // { id: 'shorts', label: 'Shorts', icon: Youtube }, // Removed as requested
    { id: 'editor', label: 'AI Editor', icon: Wand2 },
    { id: 'trends', label: 'Tendências', icon: TrendingUp },
  ];

  // Fetch videos from Repository OR Feed Viral (Inbox)
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: any[] = [];
      let error = null;

      // --- FEED VIRAL (Formerly Inbox) ---
      // Fetches ALL trending items directly from cache
      if (view === 'INBOX') {
        const regionCode = region === Region.GLOBAL ? null : (region.match(/\((.*?)\)/)?.[1] || 'US');

        const fetchYT = async () => {
          if (filterPlatform !== 'All' && filterPlatform !== Platform.YOUTUBE) return [];
          let query = supabase
            .from('trends_cache')
            .select(`*, repository(id, status)`)
            .eq('platform', 'youtube')
            .order('trend_score', { ascending: false })
            .limit(ytLimit);

          if (regionCode) query = query.eq('region', regionCode);

          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        };

        const fetchTwitch = async () => {
          if (filterPlatform !== 'All' && filterPlatform !== Platform.TWITCH) return [];
          let query = supabase
            .from('trends_cache')
            .select(`*, repository(id, status)`)
            .eq('platform', 'twitch')
            .order('trend_score', { ascending: false })
            .limit(twLimit);

          // Twitch is GLOBAL, do not filter by region
          // if (regionCode) query = query.eq('region', regionCode);

          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        };

        // Fetch YouTube and Twitch separately to ensure fair pagination
        const [ytData, twData] = await Promise.all([fetchYT(), fetchTwitch()]);

        // Combine data
        const rawData = [...ytData, ...twData];

        // Filter out items that have a repository entry (Saved or Ignored)
        data = rawData.filter((item: any) => !item.repository || item.repository.length === 0);
      }
      // --- REPOSITORY ---
      // Fetches SAVED items
      else { // REPOSITORY context (or logic shared)
        if (view === 'REPOSITORY' || view === 'SHORTS_LIST') {
          const response = await supabase
            .from('repository')
            .select(`*, trends_cache:trend_id (*)`)
            .not('status', 'eq', 'deleted')
            .not('status', 'eq', 'ignored')
            .order('saved_at', { ascending: false });
          data = response.data || [];
          error = response.error;
        }
      }

      if (error) throw error;

      // Map to Video interface
      const mappedVideos: Video[] = data.map((item: any) => {
        const isRepo = (view === 'REPOSITORY' || view === 'SHORTS_LIST');
        const trendData = isRepo ? item.trends_cache : item;
        const repoStatus = isRepo ? item.status : undefined;

        // Construct URL if missing
        let videoUrl = trendData?.url;
        if (!videoUrl && trendData?.platform === 'youtube') videoUrl = `https://www.youtube.com/watch?v=${trendData.external_id}`;
        if (!videoUrl && trendData?.platform === 'twitch') videoUrl = `https://www.twitch.tv/${trendData.channel_title}`;

        // Map DB status to Frontend Status Enum
        let mappedStatus = VideoStatus.NOT_STARTED;
        if (repoStatus === 'in_progress') mappedStatus = VideoStatus.IN_PROGRESS;
        if (repoStatus === 'finished') mappedStatus = VideoStatus.FINISHED;

        // Normalize Platform String (db is lowercase 'youtube', enum is 'YouTube')
        let mappedPlatform = Platform.YOUTUBE;
        const rawPlatform = trendData?.platform?.toLowerCase();
        if (rawPlatform === 'youtube') mappedPlatform = Platform.YOUTUBE;
        if (rawPlatform === 'twitch') mappedPlatform = Platform.TWITCH;


        return {
          id: isRepo ? item.id : trendData.id, // Repo ID or Trend ID
          title: trendData?.title || 'Sem título',
          // Use real thumbnail from Trend Data, fallback to placeholder only if missing
          thumbnail: trendData?.thumbnail || `https://placehold.co/600x400?text=${mappedPlatform}`,
          channel: trendData?.channel_title || 'Unknown',
          platform: mappedPlatform,
          category: Category.ENTERTAINMENT,
          views: trendData?.metrics?.views || trendData?.metrics?.viewers || 0,
          growth: trendData?.trend_score || 0,
          duration: '00:00',
          publishedAt: trendData?.published_at,
          status: mappedStatus,
          isApproved: isRepo,
          region: trendData?.region,
          url: videoUrl,
          shorts: []
        };
      });

      setVideos(mappedVideos);
    } catch (err) {
      console.error(err);
      setError("Falha ao sincronizar dados com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos();
    }
  }, [isAuthenticated, searchMode, region, period, view, ytLimit, twLimit, filterPlatform]);

  const filteredVideos = useMemo(() => {
    let result = videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.channel.toLowerCase().includes(search.toLowerCase());

      const matchesPlatform = filterPlatform === 'All' || v.platform === filterPlatform;
      const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
      // View specific filter is handled by fetch logic mostly, but explicit check:
      const isCorrectView = true; // Data is already scoped by fetch

      // Region Filter Logic
      const regionCode = region.match(/\((.*?)\)/)?.[1] || 'US';
      const matchesRegion =
        v.platform === Platform.TWITCH // FORCE TWITCH TO IGNORE REGION
        || region === Region.GLOBAL
        || !v.region
        || v.region === 'GLOBAL'
        || (v.region === regionCode);

      return matchesSearch && matchesPlatform && matchesCategory && isCorrectView && matchesRegion;
    });

    // Search Mode Logic (Sorting)
    if (searchMode === SearchMode.TRENDING) {
      result = result.sort((a, b) => b.growth - a.growth);
    } else {
      result = result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    }

    return result;
  }, [videos, search, filterPlatform, filterCategory, view, region, period, searchMode]);

  const handleApprove = async (id: string) => {
    try {
      if (view === 'INBOX') {
        const { data: existing } = await supabase.from('repository').select('id').eq('trend_id', id).maybeSingle();

        if (existing) {
          alert("Já está salvo no repositório.");
          return;
        }

        const { error } = await supabase.from('repository').insert({
          trend_id: id,
          status: 'approved',
          saved_at: new Date().toISOString()
        });

        if (error) throw error;
      } else {
        await supabase.from('repository').update({ status: 'approved' }).eq('id', id);
      }
      setVideos(prev => prev.map(v => v.id === id ? { ...v, isApproved: true } : v));
    } catch (e: any) {
      alert("Erro ao aprovar vídeo: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmar exclusão?")) return;
    try {
      if (view === 'INBOX') {
        alert("Não é possível apagar do Feed Global. Use 'Salvar' para mover para seu Repositório.");
        return;
      }

      await supabase.from('repository').delete().eq('id', id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      alert("Erro ao excluir vídeo.");
    }
  };

  const handleUpdateStatus = async (id: string, status: VideoStatus) => {
    try {
      let dbStatus = 'in_progress';
      if (status === VideoStatus.FINISHED) dbStatus = 'finished';
      if (status === VideoStatus.NOT_STARTED) dbStatus = 'approved';

      await supabase.from('repository').update({ status: dbStatus }).eq('id', id);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddShort = async (videoId: string) => {
    try {
      const newShort: Short = {
        id: Math.random().toString(36).substr(2, 9),
        link: 'https://link.pendente.com',
        platform: ShortPlatform.YT_SHORTS,
        status: ShortStatus.DRAFT,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, shorts: [...(v.shorts || []), newShort] } : v));
    } catch (e) {
      alert("Erro ao criar short.");
    }
  };

  const handleUpdateShortStatus = async (videoId: string, shortId: string, status: ShortStatus) => {
    try {
      setVideos(prev => prev.map(v => {
        if (v.id === videoId) {
          return { ...v, shorts: v.shorts?.map(s => s.id === shortId ? { ...s, status } : s) };
        }
        return v;
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiEdit = async () => {
    if (!editingImage || !prompt) return;
    setIsAiLoading(true);
    try {
      const result = await geminiService.editThumbnail(editingImage, prompt);
      if (result) setEditingImage(result);
    } catch (e) {
      alert("Erro na Engine AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setView('INBOX');
    setVideos([]);
  };

  const handleYtLimitIncrease = () => {
    setYtLimit(prev => prev + 24);
  };

  const handleTwLimitIncrease = () => {
    setTwLimit(prev => prev + 24);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    if (isLoading && videos.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando com Servidor...</p>
        </div>
      );
    }

    if (view === 'SHORTS_LIST') {
      return (
        <div className="p-8">
          <header className="mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Cliques & Shorts Operacionais</h2>
            <p className="text-gray-400 text-sm">Controle de publicações vinculadas ao repositório aprovado.</p>
          </header>
          <ShortsTable
            videos={videos}
            onAddShort={handleAddShort}
            onUpdateShortStatus={handleUpdateShortStatus}
          />
        </div>
      );
    }

    if (view === 'AI_EDITOR') {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-orange-400 uppercase tracking-tighter">Gemini AI Engine</h2>
            <p className="text-gray-400 text-sm">Edição estratégica de thumbnails usando processamento multimodal.</p>
          </header>
          <div className="glass p-8 rounded-2xl space-y-6 border border-orange-500/10">
            <div className="flex flex-col items-center">
              {editingImage ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 group shadow-2xl shadow-orange-500/10">
                  <img src={editingImage} className="w-full h-full object-cover" />
                  {isAiLoading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-orange-400 font-bold uppercase tracking-widest animate-pulse text-xs">Aguardando Resposta do Gemini...</p>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setEditingImage(null)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <label className="w-full aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors bg-white/5">
                  <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-widest">Carregar Thumbnail</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setEditingImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Comando Estratégico</label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: 'Destaque o objeto central', 'Aplique cores vibrantes'..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-orange-500 outline-none transition-all h-32 resize-none" />
              <button onClick={handleAiEdit} disabled={!editingImage || !prompt || isAiLoading} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${!editingImage || !prompt || isAiLoading ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5' : 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:scale-[1.01] shadow-orange-500/10'}`}>
                {isAiLoading ? 'Processando...' : 'Executar Engine AI'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'TRENDS') {
      return <TrendsView />;
    }

    if (view === 'IMPORT') {
      return <ImportView />;
    }

    return (
      <div className="p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tighter">
              {view === 'INBOX' ? 'Vídeos Virais' : 'Repositório'}
              {searchMode === SearchMode.TRENDING ? <span className="ml-2 text-orange-500 text-sm animate-pulse tracking-normal">● TRENDING ACTIVE ({region})</span> : ''}
            </h2>
            <p className="text-gray-400 text-sm">
              {view === 'INBOX' ? 'Monitor de viralidade em tempo real (Cache Global).' : 'Biblioteca de ativos salvos e aprovados.'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em]">Data Points</span>
            <p className="text-2xl font-bold text-orange-500">{filteredVideos.length}</p>
          </div>
        </header>

        {/* Video Grid Section */}
        {view === 'INBOX' ? (
          <div className="space-y-12">
            {/* YouTube Section */}
            {filterPlatform === Platform.YOUTUBE || filterPlatform === 'All' ? (
              <section>
                <div className="flex items-center space-x-3 mb-6 border-b border-red-500/20 pb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <span className="text-red-500 text-xl">▶</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">YouTube Viral</h3>
                    <p className="text-xs text-red-400 font-mono mt-1">Alta Performance de Views & Engajamento</p>
                  </div>
                </div>
                {filteredVideos.filter(v => v.platform === Platform.YOUTUBE).length > 0 ? (
                  // List View Stack
                  <div className="grid grid-cols-1 gap-2">
                    {filteredVideos.filter(v => v.platform === Platform.YOUTUBE).map(video => (
                      <VideoCard key={video.id} video={video} view={view as any} onApprove={handleApprove} onDelete={handleDelete} onUpdateStatus={handleUpdateStatus} />
                    ))}
                    {filteredVideos.filter(v => v.platform === Platform.YOUTUBE).length > 0 && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleYtLimitIncrease}
                          disabled={isLoading}
                          className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {isLoading ? 'Carregando...' : '+ Carregar Mais YouTube'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600 text-xs text-center py-8 border border-dashed border-white/5 rounded-xl">Nenhum vídeo do YouTube encontrado.</div>
                )}
              </section>
            ) : null}

            {/* Twitch Section */}
            {filterPlatform === Platform.TWITCH || filterPlatform === 'All' ? (
              <section>
                <div className="flex items-center space-x-3 mb-6 border-b border-purple-500/20 pb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <span className="text-purple-500 text-xl">👾</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Twitch Lives</h3>
                    <p className="text-xs text-purple-400 font-mono mt-1">Transmissões ao vivo com maior audiência</p>
                  </div>
                </div>
                {filteredVideos.filter(v => v.platform === Platform.TWITCH).length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredVideos.filter(v => v.platform === Platform.TWITCH).map(video => (
                      <VideoCard key={video.id} video={video} view={view as any} onApprove={handleApprove} onDelete={handleDelete} onUpdateStatus={handleUpdateStatus} />
                    ))}
                    {filteredVideos.filter(v => v.platform === Platform.TWITCH).length > 0 && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleTwLimitIncrease}
                          disabled={isLoading}
                          className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {isLoading ? 'Carregando...' : '+ Carregar Mais Twitch'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600 text-xs text-center py-8 border border-dashed border-white/5 rounded-xl">Nenhuma live da Twitch encontrada.</div>
                )}
              </section>
            ) : null}


          </div>
        ) : (
          // Repository / Standard View - List Stack
          <div className="grid grid-cols-1 gap-2">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} view={view as any} onApprove={handleApprove} onDelete={handleDelete} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && view !== 'INBOX' && (
          <div className="h-[400px] glass rounded-2xl flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
            <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-widest">Base de Dados Vazia</h3>
            <p className="text-gray-600 text-xs mt-2 uppercase tracking-tighter">Nenhum registro encontrado no servidor para os filtros aplicados.</p>
            <button onClick={fetchVideos} className="mt-6 text-orange-500 border border-orange-500/30 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">Forçar Sincronização</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden">
      <Sidebar currentView={view} setView={setView} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {view === 'INBOX' && (
          <Header
            search={search} setSearch={setSearch}
            platform={filterPlatform} setPlatform={setFilterPlatform}
            category={filterCategory} setCategory={setFilterCategory}
            searchMode={searchMode} setSearchMode={setSearchMode}
            period={period} setPeriod={setPeriod}
            region={region} setRegion={setRegion}
            onRefresh={fetchVideos}
          />
        )}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {error && <div className="bg-red-500/10 border-b border-red-500/20 text-red-500 text-center py-2 text-[10px] font-bold uppercase tracking-widest">{error}</div>}
          {renderContent()}
        </div>

        {/* Mobile Bottom Menu */}
        <BottomMenu currentView={view} setView={setView} onLogout={handleLogout} />
      </main>
    </div>
  );
};

export default App;
