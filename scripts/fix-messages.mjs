import { readFileSync, writeFileSync } from 'fs';

const file = 'd:/Users/86133/Desktop/unipass-work/app/page.tsx';
const content = readFileSync(file, 'utf8');
const lines = content.split('\n');

// Lines are 1-indexed; array is 0-indexed
// Replace lines 1995-2015 (inclusive), i.e., array indices 1994-2014
const startIdx = 1994;
const endIdx = 2014; // inclusive

const newLines = [
  '',
  "  // 新用户只显示 AI 欢迎语，有搭子后才显示私聊入口",
  "  const AI_WELCOME = { id: 'ai-welcome', type: 'ai', name: 'UniAI 助手', avatar: 'ai', preview: '👋 你好！我是 UniAI，有任何职场问题都可以来找我～', time: '刚刚', unread: 1, pinned: true };",
  '',
  "  const privateMsgs = dazis.map(d => ({",
  "    id: `private-${d.id}`, type: 'private', name: d.name, avatar: [d.avatar],",
  "    preview: `一起干饭 ${d.count} 次 · 点击开始聊天`, time: '', unread: 0, pinned: false",
  "  }));",
  '',
  "  const allMessages = [AI_WELCOME, ...privateMsgs];",
  "  const groupMsgs: {id: string; type: string; name: string; avatar: string[]; preview: string; time: string; unread: number; pinned: boolean}[] = [];",
  '',
  "  const filteredMessages = allMessages.filter(msg => {",
  "    if (filter === '全部') return true;",
  "    if (filter === '搭子局') return msg.type === 'group' || msg.type === 'private';",
  "    if (filter === 'AI 通知') return msg.type === 'ai';",
  "    return true;",
  "  });",
  '',
  "  const pinnedMsgs = filteredMessages.filter(m => m.pinned);",
  "  const normalMsgs = filteredMessages.filter(m => !m.pinned);",
];

lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done. Replaced MOCK_MESSAGES block.');
