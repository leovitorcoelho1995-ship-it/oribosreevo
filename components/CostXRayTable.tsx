
import React from 'react';
import { ProductData } from '../types';

interface CostXRayTableProps {
    data: ProductData;
    isExpanded?: boolean;
}

export const CostXRayTable: React.FC<CostXRayTableProps> = ({ data, isExpanded = true }) => {
    if (!isExpanded) return null;

    const scenarios = data.scenarios;
    if (!scenarios) return null;

    const { unitary, moq, scale } = scenarios;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Raio-X de Custos (Unitário)</h3>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Detalhamento Financeiro</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3">Estágio</th>
                            <th className="px-6 py-3">Quant.</th>
                            <th className="px-6 py-3">FOB (USD)</th>
                            <th className="px-6 py-3 text-right">Produto (BRL)</th>
                            <th className="px-6 py-3 text-right">Logística</th>
                            <th className="px-6 py-3 text-right">Impostos</th>
                            <th className="px-6 py-3 text-right">Taxas Fixas</th>
                            <th className="px-6 py-3 text-right text-gray-900">Custo Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[unitary, moq, scale].map((sc, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-gray-400' : i === 1 ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                    {sc.scenario_name}
                                </td>
                                <td className="px-6 py-4 text-gray-500">{sc.quantity} un</td>
                                <td className="px-6 py-4 text-gray-500 font-mono">US$ {sc.unit_fob_usd.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-700">R$ {sc.breakdown_unit_brl.fob.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-700">R$ {(sc.breakdown_unit_brl.freight_int + sc.breakdown_unit_brl.freight_dom).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-medium text-red-500">R$ {sc.breakdown_unit_brl.taxes.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-400">R$ {sc.breakdown_unit_brl.clearance_fixed.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-black text-gray-900">R$ {sc.unit_landed_cost_brl.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
