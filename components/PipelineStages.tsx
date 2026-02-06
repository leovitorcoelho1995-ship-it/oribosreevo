
import React from 'react';
import { ProductData } from '../types';

interface PipelineStagesProps {
    data: ProductData;
    onExpand?: (stage: string) => void;
}

export const PipelineStages: React.FC<PipelineStagesProps> = ({ data }) => {
    // If we have detailed scenarios from backend, use them.
    // Otherwise, fallback to a "Demo Calculation" derived from the simple props.

    // Helper to ensure safe numbers
    const safe = (val: number | undefined) => val || 0;

    const scenarios = data.scenarios;

    if (!scenarios) {
        return <div className="text-center p-4 text-gray-400">Aguardando dados da análise...</div>;
    }

    const { unitary, moq, scale } = scenarios;

    return (
        <div className="relative pt-8 pb-4 overflow-x-auto">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-[60%] left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-4 justify-between min-w-[800px] md:min-w-0">

                {/* ESTÁGIO 1: VALIDAÇÃO */}
                <div className="flex-1 group">
                    <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all shadow-sm group-hover:shadow-md relative">
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white">Etapa 1: Validação</span>

                        <div className="text-center mb-6 mt-2">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">📦</div>
                            <h3 className="font-black text-gray-900 text-lg">Amostra (1 un)</h3>
                            <p className="text-xs text-gray-400 font-medium px-4">"Qual o custo para trazer 1 unidade e testar a qualidade?"</p>
                        </div>

                        <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl">
                            <div className="space-y-1 pb-3 border-b border-gray-200 text-[10px] text-gray-500">
                                <div className="flex justify-between"><span>Prod:</span> <span className="font-bold text-gray-700">R$ {safe(unitary.breakdown_unit_brl.fob).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Log:</span> <span className="font-bold text-gray-700">R$ {(safe(unitary.breakdown_unit_brl.freight_int) + safe(unitary.breakdown_unit_brl.freight_dom)).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Tax:</span> <span className="font-bold text-gray-700">R$ {safe(unitary.breakdown_unit_brl.taxes).toFixed(2)}</span></div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-gray-500 font-bold">Investimento Total</span>
                                <span className="font-black text-gray-900">R$ {(safe(unitary.unit_landed_cost_brl) * safe(unitary.quantity)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold">Custo Unitário</span>
                                <span className="font-black text-gray-900">R$ {safe(unitary.unit_landed_cost_brl).toFixed(2)}</span>
                            </div>
                            <div className="text-center pt-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${unitary.unit_net_profit_brl > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                                    {unitary.unit_net_profit_brl > 0 ? 'Lucro Confirmado' : 'Custo de P&D (Prejuízo)'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex md:hidden justify-center my-2 text-gray-300">↓</div>
                </div>

                {/* ARROW CONNECTOR DESKTOP */}
                <div className="hidden md:flex flex-col justify-center items-center px-2 text-gray-300 z-10">
                    <div className="w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm">➜</div>
                </div>

                {/* ESTÁGIO 2: TRAÇÃO */}
                <div className="flex-1 group">
                    <div className="bg-white p-6 rounded-3xl border-2 border-purple-100 ring-4 ring-purple-50/50 transition-all shadow-xl relative transform md:-translate-y-4">
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-200">Etapa 2: Tração</span>

                        <div className="text-center mb-6 mt-2">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner text-purple-600">🚀</div>
                            <h3 className="font-black text-gray-900 text-xl">Lote Teste ({moq.quantity} un)</h3>
                            <p className="text-xs text-gray-400 font-medium px-2">"Validar vendas com importação simplificada."</p>
                            <div className="mt-2 text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-50 inline-block px-2 py-1 rounded-lg">Regime Simplificado</div>
                        </div>

                        <div className="space-y-3 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                            <div className="space-y-1 pb-3 border-b border-gray-100 text-[10px] text-gray-500">
                                <div className="flex justify-between"><span>Prod:</span> <span className="font-bold text-gray-900">R$ {safe(moq.breakdown_unit_brl.fob).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Log:</span> <span className="font-bold text-gray-900">R$ {(safe(moq.breakdown_unit_brl.freight_int) + safe(moq.breakdown_unit_brl.freight_dom)).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Tax:</span> <span className="font-bold text-gray-900">R$ {safe(moq.breakdown_unit_brl.taxes).toFixed(2)}</span></div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-gray-400 font-bold uppercase text-[9px]">Competitividade</span>
                                <div className={`font-black ${moq.unit_landed_cost_brl < data.competitorPrice ? 'text-green-600' : 'text-orange-500'}`}>
                                    {moq.unit_landed_cost_brl < data.competitorPrice ? '✅ Competitivo' : '⚠️ Atenção'}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-xs">Margem Unit.</span>
                                <span className={`text-lg font-black ${moq.unit_net_profit_brl > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    R$ {safe(moq.unit_net_profit_brl).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-[9px] text-right font-black text-purple-400">ROI: {safe(moq.unit_roi_percent).toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="flex md:hidden justify-center my-2 text-gray-300">↓</div>
                </div>

                {/* ARROW CONNECTOR DESKTOP */}
                <div className="hidden md:flex flex-col justify-center items-center px-2 text-gray-300 z-10">
                    <div className="w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm">➜</div>
                </div>

                {/* ESTÁGIO 3: ESCALA */}
                <div className="flex-1 group">
                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 text-white shadow-2xl relative">
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-900/20">Etapa 3: Escala</span>

                        <div className="text-center mb-6 mt-2">
                            <div className="w-12 h-12 bg-gray-800 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner border border-gray-700">🚢</div>
                            <h3 className="font-black text-white text-lg">Formal ({scale.quantity}+ un)</h3>
                            <p className="text-xs text-gray-400 font-medium px-2">"Margem máxima via Marítimo."</p>
                        </div>

                        <div className="space-y-4 bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                            <div className="space-y-1 pb-3 border-b border-gray-700 text-[10px] text-gray-400">
                                <div className="flex justify-between"><span>Prod:</span> <span className="font-bold text-white">R$ {safe(scale.breakdown_unit_brl.fob).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Log:</span> <span className="font-bold text-white">R$ {(safe(scale.breakdown_unit_brl.freight_int) + safe(scale.breakdown_unit_brl.freight_dom)).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Tax:</span> <span className="font-bold text-white">R$ {safe(scale.breakdown_unit_brl.taxes).toFixed(2)}</span></div>
                            </div>
                            <div className="text-center pt-2">
                                <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Lucro Potencial</p>
                                <p className="text-3xl font-black text-white tracking-tighter">
                                    R$ {safe(scale.unit_net_profit_brl).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
