import { readFileSync, writeFileSync } from 'fs';

const file = 'd:/Users/86133/Desktop/unipass-work/app/page.tsx';
const content = readFileSync(file, 'utf8');

// 1. Replace UserProfile signature to accept achievements prop
let result = content.replace(
  `const UserProfile = ({ dazis, onSetRole, onOpenResumeLab, onOpenPrivacy, userProfile }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  const MOCK_ACHIEVEMENTS = [
    { id: 1, tag: '✨ 执行力 +1', desc: '今天成功推进了跨部门沟通，处理得超棒！这段经历已转化为职场资产。' },
    { id: 2, tag: '🛡️ 抗压王者', desc: '独立解决线上紧急Bug，技术与心态双重升级。' },
    { id: 3, tag: '📊 数据达人', desc: '整理杂乱的数据报表，梳理出清晰的业务脉络。' }
  ];`,
  `const UserProfile = ({ dazis, achievements = [], onSetRole, onOpenResumeLab, onOpenPrivacy, userProfile }) => {
  const [openMenuId, setOpenMenuId] = useState(null);`
);

// 2. Replace hardcoded stats
result = result.replace(
  `          <div className="flex flex-col gap-2.5">
            {[
              { icon: '⏳', text: '已在职场幸存 45 天' },
              { icon: '🏅', text: '捕获成就 12 枚' },
              { icon: '👯‍♂️', text: '拥有搭子 8 位' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-[14px] border border-white shadow-sm">
                <span className="text-[14px] leading-none">{stat.icon}</span>
                <span className="text-[11px] font-black text-slate-700 tracking-wide">{stat.text}</span>
              </div>
            ))}
          </div>`,
  `          <div className="flex flex-col gap-2.5">
            {[
              { icon: '🏅', text: \`捕获成就 \${achievements.length} 枚\` },
              { icon: '👯‍♂️', text: \`拥有搭子 \${dazis.length} 位\` }
            ].filter(s => dazis.length > 0 || achievements.length > 0).map((stat, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-[14px] border border-white shadow-sm">
                <span className="text-[14px] leading-none">{stat.icon}</span>
                <span className="text-[11px] font-black text-slate-700 tracking-wide">{stat.text}</span>
              </div>
            ))}
            {dazis.length === 0 && achievements.length === 0 && (
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-[14px] border border-white shadow-sm">
                <span className="text-[11px] font-medium text-slate-400">加入局后开始积累数据 ✨</span>
              </div>
            )}
          </div>`
);

// 3. Replace hardcoded company fallback
result = result.replace(
  `<MapPin size={12} className="text-[#87A382]" /> 当前实习：{userProfile?.company || '腾讯 · 滨海大厦'}`,
  `<MapPin size={12} className="text-[#87A382]" /> {userProfile?.company ? \`当前实习：\${userProfile.company}\` : '尚未填写公司信息'}`
);

// 4. Replace avatar display to show emoji avatar
result = result.replace(
  `            <div className="w-20 h-20 rounded-full border-[4px] border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.4)] overflow-hidden bg-white shrink-0 flex items-center justify-center text-3xl font-black text-[#87A382]">
              {userProfile?.nickname?.charAt(0) || 'U'}
            </div>`,
  `            <div className="w-20 h-20 rounded-full border-[4px] border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.4)] overflow-hidden bg-white shrink-0 flex items-center justify-center text-3xl">
              {userProfile?.avatar || userProfile?.nickname?.charAt(0) || '🐧'}
            </div>`
);

// 5. Replace MOCK_ACHIEVEMENTS.map with achievements state
result = result.replace(
  `        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
          {MOCK_ACHIEVEMENTS.map(ach => (
            <div key={ach.id} className="w-[260px] bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col shrink-0 active:scale-[0.98] transition-transform cursor-pointer">
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F9D8B1]/20 text-[#D4AF37] rounded-full text-[10px] font-black mb-3 w-fit border border-[#F9D8B1]/50 tracking-widest whitespace-nowrap shrink-0">
                {ach.tag}
              </span>
              <p className="text-[13px] font-bold text-slate-600 leading-relaxed line-clamp-3">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>`,
  `        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
          {achievements.length === 0 ? (
            <div className="w-[260px] bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-dashed border-slate-200 flex flex-col items-center justify-center shrink-0 text-center min-h-[120px]">
              <span className="text-3xl mb-3">🧊</span>
              <p className="text-[12px] font-bold text-slate-400 leading-relaxed">发布帖子后，AI 会自动提取你的职场成就</p>
            </div>
          ) : achievements.map(ach => (
            <div key={ach.id} className="w-[260px] bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col shrink-0 active:scale-[0.98] transition-transform cursor-pointer">
              <span className="inline-flex items-center px-3 py-1.5 bg-[#F9D8B1]/20 text-[#D4AF37] rounded-full text-[10px] font-black mb-3 w-fit border border-[#F9D8B1]/50 tracking-widest whitespace-nowrap shrink-0">
                {ach.tag}
              </span>
              <p className="text-[13px] font-bold text-slate-600 leading-relaxed line-clamp-3">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>`
);

writeFileSync(file, result, 'utf8');
console.log('Done. Fixed UserProfile component.');
