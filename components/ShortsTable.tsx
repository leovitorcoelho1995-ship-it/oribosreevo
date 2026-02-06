
import React from 'react';
import { Video, ShortStatus, ShortPlatform } from '../types';

interface ShortsTableProps {
  videos: Video[];
  onAddShort: (videoId: string) => void;
  onUpdateShortStatus: (videoId: string, shortId: string, status: ShortStatus) => void;
}

const ShortsTable: React.FC<ShortsTableProps> = ({ videos, onAddShort, onUpdateShortStatus }) => {
  const approvedVideos = videos.filter(v => v.isApproved);

  return (
    <div className="space-y-8">
      {approvedVideos.map(video => (
        <div key={video.id} className="glass rounded-xl overflow-hidden border border-white/5">
          <div className="bg-white/5 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src={video.thumbnail} className="w-16 h-9 rounded object-cover grayscale-[30%]" />
              <div>
                <h3 className="font-semibold text-sm">{video.title}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{video.channel} • {video.category}</p>
              </div>
            </div>
            <button
              onClick={() => onAddShort(video.id)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors"
            >
              + NOVO CLIP
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em] bg-black/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Link</th>
                  <th className="px-6 py-4 font-medium">Plataforma</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {video.shorts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600 italic uppercase text-[10px] tracking-widest">
                      Nenhum clip operacional vinculado.
                    </td>
                  </tr>
                ) : (
                  video.shorts?.map(short => (
                    <tr key={short.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 truncate max-w-[200px] text-orange-400 underline decoration-orange-400/30">
                        {short.link}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] uppercase font-bold">
                          {short.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{short.createdAt}</td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-transparent border-none outline-none text-[10px] uppercase font-bold text-white cursor-pointer"
                          value={short.status}
                          onChange={(e) => onUpdateShortStatus(video.id, short.id, e.target.value as ShortStatus)}
                        >
                          {Object.values(ShortStatus).map(s => (
                            <option key={s} value={s} className="bg-[#030712]">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-600 hover:text-red-500 transition-colors uppercase text-[10px] font-bold">Excluir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsTable;
