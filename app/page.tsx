'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { track } from '@/lib/analytics';
import { supabase, type AppGuestDataRow, type DaziItem } from '@/lib/supabase';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Sparkles, 
  MessageSquare, 
  User, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Plus, 
  Send, 
  Briefcase, 
  Zap, 
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Camera,
  Wand2,
  ShieldCheck,
  X,
  Award,
  Calendar,
  Zap as ZapIcon,
  Smile,
  LayoutGrid,
  FileText,
  Shield,
  Bell,
  ChevronDown,
  Radar,
  Building2,
  EyeOff,
  Coffee,
  Mic,
  SlidersHorizontal,
  AlertCircle,
  Info,
  Layers,
  Bot,
  Pencil,
  GraduationCap,
  Loader2,
  MailCheck
} from 'lucide-react';

// --- 配置常量 ---
const COLORS = {
  bg: '#FAFAFA',
  sage: '#87A382',
  amber: '#F9D8B1',
  ink: '#2F3E46',
  white: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.7)'
};

/** 与 Logo「Unipass」渐变字同色系的登录主按钮渐变 */
const LOGIN_BRAND_GRADIENT =
  'linear-gradient(99.1035deg, rgb(110, 206, 184) 3.4422%, rgb(134, 204, 168) 70.656%, rgb(240, 196, 96) 99.069%)';

// 首页顶部小卡片可调参数区：改这里就能调位置/大小
const HOME_HERO_LAYOUT = {
  stickyPadding: 'px-5',
  expandedContainer: 'h-auto px-0 pb-6 pt-6',
  card: 'relative rounded-[24px] border border-white/55 bg-[linear-gradient(125deg,rgba(150,225,206,0.86)_0%,rgba(176,204,248,0.82)_58%,rgba(178,176,245,0.88)_100%)] px-5 py-7 shadow-[0_16px_30px_-22px_rgba(64,100,120,0.45)]',
  text: 'max-w-[54%] text-[15px] font-black leading-relaxed tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]',
  ipImage: 'pointer-events-none absolute bottom-[-30px] right-[-25px] z-20 w-[170px] object-contain drop-shadow-[0_16px_18px_rgba(68,108,92,0.35)]',
  collapsedContainer: 'h-[52px] rounded-[20px] bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_58%,rgba(178,176,245,0.98)_100%)] shadow-[0_8px_14px_-12px_rgba(64,100,120,0.22)] flex items-center px-5',
  collapsedText: 'text-[13px] font-black tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
} as const;

const HOME_SURFACE = {
  background: 'bg-[radial-gradient(circle_at_16%_4%,rgba(150,225,206,0.3)_0%,rgba(250,250,250,0)_30%),radial-gradient(circle_at_94%_12%,rgba(178,176,245,0.26)_0%,rgba(250,250,250,0)_32%),linear-gradient(180deg,#F8FCFA_0%,#F7F8FF_50%,#FFFCF6_100%)]',
  glassCard: 'border border-white/70 bg-white/72 shadow-[0_14px_34px_-24px_rgba(64,100,120,0.42)] backdrop-blur-xl',
  chipActive: 'bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_58%,rgba(178,176,245,0.98)_100%)] text-white border-white/70 shadow-[0_10px_22px_-16px_rgba(64,100,120,0.55)]',
  chipInactive: 'bg-white/70 text-slate-600 border-white/70 shadow-[0_8px_20px_-18px_rgba(64,100,120,0.45)] backdrop-blur-md',
  accentText: 'text-[#56756D]',
} as const;

/** 个人页插画尺寸：`星星.png`、`职场成就胶囊.png` 按需改此处（Tailwind class 片段） */
const PROFILE_ILLUSTRATION = {
  /** 搭子关系卡右侧星星：外层占位（与卡内边距协调，不宜过大） */
  daziStarWrap: 'h-14 w-14',
  /** 搭子关系卡右侧星星：图片本体（≤ 外层） */
  daziStarImg: 'h-12 w-12',
  /** 成就胶囊空状态插图：上移（负边距拉近标题与插画） */
  achievementCapsuleOffset: '-mt-1',
  achievementCapsuleHeight: 'h-[166px]',
  achievementCapsuleMaxW: 'max-w-[90%]',
} as const;

const UI = {
  page: `relative flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-16 ${HOME_SURFACE.background} animate-in fade-in duration-300`,
  /** 「我的」整页底色：浅色薄荷绿 → 极淡薰衣草，衬托纯白卡片（参考实拍玻璃拟态） */
  profilePage:
    'relative flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-16 bg-[linear-gradient(175deg,#DFF6EC_0%,#EBE6FA_42%,#F4EFFC_76%,#F8F6FD_100%)] animate-in fade-in duration-300',
  pageNoX: `relative flex-1 overflow-y-auto no-scrollbar pb-32 pt-16 ${HOME_SURFACE.background} animate-in fade-in duration-300`,
  sectionTitle: 'text-[22px] font-black tracking-tight text-[#2F3E46]',
  sectionSub: 'mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#56756D]/45',
  card: `rounded-[28px] ${HOME_SURFACE.glassCard}`,
  cardPad: `rounded-[28px] ${HOME_SURFACE.glassCard} p-5`,
  innerCard: 'rounded-[20px] border border-white/70 bg-white/58 shadow-[0_10px_24px_-18px_rgba(64,100,120,0.32)] backdrop-blur-md',
  iconBox: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] backdrop-blur-md',
  input: 'rounded-[20px] border border-white/72 bg-white/68 text-[#40515A] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_-20px_rgba(64,100,120,0.36)] backdrop-blur-md placeholder:text-[#56756D]/35 focus:outline-none focus:ring-2 focus:ring-[#96E1CE]/35',
  primaryButton: 'rounded-full border border-white/70 bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] text-[#2F3E46] shadow-[0_14px_28px_-18px_rgba(64,100,120,0.55)] active:scale-[0.98]',
  subtleButton: 'rounded-full border border-white/70 bg-white/58 text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md active:scale-95',
  /** 数字领地主卡：高白度 + 大范围柔阴影 + 浅色描边（与渐变底形成清晰层次） */
  profileSurface:
    'rounded-[28px] border border-white/90 bg-[color:rgba(255,255,255,0.96)] shadow-[0_22px_56px_-32px_rgba(95,122,138,0.22),0_10px_32px_-24px_rgba(144,174,167,0.18),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-md',
  profileInner:
    'rounded-[22px] border border-[#EEF4F8]/95 bg-[color:rgba(255,255,255,0.88)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_14px_32px_-24px_rgba(120,148,164,0.12)] backdrop-blur-sm',
  /** 「我的」内区块：白卡略浮起，少用灰描边 */
  profileSection:
    'rounded-[26px] border border-white/95 bg-[color:rgba(255,255,255,0.97)] p-4 shadow-[0_20px_52px_-30px_rgba(95,118,138,0.2),0_8px_28px_-20px_rgba(168,192,216,0.14),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-sm',
} as const;

const getThemeColors = (isWorkMode: boolean) => {
  if (isWorkMode) {
    return {
      primary: '#87A382', 
      bg: '#FCFDFB',
      card: '#F2F5F2',
      accent: '#2F3E46',
      text: '#2F3E46',
      ink: '#2F3E46',
      gradient: 'from-[#F2F5F2] to-white',
      tag: 'bg-[#87A382] text-white',
      ripple: '#87A382'
    };
  } else {
    return {
      primary: '#F9D8B1', 
      bg: '#FAF9FF',
      card: '#FFF9F2',
      accent: '#7C3AED', 
      text: '#2F3E46',
      ink: '#2F3E46',
      gradient: 'from-[#F9D8B1]/20 via-[#7C3AED]/10 to-white',
      tag: 'bg-[#F9D8B1] text-[#2F3E46]',
      ripple: '#F9D8B1'
    };
  }
};

// ---- 数据库行 → 组件所用格式的适配函数 ----
const DAZI_CANDIDATE_TAG = '选一种关系';
const DAZI_PEER_KEY = (sceneId: number) => `scene-${sceneId}`;
type QuickSceneFilter = '全部' | '🔥 刚刚发起' | '🍱 干饭搭子' | '☕ 楼下摸鱼' | '🚶 散散班味' | '🏢 同公司';
type AdvancedSceneFilters = {
  distance: '500m' | '3km' | 'city';
  size: 'small' | 'medium' | 'large';
  exclusive: 'company' | 'female' | 'male' | null;
};
const DEFAULT_ADVANCED_SCENE_FILTERS: AdvancedSceneFilters = {
  distance: 'city',
  size: 'large',
  exclusive: null,
};
const SUPPORTED_FEED_CITIES = ['重庆', '杭州', '深圳', '北京', '上海', '广州', '苏州', '南京', '武汉', '西安'] as const;

function inferCityFromText(input: string | null | undefined): string | null {
  const text = (input ?? '').trim();
  if (!text) return null;
  for (const city of SUPPORTED_FEED_CITIES) {
    if (text.includes(city)) return city;
  }
  const m = text.match(/([^\s·,，]{2,6})市/);
  if (m?.[1]) return m[1];
  return null;
}

function inferCityFromCoords(lat: number, lng: number): string | null {
  // 粗略边界识别：用于“同城优先”排序，不用于精确地理判断
  if (lat >= 29.3 && lat <= 31.0 && lng >= 106.0 && lng <= 108.5) return '重庆';
  if (lat >= 29.8 && lat <= 30.7 && lng >= 119.7 && lng <= 120.6) return '杭州';
  if (lat >= 22.4 && lat <= 22.9 && lng >= 113.7 && lng <= 114.7) return '深圳';
  if (lat >= 39.4 && lat <= 41.1 && lng >= 115.7 && lng <= 117.5) return '北京';
  if (lat >= 30.8 && lat <= 31.9 && lng >= 120.9 && lng <= 122.2) return '上海';
  if (lat >= 22.5 && lat <= 23.9 && lng >= 112.8 && lng <= 114.2) return '广州';
  if (lat >= 30.9 && lat <= 32.1 && lng >= 120.2 && lng <= 121.2) return '苏州';
  if (lat >= 31.7 && lat <= 32.4 && lng >= 118.3 && lng <= 119.2) return '南京';
  if (lat >= 29.8 && lat <= 31.0 && lng >= 113.8 && lng <= 115.2) return '武汉';
  if (lat >= 33.9 && lat <= 34.6 && lng >= 108.5 && lng <= 109.3) return '西安';
  return null;
}

function matchesQuickSceneFilter(scene: ReturnType<typeof adaptScene>, filter: QuickSceneFilter): boolean {
  if (filter === '全部') return true;
  if (filter === '🔥 刚刚发起') {
    if (!scene.createdAt) return false;
    const createdAt = new Date(scene.createdAt).getTime();
    if (!Number.isFinite(createdAt)) return false;
    return Date.now() - createdAt <= 60 * 60 * 1000;
  }
  const text = `${scene.title ?? ''} ${scene.type ?? ''}`;
  if (filter === '🍱 干饭搭子') return /(干饭|吃饭|午饭|午餐|晚饭|宵夜|咖啡|奶茶)/.test(text);
  if (filter === '☕ 楼下摸鱼') return /(摸鱼|楼下|茶水间|咖啡|下午茶)/.test(text);
  if (filter === '🚶 散散班味') return /(散步|走走|班味|遛弯)/.test(text);
  if (filter === '🏢 同公司') {
    return scene.exclusive === 'company' || /同公司|同事|内推/.test(text);
  }
  return true;
}

async function fetchDaziAiTags(sceneTitle: string, sceneType: string): Promise<string[]> {
  try {
    const res = await fetch('/api/eq-polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `局名称：「${sceneTitle}」，类型：${sceneType}。请输出2个4～8字以内的搭子/场景关系标签，顿号分隔，不要引号，仅输出标签：`,
        scenario: '工作汇报',
      }),
    });
    if (!res.ok) return ['本局同玩', '慢慢熟悉'];
    const data = await res.json();
    const t = (data.result ?? '').toString().trim();
    if (!t) return ['本局同玩', '慢慢熟悉'];
    return t
      .split(/[、,，;；]/)
      .map((s) => s.replace(/[「」'"]/g, '').trim())
      .filter(Boolean)
      .slice(0, 2);
  } catch {
    return ['本局同玩', '慢慢熟悉'];
  }
}

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const a = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

function formatMeters(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '未知距离';
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)}km`;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

function adaptScene(row: any) {
  const rawTime = row.meet_time ?? row.time ?? null;
  const time =
    rawTime != null && String(rawTime).trim() !== '' ? String(rawTime).trim() : '时间待定';
  return {
    id: row.id,
    emoji: row.emoji,
    type: row.type,
    title: row.title,
    distance: row.distance,
    lat: typeof row.lat === 'number' ? row.lat : null,
    lng: typeof row.lng === 'number' ? row.lng : null,
    time,
    current: row.current_count,
    total: row.total_count,
    exclusive: row.exclusive ?? null,
    desc: row.description,
    hostGuestId: row.host_guest_id ?? null,
    createdAt: row.created_at ?? null,
  };
}

function adaptFeed(row: any) {
  return {
    id: row.id,
    avatar: row.avatar,
    author: row.author,
    location: row.location,
    time: formatRelativeTime(row.created_at),
    content: row.content,
    hasImage: row.has_image,
    tags: row.tags ?? [],
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
    category: row.category ?? 'other',
    createdAt: row.created_at ?? null,
  };
}

type AppSceneRow = ReturnType<typeof adaptScene>;
type AppFeedRow = ReturnType<typeof adaptFeed>;
const HOME_NEARBY_SCENES_MIN = 10;
const COMMUNITY_VISIBLE_FEEDS_MIN = 20;

function isSyntheticSceneId(id: number) {
  return id < 0;
}

/** 本地兜底局：负数 id；无性别限定，减少不同档案下的过滤空洞 */
function buildFallbackHomeScenes(activeFilter: QuickSceneFilter): AppSceneRow[] {
  const nowIso = new Date().toISOString();
  const base: AppSceneRow[] = [
    { id: -9101, emoji: '🍱', type: '🍱 干饭搭子', title: '午饭拼单：同事一起下楼拿咖啡', distance: '380m', lat: null, lng: null, time: '11:45', current: 2, total: 5, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9102, emoji: '🥙', type: '🍱 干饭搭子', title: '轻食便当团：下午茶前垫一口', distance: '510m', lat: null, lng: null, time: '12:05', current: 3, total: 6, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9103, emoji: '☕', type: '🍱 干饭搭子', title: '奶茶店第二杯半价，顺路一起走', distance: '260m', lat: null, lng: null, time: '15:20', current: 1, total: 4, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9104, emoji: '🫖', type: '☕ 楼下摸鱼', title: '茶水间放空十分钟，有没有人一起', distance: '120m', lat: null, lng: null, time: '16:40', current: 2, total: 5, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9105, emoji: '🧋', type: '☕ 楼下摸鱼', title: '楼下咖啡：带薪偷闲喝杯冰美式', distance: '290m', lat: null, lng: null, time: '10:55', current: 2, total: 4, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9106, emoji: '🚶', type: '🚶 散散班味', title: '晚饭后散步解压，慢慢走走聊天', distance: '720m', lat: null, lng: null, time: '19:00', current: 1, total: 6, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9107, emoji: '🌿', type: '🚶 散散班味', title: '班味有点重，园区遛弯换口气', distance: '450m', lat: null, lng: null, time: '18:15', current: 2, total: 5, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9108, emoji: '🚗', type: '🏢 同公司', title: '同公司拼车回家，顺路可带一段', distance: '890m', lat: null, lng: null, time: '18:30', current: 2, total: 4, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9109, emoji: '📇', type: '🏢 同公司', title: '内推简历互相看，同事帮挑关键词', distance: '340m', lat: null, lng: null, time: '20:10', current: 1, total: 3, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9110, emoji: '🍜', type: '🍱 干饭搭子', title: '宵夜粉面局：加班后来一碗热汤', distance: '1.1km', lat: null, lng: null, time: '21:30', current: 2, total: 5, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9111, emoji: '🥐', type: '🍱 干饭搭子', title: '早餐咖啡+可颂，同事顺路拼单', distance: '420m', lat: null, lng: null, time: '08:50', current: 1, total: 4, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9112, emoji: '🎲', type: '🏢 同公司', title: '午休桌游破冰，欢迎同公司萌新', distance: '560m', lat: null, lng: null, time: '12:40', current: 2, total: 6, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
    { id: -9113, emoji: '🏢', type: '🏢 同公司', title: '同公司迎新饭：边吃边聊项目组', distance: '610m', lat: null, lng: null, time: '12:25', current: 3, total: 6, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9115, emoji: '🤝', type: '🏢 同公司', title: '同公司跨组对齐：边吃边把接口聊清', distance: '470m', lat: null, lng: null, time: '11:55', current: 2, total: 5, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9116, emoji: '🧾', type: '🏢 同公司', title: '同公司报销答疑：老员工带少走弯路', distance: '520m', lat: null, lng: null, time: '19:45', current: 1, total: 4, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9117, emoji: '💼', type: '🏢 同公司', title: '同公司实习生抱团：周报怎么写更讨喜', distance: '330m', lat: null, lng: null, time: '14:05', current: 2, total: 5, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9118, emoji: '📚', type: '🏢 同公司', title: '同公司内部知识库扫盲，一起少走弯路', distance: '690m', lat: null, lng: null, time: '16:20', current: 1, total: 4, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9119, emoji: '🌙', type: '🏢 同公司', title: '夜班同公司盒饭团，顺路去拿', distance: '1.4km', lat: null, lng: null, time: '22:10', current: 2, total: 4, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9120, emoji: '☂️', type: '🏢 同公司', title: '下雨天同公司拼车去地铁站', distance: '410m', lat: null, lng: null, time: '18:05', current: 2, total: 4, exclusive: 'company', desc: '', hostGuestId: null, createdAt: null },
    { id: -9114, emoji: '🥗', type: '🍱 干饭搭子', title: '食堂新窗口试吃拼桌', distance: '180m', lat: null, lng: null, time: '11:55', current: 2, total: 5, exclusive: null, desc: '', hostGuestId: null, createdAt: null },
  ];
  return base.map((s, i) => ({
    ...s,
    createdAt: activeFilter === '🔥 刚刚发起' && i < 12 ? nowIso : `2026-04-${String((i % 27) + 1).padStart(2, '0')}T09:30:00.000Z`,
  }));
}

/** 兜底圈子正文含「同公司」，配合 isCompanyRelatedFeed 的中间词匹配 */
function communityFeedFallbackPool(): AppFeedRow[] {
  const rows: {
    id: number;
    avatar: string;
    author: string;
    location: string;
    created_at: string;
    content: string;
    has_image: boolean;
    tags: string[];
    likes: number;
    comments: number;
    category: string;
  }[] = [
    { id: -20101, avatar: '🙂', author: '职场小雷达', location: '北京·望京', created_at: '2026-04-02T06:01:00.000Z', content: '同公司同学分享｜例会前先写一行结论再上麦，临场表达更像高手。', has_image: false, tags: ['情报'], likes: 18, comments: 5, category: 'trick' },
    { id: -20102, avatar: '🧭', author: '行政便利贴', location: '上海·漕河泾', created_at: '2026-04-02T07:04:00.000Z', content: '茶水间摸到的小邪招：会议室提前 3 分钟投屏自检，翻车率明显下降，同公司可抄作业。', has_image: false, tags: ['小技巧'], likes: 24, comments: 8, category: 'trick' },
    { id: -20103, avatar: '☕', author: '咖啡雷达', location: '深圳·南山', created_at: '2026-04-02T08:10:00.000Z', content: '科技园楼下咖啡第二杯半价，同公司拼单更合适，高峰等 7 分钟内。', has_image: false, tags: ['下午茶'], likes: 31, comments: 11, category: 'trick' },
    { id: -20104, avatar: '🍱', author: '干饭指南针', location: '杭州·西溪', created_at: '2026-04-02T09:12:00.000Z', content: '同公司避雷：这间轻食午间出餐不稳，错峰 11:35 前人少更稳。', has_image: false, tags: ['干饭'], likes: 20, comments: 6, category: '打卡' },
    { id: -20105, avatar: '🌆', author: '城市情报员', location: '广州·天河', created_at: '2026-04-02T10:20:00.000Z', content: 'CBD 天桥晚高峰人贴人，同公司可走地下通道那一段更顺。', has_image: false, tags: ['通勤'], likes: 16, comments: 4, category: 'place' },
    { id: -20106, avatar: '🪴', author: '工位策展人', location: '苏州·金鸡湖东', created_at: '2026-04-02T11:25:00.000Z', content: '办公楼 B1 瑞幸旁休息区人少，中午想放空可去，偶遇同公司同学概率高。', has_image: false, tags: ['好去处'], likes: 27, comments: 7, category: 'place' },
    { id: -20107, avatar: '📸', author: '园区摄影师', location: '南京·软件谷', created_at: '2026-04-02T12:30:00.000Z', content: '四楼连廊玻璃反光弱，阴天拍打卡照更柔和，拉上同公司一起出片～', has_image: false, tags: ['打卡'], likes: 14, comments: 3, category: 'photo' },
    { id: -20108, avatar: '🌧️', author: '情绪收留所', location: '成都·高新区', created_at: '2026-04-02T13:40:00.000Z', content: '小声吐槽｜周报改到第三轮有点破防……同公司有同款吗？抱团取暖 🫠', has_image: false, tags: ['树洞'], likes: 45, comments: 19, category: '吐槽' },
    { id: -20109, avatar: '🆘', author: '救急小分队', location: '武汉·光谷', created_at: '2026-04-02T14:50:00.000Z', content: '求助：投影仪突然无信号，同公司有没有人懂 HDMI 优先级怎么切？五分钟要开会😭', has_image: false, tags: ['救命'], likes: 12, comments: 22, category: '求助' },
    { id: -20110, avatar: '🧃', author: '喝水提醒器', location: '西安·高新', created_at: '2026-04-02T15:55:00.000Z', content: '同公司小技巧｜饮水机高温档排队短，凉茶党可以避开午间高峰去打水。', has_image: false, tags: ['省力'], likes: 19, comments: 6, category: 'trick' },
    { id: -20111, avatar: '🚇', author: '地铁观测员', location: '重庆·光电园', created_at: '2026-04-02T17:03:00.000Z', content: '同公司通勤贴士：这趟线 8:10 前要上车，否则会体验「人肉罐头」。', has_image: false, tags: ['通勤'], likes: 33, comments: 12, category: 'trick' },
    { id: -20112, avatar: '🍜', author: '食堂观察员', location: '郑州·CBD', created_at: '2026-04-02T18:08:00.000Z', content: '同公司实测：牛肉面窗口周三最稳，酸汤窗口雨天排队久。', has_image: false, tags: ['吃货'], likes: 21, comments: 9, category: '干饭' },
    { id: -20113, avatar: '🧘', author: '班味治疗师', location: '天津·梅江', created_at: '2026-04-02T19:15:00.000Z', content: '放空角落｜五楼天台风大但很安静，同公司散心别待太久着凉。', has_image: false, tags: ['散心'], likes: 17, comments: 5, category: 'trick' },
    { id: -20114, avatar: '🧾', author: '报销课代表', location: '青岛·崂山', created_at: '2026-04-02T20:22:00.000Z', content: '报销小邪招：发票抬头和同公司 OA 模版逐字对齐，退回率骤降。', has_image: false, tags: ['小技巧'], likes: 29, comments: 15, category: 'trick' },
    { id: -20115, avatar: '🌙', author: '夜班通讯员', location: '厦门·湖里', created_at: '2026-04-02T21:30:00.000Z', content: '夜宵拼单别忘了留发票备注，同城同公司都有人走集体报销流程。', has_image: false, tags: ['夜宵'], likes: 11, comments: 4, category: 'trick' },
    { id: -20116, avatar: '🧊', author: '空调谈判专家', location: '长沙·麓谷', created_at: '2026-04-03T06:42:00.000Z', content: '夏天会议室像冰窖？同公司已试｜中段温度 + 披肩，体感最稳。', has_image: false, tags: ['办公'], likes: 22, comments: 7, category: '吐槽' },
    { id: -20117, avatar: '🪑', author: '工位寻宝人', location: '合肥·政务区', created_at: '2026-04-03T07:50:00.000Z', content: '想找安静角落写文档？这层东南角四座后排干扰少，同公司码农亲测有效。', has_image: false, tags: ['专注力'], likes: 18, comments: 5, category: 'photo' },
    { id: -20118, avatar: '🧃', author: '零食情报局', location: '宁波·东部新城', created_at: '2026-04-03T08:55:00.000Z', content: '全家新品低糖布丁不错，和同公司下午茶拼单可分摊配送费～', has_image: false, tags: ['零食'], likes: 15, comments: 3, category: 'place' },
    { id: -20119, avatar: '🦺', author: '安全员二号', location: '东莞·南城', created_at: '2026-04-03T10:01:00.000Z', content: '晚班下班走地下停车场请结伴，园区保安亭可借大手电，已帮同公司同学试过。', has_image: false, tags: ['求助'], likes: 9, comments: 6, category: 'help' },
    { id: -20120, avatar: '🧑‍🏫', author: 'mentor手记', location: '佛山·南海', created_at: '2026-04-03T11:10:00.000Z', content: '带新人少走弯路：第一周把「周报格式 + OKR对齐」两件事讲清，导师省心，新人也懂同公司语境。', has_image: false, tags: ['攻略'], likes: 26, comments: 10, category: 'trick' },
    { id: -20121, avatar: '🪪', author: '实习生联盟', location: '无锡·滨湖', created_at: '2026-04-03T12:15:00.000Z', content: '门禁经常抽风？刷新工卡背后芯片 + 袖口擦干，玄学但好用，推荐给同公司实习同学。', has_image: false, tags: ['避坑'], likes: 37, comments: 14, category: 'trick' },
    { id: -20122, avatar: '🧵', author: '穿搭避雷针', location: '昆明·官渡', created_at: '2026-04-03T13:20:00.000Z', content: '吐槽：报告厅空调直吹肩颈，正装外套救我狗命——同公司有同款肩颈痛吗……', has_image: false, tags: ['吐槽'], likes: 28, comments: 11, category: 'vent' },
    { id: -20123, avatar: '🧴', author: '香氛卧底', location: '福州·鼓楼', created_at: '2026-04-03T14:25:00.000Z', content: '厕所香薰换批次了呛鼻，已经和行政反馈，同城同公司等后续吧。', has_image: false, tags: ['避雷'], likes: 13, comments: 16, category: '吐槽' },
    { id: -20124, avatar: '🎧', author: '专注力插件', location: '济南·汉峪', created_at: '2026-04-03T15:30:00.000Z', content: '白噪音 + 降噪耳机组合拳，和同公司组队「番茄钟」效果不错。', has_image: false, tags: ['专注力'], likes: 20, comments: 8, category: 'trick' },
    { id: -20125, avatar: '🚲', author: '骑行搭子', location: '石家庄·裕华', created_at: '2026-04-03T16:35:00.000Z', content: '园区共享单车早高峰被抢光，同公司可拼「地铁 + 步行」组合拳，别死磕入口那一排。', has_image: false, tags: ['通勤'], likes: 16, comments: 5, category: 'trick' },
    { id: -20126, avatar: '🧊', author: '冰美式教派', location: '哈尔滨·群力', created_at: '2026-04-03T17:40:00.000Z', content: '摸鱼情报：这家咖啡外带杯盖不漏，适合拎回工位继续肝，同公司咖啡党可冲。', has_image: false, tags: ['摸鱼'], likes: 24, comments: 9, category: 'trick' },
    { id: -20127, avatar: '🧩', author: '流程翻译官', location: '惠州·江北', created_at: '2026-04-03T18:45:00.000Z', content: '把「等领导确认」翻译成「并排期与风险」，同公司周报通过率高一截——亲测话术可用。', has_image: false, tags: ['话术'], likes: 30, comments: 13, category: 'trick' },
  ];
  if (!_communityFeedFallbackPoolMemo) _communityFeedFallbackPoolMemo = rows.map((r) => adaptFeed(r));
  return _communityFeedFallbackPoolMemo;
}
let _communityFeedFallbackPoolMemo: AppFeedRow[] | null = null;

function makeSyntheticCommunityFeed(idx: number, activeTag: string, preferredCity: string | null): AppFeedRow {
  const id = -61000 - idx;
  const city = (preferredCity ?? '互联网').replace(/市$/, '');
  const loc = `${city}·写字楼园区`;
  const iso = new Date(Date.UTC(2026, 3, 10, 8, (idx * 7) % 60, 0)).toISOString();
  const base = {
    id,
    avatar: '✨',
    author: `${city}合成情报`,
    location: loc,
    time: formatRelativeTime(iso),
    hasImage: false,
    tags: ['同城', city],
    likes: 6 + (idx % 9),
    comments: 2 + (idx % 5),
    createdAt: iso,
  } satisfies Omit<AppFeedRow, 'content' | 'category'>;
  if (activeTag.includes('小邪招')) {
    return { ...base, content: `${city}同公司小邪招${idx + 1}：把会议纪要模板固定成三段式，复盘会少挨骂。`, category: 'trick' };
  }
  if (activeTag.includes('摸鱼')) {
    return { ...base, content: `${city}同公司摸鱼情报${idx + 1}：楼下绿化带长椅午间人少，放空 8 分钟很够用。`, category: 'trick' };
  }
  if (activeTag.includes('好去处')) {
    return { ...base, content: `${city}好去处｜园区咖啡安静位盘点，和同公司战友拼双人桌正合适。`, category: 'place' };
  }
  if (activeTag.includes('树洞吐槽')) {
    return { ...base, content: `${city}树洞吐槽：需求又插队了…同公司的谁懂😭这周还能不能准点走人。`, category: 'vent' };
  }
  if (activeTag.includes('办公区打卡')) {
    return { ...base, content: `${city}办公区打卡点位${idx + 1}：连廊南向自然光最适合拍周报配图。`, category: 'photo' };
  }
  if (activeTag.includes('紧急求助')) {
    return { ...base, content: `【紧急求助·${city}】VPN 抖动导致上不去内网，同公司有没有可用的备用线路？谢谢！`, category: 'help' };
  }
  return {
    ...base,
    content: `${city}热榜速递${idx + 1}：同公司拼车群本周新增两条路线，晚高峰可多一个选择。`,
    category: 'trick',
  };
}

type FeedCommentItem = {
  id: string;
  avatar: string;
  author: string;
  content: string;
  createdAt: string;
};

/** 详情页与列表「评论数」对齐：补足本地尚未拉取到的占位讨论（不写库，仅占位展示） */
const COLD_COMMENT_AUTHORS = [
  '路过工友',
  '同公司萌新',
  '楼下干饭侠',
  '茶水间卧底',
  '实习生 A',
  '匿名 PCG',
  '隔壁组同学',
  '通勤踩点王',
];

const COLD_COMMENT_AVATARS = ['🙂', '😺', '🍱', '☕', '🧭', '🪴', '🧃', '🐧', '📝', '🌿'];

const COLD_COMMENT_LINES = [
  '同路况，感谢你探路 ✊',
  '码住，午间我就去试一下错峰～',
  '太真实了，我们这边窗口也常排队😂',
  '同公司飘过，深有感触 +1',
  '这个情报救大命，差点白排十分钟',
  '补充：可以试试提前 10 分钟下单外带。',
  '已分享给饭搭群，大家都说有用。',
  '弱弱问一句，附近有安静写文档的角落吗？',
  '同求，周报日的救命消息。',
  '周末也在附近的话可约咖啡哈哈',
  '我们组也在吐槽会议室空调，懂你。',
  '+1，轻食那条我也踩过。',
  '收藏了！下次带新人直接甩这条。',
  '同公司拼车群有没有人顺路 xxx？（小声）',
  '感谢分享，避雷成功 🙏',
  '信息量好高，辛苦了～',
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildColdStartComments(feed: AppFeedRow, fillCount: number): FeedCommentItem[] {
  if (fillCount <= 0) return [];
  const rand = mulberry32(Math.abs(feed.id) * 10007 + feed.content.length);
  const tagHint = (feed.tags ?? []).find(Boolean)?.slice(0, 8) ?? '情报';
  const baseTs = feed.createdAt ? Date.parse(feed.createdAt) : Date.now();
  const out: FeedCommentItem[] = [];
  for (let i = 0; i < fillCount; i++) {
    const tmpl = COLD_COMMENT_LINES[i % COLD_COMMENT_LINES.length] ?? '谢谢分享，很实用～';
    const line =
      rand() > 0.65 ? `【${feed.location}｜${tagHint}】${tmpl}` : tmpl + (rand() > 0.5 ? '' : '');
    out.push({
      id: `seed-${feed.id}-${i}`,
      avatar: COLD_COMMENT_AVATARS[Math.floor(rand() * COLD_COMMENT_AVATARS.length)],
      author: COLD_COMMENT_AUTHORS[(i + Math.abs(feed.id)) % COLD_COMMENT_AUTHORS.length],
      content: line,
      createdAt: new Date(baseTs + (i + 1) * 333000).toISOString(),
    });
  }
  return out;
}

/** 详情展示：先有用户在本机发表的，再按需拼冷启动，条数对齐卡片的 comments（上限以免过长） */
function mergeFeedCommentsForDetail(
  feed: AppFeedRow | undefined,
  stored: FeedCommentItem[] | undefined
): FeedCommentItem[] {
  if (!feed) return [];
  const userPart = [...(stored ?? [])];
  const target = Math.min(Math.max(feed.comments ?? 0, userPart.length), 28);
  return [...userPart, ...buildColdStartComments(feed, Math.max(0, target - userPart.length))];
}

function normalizeTag(tag: string): string {
  return tag.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
}

function matchCommunityTag(feed: ReturnType<typeof adaptFeed>, activeTag: string): boolean {
  if (activeTag === '全部') return true;
  const text = `${feed.content ?? ''} ${(feed.tags ?? []).join(' ')}`.toLowerCase();
  const normalizedCategory = String(feed.category ?? 'other').toLowerCase();

  // 先按结构化 category 严格匹配，避免“吐槽混进好去处”
  if (activeTag.includes('小邪招') && normalizedCategory === 'trick') return true;
  if (activeTag.includes('摸鱼') && normalizedCategory === 'trick') return true;
  if (activeTag.includes('好去处') && (normalizedCategory === '干饭' || normalizedCategory === '打卡' || normalizedCategory === 'place')) return true;
  if (activeTag.includes('树洞吐槽') && (normalizedCategory === '吐槽' || normalizedCategory === 'vent')) return true;
  if (activeTag.includes('办公区打卡') && (normalizedCategory === '打卡' || normalizedCategory === 'photo')) return true;
  if (activeTag.includes('紧急求助') && (normalizedCategory === '求助' || normalizedCategory === 'help')) return true;

  // 再用关键词兜底（更严格，且加排除词）
  if (activeTag.includes('小邪招')) return /小邪招|捷径|技巧|妙招|攻略|避坑/.test(text);
  if (activeTag.includes('摸鱼')) return /摸鱼|划水|带薪|偷闲|下楼转转/.test(text);
  if (activeTag.includes('好去处')) return /好去处|咖啡|食堂|餐厅|推荐|人均|好吃/.test(text) && !/吐槽|崩溃|踩雷|求助|紧急/.test(text);
  if (activeTag.includes('树洞吐槽')) return /吐槽|树洞|崩溃|加班|踩雷|离谱|破防/.test(text);
  if (activeTag.includes('办公区打卡')) return /打卡|办公区|工位|园区|会议室|楼层|座位/.test(text);
  if (activeTag.includes('紧急求助')) return /求助|帮忙|紧急|救急|问一下|求建议/.test(text);
  return true;
}

function isCompanyRelatedFeed(feed: ReturnType<typeof adaptFeed>, company: string | null | undefined): boolean {
  const target = (company ?? '').trim();
  if (!target) return false;
  const haystack = `${feed.location ?? ''} ${feed.content ?? ''} ${(feed.tags ?? []).join(' ')}`.toLowerCase();
  return haystack.includes(target.toLowerCase()) || haystack.includes('同公司');
}

function buildFeedAiTip(feed: ReturnType<typeof adaptFeed>, cached?: string): string {
  if (cached) return cached;
  
  const text = `${feed.content ?? ''} ${(feed.tags ?? []).join(' ')}`;
  if (/求助|紧急|救急/.test(text)) return 'AI 建议：补充“时间/地点/具体诉求”三要素，能更快获得有效回复。';
  if (/吐槽|避雷|崩溃/.test(text)) return 'AI 建议：尽量聚焦事实与时间点，避免情绪化表达，更容易得到建设性建议。';
  if (/咖啡|食堂|餐厅|好吃|推荐/.test(text)) return 'AI 建议：加上人均、排队时段和口味标签，这条情报会更有参考价值。';
  if (/地铁|通勤|打车|拥堵|高峰/.test(text)) return 'AI 建议：可补充具体时间窗口，帮助同城同事错峰通勤。';
  return 'AI 提示：这条内容可再补一条“最有用的一句话结论”，阅读转化会更高。';
}

function buildCommunityDigest(
  feeds: ReturnType<typeof adaptFeed>[],
  company: string | null | undefined,
  city: string | null
): string {
  if (feeds.length === 0) return '当前暂无情报，成为第一个发布情报的人吧 ✨';
  const cityMatched = city ? feeds.filter((f) => (f.location ?? '').includes(city)) : [];
  const companyMatched = company ? feeds.filter((f) => isCompanyRelatedFeed(f, company)) : [];
  const topTag = feeds
    .flatMap((f) => f.tags ?? [])
    .map((t) => String(t))
    .find(Boolean);
  if (company && companyMatched.length > 0) {
    return `AI 摘要：已发现 ${companyMatched.length} 条与「${company}」相关情报，重点关注 ${topTag ?? '通勤与办公效率'}。`;
  }
  if (city && cityMatched.length > 0) {
    return `AI 摘要：当前同城「${city}」情报 ${cityMatched.length} 条，建议优先查看最近 2 小时更新内容。`;
  }
  return `AI 摘要：最近更新 ${feeds.length} 条，热点集中在 ${topTag ?? '通勤、干饭与办公区动态'}。`;
}

// --- ✨ 辅助函数：剪贴板复制 ---
const copyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  textArea.remove();
};

const STORAGE_KEYS = {
  guestId: 'unipass_guest_id',
  appState: 'unipass_app_state',
  userProfile: 'unipass_user_profile',
  joinedIds: 'unipass_joined_ids',
  dazis: 'unipass_dazis',
  achievements: 'unipass_achievements',
  activeTab: 'unipass_active_tab',
  aiChat: 'unipass_ai_chat',
  sceneIcebreakDone: 'unipass_scene_icebreak_done',
  userLocation: 'unipass_user_location',
  feedComments: 'unipass_feed_comments',
};

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const PROFILE_AVATARS = Array.from({ length: 12 }, (_, i) => `/头像/${i + 1}.png`);

/** 随机花名词库（前缀 + 后缀组合，不重复展示职位/真名） */
const NICKNAME_PREFIXES = ['云端','星际','代码','咖啡','番茄','彩虹','氧气','摸鱼','回旋','闪光','薄荷','柠檬','深夜','清晨','迷途'];
const NICKNAME_SUFFIXES = ['侦探','探险家','观察员','指挥官','情报员','搭子','飞行员','研究院','播报员','实习生','翻译官','助理','密探','雷达','小队'];
function generateRandomNickname(): string {
  const p = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const s = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
  return `${p}${s}`;
}

/** 人设步骤里每张头像图的微调（转成 img 的内联样式） */
type PersonaSetupAvatarTune = {
  /** 左右平移（px）：正数向右、负数向左 */
  x?: number;
  /** 上下平移（px）：正数向下、负数向上 */
  y?: number;
  /** 缩放，默认 1；略大于 1 可把角色放大填满方格 */
  scale?: number;
  /**
   * 裁切锚点（object-position）。不设时默认 `center top`：
   * `object-cover` 若用浏览器默认的垂直居中，竖长素材会上下对称裁切，耳朵/头发容易被「削顶」。
   */
  objectPosition?: string;
};

function personaSetupAvatarImgStyle(t: PersonaSetupAvatarTune = {}): React.CSSProperties {
  const x = t.x ?? 0;
  const y = t.y ?? 0;
  const scale = t.scale ?? 1;
  const out: React.CSSProperties = {};
  out.objectPosition =
    t.objectPosition != null && t.objectPosition !== '' ? t.objectPosition : 'center top';
  if (x !== 0 || y !== 0 || scale !== 1) {
    out.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    out.transformOrigin = 'center center';
  }
  return out;
}

/**
 * 【职场人设】头像宫格：每张图在方格里怎么摆，只改这个数组。
 *
 * - 搜索：`PERSONA_SETUP_AVATAR_IMG_TUNING`
 * - 顺序：第 1 条 = `/头像/1.png` … 第 12 条 = `/头像/12.png`
 *
 * 例：`{ x: -6, y: -4, scale: 1.06 }`（y 正会下移，易在 overflow 下裁掉头顶）、`{ objectPosition: '52% 12%' }`。
 */
const PERSONA_SETUP_AVATAR_IMG_TUNING: PersonaSetupAvatarTune[] = [
  {}, // /头像/1.png
  { x: 1 }, // /头像/2.png
  {}, // /头像/3.png
  {}, // /头像/4.png
  {}, // /头像/5.png
  {}, // /头像/6.png
  {}, // /头像/7.png
  { x: 2 }, // /头像/8.png
  {}, // /头像/9.png
  {}, // /头像/10.png
  {}, // /头像/11.png
  { x: 3 }, // /头像/12.png
];

function isImageAvatar(avatar?: string | null) {
  if (!avatar) return false;
  return avatar.startsWith('/') || avatar.startsWith('http://') || avatar.startsWith('https://');
}

function AvatarVisual({
  avatar,
  fallback = '🐧',
  className,
  imgClassName = 'h-full w-full object-cover',
  imgStyle,
}: {
  avatar?: string | null;
  fallback?: string;
  className?: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
}) {
  const display = avatar?.trim() || fallback;
  return (
    <span className={className}>
      {isImageAvatar(display) ? (
        <img src={display} alt="头像" className={imgClassName} style={imgStyle} loading="lazy" />
      ) : (
        display
      )}
    </span>
  );
}

const EditProfileModal = ({
  profile,
  onClose,
  onSave,
}: {
  profile: { nickname: string; company: string; gender: string; role: string; avatar: string } | null;
  onClose: () => void;
  onSave: (next: { nickname: string; company: string; gender: string; role: string; avatar: string }) => void;
}) => {
  const [form, setForm] = useState({
    nickname: profile?.nickname ?? '',
    company: profile?.company ?? '',
    gender: profile?.gender ?? '',
    role: profile?.role ?? '',
    avatar: profile?.avatar ?? PROFILE_AVATARS[0],
  });
  const AVATARS = PROFILE_AVATARS;

  const canSave = form.nickname.trim() && form.company.trim() && form.role.trim() && form.gender.trim();

  return (
    <div className="absolute inset-0 z-[1300] flex items-end">
      <div className="absolute inset-0 bg-[#2F3E46]/32 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative max-h-[85%] w-full overflow-y-auto rounded-t-[40px] ${HOME_SURFACE.background} p-6 pb-8 shadow-[0_-24px_70px_-30px_rgba(47,62,70,0.35)] no-scrollbar`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-black text-[#2F3E46]">修改个人资料</h3>
          <button onClick={onClose} className={`${UI.subtleButton} p-2`}>
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={form.nickname}
            onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
            placeholder="昵称"
            className={`w-full px-4 py-3 text-[14px] font-medium ${UI.input}`}
          />
          <input
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            placeholder="公司（建议带城市，如深圳·腾讯）"
            className={`w-full px-4 py-3 text-[14px] font-medium ${UI.input}`}
          />
          <input
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            placeholder="岗位，如产品实习生"
            className={`w-full px-4 py-3 text-[14px] font-medium ${UI.input}`}
          />
          <select
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            className={`w-full px-4 py-3 text-[14px] font-medium ${UI.input}`}
          >
            <option value="">选择性别</option>
            <option value="female">女生</option>
            <option value="male">男生</option>
            <option value="other">其他</option>
          </select>
          <div className="flex gap-2 flex-wrap pt-1">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setForm((p) => ({ ...p, avatar: a }))}
                className={`h-10 w-10 overflow-hidden rounded-[16px] border text-lg transition-all ${form.avatar === a ? 'border-[#87A382]/40 bg-white/90 shadow-[0_10px_22px_-16px_rgba(64,100,120,0.45)]' : 'border-white/70 bg-white/58'}`}
              >
                <AvatarVisual avatar={a} className="flex h-full w-full items-center justify-center text-lg" />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className={`flex-1 py-3 text-[13px] font-black ${UI.subtleButton}`}>
            取消
          </button>
          <button
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onSave({
                nickname: form.nickname.trim(),
                company: form.company.trim(),
                role: form.role.trim(),
                gender: form.gender.trim(),
                avatar: form.avatar,
              });
              onClose();
            }}
            className={`flex-1 py-3 text-[13px] font-black transition-all ${
              canSave ? UI.primaryButton : 'rounded-full border border-white/70 bg-white/55 text-[#56756D]/35'
            }`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem(STORAGE_KEYS.guestId);
  if (existing) return existing;
  const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(STORAGE_KEYS.guestId, generated);
  return generated;
}

function defaultAiWelcome(profile: { nickname: string } | null): { role: 'user' | 'assistant'; content: string }[] {
  return [
    {
      role: 'assistant' as const,
      content: `👋 你好，${profile?.nickname || '实习生'}！我是 UniAI，你的专属职场 AI 助手。\n\n有什么可以帮你的吗？比如润色邮件、职场建议、心情疏导...`,
    },
  ];
}

// --- ✨ 1. 大厂级三屏引导页 (Onboarding) ---
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [showSplashEnter, setShowSplashEnter] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageFailedCircle, setImageFailedCircle] = useState(false);
  const [imageFailedBreakIce, setImageFailedBreakIce] = useState(false);
  const [imageFailedAssistant, setImageFailedAssistant] = useState(false);
  /** 大图 steps 1–4：主视觉解码晚于文字，等图 load/缓存命中后再淡出底部文案，避免「字先闪现」 */
  const [guideHeroReady, setGuideHeroReady] = useState(true);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    ['/splash-ip-cloud.png', '/dazi-guide.png', '/quanzi-guide.png', '/pobing-guide.png', '/ai-assistant-guide.png', '/onboarding-ip.png'].forEach((src) => {
      const im = new window.Image();
      im.fetchPriority = 'high';
      im.src = src;
    });
  }, []);

  useEffect(() => {
    if (step >= 1 && step <= 4) setGuideHeroReady(false);
    else setGuideHeroReady(true);
  }, [step]);

  useEffect(() => {
    if (step < 1 || step > 4) return;
    const id = window.setTimeout(() => setGuideHeroReady(true), 4500);
    return () => window.clearTimeout(id);
  }, [step]);

  const bindGuideHeroImg = (el) => {
    if (el?.complete && el.naturalWidth > 0) setGuideHeroReady(true);
  };

  useEffect(() => {
    // 第 1 屏是品牌 Splash，不自动跳转；其余引导屏自动轮播
    if (step === 0) return;
    const timer = setTimeout(() => {
      if (step < 4) setStep(s => s + 1);
    }, 5000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 0) {
      setShowSplashEnter(false);
      return;
    }
    setShowSplashEnter(false);
    const timer = setTimeout(() => {
      setShowSplashEnter(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step === 1) setImageFailed(false);
    if (step === 2) setImageFailedCircle(false);
    if (step === 3) setImageFailedBreakIce(false);
    if (step === 4) setImageFailedAssistant(false);
  }, [step]);

  const handleTap = (e) => {
    // 引导页改为以“滑动”为主，避免轻触左右区域误翻页
    if (step >= 1 && step <= 4) return;
    if (step === 0) return;
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.3 && step > 0) setStep(s => s - 1);
    if (x > width * 0.7 && step < 4) setStep(s => s + 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    // 仅在 4 个引导页启用左右滑动翻页
    if (step < 1 || step > 4) return;
    if (!touchStartX.current) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = (touchStartY.current ?? 0) - e.changedTouches[0].clientY;
    const isHorizontalSwipe = Math.abs(diffX) > 24 && Math.abs(diffX) > Math.abs(diffY) * 1.1;
    if (isHorizontalSwipe) {
      if (diffX > 0 && step < 4) setStep(s => s + 1);
      if (diffX < 0 && step > 1) setStep(s => s - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const STEPS = [
    {
      title: "先找到你的职场搭子",
      subtitle: "主打找搭子：午饭、通勤、学习、摸鱼，快速匹配同频伙伴。",
      visual: null
    },
    {
      title: "同城情报，实时更新",
      subtitle: "除了找搭子，你还能看同城/同公司的通勤、干饭、办公情报。",
      visual: (
        <div className="relative flex items-center justify-center w-40 h-40">
          <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(249,216,177,0.45)] border-4 border-white/60 relative z-10" style={{ background: `linear-gradient(135deg, ${COLORS.amber}, #FFF)` }}>
            <MapPin size={36} style={{ color: COLORS.ink }} />
          </motion.div>
          <div className="absolute w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: COLORS.amber, opacity: 0.3 }} />
        </div>
      )
    },
    {
      title: "AI 助手，帮你轻松开场",
      subtitle: "不会破冰也没关系：AI嘴替、评论建议、私聊话术一键生成。",
      visual: (
        <div className="relative flex items-center justify-center w-48 h-40">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }} className="absolute left-8 w-20 h-20 rounded-[22px] bg-white border border-slate-100 shadow-lg flex items-center justify-center">
            <Bot size={34} style={{ color: COLORS.sage }} />
          </motion.div>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }} className="absolute right-8 w-20 h-20 rounded-[22px] bg-white border border-slate-100 shadow-lg flex items-center justify-center">
            <ShieldCheck size={34} style={{ color: COLORS.ink }} />
          </motion.div>
        </div>
      )
    }
  ];

  const guideStep = Math.max(0, step - 1);
  const onboardingCtaBase =
    "h-[56px] w-[240px] rounded-full text-[18px] font-bold text-white [text-shadow:0_1px_2px_rgba(47,62,70,0.45),0_0_24px_rgba(47,62,70,0.12)] transition-all duration-300 active:scale-95 pointer-events-auto border border-white/40 backdrop-blur-xl shadow-[0_12px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-10px_18px_rgba(47,62,70,0.06)]";
  const onboardingTitleBase = "text-[#15173d] text-[34px] font-bold leading-[1.25] tracking-wide";
  const onboardingSubtitleBase = "text-[16px] leading-[1.6] font-medium";

  return (
    <div 
      className="absolute inset-0 overflow-hidden flex flex-col"
      style={step === 0 ? { background: '#EEEADC' } : { background: 'linear-gradient(135deg, #E8EFE7 0%, #FCFDFB 52%, #FDF8F2 100%)' }}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {step >= 1 && (
        <div className="absolute top-[84px] left-1/2 -translate-x-1/2 w-[172px] flex gap-2 z-50">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="flex-1 h-[2.5px] rounded-full overflow-hidden relative border border-white/35 bg-white/20 backdrop-blur-[1px]"
            >
              <motion.div
                className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-[#8fc4ff]/92 via-[#d9c8f6]/92 to-[#ffe3a8]/92 shadow-[0_0_5px_rgba(255,255,255,0.35)]"
                initial={{ width: i < guideStep ? '100%' : '0%' }}
                animate={{ width: i < guideStep ? '100%' : i === guideStep ? '100%' : '0%' }}
                transition={{ duration: i === guideStep ? 5 : 0, ease: 'linear' }}
              />
            </div>
          ))}
        </div>
      )}
      
      {step >= 1 && step <= 4 && (
        <button
          type="button"
          aria-label="返回上一页"
          onClick={(e) => {
            e.stopPropagation();
            setStep((s) => Math.max(0, s - 1));
          }}
          className="absolute top-20 left-5 z-50 flex items-center justify-center rounded-full bg-[#2F3E46]/5 px-4 py-1.5 text-[#2F3E46] backdrop-blur-md transition-transform active:scale-95"
        >
          <ArrowLeft size={14} strokeWidth={2.5} className="block shrink-0" aria-hidden />
        </button>
      )}

      {step >= 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="absolute top-20 right-5 z-50 flex items-center justify-center rounded-full bg-[#2F3E46]/5 px-4 py-1.5 text-[12px] font-bold leading-none text-[#2F3E46] backdrop-blur-md transition-transform active:scale-95"
        >
          跳过
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`flex-1 flex flex-col relative ${(step >= 1 && step <= 4) ? '' : 'px-7 pt-24'}`}
        >
          {step === 0 ? (
            <>
              {/* Splash background gradient blob */}
              <div
                className="absolute left-[-23px] top-[-84px] w-[502px] h-[981px] pointer-events-none"
                style={{ background: 'linear-gradient(157.713deg, rgb(195, 236, 217) 0%, rgb(251, 237, 206) 60.799%, rgb(231, 205, 241) 92.809%)' }}
              />

              {/* Logo + wordmark */}
              <div className="absolute left-0 top-[124px] w-full h-[194px] flex flex-col items-center pointer-events-none">
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[72px] h-[72px] rounded-[22px] shadow-[0_8px_32px_rgba(110,206,184,0.45),0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-white text-[38px] font-black"
                  style={{ background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)' }}
                >
                  U
                </motion.div>
                <h1 className="mt-4 text-[42px] leading-[42px] font-extrabold tracking-[-0.5px] bg-clip-text text-transparent"
                  style={{ fontFamily: 'Sora, Inter, sans-serif', backgroundImage: 'linear-gradient(99.1035deg, rgb(110, 206, 184) 3.4422%, rgb(134, 204, 168) 70.656%, rgb(240, 196, 96) 99.069%)' }}>
                  Unipass
                </h1>
                <p className="mt-[10px] text-[12px] tracking-[3px] uppercase text-[rgba(40,60,50,0.62)]"
                  style={{ fontFamily: 'Inter, sans-serif' }}>
                  FIND YOUR WORK BUDDY
                </p>
              </div>

              {/* Illustration area */}
              <div className="absolute left-[2px] top-[304px] w-[388px] h-[351px] pointer-events-none overflow-hidden">
                {/* Ambient color halos */}
                <motion.div
                  className="absolute left-[34px] top-[108px] w-[150px] h-[150px] rounded-full blur-[34px]"
                  style={{ background: 'radial-gradient(circle, rgba(129,232,198,0.36) 0%, rgba(129,232,198,0.06) 68%, rgba(129,232,198,0) 100%)' }}
                  animate={{ opacity: [0.26, 0.42, 0.26], scale: [0.96, 1.06, 0.96] }}
                  transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute right-[20px] top-[130px] w-[138px] h-[138px] rounded-full blur-[30px]"
                  style={{ background: 'radial-gradient(circle, rgba(211,178,245,0.34) 0%, rgba(211,178,245,0.06) 70%, rgba(211,178,245,0) 100%)' }}
                  animate={{ opacity: [0.2, 0.36, 0.2], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                />

                {/* Soft decorative bubbles */}
                <motion.div
                  className="absolute left-[46px] top-[54px] w-[30px] h-[30px] rounded-full border border-white/75 bg-white/28 backdrop-blur-[2px] shadow-[0_0_16px_rgba(255,255,255,0.35)]"
                  animate={{ y: [0, -10, 0], opacity: [0.62, 0.95, 0.62], scale: [1, 1.12, 1] }}
                  transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute right-[52px] top-[82px] w-[20px] h-[20px] rounded-full border border-white/70 bg-white/24 shadow-[0_0_14px_rgba(255,255,255,0.3)]"
                  animate={{ y: [0, -8, 0], x: [0, 3, 0], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.div
                  className="absolute left-[82px] bottom-[98px] w-[15px] h-[15px] rounded-full border border-white/65 bg-white/22 shadow-[0_0_10px_rgba(255,255,255,0.28)]"
                  animate={{ y: [0, -6, 0], opacity: [0.42, 0.82, 0.42] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                />

                {/* Soft star glints */}
                <motion.div
                  className="absolute right-[42px] bottom-[138px] w-[18px] h-[18px] drop-shadow-[0_0_8px_rgba(255,255,255,0.55)]"
                  animate={{ scale: [0.9, 1.26, 0.9], rotate: [0, 14, 0], opacity: [0.52, 0.98, 0.52] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-[18px] rounded-full bg-white/85" />
                  <span className="absolute top-1/2 left-0 -translate-y-1/2 w-[18px] h-[2px] rounded-full bg-white/85" />
                </motion.div>
                <motion.div
                  className="absolute left-[38px] bottom-[160px] w-[14px] h-[14px] drop-shadow-[0_0_7px_rgba(255,255,255,0.45)]"
                  animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.4, 0.86, 0.4] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
                >
                  <span className="absolute left-1/2 top-0 -translate-x-1/2 w-[1.6px] h-[14px] rounded-full bg-white/78" />
                  <span className="absolute top-1/2 left-0 -translate-y-1/2 w-[14px] h-[1.6px] rounded-full bg-white/78" />
                </motion.div>

                <motion.img
                  src="/splash-ip-cloud.png"
                  alt="Unipass splash mascot"
                  className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-[372px] max-w-none object-contain"
                  animate={{
                    y: [0, -3, 0],
                    scale: [0.985, 1.02, 0.992, 1]
                  }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Bottom hint */}
              <div className="absolute left-0 right-0 bottom-[96px] h-[56px] flex flex-col items-center">
                <AnimatePresence>
                  {showSplashEnter && (
                    <motion.button
                      key="splash-enter-btn"
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStep(1);
                      }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="group pointer-events-auto relative isolate h-[52px] min-w-[196px] px-7 rounded-[24px] overflow-hidden border border-white/45 text-[14px] tracking-[0.6px] text-[#20322B] font-semibold transition-all backdrop-blur-xl bg-white/22 shadow-[0_10px_26px_rgba(68,95,85,0.2),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-8px_14px_rgba(255,255,255,0.08)] hover:bg-white/28 active:bg-white/24"
                      style={{ fontFamily: 'Inter, sans-serif', WebkitBackdropFilter: 'blur(16px) saturate(135%)' }}
                    >
                      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0.18)_36%,rgba(255,255,255,0.06)_65%,rgba(255,255,255,0.2)_100%)]" />
                      <span className="pointer-events-none absolute top-[1px] left-[16px] right-[16px] h-[1px] bg-white/70 blur-[0.4px]" />
                      <span className="pointer-events-none relative inline-flex items-center gap-1.5">
                        立即进入
                        <ChevronRight size={15} className="opacity-75 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <div className="absolute inset-0 bg-white" />
              <div className="relative z-10 w-full h-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img
                    src="/dazi-guide.png"
                    alt="搭子引导图"
                    ref={bindGuideHeroImg}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageFailed ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setGuideHeroReady(true)}
                    onError={(e) => {
                      setGuideHeroReady(true);
                      setImageFailed(true);
                      e.currentTarget.src = '/onboarding-ip.png';
                    }}
                  />
                  {imageFailed && (
                    <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#ffc9d6] via-[#fbe8d5] to-[#c2ebc8]" />
                      <div className="absolute top-[20%] left-0 w-full flex justify-center items-center z-10 pointer-events-none">
                        <div className="w-56 h-56 bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 rounded-3xl flex flex-col items-center justify-center text-gray-600 shadow-sm rotate-[-2deg]">
                          <span className="text-4xl mb-3">🐧</span>
                          <span className="text-sm font-medium text-center px-4 text-gray-700 leading-relaxed">
                            预览环境无法读取本地图
                            <br />
                            <span className="text-xs text-gray-500 mt-1 block">放入搭子.png即可显示</span>
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-[45%] left-0 w-full h-[55%] z-0">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute -top-[19.5%] left-0 w-full h-[20%] text-white">
                          <path d="M0,100 C30,70 60,30 100,0 L100,100 Z" fill="currentColor" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-14 w-full flex flex-col items-center transition-all duration-[420ms] ease-out ${guideHeroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
                >
                  <h2 className={`${onboardingTitleBase} mb-4 pointer-events-none`}>
                    搭子，
                    <br />
                    马上就位
                  </h2>
                  <p className={`${onboardingSubtitleBase} text-[#848892] mb-12 pointer-events-none`}>
                    饭搭子、遛娃搭子、学习搭子，
                    <br />
                    一键找到同路人
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStep(2);
                    }}
                    aria-label="下一步"
                    className={`${onboardingCtaBase} bg-gradient-to-r from-[#ea9aaf] via-[#dcc67e] to-[#5fba8f] hover:from-[#e388a4] hover:via-[#d1b768] hover:to-[#52ad82]`}
                    style={{ WebkitBackdropFilter: 'blur(12px) saturate(138%)' }}
                  >
                    下一步
                  </button>
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="absolute inset-0 bg-white" />
              <div className="relative z-10 w-full h-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img
                    src="/quanzi-guide.png"
                    alt="圈子情报背景"
                    ref={bindGuideHeroImg}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageFailedCircle ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setGuideHeroReady(true)}
                    onError={() => {
                      setGuideHeroReady(true);
                      setImageFailedCircle(true);
                    }}
                  />

                  {imageFailedCircle && (
                    <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#ffcce0] via-[#e5d5ff] to-[#cbe5ff]" />
                      <div className="absolute top-[20%] left-0 w-full flex justify-center items-center z-10 pointer-events-none">
                        <div className="w-56 h-56 bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 rounded-3xl flex flex-col items-center justify-center text-gray-600 shadow-sm rotate-[2deg]">
                          <span className="text-4xl mb-3">🤓</span>
                          <span className="text-sm font-medium text-center px-4 text-gray-700 leading-relaxed">
                            预览环境无法读取本地图
                            <br />
                            <span className="text-xs text-gray-500 mt-1 block">放入 圈子.png 即可显示</span>
                          </span>
                        </div>
                      </div>

                      <div className="absolute top-[45%] left-0 w-full h-[55%] z-0">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute -top-[25%] left-0 w-full h-[25.5%] text-white">
                          <polygon points="0,100 0,80 100,20 100,100" fill="currentColor" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-14 w-full flex flex-col items-center transition-all duration-[420ms] ease-out ${guideHeroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
                >
                  <h2 className={`${onboardingTitleBase} mb-4 pointer-events-none`}>
                    圈子情报，实时开刷
                  </h2>
                  <p className={`${onboardingSubtitleBase} text-[#848892] mb-12 pointer-events-none`}>
                    同城同公司新鲜动态，摸鱼、吐槽、好去处全都有
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStep(3);
                    }}
                    className={`${onboardingCtaBase} bg-gradient-to-r from-[#ee7faa] to-[#7f65e0] hover:from-[#e66f9f] hover:to-[#7356d8]`}
                    style={{ WebkitBackdropFilter: 'blur(12px) saturate(138%)' }}
                  >
                    下一步
                  </button>
                </div>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <div className="absolute inset-0 bg-white" />
              <div className="relative z-10 w-full h-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-white">
                  <img
                    src="/pobing-guide.png"
                    alt="破冰话术背景"
                    ref={bindGuideHeroImg}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageFailedBreakIce ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setGuideHeroReady(true)}
                    onError={() => {
                      setGuideHeroReady(true);
                      setImageFailedBreakIce(true);
                    }}
                  />

                  {imageFailedBreakIce && (
                    <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#9bc4ff] via-[#dbe6ff] to-[#fef3d5]" />
                      <div className="absolute top-[20%] left-0 w-full flex justify-center items-center z-10 pointer-events-none">
                        <div className="w-56 h-56 bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 rounded-3xl flex flex-col items-center justify-center text-gray-600 shadow-sm rotate-[-2deg]">
                          <span className="text-4xl mb-3">💬</span>
                          <span className="text-sm font-medium text-center px-4 text-gray-700 leading-relaxed">
                            预览环境无法读取本地图
                            <br />
                            <span className="text-xs text-gray-500 mt-1 block">放入 破冰.png 即可显示</span>
                          </span>
                        </div>
                      </div>

                      <div className="absolute top-[45%] left-0 w-full h-[55%] z-0">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute -top-[25%] left-0 w-full h-[25.5%] text-white">
                          <polygon points="0,100 0,40 100,80 100,100" fill="currentColor" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-14 w-full flex flex-col items-center transition-all duration-[420ms] ease-out ${guideHeroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
                >
                  <h2 className={`${onboardingTitleBase} mb-4 text-center pointer-events-none`}>
                    不会开场？ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e19a79] to-[#a47db6]">AI</span>替你说
                  </h2>
                  <p className={`${onboardingSubtitleBase} text-[#848892] mb-12 text-center pointer-events-none`}>
                    评论、私聊、破冰话术一键生成，社交不冷场
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStep(4);
                    }}
                    className={`${onboardingCtaBase} bg-gradient-to-r from-[#7594ef] via-[#c9a8ea] to-[#e8c97a] hover:from-[#6786e8] hover:via-[#bd96e5] hover:to-[#e0bc66]`}
                    style={{ WebkitBackdropFilter: 'blur(12px) saturate(138%)' }}
                  >
                    下一步
                  </button>
                </div>
              </div>
            </>
          ) : step === 4 ? (
            <>
              <div className="absolute inset-0 bg-white" />
              <div className="relative z-10 w-full h-full overflow-hidden">
                <div className="absolute inset-0 z-0 bg-white">
                  <img
                    src="/ai-assistant-guide.png"
                    alt="职场AI助手背景"
                    ref={bindGuideHeroImg}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageFailedAssistant ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setGuideHeroReady(true)}
                    onError={() => {
                      setGuideHeroReady(true);
                      setImageFailedAssistant(true);
                    }}
                  />

                  {imageFailedAssistant && (
                    <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#87a4bf] via-[#d0dbe5] to-[#ffffff]" />
                      <div className="absolute top-[20%] left-0 w-full flex justify-center items-center z-10 pointer-events-none">
                        <div className="w-56 h-56 bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 rounded-3xl flex flex-col items-center justify-center text-gray-600 shadow-sm rotate-[-2deg]">
                          <span className="text-4xl mb-3">💼</span>
                          <span className="text-sm font-medium text-center px-4 text-gray-700 leading-relaxed">
                            预览环境无法读取本地图
                            <br />
                            <span className="text-xs text-gray-500 mt-1 block">放入 AI助手.png 即可显示</span>
                          </span>
                        </div>
                      </div>

                      <div className="absolute top-[45%] left-0 w-full h-[55%] z-0">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute -top-[25%] left-0 w-full h-[25.5%] text-white">
                          <polygon points="0,100 0,30 100,70 100,100" fill="currentColor" />
                        </svg>
                        <div className="absolute top-0 left-0 w-full h-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`absolute inset-x-0 bottom-0 z-10 px-6 pb-14 w-full flex flex-col items-center transition-all duration-[420ms] ease-out ${guideHeroReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
                >
                  <h2 className={`${onboardingTitleBase} mb-4 text-center z-20 pointer-events-none`}>
                    <span className="relative inline-block z-10">
                      职场消息
                      <svg className="absolute top-[60%] left-[-5%] w-[110%] h-[55%] -z-10 opacity-90" viewBox="0 0 100 40" fill="none" preserveAspectRatio="none">
                        <path d="M2,12 Q30,5 95,15" stroke="#84b8ed" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M5,24 Q40,15 90,26" stroke="#f5a4b5" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M10,36 Q50,25 85,37" stroke="#fce29f" strokeWidth="4.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    ，不再反复斟酌
                  </h2>

                  <p className={`${onboardingSubtitleBase} text-[#4a4d5e] mb-12 text-center pointer-events-none`}>
                    请假、催进度、汇报、拒绝、致谢等
                    <br />
                    职场场景，一键生成更稳妥的话术
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete();
                    }}
                    className={`${onboardingCtaBase} bg-gradient-to-r from-[#679dd9] via-[#9fb4c8] to-[#c9a66e] hover:from-[#5a91d2] hover:via-[#90aaba] hover:to-[#bd9960]`}
                    style={{ WebkitBackdropFilter: 'blur(12px) saturate(138%)' }}
                  >
                    立即体验
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="pointer-events-none">
                <p className="text-[30px] font-black tracking-tight mb-2" style={{ color: COLORS.sage }}>
                  {String(step + 1).padStart(2, '0')} <span className="text-slate-300">/ 04</span>
                </p>
                <h2 className="text-[44px] leading-[1.05] font-black mb-3 tracking-tight" style={{ color: COLORS.ink }}>
                  {STEPS[Math.min(step, 2)].title}
                </h2>
                <p className="text-[16px] font-medium leading-relaxed max-w-[90%]" style={{ color: COLORS.ink, opacity: 0.62 }}>
                  {STEPS[Math.min(step, 2)].subtitle}
                </p>
              </div>

              <div className="flex-1 flex items-end justify-center pointer-events-none">
                {STEPS[Math.min(step, 2)].visual}
              </div>

              <div className="pb-8 pt-2 flex flex-col items-center w-full gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (step < 4) setStep((s) => s + 1);
                    else onComplete();
                  }}
                  className="w-full max-w-[320px] py-[17px] rounded-[20px] font-black text-[20px] text-white bg-[#171A1D] active:scale-95 transition-transform pointer-events-auto"
                >
                  {step < 4 ? '下一步' : '立即找搭子'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="text-[14px] text-slate-400 font-bold py-1 px-3 pointer-events-auto"
                >
                  跳过
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- ✨ 2. 大厂级极简登录页 (Login) ---
const Login = ({ onLogin }) => {
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mode, setMode] = useState<'main' | 'phone'>('main');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testCode, setTestCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const checkAgreed = () => {
    if (!agreed) { setShowError(true); setTimeout(() => setShowError(false), 600); return false; }
    return true;
  };

  const handleWechatLogin = () => { if (checkAgreed()) onLogin(); };

  const handleSendCode = () => {
    if (phone.length < 11 || sending || countdown > 0) return;
    setSending(true);
    const generated = String(Math.floor(1000 + Math.random() * 9000));
    setTestCode(generated);
    setTimeout(() => { setCodeSent(true); setCountdown(60); setSending(false); }, 800);
  };

  const handleVerify = () => {
    if (code === testCode) { if (checkAgreed()) onLogin(); }
    else { setCodeError(true); setTimeout(() => setCodeError(false), 600); }
  };

  const AgreementRow = () => (
    <div onClick={() => setAgreed(a => !a)} className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
      <motion.div animate={showError ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}
        className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agreed ? 'border-transparent' : 'border-slate-300 bg-white'}`}
        style={agreed ? { backgroundImage: LOGIN_BRAND_GRADIENT } : {}}
      >
        <CheckCircle2 size={12} className={`text-white transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} />
      </motion.div>
      <span className={`text-[11px] font-medium transition-colors ${showError ? 'text-red-500' : 'text-slate-400'}`}>
        登录即代表同意{' '}
        <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#6eceb8] via-[#86cca8] to-[rgb(240,196,96)]">《用户协议》</span>
        {' '}与{' '}
        <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#6eceb8] via-[#86cca8] to-[rgb(240,196,96)]">《隐私政策》</span>
      </span>
    </div>
  );

  if (mode === 'phone') {
    return (
      <div className="absolute inset-0 bg-[#F5F7F5] flex flex-col overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#87A382]/10 rounded-full blur-3xl pointer-events-none" />
        <button
          type="button"
          onClick={() => {
            setMode('main');
            setPhone('');
            setCode('');
            setCodeSent(false);
            setCountdown(0);
          }}
          className="absolute top-16 left-5 z-50 flex p-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm active:scale-90 transition-transform cursor-pointer touch-manipulation"
        >
          <ArrowLeft size={20} style={{ color: COLORS.ink }} />
        </button>
        <div className="relative z-0 mt-8 flex flex-1 flex-col justify-center px-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h2 className="text-[28px] font-black tracking-tight mb-1" style={{ color: COLORS.ink }}>手机号登录</h2>
            <p className="text-[13px] font-medium text-slate-400 mb-8">验证后即可进入 UniPass</p>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="flex gap-3 items-center bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm mb-3">
              <span className="text-[14px] font-black text-slate-400 shrink-0">+86</span>
              <div className="w-px h-5 bg-slate-200 shrink-0" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="输入手机号" className="flex-1 bg-transparent text-[16px] font-black focus:outline-none placeholder:text-slate-300"
                style={{ color: COLORS.ink }} />
            </div>
            {codeSent && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <motion.div animate={codeError ? { x: [-6, 6, -6, 6, 0] } : {}} transition={{ duration: 0.3 }}
                  className={`flex gap-3 items-center bg-white rounded-[20px] p-4 border shadow-sm mb-2 transition-colors ${codeError ? 'border-red-300' : 'border-slate-100'}`}>
                  <input type="number" value={code} onChange={e => setCode(e.target.value.slice(0, 4))}
                    placeholder="输入 4 位验证码" className="flex-1 bg-transparent text-[20px] font-black focus:outline-none placeholder:text-slate-300 tracking-[0.3em]"
                    style={{ color: COLORS.ink }} />
                </motion.div>
                <div className="px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-100 mb-3">
                  <span className="text-[11px] font-bold text-amber-600">🧪 测试模式 · 你的验证码是 <span className="font-black text-amber-700 text-[13px]">{testCode}</span></span>
                </div>
              </motion.div>
            )}
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col gap-3">
            {!codeSent ? (
              <button onClick={handleSendCode} disabled={phone.length < 11 || sending}
                className={`w-full py-[18px] rounded-[24px] font-black text-[16px] transition-all active:scale-95 ${phone.length >= 11 && !sending ? 'text-white shadow-[0_10px_28px_rgba(110,206,184,0.38)]' : 'text-slate-400 bg-slate-100'}`}
                style={phone.length >= 11 && !sending ? { backgroundImage: LOGIN_BRAND_GRADIENT } : {}}>
                {sending ? '发送中...' : '发送验证码'}
              </button>
            ) : (
              <>
                <button onClick={handleVerify} disabled={code.length < 4}
                  className={`w-full py-[18px] rounded-[24px] font-black text-[16px] transition-all active:scale-95 ${code.length >= 4 ? 'text-white shadow-[0_10px_28px_rgba(110,206,184,0.38)]' : 'text-slate-400 bg-slate-100'}`}
                  style={code.length >= 4 ? { backgroundImage: LOGIN_BRAND_GRADIENT } : {}}>
                  验证并登录
                </button>
                <button onClick={countdown <= 0 ? handleSendCode : undefined}
                  className={`text-[13px] font-bold py-2 text-center transition-colors ${countdown > 0 ? 'text-slate-300' : 'text-[rgb(110,206,184)] active:opacity-70'}`}>
                  {countdown > 0 ? `${countdown}s 后重新发送` : '重新发送验证码'}
                </button>
              </>
            )}
          </motion.div>
          <AgreementRow />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#F5F7F5] flex flex-col items-center overflow-hidden pt-16">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#87A382]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-64 h-64 bg-[#F9D8B1]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20 }}>
          <div className="w-[72px] h-[72px] rounded-[22px] shadow-[0_8px_32px_rgba(110,206,184,0.45),0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-white text-[38px] font-black mb-6"
            style={{ background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)' }}>
            U
          </div>
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[42px] leading-[42px] font-extrabold tracking-[-0.5px] bg-clip-text text-transparent mb-2"
          style={{ fontFamily: 'Sora, Inter, sans-serif', backgroundImage: 'linear-gradient(99.1035deg, rgb(110, 206, 184) 3.4422%, rgb(134, 204, 168) 70.656%, rgb(240, 196, 96) 99.069%)' }}>
          Unipass
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-[12px] tracking-[3px] uppercase text-[rgba(40,60,50,0.62)]"
          style={{ fontFamily: 'Inter, sans-serif' }}>
          FIND YOUR WORK BUDDY
        </motion.p>
      </div>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="w-full px-8 pb-12 relative z-10 flex flex-col gap-4">
        <button
          onClick={handleWechatLogin}
          className="w-full py-[18px] rounded-[24px] font-black text-[16px] text-white shadow-[0_10px_28px_rgba(110,206,184,0.38)] active:scale-95 transition-transform flex items-center justify-center gap-2 border border-white/30"
          style={{ backgroundImage: LOGIN_BRAND_GRADIENT }}
        >
          <MessageCircle size={22} /> 微信一键登录
        </button>
        <div className="rounded-[24px] p-[2px] shadow-[0_8px_22px_rgba(110,206,184,0.15)]" style={{ backgroundImage: LOGIN_BRAND_GRADIENT }}>
          <button
            onClick={() => setMode('phone')}
            className="w-full py-[16px] rounded-[22px] font-black text-[16px] active:scale-95 transition-transform flex items-center justify-center bg-white/88 backdrop-blur-md text-[#2F3E46]"
          >
            手机号验证码登录
          </button>
        </div>
        <div onClick={() => setAgreed(a => !a)} className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
          <motion.div animate={showError ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }} className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agreed ? 'border-transparent' : 'border-slate-300 bg-white'}`}
            style={agreed ? { backgroundImage: LOGIN_BRAND_GRADIENT } : {}}
          >
            <CheckCircle2 size={12} className={`text-white transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} />
          </motion.div>
          <span className={`text-[11px] font-medium transition-colors ${showError ? 'text-red-500' : 'text-slate-400'}`}>
            登录即代表同意{' '}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#6eceb8] via-[#86cca8] to-[rgb(240,196,96)]">《用户协议》</span>
            {' '}与{' '}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#6eceb8] via-[#86cca8] to-[rgb(240,196,96)]">《隐私政策》</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

// --- ✨ 3. 新增：用户初始化引导逻辑 (Setup Flow) ---
const SETUP_AVATARS = PROFILE_AVATARS;
// 定位结果页（成功 / 拒绝 / 失败等共用骨架）可调参数区
const LOCATION_FAIL_LAYOUT = {
  resultCard:
    'relative mt-[3rem] rounded-[22px] border border-white/70 bg-white/92 px-6 pb-4 pt-[2.6rem] shadow-[0_18px_42px_-28px_rgba(0,0,0,0.28)] backdrop-blur-[10px]',
  continueTag:
    'pointer-events-none absolute right-5 top-6 z-10 rounded-[8px] border border-[#CFE9D7] bg-[#E4F5E8] px-2.5 py-1 text-[10px] font-black tracking-[0.08em] text-[#6BAD82]',
  title: 'mt-0 text-[#1F2329]',
  desc: 'text-[#7D7D7D]',
  retryBtn: 'mt-5 w-full rounded-[22px] py-3.5 text-[15px] font-black text-white transition-transform active:scale-[0.98] border border-white/45 shadow-[0_16px_28px_-14px_rgba(110,206,184,0.7)]',
  companyCard: 'mt-3 rounded-[22px] border border-white/70 bg-white/90 px-5 py-2.5 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.24)] backdrop-blur-[10px]',
  companyLabel: 'mb-3 block text-[15px] font-semibold text-[#8C8C8C]',
  companyInput: 'w-full rounded-[10px] px-5 py-4 text-[16px] font-black transition-colors focus:outline-none border border-[#B8D0CD] bg-[#F4F6F7]/90 text-[#1F2329] placeholder:text-[#A7A7A7] focus:border-[#87A382]',
  bottomArea: 'mt-auto pt-6 pb-[max(2.25rem,env(safe-area-inset-bottom,1rem))]',
  nextBtnEnabled: 'border border-white/45 text-white shadow-[0_16px_28px_-14px_rgba(110,206,184,0.68)] active:scale-[0.98]',
  nextBtnDisabled: 'pointer-events-none border border-white/55 bg-white/64 text-[#A7A7A7]',
} as const;

const SetupFlow = ({
  onComplete,
  onExit,
}: {
  onComplete: (
    profile: { nickname: string; company: string; gender: string; role: string; avatar: string },
    location?: { lat: number; lng: number; accuracy?: number | null; updated_at: string }
  ) => void;
  /** 定位授权首屏返回（通常回到登录） */
  onExit?: () => void;
}) => {
  const [step, setStep] = useState<'locationPermission' | 'location' | 'persona' | 'permission'>('locationPermission');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error' | 'unavailable'>('idle');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number; accuracy?: number | null; updated_at: string } | null>(null);
  const [nearbyCompanies, setNearbyCompanies] = useState<string[]>([]);
  const [profile, setProfile] = useState({ nickname: '', company: '', gender: '', role: '', avatar: SETUP_AVATARS[0] });
  const [showCompanySuggest, setShowCompanySuggest] = useState(true);
  const [showPermission, setShowPermission] = useState(false);
  /** 插画内浮层标签：首帧隐藏，延迟出现降低首屏信息密度 */
  const [mapPinsVisible, setMapPinsVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/通知.png';
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('previewLocation') !== 'denied') return;
    setStep('location');
    setLocationStatus('denied');
  }, []);

  useEffect(() => {
    if (step !== 'locationPermission') {
      setMapPinsVisible(false);
      return;
    }
    const id = window.setTimeout(() => setMapPinsVisible(true), 1500);
    return () => window.clearTimeout(id);
  }, [step]);

  const requestLocation = () => {
    setStep('location');
    setLocationStatus('loading');
    if (typeof window === 'undefined') return;
    if (!window.isSecureContext) {
      setLocationStatus('error');
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          updated_at: new Date().toISOString(),
        });
        try {
          const res = await fetch(`/api/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          if (!res.ok) throw new Error('geocode_failed');
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            const parts = [addr.neighbourhood, addr.suburb, addr.district, addr.city_district, addr.city].filter(Boolean);
            setLocationAddress(parts.slice(0, 2).join(' · ') || data.display_name?.split(',')[0] || '');
          } else {
            setLocationAddress('');
          }
        } catch {
          setLocationAddress('');
        }
        try {
          const nearRes = await fetch(`/api/nearby-companies?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          if (!nearRes.ok) throw new Error('nearby_failed');
          const nearData = await nearRes.json();
          const names = Array.isArray(nearData.companies) ? nearData.companies : [];
          setNearbyCompanies(names.slice(0, 8));
        } catch {
          setNearbyCompanies([]);
        }
        setLocationStatus('success');
      },
      (err: GeolocationPositionError) => {
        // 1=拒绝 2=不可用 3=超时 —— 原先把非拒绝都当「拒绝」会误伤：允许了也会因超时/信号差显示已拒绝
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
          // 5s 内未取到即超时，与「无可用坐标」统一进「暂时无法获取位置」
          setLocationStatus('unavailable');
        } else {
          setLocationStatus('error');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 120000,
      }
    );
  };

  const handlePersonaSubmit = () => {
    if (!profile.nickname || !profile.gender || !profile.role) return;
    setShowPermission(true);
  };

  const finishSetup = () => onComplete(profile, locationCoords ?? undefined);
  const isValidPersona = profile.nickname.trim() !== '' && profile.gender !== '' && profile.role !== '';
  const isValidCompany = profile.company.trim() !== '';
  return (
    <div className={`absolute inset-0 z-50 bg-white overflow-hidden flex flex-col ${step !== 'locationPermission' ? 'pt-16' : ''}`}>
      <AnimatePresence mode="wait">

        {/* 步骤 0: 定位授权 — 转化率 / 层级 / 信任 / 体系化（对齐 iPhone 393 槽宽 + safe-area） */}
        {step === 'locationPermission' && (
          <motion.div key="locationPermission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col overflow-hidden bg-white">
            {onExit != null && (
              <button
                type="button"
                aria-label="返回上一页"
                onClick={onExit}
                className="absolute left-[22px] z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/72 text-[#1F2933] shadow-[0_8px_18px_-14px_rgba(47,62,70,0.32)] backdrop-blur-md transition-transform active:scale-95"
                style={{ top: 'max(env(safe-area-inset-top, 0px) + 14px, 52px)' }}
              >
                <ArrowLeft size={17} strokeWidth={2.7} className="block shrink-0" aria-hidden />
              </button>
            )}

            <div
              className="relative z-10 mx-auto flex min-h-0 w-full max-w-[393px] flex-1 flex-col px-[22px]"
              style={{
                paddingTop: 'max(2rem, env(safe-area-inset-top, 0px) + 1.5rem)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px) + 0.25rem)',
              }}
            >
              <header className="flex shrink-0 items-center gap-3 pt-[max(4rem,env(safe-area-inset-top,0px)+0.25rem)]">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22px] text-[19px] font-black tracking-tighter text-white shadow-[0_8px_32px_rgba(110,206,184,0.45),0_2px_8px_rgba(0,0,0,0.1)]"
                  style={{ background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)' }}
                >
                  U
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[21px] font-extrabold leading-none tracking-[-0.04em] bg-clip-text text-transparent"
                    style={{ fontFamily: 'Sora, Inter, sans-serif', backgroundImage: LOGIN_BRAND_GRADIENT }}
                  >
                    Unipass
                  </div>
                  <p
                    className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-[rgba(40,60,50,0.62)]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    FIND YOUR WORK BUDDY
                  </p>
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col pt-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.4 }}
                  className="relative mx-auto w-full max-w-[340px] rounded-[16px] border border-black/[0.06] bg-white/90 p-[9px] shadow-[0_20px_50px_-32px_rgba(0,0,0,0.22)] backdrop-blur-md"
                >
                  <div className="relative h-[166px] overflow-hidden rounded-[16px] border border-black/[0.04] bg-[#EFF3EA]">
                    {/* 网格线 ~10% 透明度 */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, rgba(47,62,70,0.1) 1px, transparent 1px), linear-gradient(rgba(47,62,70,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }}
                    />
                    <div className="absolute left-[-18px] top-[34px] h-[58px] w-[190px] rotate-[-18deg] rounded-full bg-white/72" aria-hidden />
                    <div className="absolute right-[-34px] top-[88px] h-[62px] w-[230px] rotate-[-18deg] rounded-full bg-white/78" aria-hidden />
                    <div className="absolute bottom-[14px] left-[42px] h-[54px] w-[210px] rotate-[14deg] rounded-full bg-white/68" aria-hidden />

                    <motion.div
                      className="absolute left-1/2 top-1/2 flex h-[59px] w-[59px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[12px] text-white shadow-[0_14px_32px_-10px_rgba(110,206,184,0.5)] ring-[6px] ring-white/50"
                      style={{
                        background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)',
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                      <MapPin size={26} strokeWidth={2} className="-translate-y-px drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]" aria-hidden strokeLinecap="round" strokeLinejoin="round" />
                    </motion.div>

                    <motion.div
                      className="absolute left-4 top-4 rounded-[8px] border border-black/[0.06] bg-white/90 px-3 py-2 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                      initial={false}
                      animate={{ opacity: mapPinsVisible ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <p className="text-[11px] font-bold leading-none text-[#888888]">同公司</p>
                      <p className="mt-1.5 text-[12px] font-black leading-snug tracking-tight text-[#292929]">午饭搭子</p>
                    </motion.div>
                    <motion.div
                      className="absolute bottom-4 right-4 rounded-[8px] border border-black/[0.06] bg-white/90 px-3 py-2 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                      initial={false}
                      animate={{ opacity: mapPinsVisible ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <p className="text-[11px] font-bold leading-none text-[#888888]">500m 内</p>
                      <p className="mt-1.5 text-[12px] font-black leading-snug tracking-tight text-[#292929]">楼下摸鱼</p>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="flex flex-col items-center text-center pt-9"
                >
                  <span className="inline-flex items-center gap-1 rounded-[8px] border border-white/55 bg-white/42 px-3 py-1 text-[11px] font-bold text-[#5a9178] backdrop-blur-sm shadow-[0_10px_26px_-20px_rgba(80,104,94,0.18)]">
                    <Sparkles size={12} strokeWidth={2} className="shrink-0 text-[rgb(110,206,184)]" strokeLinecap="round" strokeLinejoin="round" />
                    一次授权，附近推荐更准
                  </span>
                  <h2 className="mx-auto mt-3 max-w-[320px] text-[28px] font-black leading-[1.2] tracking-[-0.05em] text-black">
                    优先推荐身边的人
                  </h2>
                  <p className="mx-auto mt-2 max-w-[332px] text-[15px] font-semibold leading-relaxed text-[#666666]">
                    同楼、同园区、同城的局和搭子
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 }}
                  className="mx-auto mt-8 grid w-full max-w-[318px] grid-cols-3 gap-2"
                >
                  {[
                    {
                      key: 'near',
                      label: '就近推荐',
                      visual: (
                        <Radar size={18} strokeWidth={2} className="text-[#87A382]" strokeLinecap="round" strokeLinejoin="round" />
                      ),
                    },
                    {
                      key: 'city',
                      label: '同城匹配',
                      visual: (
                        <div className="relative mx-auto flex h-[20px] w-[20px] items-center justify-center">
                          <Building2 size={18} strokeWidth={2} className="text-[#87A382]" strokeLinecap="round" strokeLinejoin="round" />
                          <MapPin
                            size={9}
                            strokeWidth={2}
                            className="absolute bottom-[-3px] right-[-4px] text-[rgb(240,196,96)] drop-shadow-sm"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </div>
                      ),
                    },
                    {
                      key: 'lock',
                      label: '位置加密',
                      visual: (
                        <EyeOff size={18} strokeWidth={2} className="text-[#87A382]" strokeLinecap="round" strokeLinejoin="round" />
                      ),
                    },
                  ].map((b) => (
                    <div
                      key={b.key}
                      className="rounded-[14px] border border-black/[0.06] bg-white/88 px-2 py-2.5 text-center shadow-[0_10px_24px_-18px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                    >
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/60 bg-white/45 backdrop-blur-[2px]">{b.visual}</div>
                      <p className="mt-1.5 text-[10px] font-black leading-tight text-[#666666]">{b.label}</p>
                    </div>
                  ))}
                </motion.div>

                <div className="min-h-[10px] flex-[0.08]" aria-hidden />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="absolute left-[22px] right-[22px] bottom-[70px] flex flex-col gap-4"
              >
                <p className="px-2 text-center text-[12px] font-medium leading-relaxed tracking-tight text-[#999999]">
                  🔒 位置信息仅用于推荐，不会记录行动轨迹
                </p>
                <motion.button
                  type="button"
                  onClick={requestLocation}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'tween', duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className="w-full rounded-[24px] border border-white/40 py-[15px] text-[17px] font-black text-white shadow-[0_16px_36px_-12px_rgba(110,206,184,0.48)] backdrop-blur-sm transition-[filter,transform] duration-200 ease-out active:!brightness-[0.95]"
                  style={{ backgroundImage: LOGIN_BRAND_GRADIENT }}
                >
                  开启附近推荐
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setLocationStatus('denied');
                    setStep('location');
                  }}
                  className="-mt-px text-center text-[15px] font-semibold leading-none text-[#999999] no-underline transition-colors hover:text-[#666666]"
                >
                  暂不开启，手动填写
                </button>
              </motion.div>

            </div>
          </motion.div>
        )}

        {/* 步骤 1: 位置结果 + 公司填写 */}
        {step === 'location' && (
          <motion.div key="location" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex min-h-0 flex-col overflow-hidden px-6 pt-[max(3.5rem,env(safe-area-inset-top,0px)+1.5rem)] pb-0"
            style={
              locationStatus === 'loading'
                ? { background: '#EEEADC' }
                : {
                    backgroundImage: "url('/dingweishibai.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
            }
          >
            <button
              type="button"
              aria-label="返回上一页"
              onClick={() => {
                setLocationStatus('idle');
                setStep('locationPermission');
              }}
              className="absolute left-6 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/72 text-[#1F2933] shadow-[0_8px_18px_-14px_rgba(47,62,70,0.32)] backdrop-blur-md transition-transform active:scale-95"
              style={{ top: 'max(env(safe-area-inset-top, 0px) + 14px, 52px)' }}
            >
              <ArrowLeft size={17} strokeWidth={2.7} className="block shrink-0" aria-hidden />
            </button>
            {locationStatus === 'loading' && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div
                  className="absolute left-[-23px] top-[-84px] h-[981px] w-[502px]"
                  style={{ background: 'linear-gradient(157.713deg, rgb(195, 236, 217) 0%, rgb(251, 237, 206) 60.799%, rgb(231, 205, 241) 92.809%)' }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.72)_45%,rgba(255,255,255,0.9)_100%)]" />
              </div>
            )}
            {locationStatus === 'loading' && (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
                <div className="relative mb-8 flex h-[178px] w-full max-w-[320px] items-center justify-center rounded-[32px] border border-black/[0.05] bg-white/86 shadow-[0_22px_58px_-28px_rgba(0,0,0,0.22)] backdrop-blur-md">
                  <div className="absolute inset-3 rounded-[26px] bg-[#EFF3EA] opacity-80" />
                  <motion.div animate={{ scale: [1, 2.2], opacity: [0.45, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }} className="absolute h-20 w-20 rounded-full bg-[rgb(110,206,184)]" />
                  <motion.div animate={{ scale: [1, 1.65], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.45, ease: "easeOut" }} className="absolute h-20 w-20 rounded-full bg-[rgb(240,196,96)]" />
                  <div
                    className="relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] text-white shadow-[0_18px_40px_-12px_rgba(110,206,184,0.58)] ring-[8px] ring-white/55"
                    style={{ background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)' }}
                  >
                    <MapPin className="text-white" size={30} strokeWidth={2.2} />
                  </div>
                </div>
                <p className="text-[22px] font-black tracking-[-0.04em] text-[#2F3E46]">正在确认附近位置</p>
                <p className="mt-3 max-w-[270px] text-[13px] font-semibold leading-relaxed text-slate-400">
                  用于优先推荐同楼、同园区、同城的局和搭子
                </p>
              </div>
            )}
            {(locationStatus === 'success' || locationStatus === 'denied' || locationStatus === 'error' || locationStatus === 'unavailable') && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 flex w-full min-h-0 flex-1 flex-col">
                {(() => {
                  const successWithAddress = locationStatus === 'success' && !!locationAddress;
                  const badge = successWithAddress ? '已获取位置' : '可继续手动填写';
                  const title =
                    successWithAddress
                      ? '定位成功'
                      : locationStatus === 'denied'
                        ? '位置权限已拒绝'
                        : locationStatus === 'unavailable'
                          ? '暂时无法获取位置'
                          : locationStatus === 'error'
                            ? '无法使用定位'
                            : '已获取位置';
                  const desc = successWithAddress
                    ? ''
                    : locationStatus === 'denied'
                      ? '若系统已选择允许仍出现本页，可重新定位；若曾选择拒绝，请在浏览器网站设置里允许位置。'
                      : locationStatus === 'unavailable'
                        ? '可能是信号弱、设备暂不可用或 5 秒内未取到坐标。你可以重新定位，也可以先手动填写公司。'
                        : locationStatus === 'error'
                          ? '请使用 http://localhost 或 HTTPS 打开本页，局域网 IP 的 HTTP 下浏览器会禁用定位。'
                          : '已拿到附近坐标，但地址解析暂时失败。你仍可手动填写公司继续。';
                  const showRetry = !successWithAddress;
                  return (
                    <>
                      <div className={LOCATION_FAIL_LAYOUT.resultCard}>
                        <span className={LOCATION_FAIL_LAYOUT.continueTag}>{badge}</span>
                        <div
                          className="relative z-[1] mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] text-white shadow-[0_14px_32px_-12px_rgba(110,206,184,0.56)]"
                          style={{
                            background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)',
                          }}
                        >
                          <MapPin size={25} strokeWidth={2.2} />
                        </div>
                        <h2 className={`text-[24px] font-black tracking-[-0.05em] ${LOCATION_FAIL_LAYOUT.title}`}>{title}</h2>
                        {successWithAddress ? (
                          <p className="mt-2 flex items-center gap-2 text-[13px] font-bold text-slate-500">
                            <span className="h-2 w-2 rounded-full bg-[rgb(110,206,184)]" />
                            {locationAddress}
                          </p>
                        ) : (
                          <p className={`mt-2 text-[13px] font-semibold leading-relaxed ${LOCATION_FAIL_LAYOUT.desc}`}>{desc}</p>
                        )}
                        {showRetry && (
                          <button
                            type="button"
                            onClick={requestLocation}
                            className={LOCATION_FAIL_LAYOUT.retryBtn}
                            style={{ backgroundImage: LOGIN_BRAND_GRADIENT }}
                          >
                            重新定位
                          </button>
                        )}
                      </div>
                      <div className={LOCATION_FAIL_LAYOUT.companyCard}>
                        <label className={LOCATION_FAIL_LAYOUT.companyLabel}>你在哪个公司实习？</label>
                        <div className="relative min-h-0">
                          <input
                            type="text"
                            value={profile.company}
                            onChange={(e) => {
                              setProfile({ ...profile, company: e.target.value });
                              setShowCompanySuggest(true);
                            }}
                            onFocus={() => setShowCompanySuggest(true)}
                            placeholder="例如：腾讯、字节跳动、美团..."
                            className={LOCATION_FAIL_LAYOUT.companyInput}
                          />
                          {locationStatus === 'success' && nearbyCompanies.length > 0 && (
                            <p className="mt-2 text-[11px] font-bold text-[#87A382]">
                              已根据你当前位置优先推荐附近公司
                            </p>
                          )}
                          {showCompanySuggest && (profile.company.length >= 1 || nearbyCompanies.length > 0) && (() => {
                            const COMPANIES = [
                              '腾讯',
                              '字节跳动',
                              '美团',
                              '阿里巴巴',
                              '百度',
                              '京东',
                              '网易',
                              '快手',
                              '小米',
                              '华为',
                              'OPPO',
                              'vivo',
                              '滴滴',
                              '拼多多',
                              'B站',
                              '爱奇艺',
                              '哔哩哔哩',
                              '蚂蚁集团',
                              '微软',
                              '谷歌',
                              '苹果',
                              '三星',
                              '亚马逊',
                              'Meta',
                              '英特尔',
                              '思科',
                              'IBM',
                              '博世',
                              '西门子',
                              '宝洁',
                              '麦肯锡',
                              '德勤',
                              '普华永道',
                              '毕马威',
                              '安永',
                              '高盛',
                              '摩根大通',
                              '花旗银行',
                              '工商银行',
                              '中国银行',
                              '建设银行',
                              '农业银行',
                              '招商银行',
                              '万科',
                              '碧桂园',
                              '恒大',
                              '联想',
                              'TCL',
                              '海尔',
                              '格力',
                              '比亚迪',
                              '宁德时代',
                              '中芯国际',
                              '寒武纪',
                              '商汤科技',
                              '旷视科技',
                              '科大讯飞',
                              '同程旅行',
                              '携程',
                              '去哪儿',
                              '途牛',
                              '同城',
                              '招聘',
                              '脉脉',
                              'BOSS直聘',
                              '猎聘',
                              '智联招聘',
                              '前程无忧',
                            ];
                            const q = profile.company.trim();
                            const nearbyMatched = nearbyCompanies.filter((co) => !q || co.includes(q) || q.includes(co.slice(0, 2)));
                            const fallbackMatched = q ? COMPANIES.filter((co) => co.includes(q) || q.includes(co.slice(0, 2))) : [];
                            const filtered = Array.from(new Set([...nearbyMatched, ...fallbackMatched])).slice(0, 6);
                            return filtered.length > 0 ? (
                              <div className="mt-2 overflow-hidden rounded-[18px] border border-slate-100 bg-white shadow-[0_14px_34px_-18px_rgba(0,0,0,0.22)]">
                                {filtered.map((co) => (
                                  <button
                                    key={co}
                                    type="button"
                                    onClick={() => {
                                      setProfile({ ...profile, company: co });
                                      setShowCompanySuggest(false);
                                    }}
                                    className="flex w-full items-center gap-2 border-b border-slate-50 px-5 py-3 text-left text-[14px] font-bold text-slate-700 last:border-0 hover:bg-slate-50 active:bg-slate-100"
                                  >
                                    <Briefcase size={14} className="shrink-0 text-[#87A382]" /> {co}
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <div className={`relative z-10 w-full shrink-0 ${LOCATION_FAIL_LAYOUT.bottomArea}`}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isValidCompany) setStep('persona');
                          }}
                          className={`w-full rounded-[24px] py-[16px] font-black text-[16px] leading-snug transition-all duration-300 sm:py-[18px] ${
                            isValidCompany ? LOCATION_FAIL_LAYOUT.nextBtnEnabled : LOCATION_FAIL_LAYOUT.nextBtnDisabled
                          }`}
                          style={isValidCompany ? { backgroundImage: LOGIN_BRAND_GRADIENT } : undefined}
                        >
                          下一步
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 步骤 2: 职场人设 + 头像选择 — 底栏固定主按钮，中间可滚动 */}
        {step === 'persona' && (
          <motion.div
            key="persona"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #EEF8EE 0%, #F9FBF7 45%, #FFFDF6 100%)' }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-8 pb-8 pt-[4.25rem]">
              <div className="relative mb-4 flex shrink-0 items-center justify-center">
                <button
                  type="button"
                  aria-label="返回上一页"
                  onClick={() => setStep('location')}
                  className="absolute left-[-0.55rem] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/72 text-[#1F2933] shadow-[0_8px_18px_-14px_rgba(47,62,70,0.32)] backdrop-blur-md transition-transform active:scale-95"
                >
                  <ArrowLeft size={17} strokeWidth={2.7} className="block shrink-0" aria-hidden />
                </button>
                <div className="text-center px-10">
                  <h2 className="bg-clip-text text-[27px] font-black leading-tight tracking-tight text-transparent" style={{ backgroundImage: LOGIN_BRAND_GRADIENT }}>
                    完善你的职场人设
                  </h2>
                  <p className="mt-2 text-[13px] font-semibold text-[#8C9090]">选择你的头像</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-4 gap-3">
                  {SETUP_AVATARS.map((av, idx) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setProfile({ ...profile, avatar: av })}
                      className={`relative aspect-square overflow-hidden rounded-[16px] border-[2.5px] bg-white transition-all ${
                        profile.avatar === av
                          ? 'border-[#9DE7B5] shadow-[0_0_0_4px_rgba(157,231,181,0.3),0_14px_26px_-14px_rgba(87,163,130,0.7)]'
                          : 'border-white/75 shadow-[0_10px_22px_-18px_rgba(47,62,70,0.22)]'
                      }`}
                    >
                      <AvatarVisual
                        avatar={av}
                        className="flex h-full w-full items-center justify-center overflow-hidden"
                        imgStyle={personaSetupAvatarImgStyle(PERSONA_SETUP_AVATAR_IMG_TUNING[idx])}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2.5 flex items-center gap-2 text-[14px] font-black text-[#4F5960]">
                  <span className="h-2 w-2 rounded-full bg-[#83D9B7]" />
                  怎么称呼你？
                </label>
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  placeholder="输入你的花名 / 昵称"
                  className="w-full rounded-[16px] border border-[#E8ECE8] bg-white/92 px-4 py-3.5 text-[15px] font-black text-[#2F3E46] shadow-[0_10px_24px_-20px_rgba(0,0,0,0.2)] transition-colors placeholder:text-slate-300 focus:border-[#87A382] focus:outline-none"
                />
              </div>

              <div className="mb-5">
                <label className="mb-2.5 flex items-center gap-2 text-[14px] font-black text-[#4F5960]">
                  <span className="h-2 w-2 rounded-full bg-[#83D9B7]" />
                  性别
                </label>
                <div className="flex gap-3">
                  {[{ id: 'male', label: '👦 男生' }, { id: 'female', label: '👧 女生' }].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: g.id })}
                      className={`flex-1 rounded-[14px] border py-3 text-[14px] font-black transition-all ${profile.gender === g.id ? 'border-white/35 text-white shadow-[0_8px_22px_-12px_rgba(110,206,184,0.65)]' : 'border-[#EDF0EC] bg-white/88 text-slate-500 shadow-[0_8px_18px_-16px_rgba(47,62,70,0.18)]'}`}
                      style={profile.gender === g.id ? { backgroundImage: LOGIN_BRAND_GRADIENT } : undefined}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2.5 flex items-center gap-2 text-[14px] font-black text-[#4F5960]">
                  <span className="h-2 w-2 rounded-full bg-[#83D9B7]" />
                  你的职能标签
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {['产品', '设计', '技术', '运营', '行政', '市场', '财务', '法务'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setProfile({ ...profile, role: r })}
                      className={`rounded-[12px] border px-2 py-2.5 text-[13px] font-black transition-all ${profile.role === r ? 'border-white/35 text-white shadow-[0_8px_20px_-12px_rgba(110,206,184,0.65)]' : 'border-[#EDF0EC] bg-white/88 text-slate-500 shadow-[0_8px_18px_-16px_rgba(47,62,70,0.16)]'}`}
                      style={profile.role === r ? { backgroundImage: LOGIN_BRAND_GRADIENT } : undefined}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-0 bg-transparent px-8 pt-3 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
              <button
                onClick={handlePersonaSubmit}
                type="button"
                className={`w-full rounded-[24px] py-[17px] text-[16px] font-black transition-all duration-300 ${isValidPersona ? 'border border-white/35 text-white shadow-[0_16px_30px_-14px_rgba(110,206,184,0.68)] active:scale-95' : 'pointer-events-none bg-slate-200 text-slate-400'}`}
                style={isValidPersona ? { backgroundImage: LOGIN_BRAND_GRADIENT } : undefined}
              >
                进入 UniPass ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 权限开启弹窗 (Overlay)：全屏 backdrop-blur 易与 onboarding 大图层叠加掉帧；用纯色遮罩 + 仅 opacity/scale 动画更顺滑 */}
      {showPermission && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-7">
          <motion.div
            className="absolute inset-0 bg-[#2F3E46]/42"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-[330px]"
          >
            <div className="relative">
              <img
                src="/通知.png"
                alt="通知插图"
                className="block w-full h-auto"
              />

              <div className="absolute inset-0 flex flex-col items-center px-6 text-center">
                <h3 className="mt-[70%] text-[26px] font-semibold leading-tight text-[#222222]">开启推送通知</h3>
                <p className="mt-2 text-[14px] font-bold leading-[1.5] text-[#6B5E4A]">
                  有局叫你，成就生成<br />第一时间告诉你 ✨
                </p>
                <p className="mt-2 text-[12px] font-medium text-[#999999]">
                  不会骚扰你，只推真正重要的消息
                </p>

                <button
                  onClick={finishSetup}
                  className="mt-4 w-[75%] rounded-full bg-[linear-gradient(90deg,#85D7A7_0%,#F2D368_100%)] py-[12px] text-[17px] font-bold text-white shadow-[0_8px_16px_-6px_rgba(133,215,167,0.4)] transition-transform active:scale-95"
                >
                  开启通知
                </button>
                <button
                  onClick={finishSetup}
                  className="mt-2 rounded-full bg-transparent px-6 py-[8px] text-[15px] font-medium text-[#999999] transition-transform active:scale-95"
                >
                  暂不开启
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};


// --- ✨ 退出确认弹窗（与 RemoveDaziConfirmModal 同系：紧凑玻璃卡 + 并排按钮） ---
const ExitConfirmModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[1200] flex items-center justify-center px-5 py-6">
    <div
      className="absolute inset-0 animate-in fade-in duration-200 bg-[#56756D]/25 backdrop-blur-[3px]"
      onClick={onCancel}
      aria-hidden
    />
    <div
      className={`relative z-10 w-full max-w-[17.5rem] animate-in zoom-in-95 duration-200 rounded-[24px] p-4 ${HOME_SURFACE.glassCard}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-scene-title"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#FECACA]/90 bg-[#FEF2F2] text-[#EF4444]">
          <AlertCircle size={18} strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="exit-scene-title" className="text-[14px] font-bold leading-snug text-[#2F3E46]">
            确定要退出吗？
          </h3>
          <p className="mt-1 text-[11px] font-normal leading-relaxed text-[#64748B]">
            将取消加入当前局，名额会重新释放给其他同学。
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-white/72 bg-white/65 py-2.5 text-[12px] font-bold text-[#56756D] shadow-[0_8px_20px_-16px_rgba(64,100,120,0.4)] backdrop-blur-md transition-transform active:scale-[0.98]"
        >
          点错了
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-full border border-red-200/90 bg-[#F87171] py-2.5 text-[12px] font-bold text-white shadow-[0_10px_22px_-14px_rgba(239,68,68,0.45)] transition-transform active:scale-[0.98]"
        >
          确定退出
        </button>
      </div>
    </div>
  </div>
);

/** 取消搭子关系：紧凑卡片，与个人页玻璃风统一 */
const RemoveDaziConfirmModal = ({
  sceneLabel,
  onConfirm,
  onCancel,
}: {
  sceneLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[1200] flex items-center justify-center px-5 py-6">
    <div
      className="absolute inset-0 animate-in fade-in duration-200 bg-[#56756D]/25 backdrop-blur-[3px]"
      onClick={onCancel}
      aria-hidden
    />
    <div
      className={`relative z-10 w-full max-w-[17.5rem] animate-in zoom-in-95 duration-200 rounded-[24px] p-4 ${HOME_SURFACE.glassCard}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-dazi-title"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#FECACA]/90 bg-[#FEF2F2] text-[#EF4444]">
          <Heart size={18} strokeWidth={2} className="fill-transparent" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="remove-dazi-title" className="text-[14px] font-bold leading-snug text-[#2F3E46]">
            取消搭子关系？
          </h3>
          <p className="mt-1 text-[11px] font-normal leading-relaxed text-[#64748B]">
            「<span className="break-all">{sceneLabel}</span>」关系卡将移除；局内再互动可重建。
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-white/72 bg-white/65 py-2.5 text-[12px] font-bold text-[#56756D] shadow-[0_8px_20px_-16px_rgba(64,100,120,0.4)] backdrop-blur-md transition-transform active:scale-[0.98]"
        >
          保留
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-full border border-red-200/90 bg-[#F87171] py-2.5 text-[12px] font-bold text-white shadow-[0_10px_22px_-14px_rgba(239,68,68,0.45)] transition-transform active:scale-[0.98]"
        >
          确定取消
        </button>
      </div>
    </div>
  </div>
);

// --- ✨ 匿名限制卡片 (Anonymous Profile Modal) ---
const AnonymousProfileModal = ({ user, onClose }) => {
  return (
    <div className="absolute inset-0 z-[1300] flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-[#FAFAFA]/70 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white rounded-[40px] w-full relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-400 flex flex-col items-center pt-10 pb-8 px-6 border border-slate-100">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 active:scale-90 transition-all">
          <X size={20} />
        </button>
        
        <div className="w-24 h-24 overflow-hidden rounded-[24px] bg-[#F8FAF8] border-2 border-slate-100 shadow-inner flex items-center justify-center text-4xl mb-4">
          <AvatarVisual avatar={user.avatar} className="flex h-full w-full items-center justify-center" />
        </div>
        <h3 className="text-[18px] font-black text-[#2F3E46] mb-1.5">{user.name}</h3>
        <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase bg-slate-50 px-3 py-1 rounded-full mb-8">
          匿名大厂员工
        </span>

        <div className="w-full bg-[#FAFAFA] rounded-[24px] p-5 border border-slate-100 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F9D8B1]/20 flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck size={20} />
          </div>
          <p className="text-[12px] font-black text-slate-500 leading-relaxed text-center">
            由于隐私护盾限制，<br/>需<span className="text-[#D4AF37]">共同参与一个局</span>或<span className="text-[#D4AF37]">互设为搭子</span><br/>方可解锁私聊权限。
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 rounded-[20px] font-black text-slate-500 bg-slate-100 active:scale-95 transition-transform mt-6"
        >
          我知道了
        </button>
      </div>
    </div>
  );
};

// --- ✨ UniAI 真实对话页 (AI Chat View) ---
const AIChatView = ({
  userProfile,
  onClose,
  messages,
  setMessages,
}: {
  userProfile: { nickname: string; company: string; gender: string; role: string; avatar: string } | null;
  onClose: () => void;
  messages: { role: 'user' | 'assistant'; content: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: 'user' | 'assistant'; content: string }[]>>;
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content }))
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'AI 暂时不可用，请稍后再试' }]);
        return;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.result || 'AI 暂时没有生成内容，请重试' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: getAiFallback() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className={`absolute inset-0 z-[1100] flex flex-col overflow-hidden rounded-[55px] ${HOME_SURFACE.background} animate-in fade-in slide-in-from-bottom-8 duration-300`}>
      <div className="pointer-events-none absolute -left-24 top-8 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.24)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-24 top-28 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.24)_0%,rgba(178,176,245,0)_72%)]" />
      <div className="relative z-10 flex items-center justify-between border-b border-white/45 bg-white/35 px-6 pb-4 pt-16 shadow-[0_12px_26px_-24px_rgba(64,100,120,0.35)] backdrop-blur-2xl shrink-0">
        <button onClick={onClose} className="rounded-full border border-white/70 bg-white/62 p-2 text-[#56756D]/70 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-[16px] font-black text-[#2F3E46] flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(125deg,rgba(150,225,206,0.28)_0%,rgba(178,176,245,0.22)_100%)] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)]">
              <Bot size={14} className="text-[#6EAFA0]" />
            </div>
            UniAI 助手
          </h2>
          <span className="text-[9px] font-black text-[#6EAFA0] tracking-wider mt-0.5">由 DeepSeek 提供智能支持</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar pb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="w-9 h-9 rounded-[14px] bg-white/62 border border-white/70 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] backdrop-blur-md">
                <Bot size={16} className="text-[#6EAFA0]" />
              </div>
            )}
            <div className={`max-w-[78%] px-4 py-3 rounded-[20px] shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] ${msg.role === 'user' ? 'bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] text-white rounded-tr-sm' : 'bg-white/72 text-[#40515A] rounded-tl-sm border border-white/70 backdrop-blur-xl'}`}>
              <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <button onClick={() => copyToClipboard(msg.content)} className="mt-2 text-[10px] font-bold text-[#56756D]/35 hover:text-[#56756D]/65 flex items-center gap-1 active:scale-95 transition-transform">
                  复制
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-9 h-9 rounded-[14px] bg-white/62 border border-white/70 flex items-center justify-center shrink-0 backdrop-blur-md">
              <Bot size={16} className="text-[#6EAFA0]" />
            </div>
            <div className="bg-white/72 border border-white/70 px-5 py-3 rounded-[20px] rounded-tl-sm shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] backdrop-blur-xl flex items-center gap-1.5">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-[#B0CCF8] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="relative z-10 border-t border-white/55 bg-white/72 p-4 pb-8 shadow-[0_-18px_38px_-26px_rgba(64,100,120,0.45)] backdrop-blur-3xl shrink-0">
        <div className="flex items-end rounded-[24px] border border-white/70 bg-white/60 p-1.5 gap-2 shadow-[inset_0_1px_8px_rgba(64,100,120,0.06)] backdrop-blur-xl">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问我任何职场问题..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-medium px-3 py-2 placeholder:text-[#56756D]/35 resize-none max-h-32 overflow-y-auto leading-relaxed text-[#40515A]"
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-[18px] flex items-center justify-center shadow-[0_8px_18px_-14px_rgba(64,100,120,0.45)] transition-all active:scale-95 shrink-0 ${input.trim() && !loading ? 'bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] text-white' : 'bg-white/55 text-[#56756D]/30 border border-white/70'}`}
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const daziPmStorageKey = (daziId: number) => `unipass_dazi_pm_${daziId}`;
const DAZI_PM_WELCOME = '谢谢你的情报！太及时了，差点就去排队了。';

// --- ✨ 私聊对话页 (Private Chat View) ---
const PrivateChatView = ({
  dazi,
  onClose,
}: {
  dazi: { id: number; avatar: string; name: string; count: number; tag: string };
  onClose: () => void;
}) => {
  const [msgs, setMsgs] = useState<{ me: boolean; text: string; id: string }[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(daziPmStorageKey(dazi.id)) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { me?: boolean; text?: string; id?: string }[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const rows = parsed.map((row, i) => ({
            me: Boolean(row?.me),
            text: typeof row?.text === 'string' ? row.text : '',
            id: typeof row?.id === 'string' ? row.id : `m-${i}`,
          }));
          const valid = rows.filter((r) => r.text);
          setMsgs(valid.length > 0 ? valid : [{ me: false, text: DAZI_PM_WELCOME, id: 'welcome' }]);
          return;
        }
      }
    } catch {
      /* fallback below */
    }
    setMsgs([{ me: false, text: DAZI_PM_WELCOME, id: 'welcome' }]);
  }, [dazi.id]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    try {
      if (msgs.length > 0) localStorage.setItem(daziPmStorageKey(dazi.id), JSON.stringify(msgs));
    } catch {
      /* ignore */
    }
  }, [dazi.id, msgs]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const id =
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setMsgs((prev) => [...prev, { me: true, text: t, id }]);
    setInput('');
    track('dazi_pm_send', { dazi_id: dazi.id });
  };

  return (
    <div
      className={`absolute inset-0 z-[1100] flex flex-col overflow-hidden rounded-[55px] ${HOME_SURFACE.background}`}
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.24)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-24 top-28 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.24)_0%,rgba(178,176,245,0)_72%)]" />
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/45 bg-white/35 px-6 pb-4 pt-16 shadow-[0_12px_26px_-24px_rgba(64,100,120,0.35)] backdrop-blur-2xl">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/70 bg-white/62 p-2 text-[#56756D]/70 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md hover:text-[#56756D] active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="flex items-center gap-1.5 text-[16px] font-black text-[#2F3E46]">
            <AvatarVisual avatar={dazi.avatar} className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-[16px]" />{' '}
            {dazi.name}
          </h2>
          <span className="mt-0.5 rounded-full border border-white/70 bg-white/50 px-2 py-0.5 text-[9px] font-black tracking-wider text-[#B4873C] backdrop-blur-md">
            ✨ {dazi.tag}
          </span>
        </div>
        <div className="w-8" />
      </div>

      <div ref={scrollRef} className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 no-scrollbar">
        <div className="mx-auto rounded-full border border-white/70 bg-white/58 px-4 py-1.5 text-[10px] font-bold text-[#56756D]/55 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-xl">
          你们已经一起干饭 {dazi.count} 次啦
        </div>
        {msgs.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.me ? 'flex-row-reverse' : ''}`}>
            {!m.me && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/70 bg-white/62 text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] backdrop-blur-md">
                <AvatarVisual avatar={dazi.avatar} className="flex h-full w-full items-center justify-center" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-[20px] border border-white/70 p-4 shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] backdrop-blur-xl ${
                m.me
                  ? 'rounded-tr-sm bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] text-white'
                  : 'rounded-tl-sm bg-white/72 text-[#40515A]'
              }`}
            >
              <p className="text-[14px] font-medium leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Prompt Bubble & Input */}
      <div className="relative z-10 shrink-0 border-t border-white/55 bg-white/72 p-4 pb-8 shadow-[0_-18px_38px_-26px_rgba(64,100,120,0.45)] backdrop-blur-3xl">
        {/* pointer-events-none：避免盖住输入区的点击 */}
        <div className="pointer-events-none absolute -top-12 left-0 right-0 flex justify-center animate-bounce">
          <div className="relative flex items-center gap-1.5 rounded-t-2xl rounded-br-sm rounded-bl-2xl bg-[linear-gradient(125deg,rgba(47,62,70,0.94)_0%,rgba(74,91,103,0.9)_48%,rgba(112,122,168,0.88)_100%)] px-4 py-2 text-[11px] font-black text-white shadow-[0_14px_28px_-18px_rgba(47,62,70,0.55)]">
            <Sparkles size={12} className="text-[#FFE68A]" /> Ta 也是 PCG 实习生，可以聊聊组内氛围哦
            <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 bg-[#4A5B67]" />
          </div>
        </div>
        <div className="flex items-center rounded-[24px] border border-white/70 bg-white/60 p-1.5 shadow-[inset_0_1px_8px_rgba(64,100,120,0.06)] backdrop-blur-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="给搭子发消息..."
            className="flex-1 border-none bg-transparent px-3 text-[13px] font-medium text-[#40515A] placeholder:text-[#56756D]/35 focus:outline-none"
          />
          <button
            type="button"
            disabled={!input.trim()}
            onClick={send}
            className={`flex h-10 w-10 items-center justify-center rounded-[18px] shadow-[0_8px_18px_-14px_rgba(64,100,120,0.45)] transition-transform active:scale-95 ${
              input.trim()
                ? 'bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] text-[#2F3E46]'
                : 'cursor-not-allowed bg-white/50 text-[#56756D]/30'
            }`}
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ✨ 详情预览模态框 (Preview Modal) ---
const PreviewModal = ({ scene, onJoin, onClose, isJoined, isHost }) => {
  // current 与数据库 current_count 一致（含局长一人）
  const currentPeople = scene.current;
  const progress = (currentPeople / scene.total) * 100;

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#2F3E46]/32 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose} />
      <div className={`relative z-10 flex max-h-[85%] w-full flex-col overflow-hidden rounded-t-[40px] ${HOME_SURFACE.background} p-8 shadow-[0_-24px_70px_-30px_rgba(47,62,70,0.35)] animate-in slide-in-from-bottom-[100%] duration-500`}>
        <div className="pointer-events-none absolute -left-20 -top-24 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.3)_0%,rgba(150,225,206,0)_72%)]" />
        <div className="pointer-events-none absolute -right-16 top-4 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.28)_0%,rgba(178,176,245,0)_72%)]" />
        <div className="relative z-10 w-12 h-1.5 bg-white/70 rounded-full mx-auto mb-8 shrink-0"></div>
        
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-[28px] ${HOME_SURFACE.glassCard} text-5xl`}>{scene.emoji}</div>
            <div className="flex flex-col gap-1">
              {scene.exclusive && (
                <div className="mb-1 flex w-fit items-center rounded-full border border-white/70 bg-white/62 px-2.5 py-1 text-[9px] font-black text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md">
                  {scene.exclusive === 'female' ? '👯‍♀️ 仅限女生' :
                   scene.exclusive === 'male' ? '🥷 纯兄弟局' :
                   '🏢 仅限同公司'}
                </div>
              )}
              <h2 className="text-2xl font-black tracking-tight text-[#2F3E46]">{scene.title}</h2>
              <div className="flex items-center gap-2 text-[#56756D]/45">
                <span className="text-[10px] font-black uppercase tracking-widest">{scene.type}</span>
                <div className="w-1 h-1 bg-[#56756D]/40 rounded-full"></div>
                <span className="text-[10px] font-black">{scene._distanceLabel ?? scene.distance}</span>
              </div>
            </div>
          </div>

        <div className={`mb-6 rounded-[32px] ${HOME_SURFACE.glassCard} p-6`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#6EAFA0]" />
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#6EAFA0]">AI 氛围描述</span>
            </div>
            <p className="text-[14px] font-bold leading-relaxed text-[#40515A]">
              {scene.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`rounded-[24px] ${HOME_SURFACE.glassCard} p-4`}>
              <div className="flex items-center gap-2 mb-1 text-[#86A4C9]">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">集合时间</span>
              </div>
              <span className="text-[15px] font-black text-[#2F3E46]">{scene.time}</span>
            </div>
            <div className={`rounded-[24px] ${HOME_SURFACE.glassCard} p-4`}>
              <div className="flex items-center gap-2 mb-1 text-[#86A4C9]">
                <Users size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">当前进度</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black text-[#6EAFA0]">{currentPeople}/{scene.total}</span>
                <div className="flex-1 h-1.5 bg-white/70 rounded-full overflow-hidden border border-white/60">
                  <div className="h-full bg-[linear-gradient(90deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_58%,rgba(178,176,245,0.98)_100%)]" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-[11px] font-black text-[#56756D]/35 uppercase tracking-[0.2em] mb-4">成员概览</h3>
            <div className="flex -space-x-3">
              {[...Array(currentPeople)].map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white/80 bg-white/75 flex items-center justify-center text-xl shadow-[0_10px_18px_-16px_rgba(64,100,120,0.5)] backdrop-blur-md">
                  {['🐶', '🐱', '🦊', '🦁'][i % 4]}
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white/70 bg-white/35 flex items-center justify-center text-[#9CB7C9] border-dashed backdrop-blur-md">
                <Plus size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/55 mt-auto flex gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-4 rounded-[22px] font-black text-[#56756D] bg-white/58 border border-white/70 backdrop-blur-md active:scale-95 transition-transform"
          >
            返回
          </button>
          <button 
            onClick={() => { if (!isHost && !isJoined) { onJoin(scene.id); onClose(); } else onClose(); }}
            disabled={isJoined || isHost}
            className={`flex-1 py-4 rounded-[22px] font-black text-[16px] transition-all active:scale-95 flex justify-center items-center gap-2 ${
              isJoined || isHost
                ? 'bg-white/55 text-[#56756D]/50 border border-white/70' 
                : 'border border-white/70 bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] text-[#2F3E46] shadow-[0_14px_28px_-18px_rgba(64,100,120,0.55)]'
            }`}
          >
            {isHost ? '我发起的局' : isJoined ? '已在局中' : '一键加入这个局 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 局详情与破冰页 (Chat Room View) —— 未首聊见 AI 开场；已发首条则直进聊天 ---
const threadStorageKey = (sceneId: number) => `unipass_scene_thread_${sceneId}`;

const newThreadMsgId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const DetailView = ({
  id,
  scene: sceneProp,
  onClose,
  icebreakDone,
  onFirstMessageInScene,
}: {
  id: number;
  scene: ReturnType<typeof adaptScene> | undefined;
  onClose: () => void;
  icebreakDone: boolean;
  onFirstMessageInScene: (sceneId: number) => void;
}) => {
  const scene = sceneProp ?? { id, emoji: '🍱', type: '局', title: '加载中...', distance: '-', time: '-', current: 0, total: 0, exclusive: null, desc: '', hostGuestId: null };
  const [inputMode, setInputMode] = useState<'ai' | 'manual'>(() => (icebreakDone ? 'manual' : 'ai'));
  const [messageText, setMessageText] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [polishSuggestionText, setPolishSuggestionText] = useState<string | null>(null);
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);
  const [thread, setThread] = useState<{ me: boolean; text: string; id: string }[]>([]);
  const polishAbortRef = useRef<AbortController | null>(null);
  /** 输入条容器：润色气泡用 Portal 对齐到 viewport，避免手机壳 DetailView overflow-hidden + 多层模糊导致 React commit 时出现 removeChild 崩溃 */
  const polishFooterRef = useRef<HTMLDivElement>(null);
  const [polishBubbleLayout, setPolishBubbleLayout] = useState<{
    left: number;
    width: number;
    bottom: number;
  } | null>(null);

  useEffect(() => {
    setInputMode(icebreakDone ? 'manual' : 'ai');
  }, [icebreakDone, id]);

  useEffect(() => {
    setPolishSuggestionText(null);
    setPolishError(null);
    setShowSuggestion(false);
    setPolishLoading(false);
  }, [id]);

  useLayoutEffect(() => {
    return () => {
      polishAbortRef.current?.abort();
      polishAbortRef.current = null;
    };
  }, [id]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !showSuggestion) {
      setPolishBubbleLayout(null);
      return;
    }
    const el = polishFooterRef.current;
    if (!el) {
      setPolishBubbleLayout(null);
      return;
    }
    const updateLayout = () => {
      const r = el.getBoundingClientRect();
      const horizontalPad = 16;
      const left = Math.max(8, r.left + horizontalPad);
      const width = Math.max(220, Math.min(r.width - horizontalPad * 2, window.innerWidth - left - 8));
      setPolishBubbleLayout({
        left,
        width,
        bottom: Math.max(8, window.innerHeight - r.top + 12),
      });
    };
    updateLayout();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', updateLayout);
    vv?.addEventListener('scroll', updateLayout);
    window.addEventListener('resize', updateLayout);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateLayout) : null;
    ro?.observe(el);
    return () => {
      vv?.removeEventListener('resize', updateLayout);
      vv?.removeEventListener('scroll', updateLayout);
      window.removeEventListener('resize', updateLayout);
      ro?.disconnect();
    };
  }, [showSuggestion, thread.length, inputMode, icebreakDone]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(threadStorageKey(id));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setThread(
            parsed.map((row, i) => {
              const r = row as { me?: unknown; text?: unknown; id?: unknown };
              return {
                me: Boolean(r?.me),
                text: typeof r?.text === 'string' ? r.text : String(r?.text ?? ''),
                id: typeof r?.id === 'string' && r.id ? r.id : `legacy-${id}-${i}`,
              };
            })
          );
        } else setThread([]);
      } catch {
        setThread([]);
      }
    } else {
      setThread([]);
    }
  }, [id]);

  const persistThread = (rows: { me: boolean; text: string; id: string }[]) => {
    setThread(rows);
    try {
      localStorage.setItem(threadStorageKey(id), JSON.stringify(rows));
    } catch { /*  */ }
  };

  const handlePolish = async () => {
    const raw = messageText.trim();
    if (!raw) return;
    setPolishError(null);
    setPolishSuggestionText(null);
    setShowSuggestion(true);
    setPolishLoading(true);
    polishAbortRef.current?.abort();
    const ac = new AbortController();
    polishAbortRef.current = ac;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ac.signal,
        body: JSON.stringify({
          mode: 'buddy-polish',
          messages: [{ role: 'user', content: raw }],
        }),
      });
      const data = (await res.json()) as { result?: string; error?: string };
      if (polishAbortRef.current !== ac) return;
      const next =
        typeof data.result === 'string' && data.result.trim() ? data.result.trim() : '';
      if (!res.ok || (!next && data.error)) {
        setPolishError(typeof data.error === 'string' ? data.error : '润色失败，可先直接发送原文');
        setPolishSuggestionText(raw);
      } else if (next) {
        setPolishSuggestionText(next);
      } else {
        setPolishSuggestionText(raw);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if ((err as { name?: string })?.name === 'AbortError') return;
      setPolishError('网络异常，已保留你的原文在下面');
      setPolishSuggestionText(raw);
    } finally {
      if (polishAbortRef.current === ac) {
        polishAbortRef.current = null;
        setPolishLoading(false);
      }
    }
  };

  const handleAdopt = () => {
    if (polishSuggestionText?.trim()) setMessageText(polishSuggestionText.trim());
    setShowSuggestion(false);
    setPolishSuggestionText(null);
    setPolishError(null);
  };

  const sendManualMessage = () => {
    const t = messageText.trim();
    if (!t) return;
    onFirstMessageInScene(id);
    persistThread([...thread, { me: true, text: t, id: newThreadMsgId() }]);
    setMessageText('');
  };

  const pickOpeningLine = (text: string) => {
    onFirstMessageInScene(id);
    persistThread([...thread, { me: true, text, id: newThreadMsgId() }]);
    setInputMode('manual');
  };

  const openingOptions = useMemo(() => {
    const topic = (scene.title || scene.type || '这个局').trim();
    const when = scene.time && scene.time !== '时间待定' ? scene.time : null;
    const where = scene.distance && scene.distance !== '-' ? scene.distance : null;
    const left = Math.max(0, (scene.total ?? 0) - (scene.current ?? 0));
    const exclusiveLabelMap: Record<string, string> = {
      female: '女生局',
      male: '兄弟局',
      company: '同公司局',
    };
    const exclusiveText =
      scene.exclusive && exclusiveLabelMap[scene.exclusive]
        ? `（${exclusiveLabelMap[scene.exclusive]}）`
        : '';
    const joinHint = left > 0 ? `还差${left}位就齐了` : '人齐可直接开冲';
    const timeHint = when ? `，${when}` : '';
    const locationHint = where ? `，在${where}` : '';

    return [
      {
        type: '社牛版',
        icon: '🙋‍♂️',
        text: `我先来破冰！${topic}${exclusiveText}${timeHint}${locationHint}，${joinHint}，我先举手！`,
        active: true,
      },
      {
        type: '社恐版',
        icon: '👀',
        text: `${topic}${timeHint}${locationHint}，我有点社恐先+1，大家更想怎么安排呀？`,
        active: false,
      },
      {
        type: '打工人',
        icon: '🏃',
        text: `${topic}${timeHint}${locationHint}，我这边收个尾就到，${joinHint}！`,
        active: false,
      },
    ];
  }, [
    scene.title,
    scene.type,
    scene.time,
    scene.distance,
    scene.total,
    scene.current,
    scene.exclusive,
  ]);

  const showWaitHero = !icebreakDone && inputMode === 'ai' && thread.length === 0;

  return (
    <div
      className={`absolute inset-0 z-[1100] flex flex-col overflow-hidden rounded-[55px] ${HOME_SURFACE.background}`}
    >
      <div className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.28)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-20 top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.26)_0%,rgba(178,176,245,0)_72%)]" />
      <div className="relative z-10 flex items-center justify-between border-b border-white/45 bg-white/35 px-6 pb-4 pt-16 shadow-[0_12px_26px_-24px_rgba(64,100,120,0.35)] backdrop-blur-2xl">
        <button onClick={onClose} className="rounded-full border border-white/70 bg-white/62 p-2.5 text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md active:scale-95 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <div className="flex max-w-[250px] items-center gap-2 rounded-full border border-white/70 bg-white/62 px-4 py-2 shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] backdrop-blur-xl">
          <span className="text-lg filter drop-shadow-sm leading-none">{scene.emoji}</span>
          <span className="truncate text-[13px] font-black tracking-tight text-[#2F3E46]">{scene.title}</span>
          <div className="w-1 h-1 bg-[#56756D]/25 rounded-full mx-1"></div>
          <span className="text-[12px] font-black text-[#6EAFA0]">{scene.current}/{scene.total}</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="relative z-0 flex flex-1 flex-col overflow-y-auto px-6 py-6">
        <div className="mx-auto rounded-full border border-white/70 bg-white/62 px-5 py-2 text-[11px] font-bold text-[#56756D]/70 shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] backdrop-blur-xl animate-in zoom-in-95 duration-500 delay-150">
          ✨ 匿名·产品实习生 悄悄滑进了这个局
        </div>

        {thread.length > 0 && (
          <div className="mt-5 flex w-full flex-col gap-2.5">
            {thread.map((m) => (
              <div key={m.id} className={`flex w-full ${m.me ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-[20px] px-4 py-2.5 text-[13px] font-bold leading-relaxed ${
                    m.me ? 'bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] text-white shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)]' : 'bg-white/75 text-slate-800 border border-white/70 backdrop-blur-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {showWaitHero && (
          <div className="mt-12 flex flex-col items-center justify-center gap-5">
            <div className="flex -space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-white bg-white/75 flex items-center justify-center text-2xl shadow-[0_14px_28px_-18px_rgba(64,100,120,0.55)] backdrop-blur-md z-30">🐶</div>
              <div className="w-16 h-16 rounded-full border-2 border-white bg-white/65 flex items-center justify-center text-2xl shadow-[0_14px_28px_-18px_rgba(64,100,120,0.55)] backdrop-blur-md z-20">🐱</div>
              <div className="w-16 h-16 rounded-full border-2 border-white bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_58%,rgba(178,176,245,0.98)_100%)] flex items-center justify-center text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(64,100,120,0.55)] z-10">YOU</div>
            </div>
            <p className="text-[11px] font-bold tracking-wide text-[#56756D]/45">
              正在等待最后 {Math.max(0, scene.total - scene.current)} 位搭子入场...
            </p>
          </div>
        )}

        {icebreakDone && thread.length === 0 && (
          <p className="mt-8 text-center text-[12px] font-bold text-slate-400">继续和搭子聊天，输入在下方</p>
        )}
      </div>

      <div className="relative mt-auto w-full">
        {inputMode === 'ai' && !icebreakDone ? (
          <div className="relative z-10 rounded-t-[40px] border-t border-white/55 bg-white/72 p-6 pb-10 shadow-[0_-18px_38px_-26px_rgba(64,100,120,0.45)] backdrop-blur-3xl animate-in slide-in-from-bottom-12 fade-in duration-500">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="rounded-[14px] border border-white/70 bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] p-1.5 shadow-[0_8px_18px_-12px_rgba(64,100,120,0.45)]">
                <Wand2 size={16} className="animate-pulse text-white" />
              </div>
              <span className="text-[13px] font-black text-[#2F3E46]">AI 已为你准备好开场白，选一个吧：</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {openingOptions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pickOpeningLine(item.text)}
                  className={`group flex w-full items-center gap-3.5 rounded-[24px] border p-4 transition-all active:scale-[0.98] ${
                    item.active
                      ? 'border-white/75 bg-[linear-gradient(128deg,rgba(255,231,171,0.64)_0%,rgba(150,225,206,0.24)_100%)] shadow-[0_14px_28px_-18px_rgba(64,100,120,0.55)]'
                      : 'border-white/70 bg-white/62 shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] backdrop-blur-xl'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] transition-transform group-active:scale-95">
                    {item.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#56756D]/45">{item.type}</span>
                    <span className="mt-0.5 text-left text-[14px] font-bold text-[#2F3E46]">{item.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className="flex items-center gap-1.5 text-[#56756D]/45 transition-colors hover:text-[#56756D]/70 active:scale-95"
              >
                <MessageSquare size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">切换到手动输入</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={polishFooterRef}
            className="relative z-10 border-t border-white/55 bg-white/88 p-4 pb-8 shadow-[0_-18px_38px_-26px_rgba(64,100,120,0.45)]"
          >
            <div className="flex items-center rounded-[24px] border border-white/70 bg-white/60 p-1.5 shadow-[inset_0_1px_8px_rgba(64,100,120,0.06)]">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') sendManualMessage();
                }}
                placeholder="随便聊点什么，AI随时帮你润色..."
                className="flex-1 border-none bg-transparent px-3 text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-0"
                style={{ color: COLORS.ink }}
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePolish}
                  className="group flex items-center gap-1.5 rounded-[18px] bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] px-3 py-2 text-white shadow-[0_8px_18px_-14px_rgba(64,100,120,0.45)] transition-transform active:scale-95"
                >
                  <Wand2 size={14} className="transition-transform group-active:rotate-12" />
                  <span className="text-[11px] font-black">润色</span>
                </button>
                <button
                  type="button"
                  onClick={sendManualMessage}
                  className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] text-[#2F3E46] shadow-[0_8px_18px_-14px_rgba(64,100,120,0.45)] transition-transform active:scale-95"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>

            {!icebreakDone && inputMode === 'manual' && (
              <div className="absolute -top-10 right-4">
                <button
                  type="button"
                  onClick={() => { setInputMode('ai'); setShowSuggestion(false); }}
                  className="rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-[10px] font-black text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md"
                >
                  返回 AI 破冰
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showSuggestion &&
      polishBubbleLayout &&
      typeof document !== 'undefined' &&
      createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI 润色建议"
          className="relative rounded-[24px] border border-white/70 bg-white/95 p-5 shadow-[0_14px_34px_-24px_rgba(64,100,120,0.42)]"
          style={{
            position: 'fixed',
            zIndex: 10050,
            left: polishBubbleLayout.left,
            width: polishBubbleLayout.width,
            bottom: polishBubbleLayout.bottom,
            maxHeight: 'min(48vh, 320px)',
            overflowY: 'auto',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="mb-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#6EAFA0]">
                <Sparkles size={12} /> AI 润色建议
              </span>
              {polishError ? <p className="mb-2 text-[11px] font-bold text-amber-700">{polishError}</p> : null}
              <div className="min-h-[44px] text-[13px] font-bold leading-snug">
                {polishLoading ? (
                  <span className="flex items-center gap-2 text-slate-500">
                    <span
                      className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-[#56756D]"
                      aria-hidden
                    />
                    正在根据你输入的内容润色…
                  </span>
                ) : (
                  <span className="block break-words text-[14px] leading-snug text-slate-800">
                    {polishSuggestionText ?? '—'}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdopt}
              disabled={polishLoading || !polishSuggestionText?.trim()}
              className="mt-1 flex shrink-0 items-center gap-1.5 rounded-xl bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] px-3.5 py-2.5 text-xs font-black text-white shadow-[0_10px_22px_-18px_rgba(64,100,120,0.45)] transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCircle2 size={14} /> 采用
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowSuggestion(false);
              setPolishSuggestionText(null);
              setPolishError(null);
            }}
            className="absolute right-3 top-3 text-slate-300 hover:text-slate-500"
          >
            <X size={14} />
          </button>
          <div className="pointer-events-none absolute -bottom-2 right-16 h-4 w-4 rotate-45 border-b border-r border-white/70 bg-white/95" />
        </div>,
        document.body
      )}
    </div>
  );
};

// --- ✨ 情报详情抽屉 (Feed Detail Modal) ---
const FeedDetailModal = ({
  feed,
  onClose,
  comments,
  onLike,
  onAddComment,
  onSummonAi,
  aiTipsCache,
}: {
  feed: ReturnType<typeof adaptFeed> | undefined;
  onClose: () => void;
  comments: FeedCommentItem[];
  onLike: (feedId: number) => void;
  onAddComment: (feedId: number, text: string) => void;
  onSummonAi: (feed: ReturnType<typeof adaptFeed>) => void;
  aiTipsCache?: Record<number, string>;
}) => {
  if (!feed) return null;
  const [commentInput, setCommentInput] = useState('');
  const [actionHint, setActionHint] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const aiTip = buildFeedAiTip(feed, aiTipsCache?.[feed.id]);
  const displayComments = comments ?? [];

  const submitComment = () => {
    if (!commentInput.trim() || isSendingComment) return;
    setIsSendingComment(true);
    onAddComment(feed.id, commentInput.trim());
    setCommentInput('');
    setActionHint('评论已发送');
    setTimeout(() => setIsSendingComment(false), 800);
  };

  return (
    <div className="absolute inset-0 z-[1200] flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#FAFAFA]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white rounded-t-[40px] w-full h-[88%] relative z-10 flex flex-col animate-in slide-in-from-bottom-[100%] duration-500 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-16 pb-4 border-b border-slate-100/50 shrink-0">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9D8B1]/20 border border-[#F9D8B1]/50 rounded-full">
            <span className="text-[12px] leading-none">🚨</span>
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest mt-0.5">实时情报</span>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="px-6 pt-6 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 overflow-hidden rounded-[16px] bg-[#F8FAF8] flex items-center justify-center text-2xl border border-slate-100 shadow-inner shrink-0">
                <AvatarVisual avatar={feed.avatar} className="flex h-full w-full items-center justify-center" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-black text-slate-800 tracking-tight">{feed.author}</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-black bg-[#87A382]/10 text-[#87A382] border border-[#87A382]/20">
                    {feed.location}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400">{feed.time}</span>
                </div>
              </div>
            </div>
            
            <p className="text-[15px] font-bold text-slate-700 leading-relaxed">
              {feed.content}
            </p>
            
            {feed.hasImage && (
              <div className="w-full h-40 bg-slate-50 rounded-[20px] border border-slate-100/60 mt-4 flex items-center justify-center text-slate-300 shadow-inner">
                <ImageIcon size={32} className="opacity-30" />
              </div>
            )}
          </div>

          {/* AI Insight Card */}
          <div className="px-6 mb-8">
            <div className="bg-gradient-to-br from-[#F9D8B1]/30 to-white/50 rounded-[24px] p-5 border border-[#F9D8B1]/40 shadow-sm relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/60 rounded-full blur-xl"></div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Sparkles size={16} className="text-[#F3B671]" />
                <span className="text-[12px] font-black text-amber-700 tracking-wider">AI 避雷提示</span>
              </div>
              <p className="text-[13px] font-bold text-amber-900/70 leading-relaxed relative z-10">
                {aiTip}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-6 pb-6">
            <h3 className="text-[14px] font-black text-slate-800 mb-6 flex items-center gap-2">
              情报补充 <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{displayComments.length}</span>
            </h3>
            
            {displayComments.length > 0 ? (
              <div className="flex flex-col gap-5">
                {displayComments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 overflow-hidden rounded-[12px] bg-slate-50 flex items-center justify-center text-lg border border-slate-100 shrink-0 shadow-sm">
                      <AvatarVisual avatar={comment.avatar} className="flex h-full w-full items-center justify-center" />
                    </div>
                    <div className="flex-1 pt-1">
                      <span className="text-[12px] font-black text-slate-800 tracking-tight">{comment.author}</span>
                      <p className="text-[13px] font-medium text-slate-600 mt-1 leading-snug">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
                <span className="text-3xl opacity-50 mb-3">💬</span>
                <p className="text-[12px] font-bold text-slate-400 mb-4 text-center leading-relaxed">这里还没有情报补充，<br/>你可以问问 AI 怎么看？</p>
                <button
                  onClick={() => onSummonAi(feed)}
                  className="px-5 py-2.5 bg-[#87A382]/10 text-[#87A382] rounded-[16px] text-[12px] font-black flex items-center gap-1.5 active:scale-95 transition-transform border border-[#87A382]/20"
                >
                  <Bot size={14} /> 召唤 AI 嘴替
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          {actionHint ? (
            <div className="mb-2 text-[11px] font-bold text-[#87A382]">{actionHint}</div>
          ) : null}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2">
          <div className="min-w-0 bg-slate-100/80 rounded-[20px] px-4 py-3 flex items-center border border-slate-200/50">
            <input 
              type="text" 
              placeholder="说点什么补充情报..." 
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
              disabled={isSendingComment}
              className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-medium placeholder:text-slate-400"
            />
            <Smile size={16} className="text-slate-400 ml-2" />
          </div>
          <button
            onClick={() => {
              onLike(feed.id);
              setActionHint('已点赞 +1');
            }}
            className="w-11 h-11 min-w-11 min-h-11 shrink-0 aspect-square rounded-[14px] bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-sm active:scale-90 transition-transform"
            aria-label="点赞"
          >
            <Heart size={19} />
          </button>
          <button
            onClick={() => {
              const text = `${feed.author} 在 UniPass 分享了情报：\n\n${feed.content}\n\n位置：${feed.location}\n标签：${(feed.tags ?? []).join('、')}`;
              copyToClipboard(text);
              setActionHint('已复制到剪贴板');
            }}
            className="w-11 h-11 min-w-11 min-h-11 shrink-0 aspect-square rounded-[14px] bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-transform"
            aria-label="分享"
          >
            <Share2 size={19} />
          </button>
          <button
            onClick={() => {
              if (!commentInput.trim()) { setActionHint('先输入内容再评论'); return; }
              submitComment();
            }}
            disabled={isSendingComment}
            className={`w-11 h-11 min-w-11 min-h-11 shrink-0 aspect-square rounded-[14px] flex items-center justify-center border shadow-sm transition-transform ${
              isSendingComment
                ? 'bg-slate-50 text-slate-300 border-slate-100'
                : 'bg-amber-50 text-amber-500 border-amber-100 active:scale-90'
            }`}
            aria-label="评论发送"
          >
            {isSendingComment
              ? <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              : <MessageCircle size={19} />
            }
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ✨ [发布情报] 全屏发布页 (Publish Modal) ---
/** 敏感词关键词列表（马赛克模式下替换为 ██）*/
/** AI 接口失败时随机返回的静态话术模板（网络异常降级） */
const AI_FALLBACK_TEMPLATES = [
  '哎呀，AI 助理临时离线了～不过你已经表达得很清楚啦，直接发出去也没问题！',
  '网络信号有点弱，AI 暂时无法响应。你的想法已经够棒了，试着直接发布吧？',
  '这次 AI 开小差了，建议你换个 WiFi 再试，或者直接用自己的措辞发出去 ✨',
  '连接 AI 时遇到了一点小波折，稍后重试看看～你的原文表达也很好！',
];
function getAiFallback(): string {
  return AI_FALLBACK_TEMPLATES[Math.floor(Math.random() * AI_FALLBACK_TEMPLATES.length)];
}

const MOSAIC_KEYWORDS = [
  '工资','薪资','薪水','待遇','底薪','绩效','奖金','涨薪','降薪',
  '裁员','辞职','离职','被开','炒鱿鱼','解雇',
  '老板','CEO','总监','VP','HRD','HR','leader',
  '会议记录','季度目标','OKR','KPI','产品规划','路线图',
  '竞品','内部','机密','保密','NDA',
];

/** 马赛克处理：把命中词替换成同长度 ██ */
function applyMosaic(text: string): string {
  let result = text;
  for (const kw of MOSAIC_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), (m) => '█'.repeat(m.length));
  }
  return result;
}

const PublishModal = ({ onClose, onPublished, userProfile }) => {
  const CATEGORIES = [
    { id: 'trick', icon: '🤫', label: '小邪招', placeholder: '发现什么摸鱼宝地或奇葩bug？' },
    { id: 'place', icon: '📍', label: '好去处', placeholder: '公司附近有什么好吃的、好玩的？' },
    { id: 'vent', icon: '📝', label: '吐槽', placeholder: '吐槽请随意，但别发公司机密和真实代码哦～' },
    { id: 'photo', icon: '📸', label: '打卡', placeholder: '记录今天的神仙落日或食堂盲盒...' },
    { id: 'help', icon: '🆘', label: '紧急求助', placeholder: '遇到棘手问题？大伙儿帮你出谋划策！' }
  ];

  const AVATARS = ['🐧', '🐕', '🐱', '🦊', '🐨', '🐼', '🐰', '🦁', '🐯', '🦉'];

  const [activeCat, setActiveCat] = useState(CATEGORIES[2]); 
  const [text, setText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageLoadingCount, setImageLoadingCount] = useState(0);
  const [showPublishExitConfirm, setShowPublishExitConfirm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [publishCoords, setPublishCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPickerLoading, setLocationPickerLoading] = useState(false);
  const [dynamicLocationChoices, setDynamicLocationChoices] = useState<
    Array<{ label: string; lat?: number; lng?: number }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const tryQuality = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('压缩失败')); return; }
              if (blob.size > 500 * 1024 && q > 0.3) { tryQuality(q - 0.1); return; }
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            },
            'image/jpeg',
            q,
          );
        };
        tryQuality(0.85);
      };
      img.onerror = reject;
      img.src = url;
    });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageLoadingCount((c) => c + files.length);
    files.forEach((file) => {
      compressImage(file)
        .then((dataUrl) => {
          setSelectedImages((prev) => [...prev, dataUrl].slice(0, 9));
        })
        .catch(() => { /* 压缩失败：忽略该文件 */ })
        .finally(() => setImageLoadingCount((c) => Math.max(0, c - 1)));
    });
    e.target.value = '';
  };

  const briefFromNominatim = (data: unknown): string => {
    if (!data || typeof data !== 'object') return '';
    const d = data as { address?: Record<string, string>; display_name?: string };
    const addr = d.address;
    if (addr) {
      const parts = [addr.road, addr.neighbourhood, addr.suburb, addr.district, addr.city_district, addr.city].filter(
        Boolean
      ) as string[];
      const compact = [...new Map(parts.map((p) => [p, p])).values()].slice(0, 2);
      return compact.join(' · ');
    }
    if (typeof d.display_name === 'string') {
      return d.display_name.split(',').slice(0, 2).join(' · ').trim();
    }
    return '';
  };

  useEffect(() => {
    if (!showLocationPicker) return;

    const fallbackChoices = (): Array<{ label: string; lat?: number; lng?: number }> => {
      const rows: Array<{ label: string; lat?: number; lng?: number }> = [];
      if (userProfile?.company) rows.push({ label: userProfile.company });
      rows.push(
        { label: '公司附近' },
        { label: '公司园区内' },
        { label: '公司食堂' },
        { label: '公司楼下咖啡厅' },
        { label: '地铁站' }
      );
      return rows;
    };

    setLocationPickerLoading(true);
    setDynamicLocationChoices([]);

    const finishWithFallback = () => {
      setDynamicLocationChoices(fallbackChoices());
      setLocationPickerLoading(false);
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      finishWithFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const items: Array<{ label: string; lat?: number; lng?: number }> = [];

        try {
          const [geoJson, placesJson] = await Promise.all([
            fetch(`/api/geocode?lat=${lat}&lon=${lng}`).then((r) => { if (!r.ok) throw new Error('geocode'); return r.json(); }),
            fetch(`/api/nearby-places?lat=${lat}&lon=${lng}`).then((r) => { if (!r.ok) throw new Error('places'); return r.json(); }),
          ]);

          const brief = briefFromNominatim(geoJson);
          items.push({ label: brief ? `📍 ${brief}` : '📍 当前位置周边', lat, lng });

          const placesList = Array.isArray(placesJson?.places) ? placesJson.places : [];
          for (const p of placesList as Array<{ name?: string; lat: number; lon: number }>) {
            const name = typeof p?.name === 'string' ? p.name.trim() : '';
            if (!name) continue;
            if (items.some((i) => i.label.replace(/^📍\s*/, '') === name || i.label === name)) continue;
            items.push({ label: name, lat: p.lat, lng: p.lon });
            if (items.length >= 12) break;
          }
        } catch {
          items.push({ label: '📍 当前位置', lat, lng });
        }

        if (typeof userProfile?.company === 'string' && userProfile.company.trim()) {
          const company = userProfile.company.trim();
          if (!items.some((i) => i.label.endsWith(company) || i.label.includes(company))) {
            items.push({ label: company });
          }
        }

        items.push(...fallbackChoices());
        const seen = new Set<string>();
        const deduped = items.filter((row) => {
          const key = row.label.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setDynamicLocationChoices(deduped.slice(0, 16));
        setLocationPickerLoading(false);
      },
      () => finishWithFallback(),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 }
    );
  }, [showLocationPicker, userProfile?.company]);

  const handlePolish = async () => {
    if (!text.trim()) return;
    setIsPolishing(true);
    try {
      const res = await fetch('/api/eq-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, scenario: null }),
      });
      const data = await res.json();
      setPolishedText(data.result ?? data.error ?? '生成失败，请重试');
    } catch {
      setPolishedText(getAiFallback());
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePublish = async () => {
    let content = (polishedText || text).trim();
    if (!content) return;
    // 马赛克模式：对敏感词做替换
    if (userProfile?.privacyMosaic !== false) {
      content = applyMosaic(content);
    }
    setIsPublishing(true);
    try {
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      
      // 根据 category id 映射到文本标签
      const categoryMap: Record<string, string> = {
        'trick': '小邪招',
        'place': '好去处',
        'vent': '吐槽',
        'photo': '打卡',
        'help': '紧急求助',
      };
      
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          tags: [`${activeCat.icon} ${activeCat.label}`],
          avatar: userProfile?.avatar ?? randomAvatar,
          author: userProfile?.nickname ?? '匿名实习生',
          location: selectedLocation || userProfile?.company || '未知位置',
          company: userProfile?.company || null,
          category: categoryMap[activeCat.id] || 'other',
          has_image: selectedImages.length > 0,
          ...(publishCoords && Number.isFinite(publishCoords.lat) && Number.isFinite(publishCoords.lng)
            ? { lat: publishCoords.lat, lng: publishCoords.lng }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(typeof data?.error === 'string' ? data.error : `发布失败（${res.status}），请稍后再试`);
        return;
      }
      if (data.data) {
        track('feed_published', { category: categoryMap[activeCat.id] || 'other', has_image: selectedImages.length > 0 });
        await Promise.resolve(onPublished?.(adaptFeed(data.data)));
        onClose();
      } else if (data.error) {
        window.alert(String(data.error));
      } else {
        window.alert('发布失败：服务器未返回数据，请检查网络或 Supabase 权限');
      }
    } catch {
      window.alert('发布失败：网络异常，请稍后再试');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`absolute inset-0 z-[1200] ${HOME_SURFACE.background} rounded-[55px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-[100%] duration-500`}>
      <div className="pointer-events-none absolute -left-24 top-4 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.24)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-24 top-28 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.24)_0%,rgba(178,176,245,0)_72%)]" />
      <div className="relative z-10 pt-16 pb-4 px-6 flex items-center justify-between border-b border-white/45 bg-white/35 shadow-[0_12px_26px_-24px_rgba(64,100,120,0.35)] backdrop-blur-2xl shrink-0">
        <button
          onClick={() => { if (text.trim() || selectedImages.length > 0) { setShowPublishExitConfirm(true); } else { onClose(); } }}
          className="rounded-full border border-white/70 bg-white/62 p-2 text-[#56756D]/70 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md hover:text-[#56756D] active:scale-90 transition-all">
          <X size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-black text-[#2F3E46]">发布情报</h2>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#56756D]/45">Share intel</p>
        </div>
        <button 
          onClick={handlePublish}
          disabled={!text.trim() || isPublishing}
          className={`px-4 py-1.5 rounded-full text-[13px] font-black transition-all border ${
            text.trim() && !isPublishing
              ? 'border-white/70 bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] text-[#2F3E46] active:scale-95 shadow-[0_8px_18px_-14px_rgba(64,100,120,0.45)]'
              : 'border-white/70 bg-white/55 text-[#56756D]/35'
          }`}
        >
          {isPublishing ? '发布中...' : '发布'}
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto no-scrollbar p-6 pb-8">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 shrink-0">
          {CATEGORIES.map(cat => {
            const isActive = activeCat.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat)}
                className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-black transition-all border active:scale-95 ${
                  isActive 
                    ? HOME_SURFACE.chipActive
                    : HOME_SURFACE.chipInactive
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            )
          })}
        </div>

        <div className={`relative mt-4 flex min-h-[220px] shrink-0 flex-1 flex-col overflow-hidden rounded-[28px] ${HOME_SURFACE.glassCard} p-5`}>
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(176,204,248,0.18)_0%,rgba(176,204,248,0)_70%)]" />
          <textarea
            className="relative z-10 flex-1 w-full bg-transparent resize-none focus:outline-none text-[15px] font-medium leading-relaxed text-[#40515A] placeholder:text-[#56756D]/35"
            placeholder={activeCat.placeholder}
            value={text}
            onChange={e => {
              setText(e.target.value);
              setPolishedText(null); 
            }}
          />
          <div className="relative z-10 flex items-center gap-3 mt-auto pt-4 shrink-0">
            <button onClick={() => fileInputRef.current?.click()} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/58 text-[#56756D]/55 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md hover:text-[#6EAFA0] active:scale-90 transition-all">
              <ImageIcon size={22} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            <button onClick={() => setShowLocationPicker(true)} className="flex h-10 items-center gap-1.5 rounded-full border border-white/70 bg-white/58 px-3 text-[#56756D]/55 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md hover:text-[#6EAFA0] active:scale-90 transition-all">
              <MapPin size={22} />
              {selectedLocation && <span className="text-[11px] font-bold text-[#6EAFA0]">{selectedLocation}</span>}
            </button>
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 shrink-0">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-[16px] border border-white/70 bg-white/55 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#2F3E46]/55 backdrop-blur-md rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {imageLoadingCount > 0 && Array.from({ length: imageLoadingCount }).map((_, i) => (
              <div key={`loading-${i}`} className="aspect-square rounded-[16px] bg-white/42 border border-white/70 flex items-center justify-center backdrop-blur-md">
                <Loader2 size={20} className="animate-spin text-[#6EAFA0]" />
              </div>
            ))}
            {selectedImages.length + imageLoadingCount < 9 && (
              <button onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[16px] bg-white/42 border-2 border-dashed border-white/80 flex flex-col items-center justify-center text-[#9CB7C9] backdrop-blur-md active:scale-95 transition-transform">
                <Plus size={20} />
                <span className="text-[10px] font-bold mt-1">添加</span>
              </button>
            )}
          </div>
        )}

        {/* 定位选择弹窗：紧凑底部抽屉 + 真实定位/OSM 周边 */}
        {showLocationPicker && (
          <div
            className="absolute inset-0 z-[200] flex flex-col justify-end overflow-hidden"
            role="presentation"
            onClick={() => setShowLocationPicker(false)}
          >
            <div className="absolute inset-0 bg-[#2F3E46]/28 backdrop-blur-sm" />
            <div
              className={`relative z-10 w-full min-h-0 max-h-[68%] rounded-t-[22px] ${HOME_SURFACE.background} shadow-[0_-18px_48px_-28px_rgba(47,62,70,0.38)] animate-in slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden pb-[max(10px,env(safe-area-inset-bottom))]`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute -right-14 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.22)_0%,rgba(178,176,245,0)_72%)]" />
              <div className="relative z-10 mx-auto mt-1.5 h-1 w-9 rounded-full bg-[#56756D]/14 shrink-0" aria-hidden />

              <div className="relative z-10 flex items-center justify-between px-4 pt-2.5 pb-2 shrink-0">
                <h3 className="text-[14px] font-black text-[#2F3E46] tracking-tight">选择发布位置</h3>
                {locationPickerLoading ? (
                  <span className="text-[11px] font-bold text-[#6EAFA0]">定位中…</span>
                ) : (
                  <span className="text-[11px] font-bold text-[#56756D]/40">GPS + 周边地点</span>
                )}
              </div>

              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain no-scrollbar px-3 pb-1 touch-pan-y [-webkit-overflow-scrolling:touch]">
                {locationPickerLoading && dynamicLocationChoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-[#56756D]/55">
                    <div className="w-5 h-5 border-2 border-[#6EAFA0] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[12px] font-bold">获取位置与周边…</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 pb-1">
                    {dynamicLocationChoices.map((row, idx) => {
                      const display = row.label.replace(/^📍\s*/, '').trim();
                      const isSel = selectedLocation === display;
                      return (
                        <button
                          key={`${row.label}-${idx}`}
                          disabled={locationPickerLoading}
                          onClick={() => {
                            setSelectedLocation(display);
                            setPublishCoords(
                              typeof row.lat === 'number' && typeof row.lng === 'number'
                                ? { lat: row.lat, lng: row.lng }
                                : null
                            );
                            setShowLocationPicker(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-[14px] text-[13px] font-bold transition-all flex items-center gap-2 border ${
                            isSel ? HOME_SURFACE.chipActive : HOME_SURFACE.chipInactive
                          } ${locationPickerLoading ? 'opacity-55' : ''}`}
                        >
                          <MapPin size={14} className={`shrink-0 ${isSel ? 'text-white' : 'text-[#6EAFA0]'}`} />
                          <span className="min-w-0 leading-snug line-clamp-2">{display}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedLocation('');
                  setPublishCoords(null);
                  setShowLocationPicker(false);
                }}
                className="relative z-10 shrink-0 w-full px-4 pt-1 text-center text-[12px] font-bold text-[#56756D]/45 active:opacity-70 pb-px"
              >
                不显示位置
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 shrink-0">
          {isPolishing ? (
            <div className={`rounded-[20px] ${HOME_SURFACE.glassCard} p-4 flex items-center justify-center gap-3`}>
              <div className="w-4 h-4 border-2 border-[#6EAFA0] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[13px] font-black text-[#6EAFA0]">AI 正在进行匿名化与润色...</span>
            </div>
          ) : polishedText ? (
            <div className={`rounded-[24px] ${HOME_SURFACE.glassCard} p-5 animate-in fade-in slide-in-from-top-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#6EAFA0] tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles size={12} /> AI 优化并已脱敏
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(polishedText || '')}
                    className="text-[11px] font-black border border-white/70 bg-white/50 text-[#56756D] px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
                  >
                    复制
                  </button>
                  <button 
                    onClick={() => { setText(polishedText || ''); setPolishedText(null); }} 
                    className="text-[11px] font-black bg-[linear-gradient(125deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_100%)] text-white px-3 py-1.5 rounded-xl shadow-[0_8px_18px_-14px_rgba(64,100,120,0.45)] active:scale-95 transition-transform"
                  >
                    采用
                  </button>
                </div>
              </div>
              <p className="text-[14px] font-medium text-[#40515A] leading-relaxed">{polishedText}</p>
            </div>
          ) : (
            <button 
              onClick={handlePolish} 
              disabled={!text.trim()}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-[20px] font-black text-[14px] transition-all border ${
                text.trim() 
                  ? 'bg-[linear-gradient(128deg,rgba(255,231,171,0.34)_0%,rgba(150,225,206,0.16)_100%)] text-[#2F3E46] border-white/70 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] active:scale-95' 
                  : 'bg-white/45 text-[#56756D]/35 border-white/60'
              }`}
            >
              <Sparkles size={18} className={text.trim() ? 'text-[#6EAFA0]' : 'text-[#56756D]/30'} />
              AI 帮我更有梗 & 保护隐私
            </button>
          )}
        </div>

        <div className="mt-auto pt-8 shrink-0">
          <p className="text-[10px] font-black text-[#56756D]/45 flex items-center justify-center gap-1.5 bg-white/45 border border-white/60 py-2.5 rounded-full backdrop-blur-md">
            <ShieldCheck size={14} className="text-[#6EAFA0]" /> UniPass 已开启隐私护盾，身份将被 AI 匿名化。
          </p>
        </div>
      </div>

      {/* 退出保存提示：内容不为空时拦截关闭 */}
      {showPublishExitConfirm && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-[#2F3E46]/32 backdrop-blur-sm" onClick={() => setShowPublishExitConfirm(false)} />
          <div className={`relative z-10 w-full max-w-[17.5rem] rounded-[24px] p-5 ${HOME_SURFACE.glassCard} animate-in zoom-in-95 duration-200`}>
            <div className="flex gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-amber-200/80 bg-amber-50 text-amber-500">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#2F3E46]">确定要放弃这篇情报吗？</p>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">你写的内容将不会被保存。</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowPublishExitConfirm(false)}
                className="flex-1 rounded-full border border-white/72 bg-white/65 py-2.5 text-[12px] font-bold text-[#56756D] active:scale-[0.98] transition-transform">
                继续写
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 rounded-full bg-amber-500 py-2.5 text-[12px] font-bold text-white active:scale-[0.98] transition-transform">
                放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- ✨ [Tab 5 专属] AI 简历实验室 (Resume Lab Modal) ---
const ResumeLabModal = ({ onClose }: { onClose: () => void }) => {
  const [isTranslating, setIsTranslating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsTranslating(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 z-[1200] flex flex-col animate-in slide-in-from-bottom-[100%] duration-500 overflow-hidden rounded-[55px] ${HOME_SURFACE.background}`}>
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.28)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-14 top-24 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.26)_0%,rgba(178,176,245,0)_72%)]" />
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/45 bg-white/45 px-6 pb-4 pt-16 shadow-[0_12px_26px_-24px_rgba(64,100,120,0.35)] backdrop-blur-2xl">
        <button onClick={onClose} className={`${UI.subtleButton} p-2 -ml-2`}>
          <ArrowLeft size={20} className="text-[#56756D]" />
        </button>
        <h2 className="text-[16px] font-black tracking-tight text-[#2F3E46] flex items-center gap-2">
          <Sparkles size={16} className="text-[#B4873C]" /> AI 简历实验室
        </h2>
        <div className="w-10" aria-hidden />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <div className="mb-5 shrink-0 px-6">
          <h3 className="mb-1 text-[17px] font-black tracking-tight text-[#2F3E46]">STAR 高光转译</h3>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#56756D]/55">Swipe · 原版 / AI</p>
        </div>

        <div className="flex h-[400px] w-full snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-6 pb-6 no-scrollbar">
          <div className={`relative flex w-[85%] max-w-[300px] shrink-0 snap-center flex-col p-5 ${UI.profileSurface}`}>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-[#DCE8DE]/90 bg-white/70 px-2 py-1 text-[9px] font-black tracking-wider text-[#64748B] shadow-sm backdrop-blur-sm">
              原版
            </span>
            <div className="mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#6EAFA0]" />
              <h4 className="text-[13px] font-black text-[#2F3E46]">日常手记</h4>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto no-scrollbar">
              <div className={`p-4 ${UI.profileInner}`}>
                <span className="mb-2 block text-[10px] font-bold text-[#94A3A8]">11月12日</span>
                <p className="text-[12px] font-medium leading-relaxed text-[#40515A]">
                  今天花了一下午整理杂乱的数据报表，梳理出了很多重复的数据，看得眼睛都花了。
                </p>
              </div>
              <div className={`p-4 ${UI.profileInner}`}>
                <span className="mb-2 block text-[10px] font-bold text-[#94A3A8]">11月15日</span>
                <p className="text-[12px] font-medium leading-relaxed text-[#40515A]">
                  拉着开发和设计开了一下午的会，终于把卡了三天的进度推进下去了，累瘫。
                </p>
              </div>
            </div>
          </div>

          <div className={`relative flex w-[85%] max-w-[300px] shrink-0 snap-center flex-col overflow-hidden border border-[#E8CF9A]/60 p-5 ${UI.profileSurface}`}>
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,231,171,0.45)_0%,rgba(255,231,171,0)_70%)]" />
            <span className="absolute right-0 top-0 z-10 rounded-bl-[14px] border border-[#E8CF9A]/70 bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(240,208,144,0.92)_100%)] px-3 py-1 text-[9px] font-black tracking-[0.12em] text-[#4A3F2E] shadow-sm backdrop-blur-sm">
              AI
            </span>
            
            <div className="relative z-10 mb-4 flex items-center gap-2">
              <Award size={18} className="text-[#B4873C]" />
              <h4 className="text-[13px] font-black text-[#2F3E46]">简历高光</h4>
            </div>

            {isTranslating ? (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#96E1CE]/35 border-t-[#6EAFA0]" />
                <span className="text-[11px] font-black tracking-wider text-[#56756D] animate-pulse">解析中...</span>
              </div>
            ) : (
              <div className="relative z-10 flex flex-1 flex-col gap-3 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
                <div className="relative flex flex-col gap-2">
                  <div className="absolute bottom-2 left-[7px] top-6 w-[2px] rounded-full bg-white/85" aria-hidden />
                  <div className="relative pl-6">
                    <div className="absolute left-[2px] top-1 z-10 h-3 w-3 rounded-full border-2 border-white bg-[#6EAFA0] shadow-sm" aria-hidden />
                    <h5 className="mb-2 text-[12px] font-black text-[#2F3E46]">数据治理</h5>
                    <div className={`p-3 text-[11px] font-medium leading-relaxed text-[#40515A] ${UI.profileInner}`}>
                      <span className="font-black text-[#56756D]">S/A/R：</span>
                      接手冗余报表→清洗维度→提升调用准确率与效率
                    </div>
                  </div>
                  <div className="relative mt-1 pl-6">
                    <div className="absolute left-[2px] top-1 z-10 h-3 w-3 rounded-full border-2 border-white bg-[#6EAFA0] shadow-sm" aria-hidden />
                    <h5 className="mb-2 text-[12px] font-black text-[#2F3E46]">跨部门推进</h5>
                    <div className={`p-3 text-[11px] font-medium leading-relaxed text-[#40515A] ${UI.profileInner}`}>
                      <span className="font-black text-[#56756D]">S/A/R：</span>
                      阻塞多方协作→组织对齐全景→按期解锁节点
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 shrink-0 border-t border-white/55 bg-white/55 p-6 pb-8 shadow-[0_-14px_40px_-24px_rgba(64,100,120,0.28)] backdrop-blur-3xl">
          <button 
            disabled={isTranslating}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-black transition-all ${
              isTranslating 
                ? 'border border-white/70 bg-white/45 text-[#56756D]/35' 
                : UI.primaryButton
            }`}
          >
            导出为 PDF <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ✨ [Tab 5 专属] 学生认证 (Student Verification Modal) ---
const StudentVerifyModal = ({
  onClose,
  onVerified,
}: {
  onClose: () => void;
  onVerified: (email: string) => void;
}) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email.trim().toLowerCase().endsWith('.edu.cn')) {
      setError('请输入以 .edu.cn 结尾的高校邮箱');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-edu-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '发送失败，请重试'); return; }
      setStep('otp');
      setCountdown(60);
      if (data.dev_code) {
        setError(`[开发模式] 验证码：${data.dev_code}`);
      }
    } catch {
      setError('网络异常，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { setError('请输入 6 位验证码'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-edu-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? '验证失败'); return; }
      onVerified(email.trim().toLowerCase());
    } catch {
      setError('网络异常，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[1100] flex items-end">
      <div className="absolute inset-0 bg-[#2F3E46]/32 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full rounded-t-[32px] ${HOME_SURFACE.background} p-6 pb-10 shadow-[0_-24px_70px_-30px_rgba(47,62,70,0.35)]`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-[#4A90D9]" />
            <h3 className="text-[17px] font-black text-[#2F3E46]">学生认证</h3>
          </div>
          <button onClick={onClose} className={`${UI.subtleButton} p-2`}>
            <X size={18} className="text-[#56756D]" />
          </button>
        </div>

        <p className="text-[12px] text-slate-500 mb-5 leading-relaxed">
          使用高校 <span className="font-bold text-[#4A90D9]">.edu.cn</span> 邮箱完成验证，获得学生认证徽章，解锁学生专属功能。
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[12px] font-bold text-slate-600 mb-1 block">高校邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="xxx@stu.pku.edu.cn"
              disabled={step === 'otp'}
              className="w-full rounded-[14px] border border-[#E8ECE8] bg-white/90 px-4 py-3 text-[14px] text-[#2F3E46] placeholder:text-slate-300 focus:border-[#4A90D9] focus:outline-none disabled:opacity-60"
            />
          </div>

          {step === 'otp' && (
            <div>
              <label className="text-[12px] font-bold text-slate-600 mb-1 block">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="6 位验证码"
                  className="flex-1 rounded-[14px] border border-[#E8ECE8] bg-white/90 px-4 py-3 text-[14px] text-[#2F3E46] placeholder:text-slate-300 focus:border-[#4A90D9] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleSendOtp}
                  className="shrink-0 rounded-[14px] border border-[#4A90D9]/30 bg-[#EEF8FF] px-3 py-2 text-[12px] font-bold text-[#4A90D9] disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : '重新发送'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className={`text-[11px] font-medium ${error.startsWith('[开发') ? 'text-blue-500' : 'text-red-500'}`}>{error}</p>
          )}

          <button
            type="button"
            onClick={step === 'input' ? handleSendOtp : handleVerify}
            disabled={loading}
            className="w-full rounded-[18px] py-3.5 text-[15px] font-black text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
            style={{ background: 'linear-gradient(125deg,#4A90D9 0%,#7BA7DC 100%)' }}
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : step === 'input' ? '获取验证码' : <><MailCheck size={16} /> 完成认证</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ✨ [Tab 5 专属] 隐私护盾设置 (Privacy Shield Drawer) ---
const PrivacyShieldDrawer = ({
  onClose,
  privacyStealth,
  privacyMosaic,
  onToggleStealth,
  onToggleMosaic,
  onRefreshNickname,
}: {
  onClose: () => void;
  privacyStealth: boolean;
  privacyMosaic: boolean;
  onToggleStealth: (v: boolean) => void;
  onToggleMosaic: (v: boolean) => void;
  onRefreshNickname?: (nickname: string) => void;
}) => {
  const toggles = { stealth: privacyStealth, mosaic: privacyMosaic };
  const setToggles = (key: 'stealth' | 'mosaic', value: boolean) => {
    if (key === 'stealth') onToggleStealth(value);
    else onToggleMosaic(value);
  };
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshId = () => {
    setIsRefreshing(true);
    const newNickname = generateRandomNickname();
    onRefreshNickname?.(newNickname);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="absolute inset-0 z-[1200] flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#2F3E46]/28 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className={`relative z-10 w-full animate-in slide-in-from-bottom-[100%] duration-400 rounded-t-[36px] border-t border-white/70 px-6 pb-10 pt-6 shadow-[0_-24px_70px_-30px_rgba(47,62,70,0.35)] ${HOME_SURFACE.background}`}>
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#CBD5CF]/85" />

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#C8DDD2]/90 bg-[color:rgba(255,255,255,0.92)] shadow-[0_10px_22px_-14px_rgba(64,100,120,0.28)] backdrop-blur-sm">
            <ShieldCheck size={22} className="text-[#56756D]" />
          </div>
          <div>
            <h2 className="text-[17px] font-black tracking-tight text-[#2F3E46]">隐私护盾</h2>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#56756D]/50">与安全偏好</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className={`flex items-center justify-between p-4 ${UI.profileInner}`}>
            <div className="min-w-0 flex-1 pr-3">
              <span className="block text-[13px] font-black text-[#2F3E46]">大厂隐身模式</span>
              <span className="mt-1 block text-[11px] font-medium leading-snug text-[#64748B]">
                减少与同司用户的内容交叉展示，降低偶遇风险。
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setToggles('stealth', !toggles.stealth)}
              className={`h-8 w-[3.0625rem] shrink-0 rounded-full p-[3px] transition-colors duration-300 ${toggles.stealth ? 'bg-[linear-gradient(125deg,rgba(150,225,206,0.95)_0%,rgba(176,204,248,0.9)_58%,rgba(178,176,245,0.92)_100%)]' : 'border border-[#DCE8DE] bg-[color:rgba(255,255,255,0.75)]'}`}
              aria-pressed={toggles.stealth}
            >
              <div className={`h-[1.375rem] w-[1.375rem] rounded-full bg-white shadow-sm transition-transform duration-300 ${toggles.stealth ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className={`flex items-center justify-between p-4 ${UI.profileInner}`}>
            <div className="min-w-0 flex-1 pr-3">
              <span className="block text-[13px] font-black text-[#2F3E46]">敏感词马赛克</span>
              <span className="mt-1 block text-[11px] font-medium leading-snug text-[#64748B]">
                发帖时提示并遮蔽可能的指标、代号等高风险片段。
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setToggles('mosaic', !toggles.mosaic)}
              className={`h-8 w-[3.0625rem] shrink-0 rounded-full p-[3px] transition-colors duration-300 ${toggles.mosaic ? 'bg-[linear-gradient(125deg,rgba(150,225,206,0.95)_0%,rgba(176,204,248,0.9)_58%,rgba(178,176,245,0.92)_100%)]' : 'border border-[#DCE8DE] bg-[color:rgba(255,255,255,0.75)]'}`}
              aria-pressed={toggles.mosaic}
            >
              <div className={`h-[1.375rem] w-[1.375rem] rounded-full bg-white shadow-sm transition-transform duration-300 ${toggles.mosaic ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className={`mt-1 flex items-center justify-between p-4 ${UI.profileInner}`}>
            <div className="min-w-0 flex-1 pr-3">
              <span className="block text-[13px] font-black text-[#2F3E46]">重置匿名昵称</span>
              <span className="mt-1 block text-[11px] font-medium leading-snug text-[#64748B]">
                随机生成新的对外展示代号，对方无法得知真实信息。
              </span>
            </div>
            <button 
              type="button"
              onClick={handleRefreshId}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-90 ${UI.subtleButton} p-0`}
              aria-busy={isRefreshing}
            >
              <ZapIcon size={16} className={isRefreshing ? 'animate-spin text-[#56756D]' : 'text-[#56756D]'} />
            </button>
          </div>
        </div>

        <button 
          type="button"
          onClick={onClose}
          className={`mt-6 w-full py-4 text-[14px] font-black ${UI.primaryButton}`}
        >
          完成
        </button>
      </div>
    </div>
  );
};

// --- ✨ [Tab 3] AI 职场氧气站 (AI Oxygen Station) ---
const AIOxygenStation = ({
  onSaveAchievementCapsule,
}: {
  onSaveAchievementCapsule?: (c: { tag: string; desc: string }) => void;
}) => {
  const [eqInput, setEqInput] = useState('');
  const [eqOutput, setEqOutput] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [activeMascot, setActiveMascot] = useState<'eq' | 'journal' | null>(null);
  const [recordingTarget, setRecordingTarget] = useState<'eq' | 'journal' | null>(null);
  const [voiceHint, setVoiceHint] = useState('');
  /** 本条语音开始前输入框已有文字，识别结果追加在后面 */
  const voiceBaseTextRef = useRef('');
  const speechRecognitionRef = useRef<any>(null);
  
  const [activeScenario, setActiveScenario] = useState<string | null>(null); 
  
  const [showCapsule, setShowCapsule] = useState(false);
  const [achievementInput, setAchievementInput] = useState('');
  const [achievementOutput, setAchievementOutput] = useState({ tag: '', text: '' }); 
  const [isGeneratingCapsule, setIsGeneratingCapsule] = useState(false);
  const [isSaved, setIsSaved] = useState(false); 

  const handleEqPolish = async () => {
    if (!eqInput.trim()) return;
    setIsPolishing(true);
    setEqOutput('');
    try {
      const res = await fetch('/api/eq-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: eqInput, scenario: activeScenario }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEqOutput(data.error ?? `服务错误（${res.status}），请重试`);
        return;
      }
      setEqOutput(data.result ?? '生成失败，请重试');
    } catch {
      setEqOutput(getAiFallback());
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerateCapsule = async () => {
    if (!achievementInput.trim()) return;
    setIsGeneratingCapsule(true);
    setIsSaved(false);
    try {
      const res = await fetch('/api/eq-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `用户写下了今日工作/实习事项的流水账（琐事、复盘、人际、情绪都可以）。请从中提炼出一条「当日职场成就胶囊」：第一行为能力标签（格式：✨ 能力名称 +1），第二行为对她的鼓励性当日总结（30-50字），要让她感到今天没有白过。即使内容琐碎也要尽量抓住真实付出或成长点。只输出这两行，不要其他内容：
${achievementInput}`,
          scenario: '工作汇报'
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAchievementOutput({ tag: '✨ 职场成长 +1', text: data.error ?? `服务错误（${res.status}），请重试` });
        setShowCapsule(true);
        return;
      }
      if (data.result) {
        const lines = data.result.trim().split('\n').filter(Boolean);
        setAchievementOutput({
          tag: lines[0]?.trim() || '✨ 职场成长 +1',
          text: lines.slice(1).join(' ').trim() || data.result.trim()
        });
        // 成就胶囊首次生成时触发 confetti 动效
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#6ECEB8', '#B0A8F0', '#F9D8B1', '#FFD700'] });
        track('ai_tool_used', { tool: 'achievement_capsule' });
      } else {
        setAchievementOutput({ tag: '✨ 职场成长 +1', text: data.error || '生成失败，请重试' });
      }
      setShowCapsule(true);
    } catch {
      setAchievementOutput({ tag: '✨ 网络错误', text: '请检查网络后重试' });
      setShowCapsule(true);
    } finally {
      setIsGeneratingCapsule(false);
    }
  };

  const handleSaveCapsule = () => {
    const tag = achievementOutput.tag.trim();
    const desc = achievementOutput.text.trim();
    if (!tag || !desc) return;
    setIsSaved(true);
    onSaveAchievementCapsule?.({ tag, desc });
  };

  const handleResetCapsule = () => {
    setShowCapsule(false);
    setAchievementInput('');
    setAchievementOutput({ tag: '', text: '' });
    setIsSaved(false);
  };

  const stopVoiceInput = useCallback(() => {
    const recognition = speechRecognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      speechRecognitionRef.current = null;
    }
    setRecordingTarget(null);
  }, []);

  /**
   * 免费方案：浏览器 Web Speech API，不调用后端、不消耗任何 API Token。
   * 依赖浏览器联网语音识别服务；部分网络环境下可能不可用。
   */
  const handleVoiceInput = useCallback(
    async (target: 'eq' | 'journal') => {
      if (recordingTarget === target) {
        stopVoiceInput();
        setVoiceHint('');
        return;
      }

      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setVoiceHint('语音功能需要 HTTPS 环境（当前非安全连接），已切换为文字输入模式');
        window.setTimeout(() => setVoiceHint(''), 4000);
        if (target === 'eq') {
          document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="情绪"]')?.focus();
        } else {
          document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="工作"]')?.focus();
        }
        return;
      }

      const SpeechRecognitionCtor =
        typeof window !== 'undefined'
          ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
          : null;

      if (!SpeechRecognitionCtor) {
        const isHttps = typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost');
        const hint = isHttps
          ? '当前浏览器不支持语音输入，请换用 Chrome / Edge，已自动切换为文字输入'
          : '语音功能需要 HTTPS 环境，请部署到 HTTPS 域名后使用，已自动切换为文字输入';
        setVoiceHint(hint);
        window.setTimeout(() => setVoiceHint(''), 4000);
        // fallback：聚焦到文字输入框
        if (target === 'eq') {
          document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="情绪"]')?.focus();
        } else {
          document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="工作"]')?.focus();
        }
        return;
      }

      stopVoiceInput();

      voiceBaseTextRef.current = target === 'eq' ? eqInput : achievementInput;

      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err: any) {
        const deny = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
        setVoiceHint(deny ? '麦克风权限被拒绝，请在地址栏允许麦克风' : '无法访问麦克风，请检查设备');
        window.setTimeout(() => setVoiceHint(''), 3400);
        return;
      }

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let hadError = false;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0]?.transcript ?? '';
          if (event.results[i].isFinal) finalTranscript += transcript;
          else interimTranscript += transcript;
        }
        const prefix = voiceBaseTextRef.current.trim();
        const live = `${finalTranscript}${interimTranscript}`.trim();
        const merged = live ? (prefix ? `${prefix} ${live}` : live) : prefix;

        if (target === 'eq') setEqInput(merged);
        else setAchievementInput(merged);
      };

      recognition.onerror = (event: any) => {
        hadError = true;
        const code = event?.error as string | undefined;
        const hints: Record<string, string> = {
          'not-allowed': '麦克风权限被拒绝',
          'service-not-allowed': '浏览器关闭了语音服务，可换 Edge 试试',
          'audio-capture': '未检测到麦克风',
          network:
            '免费语音依赖浏览器在线服务，当前网络无法连接。请换稳定网络/VPN，或换 Edge 浏览器再试',
          'no-speech': '没有听到说话，请靠近麦克风再说一次',
          aborted: '已取消语音输入',
        };
        setVoiceHint(hints[code ?? ''] ?? `语音识别出错${code ? `（${code}）` : ''}`);
        setRecordingTarget(null);
        speechRecognitionRef.current = null;
        window.setTimeout(() => setVoiceHint(''), 4500);
      };

      recognition.onend = () => {
        setRecordingTarget(null);
        if (!hadError) setVoiceHint('');
        speechRecognitionRef.current = null;
      };

      try {
        recognition.start();
      } catch {
        setVoiceHint('语音未能启动，请稍后再试');
        window.setTimeout(() => setVoiceHint(''), 2600);
        return;
      }

      speechRecognitionRef.current = recognition;
      setRecordingTarget(target);
      setActiveMascot(target);
      setVoiceHint('正在语音输入（免费·浏览器内置），说完点话筒结束');
    },
    [achievementInput, eqInput, recordingTarget, stopVoiceInput]
  );

  useEffect(() => () => stopVoiceInput(), [stopVoiceInput]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-gradient-to-b from-[#E8EFE7]/60 to-white pt-16 pb-32 relative animate-in fade-in duration-300">
      
      {/* Visual Center: Interaction Hub -> Reformed to Lightweight Header */}
      <div className="px-5 mb-6 pt-2 flex items-center shrink-0">
        <div>
          <h2 className="text-[22px] font-black tracking-tight" style={{ color: COLORS.ink }}>职场氧气站</h2>
          <p className="text-[12px] font-bold text-slate-400 mt-1">Hi，实习辛苦了 👋 需要润色还是提炼？</p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-4 shadow-[0_14px_34px_-24px_rgba(68,88,74,0.38)]">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#E9F7F1] text-[18px] shadow-inner">🤖</span>
            <h3 className="text-[19px] font-black tracking-tight text-[#1F2933]">高情商嘴替</h3>
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 pl-0">
            {['催促进度', '委婉拒绝', '向上汇报', '请假/调休', '催反馈/催审批', '风险说明'].map(tag => (
              <button
                key={tag}
                onClick={() => setActiveScenario(tag === activeScenario ? null : tag)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold transition-all border ${
                  activeScenario === tag
                    ? 'border-[#79D6A8] bg-[#79D6A8] text-white shadow-[0_6px_16px_-10px_rgba(121,214,168,0.9)]'
                    : 'border-[#DFF3E8] bg-[#EEF9F3] text-[#4F7B67]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className={`relative mb-4 transition-all duration-200 ${activeMascot === 'eq' ? 'pt-8' : 'pt-2'}`}>
            <AnimatePresence>
              {activeMascot === 'eq' && (
                <motion.img
                  initial={{ opacity: 0, y: 24, scale: 0.92 }}
                  animate={{ opacity: 1, y: [0, -3, 0], scale: [1, 1.012, 1], rotate: [0, -1.2, 0] }}
                  exit={{ opacity: 0, y: 18, scale: 0.92 }}
                  transition={{ opacity: { duration: 0.22, ease: 'easeOut' }, y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
                  src="/高情商嘴替.png"
                  alt="职场IP"
                  className="pointer-events-none absolute left-1 -top-3 z-0 h-[88px] w-auto drop-shadow-[0_10px_14px_rgba(53,75,68,0.24)]"
                />
              )}
            </AnimatePresence>
            <textarea
              value={eqInput}
              onChange={(e) => setEqInput(e.target.value)}
              onFocus={() => setActiveMascot('eq')}
              onBlur={() => setActiveMascot((prev) => (prev === 'eq' ? null : prev))}
              placeholder="把你想说的丢给我，剩下的交给我 ✍️"
              className="relative z-10 h-[112px] w-full resize-none rounded-[20px] border border-[#9BE4B8] bg-white px-4 pb-4 pt-12 pr-12 text-[13px] font-medium leading-relaxed text-slate-600 shadow-[0_0_0_1px_rgba(155,228,184,0.2),0_0_18px_rgba(116,213,159,0.32)] placeholder:text-slate-400/80 focus:outline-none focus:ring-2 focus:ring-[#8BE0AE]/35"
            />
            <button
              type="button"
              aria-label="语音输入"
              onClick={() => handleVoiceInput('eq')}
              className={`absolute bottom-3 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-[0_4px_10px_-8px_rgba(94,166,131,0.75)] active:scale-95 ${
                recordingTarget === 'eq'
                  ? 'border-[#74DDA4] text-[#47A775] ring-2 ring-[#74DDA4]/35'
                  : 'border-[#9BE4B8]/55 text-[#5EA683]'
              }`}
            >
              <Mic size={14} />
            </button>
            {recordingTarget === 'eq' && (
              <span className="pointer-events-none absolute bottom-3 right-2 z-10 h-8 w-8 rounded-full border border-[#74DDA4]/40 animate-ping" />
            )}
            {recordingTarget === 'eq' && (
              <p className="absolute right-12 top-2 z-20 rounded-full bg-[#EFFFF5] px-2.5 py-1 text-[10px] font-bold text-[#4E9B70] shadow-sm">
                正在语音输入...
              </p>
            )}
          </div>

          <button
            onClick={handleEqPolish}
            disabled={isPolishing || !eqInput}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-black text-white transition-all ${
              isPolishing || !eqInput
                ? 'bg-slate-200 text-slate-400'
                : 'bg-[linear-gradient(90deg,#74DDA4_0%,#F6D552_100%)] shadow-[0_10px_22px_-14px_rgba(117,214,152,0.75)] active:scale-[0.98]'
            }`}
          >
            {isPolishing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : '✨'}
            帮我润得漂亮点
          </button>

          {eqOutput && (
            <div className="mt-4 rounded-[20px] border border-[#87A382]/10 bg-[#F2FBF6] p-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5CA17E]">AI 优化版本</span>
                <button
                  onClick={() => { copyToClipboard(eqOutput); }}
                  className="rounded-full border border-[#87A382]/20 bg-white/70 px-3 py-1 text-[10px] font-black text-[#5CA17E] active:scale-95"
                >
                  复制
                </button>
              </div>
              <p className="text-[13px] font-bold leading-relaxed text-slate-700">{eqOutput}</p>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-4 shadow-[0_14px_34px_-24px_rgba(88,70,128,0.34)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#FFF2D9] text-[18px] shadow-inner">📒</span>
            <h3 className="text-[19px] font-black tracking-tight text-[#1F2933]">今日工作手账 · 成就胶囊</h3>
          </div>

          <div className="relative mb-3">
            <AnimatePresence>
              {activeMascot === 'journal' && (
                <motion.img
                  initial={{ opacity: 0, y: 24, x: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: [0, -2.5, 0], x: 0, scale: [1, 1.01, 1], rotate: [0, 1, 0] }}
                  exit={{ opacity: 0, y: 18, x: 8, scale: 0.92 }}
                  transition={{ opacity: { duration: 0.22, ease: 'easeOut' }, y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
                  src="/手账.png"
                  alt="成就胶囊IP"
                  className="pointer-events-none absolute -bottom-3 right-[-15px] h-[106px] w-auto drop-shadow-[0_10px_14px_rgba(74,57,106,0.22)]"
                />
              )}
            </AnimatePresence>
            <textarea
              value={achievementInput}
              onChange={(e) => {
                setAchievementInput(e.target.value);
                if(showCapsule) setShowCapsule(false);
                setIsSaved(false);
              }}
              onFocus={() => setActiveMascot('journal')}
              onBlur={() => setActiveMascot((prev) => (prev === 'journal' ? null : prev))}
              placeholder="写几件今天工作上的事就行：例会、文档、跑腿、被骂了也算，流水账就可以 ✍️"
              className="h-[118px] w-full resize-none rounded-[20px] border border-[#D5C4FF] bg-[#FCFAFF] px-4 py-4 pr-[112px] text-[13px] font-medium leading-relaxed text-slate-600 shadow-[0_0_0_1px_rgba(213,196,255,0.18),0_0_18px_rgba(184,158,255,0.26)] placeholder:text-slate-400/80 focus:outline-none focus:ring-2 focus:ring-[#C8B4FF]/35"
            />
            <button
              type="button"
              aria-label="语音输入"
              onClick={() => handleVoiceInput('journal')}
              className={`absolute bottom-3 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-[0_4px_10px_-8px_rgba(142,116,205,0.75)] active:scale-95 ${
                recordingTarget === 'journal'
                  ? 'border-[#B99DFF] text-[#7D65C7] ring-2 ring-[#B99DFF]/35'
                  : 'border-[#D5C4FF]/60 text-[#8E74CD]'
              }`}
            >
              <Mic size={14} />
            </button>
            {recordingTarget === 'journal' && (
              <span className="pointer-events-none absolute bottom-3 right-2 z-10 h-8 w-8 rounded-full border border-[#B99DFF]/45 animate-ping" />
            )}
            {recordingTarget === 'journal' && (
              <p className="absolute right-12 top-2 z-20 rounded-full bg-[#F3EEFF] px-2.5 py-1 text-[10px] font-bold text-[#7D65C7] shadow-sm">
                正在语音输入...
              </p>
            )}
          </div>

          <p className="mb-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            🔒 与圈子发帖无关；写完点生成，存入档案后会出现在「我的」成就胶囊
          </p>

          <button
            onClick={handleGenerateCapsule}
            disabled={isGeneratingCapsule || !achievementInput.trim()}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-black transition-all ${
              isGeneratingCapsule || !achievementInput.trim()
                ? 'bg-slate-200 text-slate-400'
                : 'bg-[linear-gradient(90deg,#B99DFF_0%,#FFC2A7_100%)] text-white shadow-[0_10px_22px_-14px_rgba(185,157,255,0.72)] active:scale-[0.98]'
            }`}
          >
            {isGeneratingCapsule ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              '💊'
            )}
            生成今日成就胶囊
          </button>

            {showCapsule && (
              <div className="mt-4 bg-gradient-to-br from-white to-amber-50/50 rounded-[24px] p-5 border border-amber-100 shadow-[0_8px_24px_-6px_rgba(249,216,177,0.6)] animate-in slide-in-from-top-4 fade-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl -z-10"></div>
                
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-black tracking-widest mb-3">
                  {achievementOutput.tag}
                </div>
                
                <p className="text-[13px] font-bold text-slate-600 leading-relaxed mb-6">
                  {achievementOutput.text}
                </p>

                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(achievementOutput.tag + '\n' + achievementOutput.text)}
                    className="flex-1 py-3 rounded-[16px] font-black text-[13px] transition-all border border-slate-200 bg-slate-50 text-slate-500 active:scale-95 flex items-center justify-center gap-2"
                  >
                    复制
                  </button>
                  <button 
                    onClick={handleSaveCapsule}
                    disabled={isSaved}
                    className={`flex-1 py-3 rounded-[16px] font-black text-[13px] transition-all duration-300 flex items-center justify-center gap-2 ${
                      isSaved 
                        ? 'bg-slate-50 text-slate-400 border border-slate-200' 
                        : 'bg-amber-50 text-amber-600 border-2 border-amber-200/60 active:scale-95'
                    }`}
                  >
                    {isSaved ? <><CheckCircle2 size={16} /> 已保存</> : '存入档案'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      {voiceHint && recordingTarget === null && (
        <div className="pointer-events-none fixed bottom-28 left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-[#2F3E46]/88 px-4 py-2 text-[11px] font-bold text-white shadow-xl">
          {voiceHint}
        </div>
      )}
    </div>
  );
};

// --- ✨ [Tab 2] 实习情报局 (Community Feed) ---
const CommunityFeed = ({
  onFeedClick,
  onUserClick,
  onLike,
  onSummonAi,
  feeds,
  isLoading,
  userProfile,
  activeTag,
  onTagChange,
  companyOnly,
  onToggleCompanyOnly,
  cityOnly,
  onToggleCityOnly,
  preferredCity,
  aiTipsCache,
}: {
  onFeedClick: (id: number) => void;
  onUserClick: (user: { name: string; avatar: string }) => void;
  onLike: (feedId: number) => void;
  onSummonAi: (feed: ReturnType<typeof adaptFeed>) => void;
  feeds: ReturnType<typeof adaptFeed>[];
  isLoading: boolean;
  userProfile: { nickname: string; company: string; gender: string; role: string; avatar: string } | null;
  activeTag: string;
  onTagChange: (tag: string) => void;
  companyOnly: boolean;
  onToggleCompanyOnly: () => void;
  cityOnly: boolean;
  onToggleCityOnly: () => void;
  preferredCity: string | null;
  aiTipsCache?: Record<number, string>;
}) => {
  const visibleFeeds = useMemo(() => {
    const matches = (feed: AppFeedRow) => {
      if (!matchCommunityTag(feed, activeTag)) return false;
      if (cityOnly) {
        if (!preferredCity) return false;
        if (!(feed.location ?? '').includes(preferredCity)) return false;
      }
      if (companyOnly) {
        if (!isCompanyRelatedFeed(feed, userProfile?.company)) return false;
      }
      return true;
    };

    const base = feeds.filter(matches);
    if (base.length >= COMMUNITY_VISIBLE_FEEDS_MIN) return base;

    const seen = new Set(base.map((f) => f.id));
    const out: AppFeedRow[] = [...base];
    for (const f of communityFeedFallbackPool()) {
      if (out.length >= COMMUNITY_VISIBLE_FEEDS_MIN) break;
      if (seen.has(f.id)) continue;
      if (!matches(f)) continue;
      seen.add(f.id);
      out.push(f);
    }

    let synIdx = 0;
    while (out.length < COMMUNITY_VISIBLE_FEEDS_MIN && synIdx < 140) {
      const f = makeSyntheticCommunityFeed(synIdx, activeTag, preferredCity);
      synIdx += 1;
      if (seen.has(f.id)) continue;
      if (!matches(f)) continue;
      seen.add(f.id);
      out.push(f);
    }

    return out;
  }, [feeds, activeTag, cityOnly, companyOnly, preferredCity, userProfile?.company]);

  const digestText = buildCommunityDigest(visibleFeeds, userProfile?.company, preferredCity);

  return (
    <div className={`relative flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-16 ${HOME_SURFACE.background} animate-in fade-in duration-300`}>
      <div className="pointer-events-none absolute -left-24 top-2 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.24)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.24)_0%,rgba(178,176,245,0)_72%)]" />

      <div className="relative z-10 mb-5 flex items-end justify-between shrink-0">
        <div>
          <h2 className="text-[22px] font-black tracking-tight text-[#2F3E46]">圈子情报</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#56756D]/45">
            实习生活的实时小道消息
          </p>
        </div>
        <div className="rounded-full border border-white/70 bg-white/58 px-3 py-1.5 text-[10px] font-black text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-xl">
          {visibleFeeds.length} 条
        </div>
      </div>

      <div className="relative z-10 mb-4 h-[132px] shrink-0 -translate-y-[6px]">
        <div className="absolute inset-y-0 left-0 w-[42%]">
          <img
            src="/圈子IP.png"
            alt="圈子IP"
            className="absolute bottom-0 left-[-18%] h-[104%] w-auto max-w-none object-contain drop-shadow-[0_14px_18px_rgba(62,92,107,0.24)]"
          />
        </div>

        <div className="absolute top-[20px] bottom-[4px] left-[18%] right-[2px] z-20 overflow-hidden rounded-[22px] border border-white/70 bg-white/45 p-3.5 backdrop-blur-[4px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[18px] bg-gradient-to-r from-white/45 via-white/15 to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,236,173,0.45)_0%,rgba(255,236,173,0)_72%)]" />

          <div className="relative z-10 mb-2.5 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.2em] text-[#30424A]">
              <Bot size={16} className="text-[#5D9F8E]" />
              AI情报摘要
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4B6A74]/55">Live</span>
              <div className="h-2 w-2 rounded-full bg-[#F6DC7D] shadow-[0_0_10px_rgba(246,220,125,0.92)]" />
            </div>
          </div>

          <p className="relative z-10 line-clamp-4 text-[13px] font-semibold leading-[1.5] text-[#3E545E]">
            {digestText}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex gap-2.5 overflow-x-auto no-scrollbar mb-4 pb-2 shrink-0 w-full">
        <button
          onClick={onToggleCompanyOnly}
          className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-black transition-all border active:scale-95 ${
            companyOnly
              ? HOME_SURFACE.chipActive
              : HOME_SURFACE.chipInactive
          }`}
        >
          🏢 只看同公司
        </button>
        <button
          onClick={onToggleCityOnly}
          className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-black transition-all border active:scale-95 ${
            cityOnly
              ? HOME_SURFACE.chipActive
              : HOME_SURFACE.chipInactive
          }`}
        >
          📍 只看同城
        </button>
        {['全部', '🤫 小邪招', '☕ 摸鱼情报', '📍 好去处', '📝 树洞吐槽', '📸 办公区打卡', '🆘 紧急求助'].map(tag => (
          <button
            key={tag}
            onClick={() => onTagChange(tag)}
            className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-black transition-all border active:scale-95 ${
              activeTag === tag
                ? HOME_SURFACE.chipActive
                : HOME_SURFACE.chipInactive
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="relative z-10 flex flex-col gap-4 shrink-0">
          {[1, 2, 3].map(i => (
            <div key={i} className={`rounded-[28px] ${HOME_SURFACE.glassCard} p-5 animate-pulse`}>
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-white/70 rounded-[14px]" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3 bg-white/70 rounded w-1/3" />
                  <div className="h-2 bg-white/60 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-white/60 rounded mb-2" />
              <div className="h-4 bg-white/55 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : visibleFeeds.length === 0 ? (
        <div className={`relative z-10 mx-1 my-6 flex flex-col items-center justify-center rounded-[28px] ${HOME_SURFACE.glassCard} px-6 py-14 text-[#56756D]/55`}>
          <img src="/onboarding-ip.png" alt="空状态企鹅" className="w-20 h-20 object-contain mb-4 opacity-80" />
          <p className="text-[13px] font-bold mb-2 text-[#2F3E46]">当前筛选下暂无内容</p>
          <p className="text-[12px] opacity-70 text-center leading-relaxed mb-4">
            {feeds.length === 0 
              ? '暂时还没有人发布情报。成为第一个分享职场信息的人吧！' 
              : '试试切换其他标签或城市，可能会有意想不到的发现'}
          </p>
          {feeds.length === 0 && (
            <div className="text-[11px] opacity-60 mt-4 text-center">
              💡 小贴士：分享你发现的好去处、避坑经验或求助问题
            </div>
          )}
        </div>
      ) : (
      <div className="relative z-10 flex flex-col gap-4 shrink-0">
        {visibleFeeds.map(feed => (
          <div 
            key={feed.id} 
            onClick={() => onFeedClick(feed.id)}
            className={`relative flex flex-col overflow-hidden rounded-[28px] ${HOME_SURFACE.glassCard} p-5 transition-transform active:scale-[0.98] cursor-pointer`}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(176,204,248,0.2)_0%,rgba(176,204,248,0)_70%)]" />
            <div className="pointer-events-none absolute -bottom-14 left-4 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,231,171,0.18)_0%,rgba(255,231,171,0)_72%)]" />
            <div className="flex justify-between items-start mb-3.5">
              <div className="flex items-center gap-3">
                {/* User Avatar Click Logic */}
                <div 
                  className="relative z-10 w-10 h-10 overflow-hidden rounded-[16px] bg-white/62 flex items-center justify-center text-xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] shrink-0 hover:bg-white/80 backdrop-blur-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserClick({ name: feed.author, avatar: feed.avatar });
                  }}
                >
                  <AvatarVisual avatar={feed.avatar} className="flex h-full w-full items-center justify-center" />
                </div>
                <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[14px] font-black text-slate-800 tracking-tight leading-none">{feed.author}</span>
                  <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/55 text-[#6EAFA0] border border-white/70 backdrop-blur-md">
                      {feed.location}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-[#56756D]/20"></div>
                    <span className="text-[10px] font-bold text-slate-400">{feed.time}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="relative z-10 text-[13px] font-medium text-[#40515A] leading-relaxed mb-4">
              {feed.content}
            </p>
            <div className="relative z-10 mb-3 rounded-[18px] border border-white/70 bg-[linear-gradient(128deg,rgba(255,231,171,0.34)_0%,rgba(150,225,206,0.16)_100%)] px-3.5 py-2.5 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)]">
              <span className="text-[10px] font-black text-[#B4873C]">AI 提示：</span>
              <span className="text-[11px] font-bold text-[#5C4D35]/75 ml-1">{buildFeedAiTip(feed, aiTipsCache?.[feed.id])}</span>
            </div>

            {feed.hasImage && (
              <div className="relative z-10 w-full h-32 bg-white/50 rounded-[20px] border border-white/70 mb-4 flex items-center justify-center text-[#9CB7C9] shadow-[inset_0_1px_8px_rgba(64,100,120,0.06)] backdrop-blur-md">
                <ImageIcon size={24} className="opacity-30" />
              </div>
            )}
            
            <div className="relative z-10 flex justify-between items-end mt-auto pt-1">
              <div className="flex flex-wrap gap-1.5 flex-1 pr-2">
                {feed.tags.map(tag => {
                  const isWarning = tag.includes('避雷') || tag.includes('吐槽') || tag.includes('求助');
                  return (
                    <span 
                      key={tag} 
                      className={`shrink-0 whitespace-nowrap px-2 py-1 rounded-[8px] text-[10px] font-black tracking-wide border ${
                        isWarning 
                          ? 'bg-red-50/80 text-red-500 border-red-100/80' 
                          : 'bg-white/52 text-[#B4873C] border-white/70 backdrop-blur-md'
                      }`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center gap-3.5 shrink-0 text-[#56756D]/45">
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(feed.id); }}
                  className="flex items-center gap-1 hover:text-red-400 active:scale-90 transition-all"
                >
                  <Heart size={16}/><span className="text-[12px] font-bold">{feed.likes}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onFeedClick(feed.id); }}
                  className="flex items-center gap-1 hover:text-[#6EAFA0] active:scale-90 transition-all"
                >
                  <MessageCircle size={16}/><span className="text-[12px] font-bold">{feed.comments}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSummonAi(feed); }}
                  className="flex items-center gap-1 hover:text-[#2F3E46] active:scale-90 transition-all"
                >
                  <Bot size={16}/><span className="text-[12px] font-bold">AI嘴替</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

// --- ✨ [Tab 5] 个人中心 / 数字领地 (User Profile) ---
const UserProfile = ({
  dazis,
  achievements = [] as { id: string; tag: string; desc: string }[],
  onSetRole,
  onOpenResumeLab,
  onOpenPrivacy,
  onEditProfile,
  userProfile,
  onGoAssistant,
  onGoMessage,
  onRemoveDazi,
  onOpenStudentVerify,
}: {
  dazis: DaziItem[];
  achievements: { id: string; tag: string; desc: string }[];
  onSetRole: (id: number, tag: string) => void;
  onOpenResumeLab: () => void;
  onOpenPrivacy: () => void;
  onEditProfile: () => void;
  userProfile: { nickname: string; company: string; gender: string; role: string; avatar: string; privacyStealth?: boolean; privacyMosaic?: boolean; isStudentVerified?: boolean; studentEmail?: string } | null;
  /** 成就胶囊来源：助手页第二张「今日工作手账」 */
  onGoAssistant: () => void;
  onGoMessage: () => void;
  onRemoveDazi: (id: number) => void;
  onOpenStudentVerify: () => void;
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  /** 挂载到 document.body：避免外层手机壳 overflow-hidden 裁切下拉菜单，出现「只剩午饭搭子一条」的假 bug */
  const [daziTagMenuFixed, setDaziTagMenuFixed] = useState<{ top: number; left: number } | null>(null);
  const daziTagMenuAnchorRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [pendingRemoveDaziId, setPendingRemoveDaziId] = useState<number | null>(null);
  const formalDaziCount = dazis.filter((d) => d.status === 'dazi' || !d.status).length;
  const profileLevel = Math.min(99, Math.max(1, 1 + achievements.length + Math.floor(formalDaziCount / 2)));
  const levelRankLabel =
    profileLevel <= 2 ? '职场萌新' : profileLevel <= 5 ? '职场新星' : profileLevel <= 10 ? '成长中坚' : '高光选手';

  const DAZI_TAG_OPTIONS = ['午饭搭子', '周末搭子', '随机局好友', '摸鱼队友', '跨部门吐槽搭子'] as const;

  useLayoutEffect(() => {
    if (openMenuId === null) {
      setDaziTagMenuFixed(null);
      return;
    }
    const el = daziTagMenuAnchorRefs.current.get(openMenuId);
    if (!el) {
      setDaziTagMenuFixed(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const menuMinW = 168;
    const left = Math.max(10, Math.min(r.left, window.innerWidth - menuMinW - 10));
    setDaziTagMenuFixed({ top: r.bottom + 6, left });
  }, [openMenuId]);

  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [openMenuId]);

  const pendingRemoveDazi =
    pendingRemoveDaziId === null ? null : dazis.find((d) => d.id === pendingRemoveDaziId) ?? null;
  const pendingRemoveLabel =
    pendingRemoveDazi == null
      ? ''
      : (pendingRemoveDazi.sceneTitle && pendingRemoveDazi.sceneTitle.trim())
        ? pendingRemoveDazi.sceneTitle.trim()
        : pendingRemoveDazi.name.replace(/^「(.*?)」同局圈$/, '$1') || pendingRemoveDazi.name;

  return (
    <div className={`${UI.profilePage} flex flex-col gap-0`}>
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className={`${UI.sectionTitle} flex items-center gap-1.5`}>
          数字领地
          <Sparkles size={18} className="text-[#6EAFA0] opacity-90" aria-hidden />
        </h2>
      </div>

      <div className={`relative mb-5 shrink-0 overflow-hidden p-5 ${UI.profileSurface}`}>
        <div className="pointer-events-none absolute inset-0 rounded-[27px] ring-1 ring-inset ring-white/75" />
        <div className="pointer-events-none absolute inset-x-[2px] top-[2px] h-[44%] rounded-t-[25px] bg-gradient-to-b from-white/70 via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[36%] rounded-b-[28px] bg-gradient-to-t from-[rgba(213,204,245,0.14)] via-[rgba(184,234,214,0.08)] to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-6 -top-8 h-36 w-36 rounded-full bg-white/65 blur-3xl" />
          <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-[#C8EDE0]/40 blur-3xl" />
        </div>

        <div className="relative z-10 flex gap-3">
          {(() => {
            const fromAvatar = (userProfile?.avatar ?? '').trim();
            const fromName = !fromAvatar && userProfile?.nickname ? userProfile.nickname.charAt(0) : '';
            const display = fromAvatar || fromName || '🐧';
            const useBigMascot = Boolean(fromAvatar) || (!fromName && !fromAvatar);
            return (
              <div className="relative flex h-[5.125rem] w-[5.125rem] shrink-0 items-center justify-center">
                <div className="flex h-full w-full items-center justify-center rounded-full border-[3px] border-[#E8C547]/95 bg-white/75 p-0.5 shadow-[0_6px_22px_-8px_rgba(212,175,55,0.45)] backdrop-blur-md">
                  <div className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-full bg-white/55 backdrop-blur-sm">
                    {isImageAvatar(display) ? (
                      <AvatarVisual avatar={display} className="flex h-full w-full items-center justify-center" />
                    ) : useBigMascot ? (
                      <span
                        className="select-none text-[2.5rem] leading-none sm:text-[2.65rem]"
                        style={{ transform: 'scale(1.18) translateY(-0.5px)' }}
                        aria-hidden
                      >
                        {display}
                      </span>
                    ) : (
                      <span className="text-[1.5rem] font-black leading-none text-slate-700" aria-hidden>
                        {display}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 flex-1 truncate text-[18px] font-black tracking-tight text-[#1F2933]">
                {userProfile?.nickname || '职场新人'}
              </h3>
              <span className="inline-flex shrink-0 items-center rounded-full border border-[#87A382]/35 bg-[linear-gradient(125deg,rgba(150,225,206,0.32)_0%,rgba(255,255,255,0.72)_55%,rgba(176,204,248,0.24)_100%)] px-2.5 py-px text-[10px] font-black leading-5 text-[#56756D] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_-14px_rgba(64,100,120,0.3)] backdrop-blur-md">
                {userProfile?.role || '待完善'}
              </span>
              <button
                type="button"
                onClick={onEditProfile}
                className="shrink-0 rounded-full p-1 text-[#94A3B8] transition-colors hover:bg-white/55 hover:text-[#87A382] active:scale-95"
                aria-label="编辑资料"
                title="编辑资料"
              >
                <Pencil size={14} strokeWidth={2.25} />
              </button>
            </div>
            <div className="mt-2.5 inline-flex w-full max-w-full items-center rounded-full border border-white/85 bg-white/70 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_18px_-12px_rgba(116,148,168,0.12)] backdrop-blur-xl">
              <span className="truncate text-[11px] font-bold text-[#64748B]">
                {userProfile?.company ? `当前实习：${userProfile.company}` : '尚未填写公司信息'}
              </span>
            </div>
          </div>

          <div className="shrink-0 self-start rounded-[11px] border border-white/90 bg-white/72 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_8px_20px_-14px_rgba(120,150,172,0.14)] backdrop-blur-xl">
            <p className="flex items-baseline gap-0.5 text-[9px] font-black leading-none tracking-tight text-[#94A3A8]">
              <span className="text-[10px] leading-none" aria-hidden>
                ✨
              </span>
              <span className="bg-[linear-gradient(120deg,#B8860B_0%,#64748B_100%)] bg-clip-text text-[10px] text-transparent">
                Lv.{profileLevel}
              </span>
            </p>
            <p className="mt-1 flex items-center justify-end gap-px text-[8px] font-bold leading-none text-[#94A3A8]/95">
              {levelRankLabel}
              <ChevronRight size={10} className="opacity-65" aria-hidden />
            </p>
          </div>
        </div>

        <div className={`relative z-10 mt-3 grid grid-cols-2 gap-0 px-2 py-3 sm:gap-px sm:px-3 ${UI.profileInner}`}>
          <div className="flex min-w-0 items-center gap-2.5 pr-2 sm:gap-3 sm:pr-3">
            <span className="shrink-0 text-[1.35rem] leading-none" aria-hidden>
              👯‍♂️
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#94A3A8]">拥有搭子</p>
              <p className="text-[17px] font-black tabular-nums tracking-tight text-[#1F2933]">
                {formalDaziCount}
                <span className="ml-1 text-[12px] font-black text-[#64748B]">位</span>
              </p>
            </div>
          </div>
          <div className="relative flex min-w-0 items-center gap-2.5 border-l border-[#E2E8F0]/75 pl-3 sm:gap-3 sm:pl-4">
            <Award className="h-[1.35rem] w-[1.35rem] shrink-0 text-[#C9A227]" strokeWidth={2.25} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#94A3A8]">获得成就</p>
              <p className="text-[17px] font-black tabular-nums tracking-tight text-[#1F2933]">
                {achievements.length}
                <span className="ml-1 text-[12px] font-black text-[#64748B]">颗</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 w-full shrink-0">
        <h3 className="mb-1 flex items-center gap-2 text-[15px] font-normal text-slate-800">
          ✨ 我的职场成就胶囊
        </h3>
        <div className="flex w-full gap-2 overflow-x-auto pb-1 no-scrollbar">
          {achievements.length === 0 ? (
            <div className={`relative min-w-full w-full overflow-hidden px-5 pt-2 pb-4 text-center ${UI.profileSurface}`}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[rgba(219,239,246,0.55)] via-[rgba(232,226,251,0.2)] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[rgba(224,217,246,0.22)] via-[rgba(209,239,229,0.12)] to-transparent" />
              <div className="pointer-events-none absolute inset-[2px] rounded-[26px] ring-1 ring-inset ring-white/70" />
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/职场成就胶囊.png"
                  alt="职场成就胶囊"
                  className={`mx-auto ${PROFILE_ILLUSTRATION.achievementCapsuleOffset} ${PROFILE_ILLUSTRATION.achievementCapsuleHeight} w-auto ${PROFILE_ILLUSTRATION.achievementCapsuleMaxW} object-contain drop-shadow-[0_8px_22px_-8px_rgba(80,92,140,0.28)] select-none pointer-events-none`}
                  loading="lazy"
                />
                <p className="mx-auto mt-2 max-w-[18rem] text-[13px] font-semibold leading-relaxed tracking-tight text-[#1F2933]">
                  把今天的琐碎，收成一颗会发光的成就胶囊。
                </p>
                <button
                  type="button"
                  onClick={onGoAssistant}
                  className="mt-4 w-full max-w-[16.5rem] rounded-full py-2.5 text-[11px] font-normal text-white shadow-[0_10px_26px_-12px_rgba(110,206,184,0.48),inset_0_1px_0_rgba(255,255,255,0.35)] transition-colors hover:bg-white/12 active:bg-white/18 active:scale-[0.99]"
                  style={{ backgroundImage: LOGIN_BRAND_GRADIENT }}
                >
                  去「助手」写手账 · 生成胶囊
                </button>
              </div>
            </div>
          ) : achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex min-w-full w-full shrink-0 cursor-pointer flex-col p-5 active:scale-[0.98] transition-transform ${UI.profileSurface}`}
            >
              <span className="mb-3 inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full border border-[#F9D8B1]/50 bg-[#F9D8B1]/20 px-3 py-1.5 text-[10px] font-normal tracking-widest text-[#D4AF37]">
                {ach.tag}
              </span>
              <p className="line-clamp-3 text-[13px] font-normal leading-relaxed text-slate-600">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 我的搭子关系 */}
      <div className={`mb-3 w-full shrink-0 !p-3 ${UI.profileSection}`}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800">
            <div className="relative flex items-center justify-center w-5 h-5">
              <Heart size={18} className="text-[#6ECEB8] fill-[#6ECEB8]/20" />
              <Sparkles size={10} className="text-[#6ECEB8] absolute -top-1 -right-1" />
            </div>
            我的搭子关系
          </h3>
          <button 
            onClick={onGoMessage}
            className="text-[12px] text-slate-400 flex items-center active:scale-95 transition-transform"
          >
            全部搭子 <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="flex w-full flex-col gap-1.5">
          {dazis.length === 0 && (
            <div className="-mt-1 flex flex-col items-center pt-1 pb-4 text-slate-400">
              <img src="/起始页.png" alt="起始页" className="-mt-1 mb-1.5 h-20 w-20 object-contain opacity-60" />
              <p className="text-[12px] font-bold text-slate-400">还没有搭子</p>
              <p className="mt-0.5 text-center text-[11px] text-slate-300">加入一个局并发送消息，就能结识新搭子 ✨</p>
            </div>
          )}
          {dazis.map(dazi => {
            const isCandidate = dazi.status === 'candidate';
            const headline =
              (dazi.sceneTitle && dazi.sceneTitle.trim())
                ? dazi.sceneTitle.trim()
                : dazi.name.replace(/^「(.*?)」同局圈$/, '$1') || dazi.name;
            const headlineTrunc =
              headline.length > 12 ? `${headline.slice(0, 12)}…` : headline;

            return (
              <div
                key={dazi.id}
                className="relative overflow-visible rounded-[16px] border border-white/80 bg-gradient-to-r from-[#F5FDF8]/95 via-[#F8F9FF] to-[#F4F1FF]/98 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="z-10 flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/50 bg-white text-xl shadow-sm">
                      <AvatarVisual avatar={dazi.avatar} className="flex h-full w-full items-center justify-center" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 truncate text-[13px] font-bold leading-tight text-slate-800">{headlineTrunc}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        {isCandidate ? (
                          <button
                            type="button"
                            ref={(node) => {
                              if (node) daziTagMenuAnchorRefs.current.set(dazi.id, node);
                              else daziTagMenuAnchorRefs.current.delete(dazi.id);
                            }}
                            onClick={() => setOpenMenuId(openMenuId === dazi.id ? null : dazi.id)}
                            className="flex items-center gap-0.5 rounded-full bg-[#6ECEB8] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm transition active:scale-95"
                          >
                            去界定关系 <ChevronDown size={10} />
                          </button>
                        ) : (
                          <>
                            <span className="whitespace-nowrap rounded-full bg-[#E6F4EA] px-1.5 py-0.5 text-[10px] font-medium text-[#2E7D32]">
                              搭子
                            </span>
                            <button
                              type="button"
                              ref={(node) => {
                                if (node) daziTagMenuAnchorRefs.current.set(dazi.id, node);
                                else daziTagMenuAnchorRefs.current.delete(dazi.id);
                              }}
                              onClick={() =>
                                setOpenMenuId(openMenuId === dazi.id ? null : dazi.id)
                              }
                              className="inline-flex items-center gap-0.5 rounded-full bg-[#E6F4EA] px-1.5 py-0.5 text-[10px] font-medium text-[#2E7D32] ring-1 ring-[#C8E6C9]/80 transition hover:bg-[#DCF4E4] active:scale-95"
                            >
                              {dazi.tag}
                              <ChevronDown size={10} className="opacity-75" aria-hidden />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`relative flex shrink-0 items-center justify-center ${PROFILE_ILLUSTRATION.daziStarWrap}`}
                  >
                    <img
                      src="/星星.png"
                      alt=""
                      draggable={false}
                      className={`pointer-events-none ${PROFILE_ILLUSTRATION.daziStarImg} object-contain drop-shadow-[0_4px_12px_rgba(161,196,253,0.45)]`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 成长工具箱 */}
      <div className={`mb-4 w-full shrink-0 ${UI.profileSection}`}>
        <h3 className="text-[15px] font-bold text-slate-800 mb-3">
          成长工具箱
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenResumeLab}
            className="flex flex-col items-start p-3 rounded-[18px] border border-white/90 bg-gradient-to-br from-[#ECFAF2] to-[#F3FCF6] text-left active:scale-[0.98] transition-transform relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Wand2 size={16} className="text-[#6ECEB8]" />
              <span className="text-[13px] font-bold text-slate-800">AI一键转译简历</span>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              润色 & 翻译，更好被看见 <ChevronRight size={10} />
            </span>
          </button>
          
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="flex flex-col items-start p-3 rounded-[18px] border border-white/90 bg-gradient-to-br from-[#F1EDFC] to-[#FAF8FF] text-left active:scale-[0.98] transition-transform relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={16} className="text-[#A78BFA] fill-[#A78BFA]/20" />
              <span className="text-[13px] font-bold text-slate-800">隐私护盾</span>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              保护隐私，安心分享 <ChevronRight size={10} />
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenStudentVerify}
            className="col-span-2 flex items-center justify-between p-3 rounded-[18px] border border-white/90 bg-gradient-to-br from-[#EEF8FF] to-[#F5FBFF] text-left active:scale-[0.98] transition-transform relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-[#4A90D9]" />
              <div>
                <span className="text-[13px] font-bold text-slate-800">学生认证</span>
                <span className="ml-2 text-[10px] text-slate-400">
                  {userProfile?.isStudentVerified ? `已认证 · ${userProfile.studentEmail ?? ''}` : '用 edu.cn 邮箱完成认证，解锁学生专属权益'}
                </span>
              </div>
            </div>
            {userProfile?.isStudentVerified
              ? <span className="text-[11px] font-bold text-[#4A90D9] bg-blue-100 px-2 py-0.5 rounded-full">已认证 ✓</span>
              : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
          </button>
        </div>
      </div>

      {typeof document !== 'undefined' &&
        openMenuId !== null &&
        daziTagMenuFixed &&
        (() => {
          const menuDazi = dazis.find((d) => d.id === openMenuId);
          if (!menuDazi) return null;
          return createPortal(
            <>
              <button
                type="button"
                aria-label="关闭菜单"
                className="fixed inset-0 z-[9390] cursor-default bg-transparent"
                onClick={() => setOpenMenuId(null)}
              />
              <div
                role="menu"
                className="fixed z-[9410] flex min-w-[168px] max-h-[min(70vh,320px)] flex-col gap-0.5 overflow-y-auto rounded-[16px] border border-white/70 bg-white/95 p-1.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md animate-in zoom-in-95 duration-200"
                style={{ top: daziTagMenuFixed.top, left: daziTagMenuFixed.left }}
              >
                {DAZI_TAG_OPTIONS.map((option) => {
                  const isSelected = menuDazi.tag === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSetRole(menuDazi.id, option);
                        setOpenMenuId(null);
                      }}
                      className={`rounded-xl px-3 py-2 text-left text-[12px] font-bold transition-colors ${
                        isSelected ? 'bg-[#E6F4EA] text-[#2E7D32]' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
                <div className="mx-2 my-0.5 h-px shrink-0 bg-slate-100" aria-hidden />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuId(null);
                    setPendingRemoveDaziId(menuDazi.id);
                  }}
                  className="rounded-xl px-3 py-2 text-left text-[12px] font-normal text-red-600 transition-colors hover:bg-red-50 active:bg-red-50/80"
                >
                  取消搭子关系
                </button>
              </div>
            </>,
            document.body
          );
        })()}

      {pendingRemoveDazi && (
        <RemoveDaziConfirmModal
          sceneLabel={pendingRemoveLabel}
          onCancel={() => setPendingRemoveDaziId(null)}
          onConfirm={() => {
            onRemoveDazi(pendingRemoveDazi.id);
            setPendingRemoveDaziId(null);
            setOpenMenuId(null);
          }}
        />
      )}
    </div>
  );
}

// --- ✨ [Tab 4] 消息中心 (Message Center) ---
const MessageCenter = ({
  dazis,
  onOpenGroupChat,
  onOpenPrivateChat,
  onOpenAIChat,
  onUserClick,
  filter,
  onFilterChange,
}: {
  dazis: DaziItem[];
  onOpenGroupChat: (sceneId: number) => void;
  onOpenPrivateChat: (dazi: { id: number; avatar: string; name: string; count: number; tag: string } | null) => void;
  onOpenAIChat: () => void;
  onUserClick: (user: { name: string; avatar: string }) => void;
  filter: '全部' | '会话' | '通知';
  onFilterChange: (next: '全部' | '会话' | '通知') => void;
}) => {
  const tabs: Array<'全部' | '会话' | '通知'> = ['全部', '会话', '通知'];


  // 新用户只显示 AI 欢迎语，有搭子后才显示私聊入口
  const AI_WELCOME = { id: 'ai-welcome', type: 'ai', name: 'UniAI 助手', avatar: 'ai', preview: '👋 你好！我是 UniAI，有任何职场问题都可以来找我～', time: '刚刚', unread: 1, pinned: true };

  const privateMsgs = dazis.map((d) => ({
    id: `private-${d.id}`,
    type: 'private',
    name: d.name,
    avatar: [d.avatar],
    preview:
      d.status === 'candidate'
        ? `候选项 · ${d.sceneType || '同局'} · 在[我的]里选一种搭子关系`
        : `一起参与 ${d.count} 次 · ${d.tag} · 点击开聊`,
    time: '',
    unread: 0,
    pinned: false,
  }));

  const allMessages = [AI_WELCOME, ...privateMsgs];
  const groupMsgs: {id: string|number; type: string; name: string; avatar: string|string[]; preview: string; time: string; unread: number; pinned: boolean; sceneId?: number; tag?: string; tagColor?: string}[] = [];

  const filteredMessages = allMessages.filter(msg => {
    if (filter === '全部') return true;
    if (filter === '会话') return msg.type === 'group' || msg.type === 'private';
    if (filter === '通知') return msg.type === 'ai';
    return true;
  });

  const pinnedMsgs = filteredMessages.filter(m => m.pinned);
  const normalMsgs = filteredMessages.filter(m => !m.pinned);

  const renderAvatar = (msg) => {
    if (msg.type === 'ai') {
      return (
        <div className="w-12 h-12 rounded-[18px] bg-white/62 border border-white/70 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] backdrop-blur-md shrink-0 relative">
          <Bot size={22} className="text-[#6EAFA0]" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFE68A] rounded-full border-2 border-white shadow-[0_0_8px_rgba(255,230,138,0.6)]"></div>
        </div>
      );
    }
    if (Array.isArray(msg.avatar) && msg.avatar.length > 1) {
      return (
        <div className="w-12 h-12 rounded-[18px] bg-white/55 border border-white/70 overflow-hidden grid grid-cols-2 gap-0.5 shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] backdrop-blur-md p-0.5">
          {msg.avatar.slice(0, 4).map((av, idx) => (
            <div key={idx} className="bg-white/65 flex items-center justify-center overflow-hidden text-[11px] rounded-[6px]">
              <AvatarVisual avatar={av} className="flex h-full w-full items-center justify-center" imgClassName="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      );
    }
    const singleAvatar = Array.isArray(msg.avatar) ? msg.avatar[0] : msg.avatar;
    return (
      <div 
        className="w-12 h-12 overflow-hidden rounded-[18px] bg-white/62 border border-white/70 flex items-center justify-center text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_8px_16px_-14px_rgba(64,100,120,0.45)] backdrop-blur-md shrink-0 cursor-pointer hover:bg-white/80 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onUserClick({ name: msg.name, avatar: singleAvatar });
        }}
      >
        <AvatarVisual avatar={singleAvatar} className="flex h-full w-full items-center justify-center" />
      </div>
    );
  };

  return (
    <div className={`relative flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-16 ${HOME_SURFACE.background} animate-in fade-in duration-300`}>
      <div className="pointer-events-none absolute -left-24 top-2 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.24)_0%,rgba(150,225,206,0)_72%)]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.24)_0%,rgba(178,176,245,0)_72%)]" />

      <div className="relative z-10 mb-5 flex items-end justify-between shrink-0">
        <div>
          <h2 className="text-[22px] font-black text-[#2F3E46] tracking-tight">智能互动枢纽</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#56756D]/45">消息、搭子与 AI 助手</p>
        </div>
        <div className="rounded-full border border-white/70 bg-white/58 px-3 py-1.5 text-[10px] font-black text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-xl">
          {filteredMessages.length} 条
        </div>
      </div>

      <div className="relative z-10 mb-5 flex gap-2.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-[12px] font-black transition-all active:scale-95 ${
              filter === tab ? HOME_SURFACE.chipActive : HOME_SURFACE.chipInactive
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={`relative z-10 flex flex-col overflow-hidden rounded-[28px] ${HOME_SURFACE.glassCard} shrink-0`}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(176,204,248,0.2)_0%,rgba(176,204,248,0)_70%)]" />
        
        {/* 置顶区：AI通知 */}
        {pinnedMsgs.map(msg => (
          <div key={msg.id} onClick={() => msg.type === 'ai' && onOpenAIChat()} className="relative z-10 flex items-center p-5 cursor-pointer active:bg-white/50 transition-colors border-b border-white/50 bg-[linear-gradient(128deg,rgba(150,225,206,0.14)_0%,rgba(176,204,248,0.12)_100%)]">
            {renderAvatar(msg)}
            <div className="flex-1 ml-3 min-w-0 pr-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[15px] font-black text-slate-800 truncate">{msg.name}</span>
                <span className="text-[11px] font-bold text-slate-400 shrink-0">{msg.time}</span>
              </div>
              <p className="text-[13px] font-medium text-slate-600 truncate pr-2">
                {msg.preview}
              </p>
            </div>
            {msg.unread > 0 && (
              <div className="w-5 h-5 bg-[#FFE68A] rounded-full flex items-center justify-center text-[10px] font-black text-[#2F3E46] shrink-0 shadow-[0_0_8px_rgba(255,230,138,0.55)]">
                {msg.unread}
              </div>
            )}
          </div>
        ))}

        {/* 第一区：群聊区 */}
        {groupMsgs.length > 0 && (
          <div className="relative z-10 px-5 pt-4 pb-2 text-[11px] font-black text-[#56756D]/45 uppercase tracking-widest bg-white/25 border-b border-white/45">
            群聊区 (临时局)
          </div>
        )}
        {groupMsgs.map((msg, index) => (
          <div 
            key={msg.id} 
            onClick={() => {
              if (typeof msg.sceneId === 'number') onOpenGroupChat(msg.sceneId);
            }}
            className={`relative z-10 flex items-center p-5 cursor-pointer active:bg-white/50 transition-colors ${index !== groupMsgs.length - 1 ? 'border-b border-white/50' : ''}`}
          >
            {renderAvatar(msg)}
            <div className="flex-1 ml-3 min-w-0 pr-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[15px] font-black text-slate-800 truncate">{msg.name}</span>
                  {msg.tag && (
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-[6px] text-[9px] font-black border ${
                      msg.tagColor === 'amber' 
                        ? 'bg-[#F9D8B1]/20 text-amber-600 border-[#F9D8B1]/40' 
                        : 'bg-[#87A382]/10 text-[#87A382] border-[#87A382]/20'
                    }`}>
                      {msg.tag}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{msg.time}</span>
              </div>
              <p className="text-[13px] font-medium text-[#56756D]/65 truncate pr-2">
                {msg.preview}
              </p>
            </div>
            {msg.unread > 0 && (
              <div className="w-5 h-5 bg-[#FFE68A] rounded-full flex items-center justify-center text-[10px] font-black text-[#2F3E46] shrink-0 shadow-[0_0_8px_rgba(255,230,138,0.55)]">
                {msg.unread}
              </div>
            )}
          </div>
        ))}

        {/* 第二区：私聊区 */}
        {privateMsgs.length > 0 && (
          <div className="relative z-10 px-5 pt-4 pb-2 text-[11px] font-black text-[#56756D]/45 uppercase tracking-widest bg-white/25 border-b border-white/45 border-t border-white/50">
            私聊区 (专属搭子)
          </div>
        )}
        {privateMsgs.map((msg, index) => {
          const dazi = dazis.find(d => d.name === msg.name);
          return (
            <div 
              key={msg.id} 
              onClick={() => onOpenPrivateChat(dazi ?? null)}
              className={`relative z-10 flex items-center p-5 cursor-pointer active:bg-white/50 transition-colors ${index !== privateMsgs.length - 1 ? 'border-b border-white/50' : ''}`}
            >
              {renderAvatar(msg)}
              <div className="flex-1 ml-3 min-w-0 pr-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-black text-slate-800 truncate">{msg.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">{msg.time}</span>
                </div>
                <p className="text-[13px] font-medium text-[#56756D]/65 truncate pr-2">
                  {msg.preview}
                </p>
              </div>
              {msg.unread > 0 && (
                <div className="w-5 h-5 bg-[#FFE68A] rounded-full flex items-center justify-center text-[10px] font-black text-[#2F3E46] shrink-0 shadow-[0_0_8px_rgba(255,230,138,0.55)]">
                  {msg.unread}
                </div>
              )}
            </div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="relative z-10 p-10 flex flex-col items-center justify-center text-[#56756D]/45">
            <MessageSquare size={32} className="opacity-20 mb-3" />
            <span className="text-[13px] font-bold">暂无消息</span>
          </div>
        )}

      </div>
    </div>
  );
};

// --- ✨ 新增组件：AI 帮我攒个局 (Quick Build Modal) ---
const QuickBuildModal = ({
  onClose,
  onPublished,
  guestId,
  userLocation,
}: {
  onClose: () => void;
  onPublished: () => void | Promise<void>;
  /** 与本地游客 id 一致，用于在库里标记「局长」、前端识别我发起的局 */
  guestId: string;
  userLocation: { lat: number; lng: number } | null;
}) => {
  const [step, setStep] = useState('input'); 
  const [text, setText] = useState('');
  const [exclusive, setExclusive] = useState<string | null>(null); 
  
  const [meetTime, setMeetTime] = useState('今晚 18:30');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isCustomTimeMode, setIsCustomTimeMode] = useState(false);
  /** 原生 datetime-local：YYYY-MM-DDTHH:mm（本地） */
  const [customDateTimeValue, setCustomDateTimeValue] = useState(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T19:00`;
  });
  const [publishing, setPublishing] = useState(false);

  const formatMeetTimeFromDateTimeLocal = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const p = (n: number) => String(n).padStart(2, '0');
    const timePart = `${p(d.getHours())}:${p(d.getMinutes())}`;
    const startOfDay = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diffDays = Math.round(
      (startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / 86400000
    );
    if (diffDays === 0) return `今天 ${timePart}`;
    if (diffDays === 1) return `明天 ${timePart}`;
    return `${d.getMonth() + 1}月${d.getDate()}日 ${timePart}`;
  };

  // AI 生成的场景信息
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedType, setGeneratedType] = useState('');
  const [generatedEmoji, setGeneratedEmoji] = useState('✨');
  const [generatedLocation, setGeneratedLocation] = useState('');
  /** 预览步可编辑，与发布写入 Supabase 一致 */
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewLocation, setPreviewLocation] = useState('');

  // 本地关键词推断（当 AI 不可用时作为降级）
  const inferScene = (input: string) => {
    const t = input.toLowerCase();
    if (t.includes('火锅') || t.includes('烤肉') || t.includes('串串') || t.includes('吃') || t.includes('饭') || t.includes('餐'))
      return { emoji: '🍲', type: '美食拼单', location: '待定' };
    if (t.includes('咖啡') || t.includes('奶茶') || t.includes('下午茶'))
      return { emoji: '☕', type: '下午茶搭子', location: '楼下咖啡厅' };
    if (t.includes('羽毛球') || t.includes('篮球') || t.includes('运动') || t.includes('健身'))
      return { emoji: '🏸', type: '运动组队', location: '待定' };
    if (t.includes('剧本') || t.includes('密室') || t.includes('游戏') || t.includes('玩'))
      return { emoji: '🎭', type: '娱乐局', location: '待定' };
    if (t.includes('自习') || t.includes('图书馆') || t.includes('学习'))
      return { emoji: '📚', type: '学习搭子', location: '图书馆' };
    if (t.includes('摸鱼') || t.includes('散步') || t.includes('溜达'))
      return { emoji: '🚶', type: '散班味', location: '公司附近' };
    return { emoji: '✨', type: '搭子局', location: '待定' };
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setStep('processing');
    let title = text.slice(0, 15);

    // 拼入逆地理地址上下文
    let locationCtx = '';
    if (userLocation) {
      try {
        const geoRes = await fetch(`/api/geocode?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.address) locationCtx = `（活动附近地点参考：${geoData.address}）`;
        }
      } catch { /* 忽略逆地理失败 */ }
    }

    try {
      const res = await fetch('/api/eq-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `将以下想法转化为一个吸引人的活动标题（不超过12个字，不加标点），只输出标题本身${locationCtx}：${text}`,
          scenario: '工作汇报'
        }),
      });
      const data = await res.json();
      const aiTitle = data.result?.trim();
      if (aiTitle && aiTitle.length <= 20) {
        title = aiTitle;
      }
    } catch { /* 降级 */ }
    const inferred = inferScene(text);
    // 若有地理信息，优先用 API 地址作为 location
    if (locationCtx && inferred.location === '待定') {
      try {
        const geoRes = await fetch(`/api/geocode?lat=${userLocation!.lat}&lng=${userLocation!.lng}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.address) inferred.location = geoData.address.split('·')[0] || inferred.location;
        }
      } catch { /* 忽略 */ }
    }
    setGeneratedTitle(title);
    setGeneratedEmoji(inferred.emoji);
    setGeneratedType(inferred.type);
    setGeneratedLocation(inferred.location);
    setPreviewTitle(title);
    setPreviewType(inferred.type);
    setPreviewLocation(inferred.location);
    setStep('preview');
  };

  const handlePublish = async () => {
    if (!text.trim() || publishing) return;
    setPublishing(true);
    const title = previewTitle.trim() || generatedTitle || text.slice(0, 20);
    const type = previewType.trim() || generatedType || '搭子局';
    const loc = previewLocation.trim() || generatedLocation || '附近';
    const row = {
      emoji: generatedEmoji,
      type,
      title,
      distance: loc,
      meet_time: meetTime,
      current_count: 1,
      total_count: 5,
      exclusive: exclusive,
      description: text.trim(),
      host_guest_id: guestId || null,
      lat: userLocation?.lat ?? null,
      lng: userLocation?.lng ?? null,
    };
    let { error } = await supabase.from('scenes').insert([row]);
    if (
      error?.code === 'PGRST204' &&
      (error.message ?? '').includes("'host_guest_id' column")
    ) {
      const { host_guest_id: _unusedHostGuestId, ...rowWithoutHostGuestId } = row;
      const retry = await supabase.from('scenes').insert([rowWithoutHostGuestId]);
      error = retry.error;
      if (!error) {
        console.warn(
          'scenes insert fallback: host_guest_id missing in schema, inserted without it'
        );
      }
    }
    setPublishing(false);
    if (error) {
      console.error('scenes insert:', error);
      window.alert(
        `发布失败：${error.message}\n请确认 Supabase 已建 scenes 表并允许匿名 insert（supabase/sql/scenes_anon_write.sql），已添加 host_guest_id 列（supabase/sql/scenes_host_guest.sql），且已添加定位列 lat/lng（supabase/sql/location_columns.sql）`
      );
      return;
    }
    await Promise.resolve(onPublished());
    onClose();
  };

  const [showBuildExitConfirm, setShowBuildExitConfirm] = useState(false);
  const handleBuildClose = () => { if (text.trim() && step === 'input') { setShowBuildExitConfirm(true); } else { onClose(); } };

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#2F3E46]/24 backdrop-blur-md transition-opacity animate-in fade-in" onClick={handleBuildClose} />
      
      <div className={`relative z-10 flex h-[85%] w-full flex-col overflow-hidden rounded-t-[40px] ${HOME_SURFACE.background} p-6 shadow-[0_-24px_70px_-30px_rgba(47,62,70,0.35)] animate-in slide-in-from-bottom-[100%] duration-500`}>
        
        <button onClick={handleBuildClose} className="absolute top-6 right-6 z-20 rounded-full border border-white/70 bg-white/62 p-2 text-[#56756D]/70 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md active:scale-90 transition-transform">
          <X size={20} />
        </button>

        {showBuildExitConfirm && (
          <div className="absolute inset-0 z-[300] flex items-center justify-center px-5">
            <div className="absolute inset-0 bg-[#2F3E46]/32 backdrop-blur-sm" onClick={() => setShowBuildExitConfirm(false)} />
            <div className={`relative z-10 w-full max-w-[17.5rem] rounded-[24px] p-5 ${HOME_SURFACE.glassCard} animate-in zoom-in-95 duration-200`}>
              <div className="flex gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-amber-200/80 bg-amber-50 text-amber-500">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#2F3E46]">确定放弃组局内容吗？</p>
                  <p className="mt-1 text-[11px] text-slate-400">你写的局描述将不会被保存。</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowBuildExitConfirm(false)}
                  className="flex-1 rounded-full border border-white/72 bg-white/65 py-2.5 text-[12px] font-bold text-[#56756D] active:scale-[0.98] transition-transform">继续写</button>
                <button type="button" onClick={onClose}
                  className="flex-1 rounded-full bg-amber-500 py-2.5 text-[12px] font-bold text-white active:scale-[0.98] transition-transform">放弃</button>
              </div>
            </div>
          </div>
        )}

        {step === 'input' && (
          <div className="flex-1 flex flex-col pt-4 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-[24px] font-black tracking-tight mb-8" style={{ color: COLORS.ink }}>
              一句话，AI 帮你搞定 ✨
            </h2>
            
            <div className="mb-6">
              <span className="text-[11px] font-black opacity-40 uppercase tracking-widest mb-2 block" style={{ color: COLORS.ink }}>添加专属门禁 (可选)</span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'female', label: '👯‍♀️ 仅女生', activeClass: 'bg-[#FDF2F8] text-[#BE185D] border-[#BE185D]/30' },
                  { id: 'male', label: '🥷 兄弟局', activeClass: 'bg-blue-50 text-blue-600 border-blue-600/30' },
                  { id: 'company', label: '🏢 同公司', activeClass: 'bg-[#EAF0E9] text-[#2F3E46] border-[#2F3E46]/30' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setExclusive(exclusive === opt.id ? null : opt.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all duration-300 ${
                      exclusive === opt.id 
                        ? `${opt.activeClass} shadow-sm` 
                        : 'bg-white/68 text-slate-500 border-white/70 hover:bg-white/80 backdrop-blur-md'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mb-6 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#96E1CE]/34 via-[#B0CCF8]/28 to-[#B2B0F5]/30 rounded-[28px] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="例如：晚上想吃潮汕牛肉火锅，找个能聊得来的…"
                className="relative w-full h-36 bg-white/72 backdrop-blur-xl border border-white/70 rounded-[26px] p-6 text-[15px] font-medium placeholder:text-slate-300 focus:outline-none shadow-[0_14px_34px_-24px_rgba(64,100,120,0.42)] resize-none leading-relaxed"
                style={{ color: COLORS.ink }}
              />
              <button className="absolute bottom-5 right-5 rounded-full border border-white/70 bg-white/62 p-3.5 text-[#56756D]/55 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md hover:text-[#56756D] active:scale-90 transition-transform">
                <Mic size={20} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {['☕ 楼下瑞幸拼单', '🏸 周末羽毛球局', '💻 图书馆沉浸自习'].map(pill => (
                <button 
                  key={pill} 
                  onClick={() => setText(pill)} 
                  className="px-4 py-2.5 bg-white/68 border border-white/70 rounded-full text-[12px] font-bold shadow-[0_8px_20px_-18px_rgba(64,100,120,0.45)] backdrop-blur-md active:scale-95 transition-transform"
                  style={{ color: COLORS.ink }}
                >
                  {pill}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleGenerate}
              className={`mt-auto mb-8 w-full py-[18px] rounded-[22px] font-black text-[16px] text-white shadow-xl transition-all duration-300 flex justify-center items-center gap-2 ${
                text.trim() ? 'active:scale-95 translate-y-0 opacity-100' : 'opacity-40 pointer-events-none translate-y-2'
              }`}
              style={{ background: 'linear-gradient(125deg,rgba(150,225,206,0.98) 0%,rgba(176,204,248,0.96) 58%,rgba(178,176,245,0.98) 100%)' }}
            >
              魔法生成 <Wand2 size={18} />
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-28 h-28 flex items-center justify-center mb-8">
              <div className="absolute inset-0 border-4 border-dashed rounded-full animate-[spin_4s_linear_infinite]" style={{ borderColor: `${COLORS.sage}30` }}></div>
              <div className="absolute inset-2 border-4 rounded-full animate-spin border-t-transparent" style={{ borderColor: COLORS.sage }}></div>
              <Sparkles size={36} className="animate-pulse" style={{ color: COLORS.sage }} />
            </div>
            <p className="text-[16px] font-black tracking-tight animate-pulse" style={{ color: COLORS.ink }}>正在帮你构思文案和挑选地点...</p>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 flex flex-col pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-xl font-black tracking-tight mb-2" style={{ color: COLORS.ink }}>预览你的局 👀</h2>
            <p className="text-[11px] font-bold text-slate-400 mb-6 flex items-center gap-1">
              点击虚线框可手动修改信息
            </p>

            <div className="flex flex-col mb-auto gap-4">
              <div className="w-full bg-white rounded-[32px] border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative">
                <div className="p-7 pb-6">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#F8FAF8] rounded-[20px] flex items-center justify-center text-3xl shadow-inner border border-slate-100/50">{generatedEmoji}</div>
                      <div className="flex flex-col gap-1.5">
                        {exclusive && (
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black flex items-center w-fit border mb-1 shadow-sm ${
                            exclusive === 'female' ? 'bg-[#FDF2F8] text-[#BE185D] border-[#BE185D]/10' :
                            exclusive === 'male' ? 'bg-blue-50 text-blue-600 border-blue-600/10' :
                            'bg-[#EAF0E9] text-[#2F3E46] border-[#2F3E46]/10'
                          }`}>
                            {exclusive === 'female' ? '👯‍♀️ 仅限女生' :
                             exclusive === 'male' ? '🥷 纯兄弟局' :
                             '🏢 仅限同公司'}
                          </div>
                        )}
                        <input 
                          type="text" 
                          value={previewTitle}
                          onChange={e => setPreviewTitle(e.target.value)}
                          className="w-[min(100%,220px)] border-b border-dashed border-slate-300 bg-transparent pb-0.5 text-[18px] font-black transition-colors focus:border-[#87A382] focus:outline-none"
                          style={{ color: COLORS.ink }}
                        />
                        <input 
                          type="text" 
                          value={previewType}
                          onChange={e => setPreviewType(e.target.value)}
                          className="w-[min(100%,120px)] border-b border-dashed border-slate-200 bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors focus:border-[#87A382] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-0 border-t-2 border-dashed border-slate-100 w-full z-10">
                  <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: '#F8FAF8' }}></div>
                  <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full shadow-inner" style={{ backgroundColor: '#F8FAF8' }}></div>
                </div>

                <div className="p-7 pt-6 bg-slate-50/30">
                  <div className="flex flex-col gap-5">
                    {/* --- 时间修改交互区域 --- */}
                    <div className="flex items-center gap-3.5">
                      <Clock size={18} className="text-slate-300 shrink-0" />
                      <div 
                        onClick={() => {
                          setShowTimePicker(!showTimePicker);
                          setIsCustomTimeMode(false);
                        }}
                        className={`flex-1 flex items-center justify-between border-b border-dashed pb-1 cursor-pointer transition-colors ${showTimePicker ? 'border-[#87A382]' : 'border-slate-300'}`}
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-[14px] font-bold" style={{ color: COLORS.ink }}>{meetTime}</span>
                          <span className="text-[10px] font-medium text-slate-400">(2小时后停止招募)</span>
                        </div>
                        <span className="text-[14px] opacity-60 grayscale">✏️</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <MapPin size={18} className="text-slate-300 shrink-0" />
                      <input 
                        type="text" 
                        value={previewLocation}
                        onChange={e => setPreviewLocation(e.target.value)}
                        className="flex-1 border-b border-dashed border-slate-300 bg-transparent pb-1 text-[14px] font-bold transition-colors focus:border-[#87A382] focus:outline-none"
                        style={{ color: COLORS.ink }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-1 justify-between opacity-[0.05]">
                    {[...Array(24)].map((_, i) => <div key={i} className={`h-5 ${i%3===0 ? 'w-2.5' : i%2===0 ? 'w-1.5' : 'w-1'}`} style={{ backgroundColor: COLORS.ink }}></div>)}
                  </div>
                </div>
              </div>

              {/* --- 轻量快捷时间面板 / 原生时间选择器 --- */}
              {showTimePicker && (
                <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black opacity-40 uppercase tracking-widest block" style={{ color: COLORS.ink }}>
                      {isCustomTimeMode ? '选择日期与时间' : '快速调整出发时间'}
                    </span>
                    {isCustomTimeMode && (
                      <button 
                        onClick={() => setIsCustomTimeMode(false)}
                        className="text-[10px] text-slate-400 font-bold hover:text-slate-600 active:scale-95 transition-transform"
                      >
                        返回快捷选项
                      </button>
                    )}
                  </div>

                  {isCustomTimeMode ? (
                    <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-300 mt-2 sm:flex-row sm:items-center">
                      <input
                        type="datetime-local"
                        value={customDateTimeValue}
                        onChange={(e) => setCustomDateTimeValue(e.target.value)}
                        className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[15px] font-bold focus:outline-none focus:border-[#87A382] transition-colors"
                        style={{ color: COLORS.ink }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMeetTime(formatMeetTimeFromDateTimeLocal(customDateTimeValue));
                          setIsCustomTimeMode(false);
                          setShowTimePicker(false);
                        }}
                        className="shrink-0 px-6 py-3 rounded-[16px] font-black text-white shadow-sm active:scale-95 transition-transform"
                        style={{ backgroundColor: COLORS.sage }}
                      >
                        确认
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {['⚡ 马上走 (30分钟)', '🍱 中午饭 (12:00)', '🌇 今晚下班 (18:30)', '⚙️ 具体时间'].map(timeOpt => (
                        <button 
                          key={timeOpt}
                          onClick={() => { 
                            if (timeOpt === '⚙️ 具体时间') {
                              setIsCustomTimeMode(true);
                            } else {
                              setMeetTime(timeOpt); 
                              setShowTimePicker(false); 
                            }
                          }}
                          className={`px-4 py-2.5 rounded-full text-[12px] font-bold shadow-sm active:scale-95 transition-all border ${
                            meetTime === timeOpt 
                              ? 'bg-[#87A382] text-white border-[#87A382]' 
                              : 'bg-[#FAFAFA] text-slate-600 border-slate-200/60 hover:bg-slate-50'
                          }`}
                        >
                          {timeOpt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={publishing}
              onClick={handlePublish} 
              className="mb-8 mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r py-[18px] font-black shadow-[0_8px_25px_-5px_rgba(249,216,177,0.7)] transition-all active:scale-95 disabled:opacity-50"
              style={{ 
                color: COLORS.ink,
                backgroundImage: `linear-gradient(to right, ${COLORS.amber}, #F3B671)`
              }}
            >
              <span className="text-lg">{publishing ? '⏳' : '🚀'}</span> {publishing ? '正在发布…' : '确认发布，召唤搭子'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// --- ✨ 新增组件：高级筛选 (Advanced Filter Modal) ---
const AdvancedFilterModal = ({
  onClose,
  onApply,
  getPreviewCount,
  isWorkMode,
  currentFilters,
}: {
  onClose: () => void;
  onApply: (next: AdvancedSceneFilters) => void;
  getPreviewCount: (next: AdvancedSceneFilters) => number;
  isWorkMode: boolean;
  currentFilters: AdvancedSceneFilters;
}) => {
  const colors = getThemeColors(isWorkMode);
  const [distance, setDistance] = useState<'500m' | '3km' | 'city'>(currentFilters.distance);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>(currentFilters.size);
  const [exclusiveFilter, setExclusiveFilter] = useState<'company' | 'female' | 'male' | null>(currentFilters.exclusive);
  const previewCount = getPreviewCount({
    distance,
    size,
    exclusive: exclusiveFilter,
  });
  const distanceOptions = [
    { id: '500m', label: '步行 5 分钟' },
    { id: '3km', label: '3 公里内' },
    { id: 'city', label: '全城找搭子' },
  ] as const;
  const sizeOptions = [
    { id: 'small', label: '2-3人 (I人友好)' },
    { id: 'medium', label: '4-6人 (热闹组局)' },
    { id: 'large', label: '不限人数' },
  ] as const;
  const exclusiveOptions = [
    { id: 'company', label: '🏢 仅限同公司', desc: '系统将验证对方企业邮箱' },
    { id: 'female', label: '👯‍♀️ 仅限女生', desc: '安全社交过滤保护' },
    { id: 'male', label: '🥷 纯兄弟局', desc: '男生专属痛快交流' },
  ] as const;

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col justify-end">
      <div 
        className="absolute inset-0 bg-[#2F3E46]/36 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className={`relative z-10 flex max-h-[85%] w-full flex-col rounded-t-[40px] ${HOME_SURFACE.background} px-6 pb-10 pt-6 shadow-[0_-24px_70px_-30px_rgba(47,62,70,0.35)] animate-in slide-in-from-bottom-[100%] duration-500`}>
        <div className="pointer-events-none absolute -left-20 -top-24 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.3)_0%,rgba(150,225,206,0)_72%)]" />
        <div className="pointer-events-none absolute -right-16 top-4 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(178,176,245,0.28)_0%,rgba(178,176,245,0)_72%)]" />
        <div className="w-12 h-1.5 bg-white/70 rounded-full mx-auto mb-6 shrink-0"></div>
        <div className="relative z-10 mb-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[22px] font-black tracking-tight" style={{ color: colors.ink }}>高级筛选</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#56756D]/45">精准找到你的同频搭子</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/70 bg-white/62 p-2 text-[#56756D]/70 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md active:scale-90 transition-transform">
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-5 pb-4">
          <div className={`rounded-[24px] ${HOME_SURFACE.glassCard} p-4`}>
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#56756D]/50">
              <MapPin size={12} /> 距离偏好
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {distanceOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDistance(opt.id)}
                  className={`px-4 py-2.5 rounded-[16px] text-[13px] font-bold border transition-all duration-300 ${
                    distance === opt.id 
                      ? HOME_SURFACE.chipActive
                      : HOME_SURFACE.chipInactive
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-[24px] ${HOME_SURFACE.glassCard} p-4`}>
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#56756D]/50">
              <Users size={12} /> 局的规模
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {sizeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSize(opt.id)}
                  className={`px-4 py-2.5 rounded-[16px] text-[13px] font-bold border transition-all duration-300 ${
                    size === opt.id 
                      ? HOME_SURFACE.chipActive
                      : HOME_SURFACE.chipInactive
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-[24px] ${HOME_SURFACE.glassCard} p-4`}>
            <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#56756D]/50">
              <ShieldCheck size={12} /> 专属门禁
            </h3>
            <div className="flex flex-col gap-2.5">
              {exclusiveOptions.map(opt => {
                const isActive = exclusiveFilter === opt.id;
                return (
                  <div 
                    key={opt.id}
                    onClick={() => setExclusiveFilter(isActive ? null : opt.id)}
                    className={`flex items-center justify-between p-4 rounded-[18px] border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'border-white/75 bg-[linear-gradient(128deg,rgba(150,225,206,0.28)_0%,rgba(176,204,248,0.22)_56%,rgba(178,176,245,0.24)_100%)] shadow-[0_12px_22px_-18px_rgba(64,100,120,0.5)] backdrop-blur-xl'
                        : 'bg-white/60 border-white/70 hover:bg-white/80 backdrop-blur-md'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-[14px] font-bold ${isActive ? 'text-[#2F3E46]' : 'text-slate-700'}`}>{opt.label}</span>
                      <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-[#56756D]/75' : 'text-slate-400'}`}>{opt.desc}</span>
                    </div>
                    <div 
                      className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-300"
                      style={isActive ? { backgroundColor: '#56756D', borderColor: '#56756D' } : { borderColor: '#DCE4E7', backgroundColor: '#FFF' }}
                    >
                      {isActive && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-2 flex shrink-0 gap-3 border-t border-white/55 pt-4">
          <button
            onClick={() => {
              setDistance(DEFAULT_ADVANCED_SCENE_FILTERS.distance);
              setSize(DEFAULT_ADVANCED_SCENE_FILTERS.size);
              setExclusiveFilter(DEFAULT_ADVANCED_SCENE_FILTERS.exclusive);
            }}
            className="px-6 py-4 rounded-[22px] font-black text-[15px] text-[#56756D] bg-white/58 border border-white/70 backdrop-blur-md active:scale-95 transition-transform"
          >
            重置
          </button>
          <button
            onClick={() => {
              onApply({
                distance,
                size,
                exclusive: exclusiveFilter,
              });
              onClose();
            }}
            className="flex-1 py-4 rounded-[22px] font-black text-[16px] text-white shadow-[0_14px_28px_-18px_rgba(47,62,70,0.55)] transition-all active:scale-95 flex justify-center items-center gap-2"
            style={{ background: 'linear-gradient(125deg,rgba(47,62,70,0.94) 0%,rgba(74,91,103,0.9) 48%,rgba(112,122,168,0.88) 100%)' }}
          >
            确认并查看 ({previewCount})
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 根组件 App ---
const App = () => {
  // ✨ 应用状态逻辑 ('onboarding' -> 'login' -> 'setup' -> 'main')
  const [appState, setAppState] = useState('onboarding');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);
  const [userProfile, setUserProfile] = useState<{ nickname: string; company: string; gender: string; role: string; avatar: string; privacyStealth?: boolean; privacyMosaic?: boolean; isStudentVerified?: boolean; studentEmail?: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const guestIdRef = useRef('');
  const [guestId, setGuestId] = useState('');
  const [remoteDataReady, setRemoteDataReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number | null; updated_at: string } | null>(null);

  const [activeTab, setActiveTab] = useState('home');
  const [isWorkMode, setIsWorkMode] = useState(true);
  
  // 搭子 / 同局关系卡：首次局内发消息后创建候选项，选标签后成为正式搭子
  const [dazis, setDazis] = useState<DaziItem[]>([]);
  // 成就胶囊：初始为空；仅在「助手」第二张手账生成后点「存入档案」写入（不与发帖/加局关联）
  const [achievements, setAchievements] = useState<Array<{id: string; tag: string; desc: string}>>([]);
  const [aiChatMessages, setAiChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >(() => defaultAiWelcome(null));

  const [showChatId, setShowChatId] = useState<number | null>(null);
  const [showPreviewId, setShowPreviewId] = useState<number | null>(null);
  const [showFeedDetailId, setShowFeedDetailId] = useState<number | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showResumeLab, setShowResumeLab] = useState(false); 
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);
  const [showStudentVerify, setShowStudentVerify] = useState(false);
  const [showAnonymousProfile, setShowAnonymousProfile] = useState<{ name: string; avatar: string } | null>(null); 
  const [showPrivateChat, setShowPrivateChat] = useState<{ id: number; avatar: string; name: string; count: number; tag: string } | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [activeFilter, setActiveFilter] = useState<QuickSceneFilter>('全部');
  const [messageFilter, setMessageFilter] = useState<'全部' | '会话' | '通知'>('全部');
  const [advancedSceneFilters, setAdvancedSceneFilters] = useState<AdvancedSceneFilters>(DEFAULT_ADVANCED_SCENE_FILTERS);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false); 
  const [showQuickBuild, setShowQuickBuild] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  /** 本地兜底局入局仅改前端计数，用此增量叠加在 current 上 */
  const [demoSceneJoinBoost, setDemoSceneJoinBoost] = useState<Record<number, number>>({});
  /** 合成圈子 feed（负数 id）点赞仅本地递增 */
  const [syntheticFeedLikeDelta, setSyntheticFeedLikeDelta] = useState<Record<number, number>>({});
  /** 合成圈子 feed（负数 id）评论数前端叠加（评论内容走 feedCommentsMap） */
  const [syntheticFeedCommentBoost, setSyntheticFeedCommentBoost] = useState<Record<number, number>>({});
  /** 该局内已发过首条群消息（AI 选句或手动），下次直进聊天 */
  const [sceneIcebreakDoneIds, setSceneIcebreakDoneIds] = useState<number[]>([]);
  const [exitConfirmId, setExitConfirmId] = useState<number | null>(null); 
  const scrollRef = useRef(null);

  // ---- 真实数据状态 ----
  const [scenes, setScenes] = useState<ReturnType<typeof adaptScene>[]>([]);
  const [feeds, setFeeds] = useState<ReturnType<typeof adaptFeed>[]>([]);
  const [feedAiTipsCache, setFeedAiTipsCache] = useState<Record<number, string>>({});
  const [scenesLoading, setScenesLoading] = useState(true);
  const [feedsLoading, setFeedsLoading] = useState(true);
  const [scenesError, setScenesError] = useState<string | null>(null);
  const [feedsError, setFeedsError] = useState<string | null>(null);
  const [communityTag, setCommunityTag] = useState('全部');
  const [communityCompanyOnly, setCommunityCompanyOnly] = useState(false);
  const [communityCityOnly, setCommunityCityOnly] = useState(false);
  const [feedCommentsMap, setFeedCommentsMap] = useState<Record<number, FeedCommentItem[]>>({});
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [remoteSyncDisabled, setRemoteSyncDisabled] = useState(false);
  /** 已点赞的 feed id 集合（防重）*/
  const [likedFeedIds, setLikedFeedIds] = useState<Set<number>>(new Set());
  const preferredFeedCity = useMemo(() => {
    const profileCity = inferCityFromText(userProfile?.company);
    if (profileCity) return profileCity;
    if (detectedCity) return detectedCity;
    if (userLocation) return inferCityFromCoords(userLocation.lat, userLocation.lng);
    return null;
  }, [userProfile?.company, userLocation, detectedCity]);

  const feedsMergedForUi = useMemo(() => {
    const idSet = new Set(feeds.map((f) => f.id));
    const merged: AppFeedRow[] = [...feeds];
    for (const f of communityFeedFallbackPool()) {
      if (!idSet.has(f.id)) merged.push(f);
    }
    return merged.map((f) => {
      if (f.id >= 0) return f;
      return {
        ...f,
        likes: f.likes + (syntheticFeedLikeDelta[f.id] ?? 0),
        comments: f.comments + (syntheticFeedCommentBoost[f.id] ?? 0),
      };
    });
  }, [feeds, syntheticFeedLikeDelta, syntheticFeedCommentBoost]);

  const persistUserProfileToSupabase = useCallback(async (profile: { nickname: string; company: string; gender: string; role: string; avatar: string }) => {
    // users 表目前不一定包含 guest_id / avatar 字段，这里做最小兼容写入，失败不打断使用
    try {
      const { error } = await supabase.from('users').insert([{
        nickname: profile.nickname,
        company: profile.company,
        gender: profile.gender,
        role: profile.role,
      }]);
      if (error) console.warn('Profile persist failed (non-blocking):', error.message);
    } catch (e) {
      console.warn('Profile persist exception (non-blocking):', e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const forceResetOnboarding = params.get('resetOnboarding') === '1';
    if (forceResetOnboarding) {
      localStorage.removeItem(STORAGE_KEYS.appState);
      localStorage.removeItem(STORAGE_KEYS.userProfile);
      localStorage.removeItem(STORAGE_KEYS.guestId);
      localStorage.removeItem(STORAGE_KEYS.joinedIds);
      localStorage.removeItem(STORAGE_KEYS.dazis);
      localStorage.removeItem(STORAGE_KEYS.achievements);
      localStorage.removeItem(STORAGE_KEYS.aiChat);
      localStorage.removeItem(STORAGE_KEYS.userLocation);
      localStorage.removeItem(STORAGE_KEYS.feedComments);
      setAppState('onboarding');
      setIsHydrated(true);
      return;
    }

    /** 仅开发：打开 /?previewLocation=denied 直接进「定位已拒绝」结果页（避免已登录用户一直停在首页） */
    const devDenied =
      process.env.NODE_ENV === 'development' && params.get('previewLocation') === 'denied';
    if (devDenied) {
      localStorage.removeItem(STORAGE_KEYS.userProfile);
      localStorage.setItem(STORAGE_KEYS.appState, 'setup');
    }

    const gid = getOrCreateGuestId();
    guestIdRef.current = gid;
    setGuestId(gid);
    const storedProfile = safeParseJSON<{ nickname: string; company: string; gender: string; role: string; avatar: string } | null>(
      localStorage.getItem(STORAGE_KEYS.userProfile),
      null
    );
    const storedJoinedIds = safeParseJSON<number[]>(localStorage.getItem(STORAGE_KEYS.joinedIds), []);
    const storedDazis = safeParseJSON<DaziItem[]>(localStorage.getItem(STORAGE_KEYS.dazis), []);
    const storedAchievements = safeParseJSON<Array<{ id: string; tag: string; desc: string }>>(
      localStorage.getItem(STORAGE_KEYS.achievements),
      []
    );
    const storedAiChat = safeParseJSON<{ role: 'user' | 'assistant'; content: string }[]>(
      localStorage.getItem(STORAGE_KEYS.aiChat),
      []
    );
    const storedUserLocation = safeParseJSON<{ lat: number; lng: number; accuracy?: number | null; updated_at: string } | null>(
      localStorage.getItem(STORAGE_KEYS.userLocation),
      null
    );
    const storedActiveTab = localStorage.getItem(STORAGE_KEYS.activeTab);
    const storedAppState = localStorage.getItem(STORAGE_KEYS.appState);
    const storedFeedComments = safeParseJSON<Record<number, FeedCommentItem[]>>(
      localStorage.getItem(STORAGE_KEYS.feedComments),
      {}
    );

    if (storedProfile) setUserProfile(storedProfile);
    if (storedJoinedIds.length > 0) setJoinedIds(storedJoinedIds);
    setSceneIcebreakDoneIds(
      safeParseJSON<number[]>(localStorage.getItem(STORAGE_KEYS.sceneIcebreakDone), [])
    );
    if (storedDazis.length > 0) setDazis(storedDazis);
    if (storedAchievements.length > 0) setAchievements(storedAchievements);
    if (storedAiChat.length > 0) setAiChatMessages(storedAiChat);
    if (storedUserLocation) setUserLocation(storedUserLocation);
    if (storedActiveTab) setActiveTab(storedActiveTab);
    if (storedFeedComments) setFeedCommentsMap(storedFeedComments);

    if (storedProfile) {
      setAppState('main');
    } else if (storedAppState) {
      setAppState(storedAppState);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.appState, appState);
    localStorage.setItem(STORAGE_KEYS.joinedIds, JSON.stringify(joinedIds));
    localStorage.setItem(STORAGE_KEYS.sceneIcebreakDone, JSON.stringify(sceneIcebreakDoneIds));
    localStorage.setItem(STORAGE_KEYS.dazis, JSON.stringify(dazis));
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
    localStorage.setItem(STORAGE_KEYS.aiChat, JSON.stringify(aiChatMessages));
    localStorage.setItem(STORAGE_KEYS.activeTab, activeTab);
    localStorage.setItem(STORAGE_KEYS.userLocation, JSON.stringify(userLocation));
    localStorage.setItem(STORAGE_KEYS.feedComments, JSON.stringify(feedCommentsMap));
    if (userProfile) {
      localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(userProfile));
    }
  }, [isHydrated, appState, joinedIds, sceneIcebreakDoneIds, dazis, achievements, activeTab, userProfile, aiChatMessages, userLocation, feedCommentsMap]);

  // 从 Supabase 拉取游客全量数据（需已在 Supabase 执行 supabase/sql/app_guest_data.sql）
  useEffect(() => {
    if (!isHydrated || !guestId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('app_guest_data')
        .select('*')
        .eq('guest_id', guestId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        if (error.code === '42501') {
          // RLS 拒绝：自动降级到本地模式，避免持续报错影响体验
          setRemoteSyncDisabled(true);
          setRemoteDataReady(true);
          return;
        }
        console.warn('app_guest_data 读取失败（若尚未建表，请在 Supabase 执行 supabase/sql/app_guest_data.sql）', error);
        setRemoteDataReady(true);
        return;
      }
      if (data) {
        const row = data as unknown as AppGuestDataRow;
        if (row.user_profile) {
          setUserProfile(row.user_profile);
          setAppState('main');
        } else if (row.app_state) {
          setAppState(row.app_state);
        }
        if (row.joined_ids && Array.isArray(row.joined_ids) && (row.joined_ids as number[]).length) {
          setJoinedIds(row.joined_ids as number[]);
        }
        if (row.dazis && Array.isArray(row.dazis) && row.dazis.length) {
          setDazis(row.dazis as DaziItem[]);
        }
        if (row.achievements && Array.isArray(row.achievements) && row.achievements.length) {
          setAchievements(row.achievements as { id: string; tag: string; desc: string }[]);
        }
        if (row.active_tab) setActiveTab(row.active_tab);
        if (row.ai_chat && Array.isArray(row.ai_chat) && row.ai_chat.length) {
          setAiChatMessages(row.ai_chat as { role: 'user' | 'assistant'; content: string }[]);
        }
        if (row.user_location && typeof row.user_location === 'object') {
          setUserLocation(row.user_location);
        }
      }
      setRemoteDataReady(true);
    })();
    return () => { cancelled = true; };
  }, [isHydrated, guestId]);

  useEffect(() => {
    if (!isHydrated || !guestId || !remoteDataReady || remoteSyncDisabled) return;
    const t = setTimeout(() => {
      const payload: AppGuestDataRow = {
        guest_id: guestId,
        user_profile: userProfile,
        joined_ids: joinedIds,
        dazis,
        achievements,
        ai_chat: aiChatMessages,
        app_state: appState,
        active_tab: activeTab,
        updated_at: new Date().toISOString(),
      };
      void supabase
        .from('app_guest_data')
        .upsert(payload, { onConflict: 'guest_id' })
        .then(({ error: upErr }) => {
          if (!upErr) return;
          if (upErr.code === '42501') {
            setRemoteSyncDisabled(true);
            return;
          }
          console.warn('app_guest_data 同步失败', upErr);
        });
    }, 800);
    return () => clearTimeout(t);
  }, [isHydrated, guestId, remoteDataReady, remoteSyncDisabled, appState, userProfile, joinedIds, dazis, achievements, activeTab, aiChatMessages, userLocation]);

  const loadDazisFromServer = useCallback(async () => {
    if (!guestId) return;
    try {
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .or(`guest_id_a.eq.${guestId},guest_id_b.eq.${guestId}`)
        .eq('status', 'active');
      if (error || !data) return;
      const serverDazis: DaziItem[] = data.map((r, idx) => {
        const partnerId = r.guest_id_a === guestId ? r.guest_id_b : r.guest_id_a;
        return {
          id: r.id ?? idx + 1,
          name: partnerId.slice(0, 8),
          avatar: '🐧',
          tag: '搭子',
          count: 1,
          status: 'dazi' as const,
          sceneLabel: r.scene_id ? `局 #${r.scene_id}` : '直接添加',
        };
      });
      if (serverDazis.length > 0) {
        setDazis((prev) => {
          const prevIds = new Set(prev.map((d) => d.id));
          const merged = [...prev, ...serverDazis.filter((d) => !prevIds.has(d.id))];
          return merged;
        });
      }
    } catch { /* 忽略，本地兜底 */ }
  }, [guestId]);

  const loadScenes = useCallback(async () => {
    setScenesLoading(true);
    setScenesError(null);
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setScenes(data.map(adaptScene));
      } else if (error) {
        console.error('Failed to load scenes:', error.message);
        setScenesError('局数据加载失败，下拉刷新试试');
      }
    } catch (e) {
      console.error('Scene loading error:', e);
      setScenesError('网络异常，局数据加载失败');
    } finally {
      setScenesLoading(false);
    }
  }, []);

  const loadFeeds = useCallback(
    async (opts?: { pinned?: ReturnType<typeof adaptFeed> }) => {
    setFeedsLoading(true);
    setFeedsError(null);
    try {
      // 服务端优先加载同城 + 同公司的情报，再合并全局最新内容
      const city = preferredFeedCity || userProfile?.company;
      const company = userProfile?.company;
      let data: ReturnType<typeof adaptFeed>[] = [];
      let error: unknown = null;

      // 查同城/同公司数据（最多 60 条）
      if (city || company) {
        const conditions: string[] = [];
        if (city) conditions.push(`city.ilike.%${city}%`);
        if (company) conditions.push(`company.ilike.%${company}%`);
        const { data: localData, error: localError } = await supabase
          .from('feeds')
          .select('*')
          .or(conditions.join(','))
          .order('created_at', { ascending: false })
          .limit(60);
        if (!localError && localData) data = data.concat(localData.map(adaptFeed));
        error = localError;
      }
      // 查全局最新（最多 60 条，补全本地结果）
      {
        const { data: globalData, error: globalError } = await supabase
          .from('feeds')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(60);
        if (!globalError && globalData) {
          const existingIds = new Set(data.map((f) => f.id));
          data = data.concat(globalData.map(adaptFeed).filter((f) => !existingIds.has(f.id)));
        }
        if (!error) error = globalError;
      }

      if (!error && data.length >= 0) {
        let nextFeeds = data;
        const pinned = opts?.pinned;
        if (pinned && !nextFeeds.some((f) => f.id === pinned.id)) {
          nextFeeds = [pinned, ...nextFeeds];
        }
        nextFeeds.sort((a, b) => {
          const aCity = preferredFeedCity && (a.location ?? '').includes(preferredFeedCity) ? 1 : 0;
          const bCity = preferredFeedCity && (b.location ?? '').includes(preferredFeedCity) ? 1 : 0;
          const aCompany = isCompanyRelatedFeed(a, userProfile?.company) ? 1 : 0;
          const bCompany = isCompanyRelatedFeed(b, userProfile?.company) ? 1 : 0;
          
          // 关联度评分：同公司权重 3，同城权重 2
          const scoreA = aCompany * 3 + aCity * 2;
          const scoreB = bCompany * 3 + bCity * 2;
          if (scoreA !== scoreB) return scoreB - scoreA;
          
          // 如果关联度相同，按热度排序（likes + comments）
          const heatA = (a.likes ?? 0) + (a.comments ?? 0) * 2;
          const heatB = (b.likes ?? 0) + (b.comments ?? 0) * 2;
          if (heatA !== heatB) return heatB - heatA;
          
          // 最后按时间排序（最新优先）
          const timeA = new Date(a.createdAt ?? 0).getTime();
          const timeB = new Date(b.createdAt ?? 0).getTime();
          return timeB - timeA;
        });
        setFeeds(nextFeeds);
      } else if (error) {
        console.error('Failed to load feeds:', (error as {message?: string})?.message ?? error);
        setFeedsError('情报加载失败，下拉刷新试试');
      }
    } catch (e) {
      console.error('Feed loading error:', e);
      setFeedsError('网络异常，情报加载失败');
    } finally {
      setFeedsLoading(false);
    }
  },
  [preferredFeedCity, userProfile?.company]);

  useEffect(() => {
    if (appState === 'main') {
      loadScenes();
      loadFeeds();
      loadDazisFromServer();
    }
  }, [appState, loadScenes, loadFeeds, loadDazisFromServer]);

  // 异步生成 feed AI 摘要缓存
  useEffect(() => {
    if (feeds.length === 0) return;
    const needsGeneration = feeds.filter(f => !feedAiTipsCache[f.id]);
    if (needsGeneration.length === 0) return;

    const generateAiTips = async () => {
      const tips: Record<number, string> = { ...feedAiTipsCache };
      for (const feed of needsGeneration.slice(0, 5)) {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                { role: 'user', content: `请为这条圈子内容生成一句话的AI摘要，不超过20字，聚焦其实用价值：\n\n内容：${feed.content}\n标签：${(feed.tags ?? []).join('、') || '无'}` }
              ],
              mode: 'feed-summary'
            }),
            signal: AbortSignal.timeout(8000)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.result) {
              tips[feed.id] = data.result;
            }
          }
        } catch {
          // 静默失败，保留默认摘要
        }
      }
      setFeedAiTipsCache(tips);
    };

    generateAiTips();
  }, [feeds, feedAiTipsCache]);

  useEffect(() => {
    if (appState !== 'main' || typeof window === 'undefined') return;
    if (!navigator.geolocation) return;
    const tooOld =
      !userLocation ||
      Date.now() - new Date(userLocation.updated_at).getTime() > 30 * 60 * 1000;
    if (!tooOld) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          updated_at: new Date().toISOString(),
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, [appState, userLocation]);

  useEffect(() => {
    if (!userLocation) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/geocode?lat=${userLocation.lat}&lon=${userLocation.lng}`);
        if (!res.ok) { if (!cancelled) setDetectedCity(null); return; }
        const data = await res.json();
        if (cancelled) return;
        const addr = data?.address ?? {};
        const cityText =
          addr.city ||
          addr.town ||
          addr.county ||
          addr.state_district ||
          addr.state ||
          '';
        setDetectedCity(inferCityFromText(String(cityText)));
      } catch {
        if (!cancelled) setDetectedCity(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setScrolled(scrollTop > 40);
  };

  const scenesWithFallback = useMemo(() => {
    const boosted = buildFallbackHomeScenes(activeFilter);
    const remoteIds = new Set(scenes.map((s) => s.id));
    const merged = [...scenes];
    for (const s of boosted) {
      if (!remoteIds.has(s.id)) merged.push(s);
    }
    return merged.map((s) =>
      isSyntheticSceneId(s.id)
        ? {
            ...s,
            current: Math.min(s.total, s.current + (demoSceneJoinBoost[s.id] ?? 0)),
          }
        : s
    );
  }, [scenes, activeFilter, demoSceneJoinBoost]);

  const upsertDaziFromFirstSceneMessage = useCallback(
    (sceneId: number) => {
      const scene = scenesWithFallback.find(s => s.id === sceneId);
      if (!scene) return;
      const peerKey = DAZI_PEER_KEY(sceneId);
      const shortTitle = scene.title.length > 12 ? scene.title.slice(0, 12) + '…' : scene.title;
      let created = false;
      setDazis(prev => {
        if (prev.some(d => d.peerKey === peerKey)) return prev;
        created = true;
        const item: DaziItem = {
          id: Date.now() + sceneId,
          avatar: scene.emoji,
          name: `「${shortTitle}」同局圈`,
          count: 1,
          tag: DAZI_CANDIDATE_TAG,
          status: 'candidate',
          peerKey,
          sceneId,
          sceneType: scene.type,
          sceneTitle: scene.title,
          aiTags: [],
          timeline: [{ at: new Date().toISOString(), text: '第一次在本局发言，已生成关系卡' }],
        };
        return [item, ...prev];
      });
      if (created) {
        void (async () => {
          const tags = await fetchDaziAiTags(scene.title, scene.type);
          setDazis(p =>
            p.map(d => (d.peerKey === peerKey ? { ...d, aiTags: tags.length ? tags : ['同局可聊', '慢慢熟悉'] } : d))
          );
        })();
      }
    },
    [scenesWithFallback]
  );

  const markSceneFirstMessage = useCallback(
    (sceneId: number) => {
      setSceneIcebreakDoneIds((prev) => (prev.includes(sceneId) ? prev : [...prev, sceneId]));
      upsertDaziFromFirstSceneMessage(sceneId);
    },
    [upsertDaziFromFirstSceneMessage]
  );

  const handleJoin = async (id: number) => {
    if (joinedIds.includes(id)) return;
    const scMerged = scenesWithFallback.find((s) => s.id === id);
    const scRemote = scenes.find((s) => s.id === id);

    if (isSyntheticSceneId(id)) {
      if (guestId && scMerged?.hostGuestId && scMerged.hostGuestId === guestId) return;
      setJoinedIds((prev) => [...prev, id]);
      setDemoSceneJoinBoost((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      setShowChatId(id);
      return;
    }

    const sc = scRemote;
    if (guestId && sc?.hostGuestId && sc.hostGuestId === guestId) return;
    const isFirstJoin = joinedIds.length === 0;
    setJoinedIds(prev => [...prev, id]);
    setScenes(prev =>
      prev.map(s => s.id === id ? { ...s, current: s.current + 1 } : s)
    );
    setShowChatId(id);
    if (isFirstJoin) track('scene_joined', { scene_id: id });
    await supabase
      .from('scenes')
      .update({ current_count: (scenes.find(s => s.id === id)?.current ?? 0) + 1 })
      .eq('id', id);
    // 双向写入 relationships 表：当前用户 ↔ 发起者
    if (guestId && sc?.hostGuestId && sc.hostGuestId !== guestId) {
      const [a, b] = [guestId, sc.hostGuestId].sort();
      await supabase.from('relationships').upsert(
        { guest_id_a: a, guest_id_b: b, scene_id: id, type: 'dazi', status: 'active' },
        { onConflict: 'guest_id_a,guest_id_b,scene_id' }
      );
    }
  };

  const handleExit = async (id: number) => {
    setJoinedIds(prev => prev.filter(item => item !== id));
    setSceneIcebreakDoneIds((prev) => prev.filter((sid) => sid !== id));
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(threadStorageKey(id));
      } catch {
        /* ignore */
      }
    }

    if (isSyntheticSceneId(id)) {
      setDemoSceneJoinBoost((prev) => {
        const next = { ...prev };
        if (!next[id]) return prev;
        const v = Math.max(0, next[id] - 1);
        if (v <= 0) delete next[id];
        else next[id] = v;
        return next;
      });
      setExitConfirmId(null);
      setShowChatId((open) => (open === id ? null : open));
      return;
    }

    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, current: Math.max(0, s.current - 1) } : s))
    );
    setExitConfirmId(null);
    setShowChatId((open) => (open === id ? null : open));
    await supabase
      .from('scenes')
      .update({ current_count: Math.max(0, (scenes.find(s => s.id === id)?.current ?? 1) - 1) })
      .eq('id', id);
  };

  const handleSetRole = (id: number, newRole: string) => {
    setDazis((prevDazis) =>
      prevDazis.map((dazi) => {
        if (dazi.id !== id) return dazi;
        const prevTag = dazi.tag;
        const timelineMsg =
          dazi.status === 'candidate' || prevTag === DAZI_CANDIDATE_TAG
            ? `已设为：${newRole}`
            : `已调整为：${newRole}`;
        return {
          ...dazi,
          tag: newRole,
          status: 'dazi',
          timeline:
            prevTag === newRole
              ? (dazi.timeline ?? [])
              : [
                  ...(dazi.timeline ?? []),
                  { at: new Date().toISOString(), text: timelineMsg },
                ],
        };
      })
    );
  };

  const handleRemoveDazi = useCallback((id: number) => {
    setDazis((prev) => prev.filter((d) => d.id !== id));
    setShowPrivateChat((open) => (open?.id === id ? null : open));
  }, []);

  const handleUpdateProfile = useCallback(
    (next: { nickname: string; company: string; gender: string; role: string; avatar: string }) => {
      setUserProfile(next);
      void persistUserProfileToSupabase(next);
    },
    [persistUserProfileToSupabase]
  );

  const handleUserClick = (user) => {
    const isDazi = dazis.find(d => d.name === user.name);
    if (isDazi) {
      setShowPrivateChat(isDazi);
    } else {
      setShowAnonymousProfile(user);
    }
  };

  const handleFeedPublished = useCallback(async (newFeed: ReturnType<typeof adaptFeed>) => {
    await loadFeeds({ pinned: newFeed });
  }, [loadFeeds]);

  const handleFeedLike = useCallback((feedId: number) => {
    // 合成 feed（负数 id）：仅本地计数
    if (feedId < 0) {
      setSyntheticFeedLikeDelta((prev) => ({
        ...prev,
        [feedId]: (prev[feedId] ?? 0) + 1,
      }));
      return;
    }
    // 防重复点赞
    setLikedFeedIds((prev) => {
      const isLiked = prev.has(feedId);
      const next = new Set(prev);
      if (isLiked) {
        next.delete(feedId);
      } else {
        next.add(feedId);
      }
      return next;
    });
    // 乐观更新 UI
    const isCurrentlyLiked = likedFeedIds.has(feedId);
    setFeeds((prev) =>
      prev.map((f) => {
        if (f.id !== feedId) return f;
        return { ...f, likes: Math.max(0, (f.likes ?? 0) + (isCurrentlyLiked ? -1 : 1)) };
      })
    );
    // 调用 API 持久化（fire-and-forget，失败静默）
    void fetch('/api/feed-like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feed_id: feedId,
        guest_id: guestIdRef.current || guestId,
        action: isCurrentlyLiked ? 'unlike' : 'like',
      }),
    }).catch(() => { /* 网络失败不影响本地 UI */ });
  }, [likedFeedIds, guestId]);

  const handleFeedComment = useCallback((feedId: number, text: string) => {
    if (!text.trim()) return;
    const comment: FeedCommentItem = {
      id: `c-${feedId}-${Date.now()}`,
      avatar: userProfile?.avatar ?? '🐧',
      author: userProfile?.nickname ?? '匿名实习生',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };
    // 合成 feed（负数 id）：仅本地
    if (feedId < 0) {
      setSyntheticFeedCommentBoost((prev) => ({
        ...prev,
        [feedId]: (prev[feedId] ?? 0) + 1,
      }));
      setFeedCommentsMap((prev) => ({
        ...prev,
        [feedId]: [comment, ...(prev[feedId] ?? [])],
      }));
      return;
    }
    // 乐观更新本地
    setFeedCommentsMap((prev) => ({
      ...prev,
      [feedId]: [comment, ...(prev[feedId] ?? [])],
    }));
    setFeeds((prev) =>
      prev.map((f) => {
        if (f.id !== feedId) return f;
        return { ...f, comments: (f.comments ?? 0) + 1 };
      })
    );
    // 调用 API 持久化到 feed_comments 表
    void fetch('/api/feed-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feed_id: feedId,
        guest_id: guestIdRef.current || guestId,
        avatar: userProfile?.avatar ?? '🐧',
        author: userProfile?.nickname ?? '匿名实习生',
        content: text.trim(),
      }),
    }).catch(() => { /* 网络失败不影响本地 UI */ });
  }, [userProfile?.avatar, userProfile?.nickname, guestId]);

  const handleSummonAiForFeed = useCallback((feed: ReturnType<typeof adaptFeed>) => {
    const prompt = `请基于这条圈子内容给我一段“高情商嘴替”，用于友好评论或私聊补充。` +
      `\n\n内容：${feed.content}\n位置：${feed.location}\n标签：${(feed.tags ?? []).join('、') || '无'}\n` +
      `要求：给出 3 条可直接复制的话术，每条不超过 35 字。`;
    const seededMessages = [
      ...defaultAiWelcome(userProfile),
      { role: 'user', content: prompt },
    ] as { role: 'user' | 'assistant'; content: string }[];
    setAiChatMessages(seededMessages);
    setShowAIChat(true);
    void (async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: seededMessages
              .filter((m, i) => m.role !== 'assistant' || i > 0)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await res.json();
        const answer = res.ok
          ? (data.result || '我先给你一个简版：先共情，再给建议，最后给可执行动作。')
          : (data.error || 'AI 暂时不可用，请稍后再试');
        setAiChatMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      } catch {
        setAiChatMessages((prev) => [...prev, { role: 'assistant', content: '网络超时，请稍后重试 🙏' }]);
      }
    })();
  }, [userProfile]);

  const getSceneDistanceMeters = useCallback((scene: ReturnType<typeof adaptScene>) => {
    if (
      userLocation &&
      typeof scene.lat === 'number' &&
      typeof scene.lng === 'number'
    ) {
      return haversineMeters(userLocation.lat, userLocation.lng, scene.lat, scene.lng);
    }
    return Number.POSITIVE_INFINITY;
  }, [userLocation]);

  const baseVisibleScenes = scenesWithFallback
    .filter(scene => {
      if (!scene.exclusive) return true;
      if (!userProfile) return true;
      if (scene.exclusive === 'female' && userProfile.gender !== 'female') return false;
      if (scene.exclusive === 'male' && userProfile.gender !== 'male') return false;
      if (scene.exclusive === 'company' && !userProfile.company) return false;
      return true;
    })
    .filter((scene) => matchesQuickSceneFilter(scene, activeFilter))
    .map((scene) => {
      const meters = getSceneDistanceMeters(scene);
      const distanceLabel = Number.isFinite(meters) ? formatMeters(meters) : (scene.distance || '附近');
      return { ...scene, _distanceMeters: meters, _distanceLabel: distanceLabel };
    });

  const applyAdvancedSceneFilters = useCallback((filters: AdvancedSceneFilters) => (
    baseVisibleScenes
      .filter((scene) => {
        // 无 lat/lng 时无法计算真实距离（常见于未开定位或发布时未写入坐标），
        // 若在 500m/3km 模式下直接过滤掉，会导致「刚发的局在首页消失」。
        if (filters.distance === '500m') {
          if (!Number.isFinite(scene._distanceMeters)) return true;
          return scene._distanceMeters <= 500;
        }
        if (filters.distance === '3km') {
          if (!Number.isFinite(scene._distanceMeters)) return true;
          return scene._distanceMeters <= 3000;
        }
        return true;
      })
      .filter((scene) => {
        if (filters.size === 'small') return scene.total <= 3;
        if (filters.size === 'medium') return scene.total >= 4 && scene.total <= 6;
        return true;
      })
      .filter((scene) => {
        if (!filters.exclusive) return true;
        return scene.exclusive === filters.exclusive;
      })
  ), [baseVisibleScenes]);

  const passesSceneExclusiveGate = useCallback(
    (scene: AppSceneRow) => {
      if (!scene.exclusive) return true;
      if (!userProfile) return true;
      if (scene.exclusive === 'female' && userProfile.gender !== 'female') return false;
      if (scene.exclusive === 'male' && userProfile.gender !== 'male') return false;
      if (scene.exclusive === 'company' && !userProfile.company) return false;
      return true;
    },
    [userProfile]
  );

  // ✨ 根据用户信息过滤展示的局 + 按与当前位置真实距离排序（高级筛过狠时用仅「快捷标签」通过的局补齐条数）
  const visibleScenes = useMemo(() => {
    const primary = applyAdvancedSceneFilters(advancedSceneFilters).sort(
      (a, b) => a._distanceMeters - b._distanceMeters
    );
    if (primary.length >= HOME_NEARBY_SCENES_MIN) return primary;
    const seen = new Set(primary.map((s) => s.id));
    const out = [...primary];

    const advEx = advancedSceneFilters.exclusive;
    for (const row of baseVisibleScenes) {
      if (out.length >= HOME_NEARBY_SCENES_MIN) break;
      if (seen.has(row.id)) continue;
      if (advEx && row.exclusive !== advEx) continue;
      seen.add(row.id);
      out.push(row);
    }

    if (out.length < HOME_NEARBY_SCENES_MIN) {
      for (const seed of buildFallbackHomeScenes(activeFilter)) {
        const scene = scenesWithFallback.find((s) => s.id === seed.id) ?? seed;
        if (out.length >= HOME_NEARBY_SCENES_MIN) break;
        if (seen.has(scene.id)) continue;
        if (!passesSceneExclusiveGate(scene)) continue;
        if (!matchesQuickSceneFilter(scene, activeFilter)) continue;
        if (advEx && scene.exclusive !== advEx) continue;
        const meters = getSceneDistanceMeters(scene);
        const distanceLabel = Number.isFinite(meters) ? formatMeters(meters) : (scene.distance || '附近');
        const row = { ...scene, _distanceMeters: meters, _distanceLabel: distanceLabel };
        seen.add(scene.id);
        out.push(row);
      }
    }

    return out.sort((a, b) => a._distanceMeters - b._distanceMeters);
  }, [
    activeFilter,
    advancedSceneFilters,
    applyAdvancedSceneFilters,
    baseVisibleScenes,
    scenesWithFallback,
    getSceneDistanceMeters,
    passesSceneExclusiveGate,
  ]);

  const ScenePass = ({ scene }) => {
    const isHost = !!(guestId && scene.hostGuestId && scene.hostGuestId === guestId);
    const isJoined = joinedIds.includes(scene.id);
    const isInScene = isJoined || isHost;
    const currentPeople = scene.current;
    const progress = (currentPeople / scene.total) * 100;

    return (
      <div 
        onClick={() => {
          if (isInScene) {
            setShowChatId(scene.id);
          } else {
            setShowPreviewId(scene.id);
          }
        }}
        className={`relative w-full rounded-[28px] ${HOME_SURFACE.glassCard} overflow-hidden flex flex-col p-5 mb-4 transition-all active:scale-[0.98] cursor-pointer`}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(176,204,248,0.26)_0%,rgba(176,204,248,0)_70%)]" />
        <div className="pointer-events-none absolute -bottom-16 left-4 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(150,225,206,0.22)_0%,rgba(150,225,206,0)_72%)]" />
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white/58 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_18px_-16px_rgba(64,100,120,0.5)] backdrop-blur-md">{scene.emoji}</div>
            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
              {scene.exclusive && (
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black flex items-center w-fit border mb-1 shadow-sm ${
                  scene.exclusive === 'female' ? 'bg-[#FDF2F8] text-[#BE185D] border-[#BE185D]/10' :
                  scene.exclusive === 'male' ? 'bg-blue-50 text-blue-600 border-blue-600/10' :
                  'bg-[#EAF0E9] text-[#2F3E46] border-[#2F3E46]/10'
                }`}>
                  {scene.exclusive === 'female' ? '👯‍♀️ 仅限女生' :
                   scene.exclusive === 'male' ? '🥷 纯兄弟局' :
                   '🏢 仅限同公司'}
                </div>
              )}
              <h3 className="line-clamp-2 font-black text-[17px] tracking-tight" style={{ color: COLORS.ink }}>{scene.title}</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: COLORS.ink }}>{scene.type}</span>
            </div>
          </div>
          <div className="relative z-10 flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-white/70 bg-white/55 px-2.5 py-1 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md">
            <MapPin size={10} className="shrink-0 text-[#6EAFA0]" />
            <span className="text-[10px] font-black text-[#56756D]">{scene._distanceLabel ?? scene.distance}</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-auto">
          <div className="flex flex-col gap-2 flex-1 mr-6">
            <div className="flex items-center gap-1.5 text-[#56756D]/55">
              <Clock size={12} />
              <span className="text-xs font-bold">{scene.time}</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[...Array(currentPeople)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-gradient-to-br from-[#E7F7F1] to-[#ECEBFF] shadow-sm flex items-center justify-center text-[8px]">👤</div>
                  ))}
                </div>
                <span className="text-[10px] font-black text-[#56756D]/50">{currentPeople}/{scene.total}</span>
              </div>
              <div className="w-full h-1.5 bg-white/70 rounded-full overflow-hidden border border-white/60">
                <div 
                  className="h-full bg-[linear-gradient(90deg,rgba(150,225,206,0.98)_0%,rgba(176,204,248,0.96)_58%,rgba(178,176,245,0.98)_100%)] transition-all duration-700 ease-in-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={(e) => { 
              e.stopPropagation();
              if (isHost) {
                setShowChatId(scene.id);
                return;
              }
              if (isJoined) {
                setExitConfirmId(scene.id);
              } else {
                handleJoin(scene.id);
              }
            }}
            className={`px-6 py-3 rounded-[20px] font-black text-sm transition-all duration-300 ${
              isInScene 
                ? 'bg-white/60 text-[#56756D]/55 border border-white/70 shadow-none' 
                : 'border border-white/70 bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] text-[#2F3E46] shadow-[0_12px_22px_-14px_rgba(64,100,120,0.48)] active:translate-y-0.5 active:shadow-[0_8px_16px_-14px_rgba(64,100,120,0.45)]'
            }`}
          >
            {isHost ? '我发起的' : isJoined ? '已在局中' : '一键加入'}
          </button>
        </div>
      </div>
    );
  };

  const previewSceneForModal = showPreviewId == null ? undefined : scenesWithFallback.find(s => s.id === showPreviewId);
  const previewModalIsHost = !!(guestId && previewSceneForModal?.hostGuestId && previewSceneForModal.hostGuestId === guestId);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#FAFAFA] font-['Inter'] md:min-h-screen md:flex-row md:items-center md:justify-center md:bg-[#C8C5BE] md:p-4">
      <div
        className="relative flex w-full flex-col overflow-hidden border-0 bg-transparent shadow-none max-md:min-h-[100dvh] max-md:flex-1 max-md:rounded-none max-md:border-0 md:h-[852px] md:min-h-0 md:w-[393px] md:flex-none md:rounded-[55px] md:border-[2px] md:border-white/10 md:shadow-[0_0_0_12px_#1a1a1a,0_22px_70px_rgba(0,0,0,0.3)]"
        style={{ backgroundColor: COLORS.bg }}
      >
        {/* -- 电脑演示用：伪刘海 + 状态栏（真手机全屏时隐藏） -- */}
        <div className="pointer-events-none absolute top-3 left-1/2 z-[100] hidden h-[35px] w-[120px] -translate-x-1/2 rounded-[20px] bg-black md:block" />
        <div className="pointer-events-none z-50 hidden h-14 w-full items-end justify-between px-10 pb-2 md:flex">
          <span className={`text-[15px] font-black ${appState !== 'main' ? 'text-slate-600' : 'text-slate-900'}`}>9:41</span>
          <div className={`flex gap-1.5 items-center pb-0.5 opacity-20 ${appState !== 'main' ? 'grayscale opacity-40' : ''}`}>
            <div className="w-[18px] h-[10px] border-2 rounded-[3px] border-current"></div>
          </div>
        </div>

        {/* --- Application State Routing --- */}
        <AnimatePresence mode="wait">
          {appState === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-40 bg-white"
            >
              <Onboarding onComplete={() => setAppState('login')} />
            </motion.div>
          )}
          
          {appState === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-40 bg-white"
            >
              <Login onLogin={() => setAppState('setup')} />
            </motion.div>
          )}

          {appState === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-40 bg-white"
            >
              <SetupFlow
                onExit={() => setAppState('login')}
                onComplete={(profile, location) => {
                  setUserProfile(profile);
                  if (location) setUserLocation(location);
                  persistUserProfileToSupabase(profile);
                  setAppState('main');
                  track('onboarding_complete', { company: profile.company, role: profile.role });
                }}
              />
            </motion.div>
          )}

          {appState === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 flex flex-col ${HOME_SURFACE.background}`}
            >
              {/* 全局断网 Banner */}
              {!isOnline && (
                <div className="relative z-[9000] flex items-center justify-center gap-2 bg-[#EF4444] px-4 py-2 text-[12px] font-bold text-white">
                  <span>📵</span>
                  <span>网络已断开，请检查网络连接后重试</span>
                </div>
              )}
              {/* Top Bar Navigation for Tab 1 */}
              {activeTab === 'home' && (
                <div className="relative z-40 flex items-center justify-between border-b border-white/45 bg-white/45 px-6 pb-4 pt-16 shadow-[0_12px_26px_-24px_rgba(64,100,120,0.35)] backdrop-blur-2xl">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-white/60 text-[16px] font-black tracking-tighter text-white shadow-[0_8px_24px_rgba(110,206,184,0.4),0_2px_8px_rgba(0,0,0,0.08)]"
                      style={{ background: 'linear-gradient(140deg, rgb(110, 206, 184) 3.6706%, rgb(155, 136, 216) 54.633%, rgb(240, 196, 96) 96.329%)' }}
                    >
                      U
                    </div>
                    <span
                      className="text-[21px] font-extrabold leading-none tracking-[-0.04em] bg-clip-text text-transparent"
                      style={{ fontFamily: 'Sora, Inter, sans-serif', backgroundImage: LOGIN_BRAND_GRADIENT }}
                    >
                      Unipass
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setMessageFilter('通知');
                        setActiveTab('message');
                      }}
                      className="rounded-full border border-white/70 bg-white/62 p-2 text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)] backdrop-blur-md"
                    >
                      <Bell size={18} className="opacity-70" />
                    </button>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-[linear-gradient(135deg,rgba(150,225,206,0.32),rgba(178,176,245,0.22))] font-black text-[#56756D] shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)]"
                    >
                       {userProfile?.nickname?.charAt(0) || 'U'}
                    </button>
                  </div>
                </div>
              )}

              {/* --- Main Tab Contents --- */}
              {activeTab === 'home' ? (
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className={`relative flex-1 overflow-y-auto no-scrollbar pb-[220px] ${HOME_SURFACE.background}`}
                >
                  <div className={`sticky top-0 z-30 relative transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${HOME_HERO_LAYOUT.stickyPadding}`}>
                    <div 
                      className={`w-full relative z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        scrolled 
                          ? HOME_HERO_LAYOUT.collapsedContainer
                          : HOME_HERO_LAYOUT.expandedContainer
                      }`} 
                      style={scrolled ? {} : { background: 'transparent' }}
                    >
                      <div className={`absolute -top-10 right-0 h-40 w-40 rounded-full bg-white/40 blur-3xl transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-0'}`}></div>
                      
                      <div className={`relative z-10 flex transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? 'items-center justify-between w-full' : 'flex-col'}`}>
                        {scrolled ? (
                          <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-right-2 duration-500 delay-150">
                            <span className={HOME_HERO_LAYOUT.collapsedText}>
                              附近有 {visibleScenes.length} 个局正在发生
                            </span>
                            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                              <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#F2D56A]/70 animate-ping [animation-delay:220ms]" />
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ECCC55] animate-in zoom-in-75 duration-500 delay-200" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-full animate-in fade-in duration-700">
                            <div className={HOME_HERO_LAYOUT.card}>
                              <p className={HOME_HERO_LAYOUT.text}>
                                {userProfile?.company ? <>探测到你正在 <span className="text-[#FFE68A]">{userProfile.company}</span>，为你推荐以下场景...</> : '正在为你雷达扫描附近的局...'}
                              </p>
                              <div className="pointer-events-none absolute right-[-5px] bottom-[-20px] z-10 h-[108px] w-[108px] rounded-full bg-[radial-gradient(circle,rgba(255,255,236,0.9)_0%,rgba(255,248,220,0.34)_40%,rgba(255,244,214,0)_70%)] blur-[0.5px]" />
                              <div className="pointer-events-none absolute right-[-12px] bottom-[-25px] z-[9] h-[138px] w-[138px] rounded-full bg-[radial-gradient(circle,rgba(255,252,231,0.5)_0%,rgba(255,249,229,0.18)_52%,rgba(255,248,226,0)_78%)]" />

                              <span className="pointer-events-none absolute right-[128px] top-[12px] z-20 h-1.5 w-1.5 rounded-full bg-[#fffef0] animate-pulse" />
                              <span className="pointer-events-none absolute right-[112px] top-[42px] z-20 h-1 w-1 rounded-full bg-[#fff7d1] animate-pulse [animation-delay:280ms]" />
                              <span className="pointer-events-none absolute right-[92px] top-[20px] z-20 h-1 w-1 rounded-full bg-white/75 animate-pulse [animation-delay:520ms]" />
                              <span className="pointer-events-none absolute right-[152px] bottom-[44px] z-20 h-1.5 w-1.5 rounded-full bg-[#fff6cd] animate-pulse [animation-delay:740ms]" />
                              <span className="pointer-events-none absolute right-[122px] bottom-[20px] z-20 h-1 w-1 rounded-full bg-[#fffdf2] animate-pulse [animation-delay:930ms]" />
                              <span className="pointer-events-none absolute right-[142px] top-[26px] z-20 text-[12px] leading-none text-[#fff5c9] animate-pulse [animation-delay:460ms]">✦</span>
                              <span className="pointer-events-none absolute right-[108px] bottom-[54px] z-20 text-[10px] leading-none text-[#ffefb0] animate-pulse [animation-delay:820ms]">✦</span>

                              <img
                                src="/首页IP.png"
                                alt="首页IP"
                                className={HOME_HERO_LAYOUT.ipImage}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sticky top-[52px] z-20 border-b border-white/35 bg-white/28 backdrop-blur-2xl">
                    <div className="flex items-center gap-3 px-5 py-3 transition-all">
                      <button 
                        onClick={() => setShowAdvancedFilter(true)}
                        className={`shrink-0 w-11 h-11 rounded-[18px] ${HOME_SURFACE.glassCard} flex items-center justify-center active:scale-95 transition-transform`}
                      >
                        <SlidersHorizontal size={18} className="text-[#56756D]" />
                      </button>
                      
                      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                        {(['全部', '🔥 刚刚发起', '🍱 干饭搭子', '☕ 楼下摸鱼', '🚶 散散班味', '🏢 同公司'] as QuickSceneFilter[]).map(tag => (
                           <button
                              key={tag}
                              onClick={() => setActiveFilter(tag)}
                              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-[12px] font-black transition-all duration-300 border ${
                                activeFilter === tag 
                                  ? HOME_SURFACE.chipActive 
                                  : HOME_SURFACE.chipInactive
                              }`}
                           >
                              {tag}
                           </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-6 pb-3 pt-1">
                      <h2 className="font-black text-lg tracking-tight text-[#2F3E46]">附近的局</h2>
                      <div className="flex items-center gap-1 text-[10px] font-black text-[#56756D]/35 uppercase tracking-widest">
                        Scroll for more <ChevronDown size={12} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col px-5 pt-3">
                    
                    {/* ✨ 这里应用了基于用户档案的动态过滤 */}
                    {scenesLoading ? (
                      [1, 2, 3].map(i => (
                        <div key={i} className={`w-full rounded-[28px] ${HOME_SURFACE.glassCard} p-5 mb-4 animate-pulse`}>
                          <div className="flex gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/70 rounded-[16px]" />
                            <div className="flex flex-col gap-2 flex-1">
                              <div className="h-4 bg-white/70 rounded w-2/3" />
                              <div className="h-3 bg-white/60 rounded w-1/3" />
                            </div>
                          </div>
                          <div className="h-2 bg-white/60 rounded w-full mt-4" />
                        </div>
                      ))
                    ) : visibleScenes.length > 0 ? (
                      visibleScenes.map(scene => (
                        <ScenePass key={scene.id} scene={scene} />
                      ))
                    ) : (
                      <div className={`mx-1 my-6 flex flex-col items-center justify-center rounded-[28px] ${HOME_SURFACE.glassCard} px-6 py-12 text-[#56756D]/55`}>
                        <Radar size={40} className="mb-4 opacity-35" />
                        <p className="text-[13px] font-bold">目前还没有符合你权限的局哦</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'community' ? (
                <>
                  {feedsError && (
                    <div className="mx-5 mt-4 rounded-[16px] bg-amber-50 border border-amber-100 px-4 py-3 flex items-center gap-2 text-[12px] font-bold text-amber-700">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{feedsError}</span>
                      <button onClick={() => loadFeeds()} className="ml-auto text-[11px] underline">重试</button>
                    </div>
                  )}
                <CommunityFeed 
                  onFeedClick={(id) => setShowFeedDetailId(id)} 
                  onUserClick={handleUserClick}
                  onLike={handleFeedLike}
                  onSummonAi={handleSummonAiForFeed}
                  feeds={feedsMergedForUi}
                  isLoading={feedsLoading}
                  userProfile={userProfile}
                  activeTag={communityTag}
                  onTagChange={setCommunityTag}
                  companyOnly={communityCompanyOnly}
                  onToggleCompanyOnly={() => setCommunityCompanyOnly((v) => !v)}
                  cityOnly={communityCityOnly}
                  onToggleCityOnly={() => setCommunityCityOnly((v) => !v)}
                  preferredCity={preferredFeedCity}
                  aiTipsCache={feedAiTipsCache}
                />
                </>
              ) : activeTab === 'ai' ? (
                <AIOxygenStation
                  onSaveAchievementCapsule={(c) =>
                    setAchievements((prev) => [{ id: `ach-${Date.now()}`, tag: c.tag, desc: c.desc }, ...prev])
                  }
                />
              ) : activeTab === 'message' ? (
                <MessageCenter 
                  dazis={dazis}
                  onOpenGroupChat={(sceneId) => setShowChatId(sceneId)}
                  onOpenPrivateChat={(dazi) => setShowPrivateChat(dazi)}
                  onOpenAIChat={() => setShowAIChat(true)}
                  onUserClick={handleUserClick}
                  filter={messageFilter}
                  onFilterChange={setMessageFilter}
                />
              ) : activeTab === 'profile' ? (
                <UserProfile
                  dazis={dazis}
                  achievements={achievements}
                  onSetRole={handleSetRole}
                  onOpenResumeLab={() => setShowResumeLab(true)}
                  onOpenPrivacy={() => setShowPrivacyShield(true)}
                  onEditProfile={() => setShowEditProfileModal(true)}
                  userProfile={userProfile}
                  onGoAssistant={() => setActiveTab('ai')}
                  onGoMessage={() => setActiveTab('message')}
                  onRemoveDazi={handleRemoveDazi}
                  onOpenStudentVerify={() => setShowStudentVerify(true)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-300 font-black uppercase tracking-widest">
                  {activeTab} Coming Soon
                </div>
              )}

              {/* 悬浮按钮 (FABs based on Active Tab) */}
              {activeTab === 'home' && (
                <div className="absolute bottom-[128px] left-0 right-0 flex justify-center z-40 pointer-events-none">
                  <button 
                    onClick={() => setShowQuickBuild(true)}
                    className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/60 bg-[linear-gradient(125deg,rgba(47,62,70,0.94)_0%,rgba(74,91,103,0.9)_48%,rgba(112,122,168,0.88)_100%)] px-6 py-4 text-white shadow-[0_18px_38px_-18px_rgba(47,62,70,0.62)] backdrop-blur-xl transform transition-transform active:scale-95"
                  >
                    <Plus size={20} className="text-[#FFE68A]" />
                    <span className="text-sm font-black tracking-tight">AI 帮我攒个局</span>
                  </button>
                </div>
              )}

              {activeTab === 'community' && (
                <div className="absolute bottom-[128px] right-6 z-40 pointer-events-none animate-in zoom-in-95 duration-300">
                  <button 
                    onClick={() => setShowPublishModal(true)}
                    className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-[linear-gradient(125deg,rgba(255,231,171,0.95)_0%,rgba(150,225,206,0.9)_100%)] shadow-[0_16px_32px_-18px_rgba(64,100,120,0.62)] backdrop-blur-xl active:scale-90 transition-transform"
                  >
                    <Plus size={24} className="text-[#2F3E46]" />
                  </button>
                </div>
              )}

              {/* Bottom Tab Bar */}
              <div className="absolute bottom-0 z-40 flex w-full items-center justify-around border-t border-white/55 bg-white/72 px-4 pb-8 pt-3 shadow-[0_-18px_38px_-26px_rgba(64,100,120,0.45)] backdrop-blur-3xl">
                {[
                  { id: 'home', icon: <Home size={22}/>, label: '首页' },
                  { id: 'community', icon: <Users size={22}/>, label: '圈子' },
                  { id: 'ai', icon: <Sparkles size={22}/>, label: '助手' },
                  { id: 'message', icon: <MessageSquare size={22}/>, label: '消息' },
                  { id: 'profile', icon: <User size={22}/>, label: '我的' },
                ].map(tab => (
                  <button 
                    key={tab.id} 
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'message') setMessageFilter('全部');
                    }} 
                    className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === tab.id ? 'opacity-100 scale-105 text-[#56756D]' : 'opacity-35 text-[#56756D]'}`}
                  >
                    <div className={`${activeTab === tab.id ? 'rounded-[16px] border border-white/70 bg-[linear-gradient(135deg,rgba(150,225,206,0.28),rgba(178,176,245,0.2))] p-2 shadow-[0_8px_18px_-16px_rgba(64,100,120,0.45)]' : ''}`}>{tab.icon}</div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === tab.id ? 'block' : 'hidden'}`}>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* --- Global Modals & Layers --- */}
              {showAnonymousProfile && (
                <AnonymousProfileModal user={showAnonymousProfile} onClose={() => setShowAnonymousProfile(null)} />
              )}
              {showAIChat && (
                <AIChatView
                  userProfile={userProfile}
                  onClose={() => setShowAIChat(false)}
                  messages={aiChatMessages}
                  setMessages={setAiChatMessages}
                />
              )}
              {showResumeLab && (
                <ResumeLabModal onClose={() => setShowResumeLab(false)} />
              )}
              {showStudentVerify && (
                <StudentVerifyModal
                  onClose={() => setShowStudentVerify(false)}
                  onVerified={(email) => {
                    const next = { ...(userProfile as NonNullable<typeof userProfile>), isStudentVerified: true, studentEmail: email };
                    setUserProfile(next);
                    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(next));
                    track('student_verified', { email_domain: email.split('@')[1] });
                    setShowStudentVerify(false);
                  }}
                />
              )}
              {showPrivacyShield && (
                <PrivacyShieldDrawer
                  onClose={() => setShowPrivacyShield(false)}
                  privacyStealth={userProfile?.privacyStealth ?? true}
                  privacyMosaic={userProfile?.privacyMosaic ?? true}
                  onToggleStealth={(v) => {
                    const next = { ...(userProfile as NonNullable<typeof userProfile>), privacyStealth: v };
                    setUserProfile(next);
                    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(next));
                  }}
                  onToggleMosaic={(v) => {
                    const next = { ...(userProfile as NonNullable<typeof userProfile>), privacyMosaic: v };
                    setUserProfile(next);
                    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(next));
                  }}
                  onRefreshNickname={(nickname) => {
                    const next = { ...(userProfile as NonNullable<typeof userProfile>), nickname };
                    setUserProfile(next);
                    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(next));
                  }}
                />
              )}
              {showEditProfileModal && (
                <EditProfileModal
                  profile={userProfile}
                  onClose={() => setShowEditProfileModal(false)}
                  onSave={handleUpdateProfile}
                />
              )}
              {showPublishModal && (
                <PublishModal
                  onClose={() => setShowPublishModal(false)}
                  onPublished={handleFeedPublished}
                  userProfile={userProfile}
                />
              )}
              {showFeedDetailId && (
                <FeedDetailModal
                  feed={feedsMergedForUi.find(f => f.id === showFeedDetailId)}
                  comments={
                    showFeedDetailId
                      ? mergeFeedCommentsForDetail(
                          feedsMergedForUi.find((f) => f.id === showFeedDetailId),
                          feedCommentsMap[showFeedDetailId]
                        )
                      : []
                  }
                  onLike={handleFeedLike}
                  onAddComment={handleFeedComment}
                  onSummonAi={handleSummonAiForFeed}
                  onClose={() => setShowFeedDetailId(null)}
                  aiTipsCache={feedAiTipsCache}
                />
              )}
              {showPreviewId && previewSceneForModal && (
                <PreviewModal 
                  scene={previewSceneForModal} 
                  isHost={previewModalIsHost}
                  isJoined={joinedIds.includes(showPreviewId) || previewModalIsHost}
                  onJoin={handleJoin}
                  onClose={() => setShowPreviewId(null)} 
                />
              )}
              {showQuickBuild && (
                <QuickBuildModal
                  onClose={() => setShowQuickBuild(false)}
                  onPublished={loadScenes}
                  guestId={guestId}
                  userLocation={userLocation}
                />
              )}
              {showAdvancedFilter && (
                <AdvancedFilterModal
                  onClose={() => setShowAdvancedFilter(false)}
                  onApply={setAdvancedSceneFilters}
                  getPreviewCount={(next) => applyAdvancedSceneFilters(next).length}
                  isWorkMode={isWorkMode}
                  currentFilters={advancedSceneFilters}
                />
              )}
              {exitConfirmId && (
                <ExitConfirmModal onConfirm={() => handleExit(exitConfirmId)} onCancel={() => setExitConfirmId(null)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {appState === 'main' && showChatId !== null && (
          <DetailView
            key={showChatId}
            id={showChatId}
            scene={scenesWithFallback.find(s => s.id === showChatId)}
            onClose={() => setShowChatId(null)}
            icebreakDone={sceneIcebreakDoneIds.includes(showChatId)}
            onFirstMessageInScene={markSceneFirstMessage}
          />
        )}

        {appState === 'main' && showPrivateChat && (
          <PrivateChatView dazi={showPrivateChat} onClose={() => setShowPrivateChat(null)} />
        )}

        <div className="pointer-events-none absolute bottom-1.5 z-[100] hidden w-full justify-center md:flex">
          <div className="h-[5px] w-[130px] rounded-full bg-black/5" />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background: #E2E8E2; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes breath {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .animate-breath {
          animation: breath 4s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}} />
    </div>
  );
};

export default App;