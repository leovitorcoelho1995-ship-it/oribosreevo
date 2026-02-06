
export enum Platform {
  YOUTUBE = 'YouTube',
  TWITCH = 'Twitch'
}

export enum Category {
  GAMING = 'Gaming',
  FINANCE = 'Finanças',
  PODCAST = 'Podcast',
  BODYBUILDING = 'Musculação',
  EDUCATION = 'Educação',
  REACT = 'React / Entrevista',
  ENTERTAINMENT = 'Entretenimento'
}

export enum VideoStatus {
  NOT_STARTED = 'Não iniciado',
  IN_PROGRESS = 'Em corte',
  FINISHED = 'Finalizado'
}

export enum ShortStatus {
  DRAFT = 'Rascunho',
  PUBLISHED = 'Publicado'
}

export enum ShortPlatform {
  YT_SHORTS = 'YouTube Shorts',
  TIKTOK = 'TikTok',
  REELS = 'Instagram Reels'
}

export enum SearchMode {
  GENERAL = 'Geral',
  TRENDING = 'Em Alta'
}

export enum Period {
  LAST_24H = 'Últimas 24 horas',
  LAST_WEEK = 'Última semana',
  LAST_MONTH = 'Último mês',
  LAST_3_MONTHS = 'Últimos 3 meses'
}

export enum Region {
  US = 'United States (US)',
  GLOBAL = 'Global',
  BR = 'Brazil (BR)',
  CA = 'Canada (CA)',
  UK = 'United Kingdom (UK)',
  EU = 'Europe (EU)'
}

export interface Short {
  id: string;
  repository_id?: string; // Updated from video_id implied
  link: string;
  platform: ShortPlatform;
  status: ShortStatus;
  createdAt: string;
}

export interface Video {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  platform: Platform;
  category: Category;
  views: number;
  growth: number;
  duration: string;
  publishedAt: string;
  status: VideoStatus;
  isApproved: boolean;
  region?: string;
  shorts?: Short[];
}

export type ViewType = 'INBOX' | 'REPOSITORY' | 'SHORTS_LIST' | 'AI_EDITOR' | 'TRENDS' | 'IMPORT';

export enum Marketplace {
  MERCADO_LIVRE = 'Mercado Livre',
  SHOPEE = 'Shopee',
  AMAZON_BR = 'Amazon Brasil'
}

export enum OperationType {
  PF = 'Pessoa Física',
  PJ = 'Pessoa Jurídica'
}

export enum TaxRegime {
  MEI = 'MEI',
  SIMPLES = 'Simples Nacional',
  LUCRO_REAL = 'Lucro Real/Presumido'
}

export enum DeliveryType {
  RESIDENCE = 'Endereço Próprio',
  FULLFILLMENT = 'Fulfillment (CD Marketplace)'
}

export interface UserProfile {
  name: string;
  idNumber: string;
  businessName: string;
  defaultCep: string;
  operationType: OperationType;
  taxRegime: TaxRegime;
  mainMarketplace: Marketplace;
  deliveryPreference: DeliveryType;
}

export interface Supplier {
  name: string;
  specialty: string;
  moq: number;
  rating: string;
  responseTime: string;
}

export interface CandidateProduct {
  title: string;
  price: number;
  image: string;
  link: string;
}

export interface DiscoveryResponse {
  source: {
    title: string;
    price_usd: number;
    shipping_usd: number;
    image: string;
  };
  candidates: CandidateProduct[];
  search_query: string;
}

export type LogisticsMode = 'Standard_Packet' | 'Courier_Air' | 'Sea_LCL';

export interface LogisticsParams {
  weightKg: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  mode: LogisticsMode;
  destinationState: string;
}

export interface DetailedAnalysisRequest {
  sourcePriceUsd: number;
  sourceShippingUsd: number;
  competitorPriceBrl: number;
  icmsRate: number;
  logistics: LogisticsParams;
}

export interface PricingTier {
  min_qty: number;
  price_usd: number;
}

