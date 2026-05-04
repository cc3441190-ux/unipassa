/**
 * 轻量埋点封装 — 支持 Umami（或 Plausible）
 *
 * 使用方式：
 *   import { track } from '@/lib/analytics';
 *   track('scene_joined', { scene_id: 42 });
 *
 * Umami 配置：在 .env.local 加入
 *   NEXT_PUBLIC_UMAMI_WEBSITE_ID=<your-website-id>
 *   NEXT_PUBLIC_UMAMI_URL=https://your-umami-instance/script.js  （可选，默认用 cloud）
 */

declare global {
  interface Window {
    umami?: { track: (name: string, props?: Record<string, unknown>) => void };
    plausible?: (name: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

export type TrackEventName =
  | 'onboarding_complete'    // 1. 引导页完成（设置完个人资料进入主页）
  | 'student_verified'       // 2. 学生认证完成
  | 'scene_joined'           // 3. 首次成功加入局
  | 'feed_published'         // 4. 首次发布情报
  | 'ai_tool_used'           // 5. 使用 AI 工具（EQ/成就胶囊/AI对话）
  | 'dazi_pm_send'           // 6. 搭子私聊发送消息
  | 'logout';                // 7. 退出登录（清除本机会话）

export function track(event: TrackEventName, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    if (window.umami?.track) {
      window.umami.track(event, props);
    } else if (window.plausible) {
      window.plausible(event, { props });
    }
    // 开发模式下在控制台打印，方便调试
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[analytics] ${event}`, props);
    }
  } catch { /* 埋点失败不影响主流程 */ }
}
