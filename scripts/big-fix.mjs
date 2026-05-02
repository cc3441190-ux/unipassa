import { readFileSync, writeFileSync } from 'fs';

const file = 'd:/Users/86133/Desktop/unipass-work/app/page.tsx';
let c = readFileSync(file, 'utf8');

// ===========================================================
// B: Fix location permission buttons (equal width, safe area)
// ===========================================================
c = c.replace(
  `            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="w-full flex flex-col gap-3">
              <button onClick={requestLocation}
                className="w-full py-[18px] rounded-[24px] font-black text-[16px] text-white shadow-[0_8px_25px_rgba(135,163,130,0.4)] active:scale-95 transition-transform"
                style={{ backgroundColor: COLORS.sage }}>
                允许获取位置
              </button>
              <button onClick={() => { setLocationStatus('denied'); setStep('location'); }}
                className="w-full py-[14px] rounded-[24px] font-black text-[14px] text-slate-400 bg-slate-100 active:scale-95 transition-transform">
                不允许，手动填写
              </button>
            </motion.div>`,
  `            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="w-full flex flex-col gap-3 pb-safe">
              <button onClick={requestLocation}
                className="w-full py-[18px] rounded-[24px] font-black text-[16px] text-white shadow-[0_8px_25px_rgba(135,163,130,0.4)] active:scale-95 transition-transform"
                style={{ backgroundColor: COLORS.sage }}>
                允许获取位置
              </button>
              <button onClick={() => { setLocationStatus('denied'); setStep('location'); }}
                className="w-full py-[18px] rounded-[24px] font-black text-[16px] text-slate-500 bg-slate-100 active:scale-95 transition-transform">
                不允许，手动填写
              </button>
            </motion.div>`
);

// Fix location step: "下一步" button not cut off (add padding-bottom to the flex column)
c = c.replace(
  `            className="absolute inset-0 bg-gradient-to-b from-[#87A382]/15 to-white flex flex-col items-center pt-24 px-8">`,
  `            className="absolute inset-0 bg-gradient-to-b from-[#87A382]/15 to-white flex flex-col items-center pt-24 px-8 pb-10">`
);

// ===========================================================
// F: Dynamic AI情报摘要 - pass userProfile to CommunityFeed
// ===========================================================
// First update CommunityFeed signature to accept userProfile
c = c.replace(
  `const CommunityFeed = ({ onFeedClick, onUserClick, feeds, isLoading }) => {`,
  `const CommunityFeed = ({ onFeedClick, onUserClick, feeds, isLoading, userProfile }) => {`
);

// Replace hardcoded AI情报摘要 text with dynamic version
c = c.replace(
  `        <p className="text-[14px] font-bold text-slate-700 leading-relaxed relative z-10">
          今日避雷：腾讯滨海 A 座 15 楼厕所正在排队，建议错峰 🚽；负一楼麻辣烫今日加量不加价 ✨
        </p>`,
  `        <p className="text-[14px] font-bold text-slate-700 leading-relaxed relative z-10">
          {userProfile?.company
            ? \`今日 \${userProfile.company} 情报：当前暂无新情报，发布第一条情报后将在此显示 AI 摘要 ✨\`
            : '当前暂无情报，成为第一个发布情报的人吧 ✨'}
        </p>`
);

// Update where CommunityFeed is rendered to pass userProfile
c = c.replace(
  `                <CommunityFeed 
                  onFeedClick={(id) => setShowFeedDetailId(id)}
                  onUserClick={(user) => setShowAnonymousProfile(user)}
                  feeds={feeds}
                  isLoading={feedsLoading}`,
  `                <CommunityFeed 
                  onFeedClick={(id) => setShowFeedDetailId(id)}
                  onUserClick={(user) => setShowAnonymousProfile(user)}
                  feeds={feeds}
                  isLoading={feedsLoading}
                  userProfile={userProfile}`
);

