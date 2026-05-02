import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- 数据库表的 TypeScript 类型 ----

export type Scene = {
  id: number;
  emoji: string;
  type: string;
  title: string;
  distance: string;
  lat?: number | null;
  lng?: number | null;
  meet_time: string;
  current_count: number;
  total_count: number;
  exclusive: string | null;
  description: string;
  /** 创建该局时的游客/设备 id，用于前端识别「我发起的局」 */
  host_guest_id?: string | null;
  created_at: string;
};

export type Feed = {
  id: number;
  avatar: string;
  author: string;
  location: string;
  content: string;
  has_image: boolean;
  tags: string[];
  likes: number;
  comments: number;
  created_at: string;
};

export type User = {
  id: number;
  nickname: string;
  company: string;
  gender: string;
  role: string;
  created_at: string;
};

/** 游客/设备在云端同步的个人数据行（与 supabase/sql/app_guest_data.sql 一致） */
export type AppGuestDataRow = {
  guest_id: string;
  user_profile: {
    nickname: string;
    company: string;
    gender: string;
    role: string;
    avatar: string;
  } | null;
  joined_ids: number[];
  dazis: DaziItem[];
  achievements: { id: string; tag: string; desc: string }[];
  ai_chat: { role: 'user' | 'assistant'; content: string }[];
  user_location?: { lat: number; lng: number; accuracy?: number | null; updated_at: string } | null;
  app_state: string;
  active_tab: string;
  updated_at: string;
};

/** 搭子 / 同局关系卡（本地 + 同步 app_guest_data.dazis） */
export type DaziItem = {
  id: number;
  avatar: string;
  name: string;
  /** 同局/共同互动次数 */
  count: number;
  tag: string;
  /** 候选 = 已生成卡待选关系类型；dazi = 已手动选用标签的正式搭子 */
  status?: 'candidate' | 'dazi';
  /** 稳定键：一卡一局 */
  peerKey?: string;
  sceneId?: number;
  sceneType?: string;
  sceneTitle?: string;
  aiTags?: string[];
  timeline?: { at: string; text: string }[];
};
