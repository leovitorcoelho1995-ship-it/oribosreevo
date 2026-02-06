
import React from 'react';
import { Video, Platform, VideoStatus } from '../types';
import { Youtube, CheckCircle2, Eye, Activity, ExternalLink } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, status: VideoStatus) => void;
  view: 'INBOX' | 'REPOSITORY';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onApprove, onDelete, onUpdateStatus, view }) => {
  const isYoutube = video.platform === Platform.YOUTUBE;
  const isTwitch = video.platform === Platform.TWITCH;

  return (
    <div className="group relative bg-[#0f172a]/80 hover:bg-[#1e293b] border border-white/5 hover:border-orange-500/30 rounded-lg overflow-hidden transition-all duration-300 flex flex-row h-28">
      {/* Thumbnail Section - Fixed Width */}
      <div className="relative w-44 h-full flex-shrink-0 bg-black">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
          {isYoutube && <span className="text-red-500">▶</span>}
          {isTwitch && <span className="text-purple-500">👾</span>}
          {video.platform}
        </div>
        {video.duration && (
          <div className="absolute bottom-1 right-1 bg-black/90 px-1 py-0.5 rounded text-[9px] font-mono text-white">
            {video.duration}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-3 flex flex-col justify-between relative min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0 pr-2">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-gray-200 group-hover:text-orange-400 leading-tight line-clamp-2 block mb-1 hover:underline decoration-orange-500/50"
              title={video.title}
            >
              {video.title}
            </a>
            <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
              {video.channel}
            </p>
          </div>

          {/* Actions for Inbox */}
          {view === 'INBOX' && (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                onClick={() => onApprove?.(video.id)}
                className="bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 p-1.5 rounded transition-all text-xs"
                title="Salvar"
              >
                <CheckCircle2 size={16} />
              </button>
              <button
                onClick={() => onDelete?.(video.id)}
                className="bg-gray-500/10 hover:bg-gray-600 text-gray-500 hover:text-white border border-gray-500/20 p-1.5 rounded transition-all text-xs"
                title="Ignorar"
              >
                ✕
              </button>
            </div>
          )}
          {/* Actions for Repository */}
          {view !== 'INBOX' && onDelete && (
            <button
              onClick={() => onDelete(video.id)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1"
              title="Excluir"
            >
              ✕
            </button>
          )}
        </div>

        {/* Metrics & Status Row */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-white/5">
          <div className="space-y-1 w-2/3">
            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
              <span className="flex items-center gap-1"><Eye size={12} className="text-blue-400" /> {video.views ? video.views.toLocaleString() : '0'}</span>
              <span className="flex items-center gap-1 text-green-400"><Activity size={12} /> {Math.round(video.growth)}% Trend</span>
            </div>
            {/* Growth Bar Visual */}
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{ width: `${Math.min(Math.max(video.growth, 0) / 10, 100)}%` }}
              />
            </div>
          </div>

          {/* Repository Status Selector */}
          {view !== 'INBOX' && onUpdateStatus && (
            <div className="flex items-center gap-2">
              <select
                value={video.status}
                onChange={(e) => onUpdateStatus(video.id, e.target.value as VideoStatus)}
                className={`bg-black/30 text-[10px] uppercase font-bold py-1 px-2 rounded border border-white/10 outline-none cursor-pointer
                        ${video.status === VideoStatus.FINISHED ? 'text-green-500 border-green-500/30' :
                    video.status === VideoStatus.IN_PROGRESS ? 'text-orange-400 border-orange-500/30' : 'text-gray-400'}
                        `}
              >
                <option value={VideoStatus.NOT_STARTED}>Na Fila</option>
                <option value={VideoStatus.IN_PROGRESS}>Em Produção</option>
                <option value={VideoStatus.FINISHED}>Finalizado</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