export interface ScenarioResult {
  scenario_name: string;
  logistics_mode: string;
  quantity: number;
  unit_fob_usd: number;
  total_batch_usd: number;
  unit_landed_cost_brl: number;
  unit_net_profit_brl: number;
  unit_roi_percent: number;
  verdict: string;
  breakdown_unit_brl: {
    fob: number;
    freight_int: number;
    taxes: number;
    clearance_fixed: number;
    freight_dom: number;
  };
}

export interface MultiScenarioResponse {
  product_title: string;
  competitor_price_brl: number;
  scenarios: {
    unitary: ScenarioResult;
    moq: ScenarioResult;
    scale: ScenarioResult;
  };
  risk_assessment: string;
}

export interface LogisticsInput {
  weightKg: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  destinationState: string;
}

export interface AdvancedAnalysisRequest {
  productUrl: string;
  source_price_usd?: number; // Added sourcing price
  manual_tiers?: PricingTier[];
  competitorPriceBrl: number;
  icmsRate: number;
  logistics: LogisticsInput;
  target_scale_qty: number;
}

export interface AnalysisRequest {
  productUrl: string;
  cep: string;
  marketplace: Marketplace;
  desiredMargin: number;
  profile: UserProfile;
}

export interface ViabilityReport {
  // Classic Fields (Optional now)
  product?: {
    name: string;
    category: string;
    ncm: string;
    estimatedWeight: string;
    dimensions: string;
    moq: number;
    estimatedPriceUsd: number;
    regulatoryRisk: string;
  };
  logistics?: {
    port: string;
    internationalFreight: number;
    internalLogistics: number;
    totalLogistics: number;
    origin: string;
    lastMile: string;
  };
  taxes?: {
    importRegime: string;
    regimeExplanation: string;
    taxBase: number;
    importTaxAmount: number;
    ipiAmount: number;
    icmsAmount: number;
    customsFees: number;
    totalBatchTaxes: number;
    unitTaxes: number;
    fiscalRisk: 'Baixo' | 'Médio' | 'Alto';
    fiscalRiskExplanation: string;
  };
  market?: {
    avgPriceBr: number;
    minPriceBr: number;
    maxPriceBr: number;
    competitionLevel: 'Baixo' | 'Médio' | 'Alto';
    priceWarRisk: string;
    pressureLevel: string;
    topSellerCompetitor?: {
      title: string;
      price: number;
      listingUrl: string;
      salesCountEstimate: string;
      advantages: string[];
    };
  };
  pricing?: {
    exchangeRateUsed: number;
    breakevenPrice: number;
    recommendedPrice: number;
    profitPerUnit: number;
    roi: number;
    fobCostBrl: number;
  };
  supplierModule?: {
    suggestedSuppliers: Supplier[];
    validationTips: string[];
    redFlags: string[];
    englishMessage: string;
  };
  recommendation?: {
    verdict: 'VIÁVEL' | 'ARRISCADO' | 'INVIÁVEL';
    verdictBadge: string;
    summary: string;
    risks: string[];
    opportunities: string[];
    scenarios: {
      conservative: string;
      realistic: string;
      optimistic: string;
    };
  };

  // New Precision Fields (The Truth)
  totalLandedCost?: number;
  profitMargin?: number;
  breakdown?: {
    fob_usd: number;
    int_freight_usd: number;
    insurance_usd: number;
    cif_brl: number;
    import_tax_brl: number;
    icms_brl: number;
    clearance_fee_brl: number;
    domestic_freight_brl: number;
    logistics_mode: string;
    exchange_rate: number;
  };
}

export interface ComparisonReport {
  winner: 'A' | 'B' | 'DRAW';
  reasoning: string;
  productA: {
    name: string;
    roi: number;
    breakeven: number;
    risk: string;
  };
  productB: {
    name: string;
    roi: number;
    breakeven: number;
    risk: string;
  };
  fullReportA?: ViabilityReport;
  fullReportB?: ViabilityReport;
  comparisonTable: {
    feature: string;
    valA: string;
    valB: string;
    better: 'A' | 'B' | 'NONE';
  }[];
}

export interface ProductData {
  fobPrice: number;
  competitorPrice: number;
  dollarRate: number;
  weight: number;
  category: string;
  scenarios: {
    unitary: ScenarioResult;
    moq: ScenarioResult;
    scale: ScenarioResult;
  };
}
