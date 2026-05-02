import { readFileSync, writeFileSync } from 'fs';

const file = 'd:/Users/86133/Desktop/unipass-work/app/page.tsx';
let content = readFileSync(file, 'utf8');

// Fix 1: Add proper type for groupMsgs to include optional sceneId/tag/tagColor
content = content.replace(
  `  const groupMsgs: {id: string; type: string; name: string; avatar: string[]; preview: string; time: string; unread: number; pinned: boolean}[] = [];`,
  `  const groupMsgs: {id: string|number; type: string; name: string; avatar: string|string[]; preview: string; time: string; unread: number; pinned: boolean; sceneId?: number; tag?: string; tagColor?: string}[] = [];`
);

// Fix 2: Add type annotation to UserProfile achievements parameter
content = content.replace(
  `const UserProfile = ({ dazis, achievements = [], onSetRole, onOpenResumeLab, onOpenPrivacy, userProfile }) => {`,
  `const UserProfile = ({ dazis, achievements = [] as {id: string; tag: string; desc: string}[], onSetRole, onOpenResumeLab, onOpenPrivacy, userProfile }) => {`
);

// Fix 3: Fix achievements type in App component (ensure it's not inferred as never[])
content = content.replace(
  `  // 成就胶囊：新用户初始为空，发帖后 AI 自动提取\n  const [achievements, setAchievements] = useState<{id: string; tag: string; desc: string}[]>([]);`,
  `  // 成就胶囊：新用户初始为空，发帖后 AI 自动提取\n  const [achievements, setAchievements] = useState<Array<{id: string; tag: string; desc: string}>>([]);`
);

writeFileSync(file, content, 'utf8');
console.log('Done. Fixed TypeScript type errors.');
