
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

export type ViewType = 'INBOX' | 'REPOSITORY' | 'SHORTS_LIST' | 'AI_EDITOR' | 'TRENDS';
