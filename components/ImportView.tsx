
import React, { useState } from 'react';
import {
    Marketplace,
    ProductData,
    AdvancedAnalysisRequest,
    LogisticsInput,
    CandidateProduct,
    MultiScenarioResponse,
    ScenarioResult
} from '../types';
import { PipelineStages } from './PipelineStages';
import { CostXRayTable } from './CostXRayTable';

// --- CLIENT SIDE CALCULATION ENGINE (Fallback) ---
// Ported from backend logic to ensure functionality without Python server
const calculateClientSideScenarios = (req: AdvancedAnalysisRequest): MultiScenarioResponse => {
    const rate = 6.10; // Fixed fallback rate
    const fob = req.source_price_usd || 5.0;
    const competitorPrice = req.competitorPriceBrl;

    // Helper Calc
    const calc = (qty: number, mode: 'Air' | 'Sea', discount: number) => {
        const unitFob = fob * (1 - discount);
        // Simple freight logic matching backend approximation
        const freightRate = mode === 'Air' ? 12.0 : 200.0 / 500; // $/kg or $/unit approx
        const unitFreight = req.logistics.weightKg * freightRate;

        const fobBrl = unitFob * rate;
        const freightBrl = unitFreight * rate;

        // Tax Logic
        const importTaxRate = mode === 'Sea' ? 0.60 : 0.60; // Simplified
        const taxes = (fobBrl + freightBrl) * importTaxRate;
        const fixed = mode === 'Sea' ? 1500 / qty : 20 / qty;

        const landed = fobBrl + freightBrl + taxes + fixed + 15.0; // + Domestic
        const profit = competitorPrice - landed;

        return {
            scenario_name: mode === 'Air' ? (qty === 1 ? 'Validação' : 'Tração') : 'Escala',
            logistics_mode: mode === 'Air' ? 'Courier_Air' : 'Sea_LCL',
            quantity: qty,
            unit_fob_usd: unitFob,
            total_batch_usd: unitFob * qty,
            unit_landed_cost_brl: landed,
            unit_net_profit_brl: profit,
            unit_roi_percent: (profit / landed) * 100,
            verdict: profit > 0 ? 'VIÁVEL' : 'INVIÁVEL',
            breakdown_unit_brl: {
                fob: fobBrl,
                freight_int: freightBrl,
                taxes: taxes,
                clearance_fixed: fixed,
                freight_dom: 15.0
            }
        } as ScenarioResult;
    };

    return {
        product_title: "Produto Simulado (Client-Side)",
        competitor_price_brl: competitorPrice,
        scenarios: {
            unitary: calc(1, 'Air', 0),
            moq: calc(50, 'Air', 0.05),
            scale: calc(req.target_scale_qty || 500, 'Sea', 0.15)
        },
        risk_assessment: "Cálculo via Frontend (Estimado)"
    };
};

export const ImportView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productUrl: '',
        cep: '01001-000',
        marketplace: Marketplace.MERCADO_LIVRE,
        manualPriceUsd: 5.0,
        manualCompetitorBrl: 150.0
    });

    // Results State
    const [multiReport, setMultiReport] = useState<MultiScenarioResponse | null>(null);
    const [productData, setProductData] = useState<ProductData | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulation of API Call delay
        setTimeout(() => {
            try {
                // Use Client Side Logic
                const req: AdvancedAnalysisRequest = {
                    productUrl: formData.productUrl,
                    source_price_usd: formData.manualPriceUsd,
                    competitorPriceBrl: formData.manualCompetitorBrl,
                    icmsRate: 0.17,
                    logistics: {
                        weightKg: 0.5,
                        widthCm: 10,
                        heightCm: 10,
                        lengthCm: 10,
                        destinationState: 'SP'
                    },
                    target_scale_qty: 500
                };

                const result = calculateClientSideScenarios(req);

                setMultiReport(result);
                setProductData({
                    fobPrice: formData.manualPriceUsd,
                    competitorPrice: formData.manualCompetitorBrl,
                    dollarRate: 6.10,
                    weight: 0.5,
                    category: 'Imported',
                    scenarios: result.scenarios
                });

            } catch (err) {
                alert("Erro ao calcular.");
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900">Simulador <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Oribos</span></h2>
                <p className="text-gray-500 font-medium">Análise de Viabilidade de Importação</p>
            </div>

            {!multiReport ? (
                <div className="max-w-xl mx-auto">
                    <form onSubmit={handleAnalyze} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Link do Produto (Alibaba/AliE)</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-orange-500 font-medium transition-all"
                                value={formData.productUrl}
                                onChange={e => setFormData({ ...formData, productUrl: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Custo USD (Est.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-orange-500"
                                    value={formData.manualPriceUsd}
                                    onChange={e => setFormData({ ...formData, manualPriceUsd: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Venda BRL (Conc.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-orange-500"
                                    value={formData.manualCompetitorBrl}
                                    onChange={e => setFormData({ ...formData, manualCompetitorBrl: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-2xl uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center"
                        >
                            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'ANALISAR VIABILIDADE'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-end">
                        <button onClick={() => setMultiReport(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase">
                            ← Nova Simulação
                        </button>
                    </div>

                    {productData && <PipelineStages data={productData} />}
                    {productData && <CostXRayTable data={productData} />}
                </div>
            )}
        </div>
    );
};