// ===========================================================
// I: 成就胶囊 - replace mock with real AI
// ===========================================================
c = c.replace(
  `  const handleGenerateCapsule = () => {
    if (!achievementInput.trim()) return;
    setIsGeneratingCapsule(true);
    setIsSaved(false); 
    setTimeout(() => {
      setAchievementOutput({
        tag: "✨ 沟通协调能力 +1",
        text: "今天成功推进了跨部门沟通，虽然过程曲折，但你处理得超棒！这段经历已经转化为你的职场资产啦。"
      });
      setShowCapsule(true);
      setIsGeneratingCapsule(false);
    }, 1500);
  };`,
  `  const handleGenerateCapsule = async () => {
    if (!achievementInput.trim()) return;
    setIsGeneratingCapsule(true);
    setIsSaved(false);
    try {
      const res = await fetch('/api/eq-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: \`从以下实习经历描述中，提炼一条核心职场成就。用第一行输出能力标签（格式：✨ 能力名称 +1），第二行输出一段鼓励性总结（30-50字）。只输出这两行，不要其他内容：\n\${achievementInput}\`,
          scenario: '工作汇报'
        }),
      });
      const data = await res.json();
      if (data.result) {
        const lines = data.result.trim().split('\n').filter(Boolean);
        setAchievementOutput({
          tag: lines[0]?.trim() || '✨ 职场成长 +1',
          text: lines.slice(1).join(' ').trim() || data.result.trim()
        });
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
  };`
);

// Add copy button for EQ output (currently only has Share2 icon - replace with proper copy)
c = c.replace(
  `                <button 
                  onClick={() => copyToClipboard(eqOutput)} 
                  className="p-1 text-slate-300 hover:text-slate-500 active:scale-110 transition-transform"
                >
                  <Share2 size={12}/>
                </button>`,
  `                <button 
                  onClick={() => { copyToClipboard(eqOutput); }}
                  className="flex items-center gap-1 px-3 py-1 bg-[#87A382]/10 text-[#87A382] rounded-full text-[10px] font-black active:scale-95 transition-transform border border-[#87A382]/20"
                >
                  复制
                </button>`
);

// Add copy button for achievement capsule output
c = c.replace(
  `                <button 
                  onClick={handleSaveCapsule}
                  disabled={isSaved}
                  className={\`w-full py-3.5 rounded-[16px] font-black text-[13px] transition-all duration-300 flex items-center justify-center gap-2 \${
                    isSaved 
                      ? 'bg-slate-50 text-slate-400 border border-slate-200' 
                      : 'bg-transparent text-amber-600 border-2 border-amber-200/60 hover:bg-amber-50/50 active:scale-95'
                  }\`}
                >
                  {isSaved ? (
                    <><CheckCircle2 size={16} /> 职场档案已更新</>
                  ) : (
                    '存入职场档案'
                  )}
                </button>`,
  `                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(achievementOutput.tag + '\\n' + achievementOutput.text)}
                    className="flex-1 py-3 rounded-[16px] font-black text-[13px] transition-all border border-slate-200 bg-slate-50 text-slate-500 active:scale-95 flex items-center justify-center gap-2"
                  >
                    复制
                  </button>
                  <button 
                    onClick={handleSaveCapsule}
                    disabled={isSaved}
                    className={\`flex-1 py-3 rounded-[16px] font-black text-[13px] transition-all duration-300 flex items-center justify-center gap-2 \${
                      isSaved 
                        ? 'bg-slate-50 text-slate-400 border border-slate-200' 
                        : 'bg-amber-50 text-amber-600 border-2 border-amber-200/60 active:scale-95'
                    }\`}
                  >
                    {isSaved ? <><CheckCircle2 size={16} /> 已保存</> : '存入档案'}
                  </button>
                </div>`
);

// Add copy button for AI beautification result in PublishModal
c = c.replace(
  `              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#87A382] tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles size={12} /> AI 优化并已脱敏
                </span>
                <button 
                  onClick={() => {
                    setText(polishedText);
                    setPolishedText(null);
                  }} 
                  className="text-[11px] font-black bg-[#87A382] text-white px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform"
                >
                  采用此版本
                </button>
              </div>
              <p className="text-[14px] font-medium text-slate-700 leading-relaxed">{polishedText}</p>`,
  `              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#87A382] tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles size={12} /> AI 优化并已脱敏
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(polishedText || '')}
                    className="text-[11px] font-black border border-[#87A382]/30 text-[#87A382] px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
                  >
                    复制
                  </button>
                  <button 
                    onClick={() => { setText(polishedText || ''); setPolishedText(null); }} 
                    className="text-[11px] font-black bg-[#87A382] text-white px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform"
                  >
                    采用
                  </button>
                </div>
              </div>
              <p className="text-[14px] font-medium text-slate-700 leading-relaxed">{polishedText}</p>`
);

writeFileSync(file, c, 'utf8');
console.log('Done: B, F, I, H (copy buttons) applied.');
