import { readFileSync, writeFileSync } from 'fs';

const file = 'd:/Users/86133/Desktop/unipass-work/app/page.tsx';
let content = readFileSync(file, 'utf8');

// 1. Remove hardcoded dazis
content = content.replace(
  `  // 核心状态：全局搭子列表
  const [dazis, setDazis] = useState([
    { id: 1, avatar: '🐶', name: '产品部的修狗', count: 5, tag: '跨部门吐槽搭子' },
    { id: 2, avatar: '🐱', name: '不爱吃香菜', count: 12, tag: '午饭固定队友' },
    { id: 3, avatar: '🦊', name: '摸鱼的打工人', count: 3, tag: '周末探店好友' },
    { id: 4, avatar: '🐕', name: '摸鱼的柴犬', count: 8, tag: '摸鱼队友' } 
  ]);`,
  `  // 搭子列表：新用户初始为空，加入局后逐步积累
  const [dazis, setDazis] = useState<{id: number; avatar: string; name: string; count: number; tag: string}[]>([]);
  // 成就胶囊：新用户初始为空，发帖后 AI 自动提取
  const [achievements, setAchievements] = useState<{id: string; tag: string; desc: string}[]>([]);`
);

// 2. Update userProfile type to include avatar
content = content.replace(
  `  const [userProfile, setUserProfile] = useState<{ nickname: string; company: string; gender: string; role: string } | null>(null);`,
  `  const [userProfile, setUserProfile] = useState<{ nickname: string; company: string; gender: string; role: string; avatar: string } | null>(null);`
);

// 3. Remove fallback '腾讯滨海大厦' from location text
content = content.replace(
  `探测到你正在 <span className="underline decoration-amber-200/50 underline-offset-4 decoration-2">{userProfile?.company || '腾讯滨海大厦'}</span>，为你推荐以下场景...`,
  `{userProfile?.company ? <>探测到你正在 <span className="underline decoration-amber-200/50 underline-offset-4 decoration-2">{userProfile.company}</span>，为你推荐以下场景...</> : '正在为你雷达扫描附近的局...'}`
);

writeFileSync(file, content, 'utf8');
console.log('Done. Fixed App component.');
