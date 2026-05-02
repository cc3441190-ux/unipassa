import { readFileSync, writeFileSync } from 'fs';

const file = 'd:/Users/86133/Desktop/unipass-work/app/page.tsx';
let c = readFileSync(file, 'utf8');

// ===========================================================
// B: Fix FAB button bottom position (avoid tab bar overlap)
// ===========================================================
c = c.replace(
  `                <div className="absolute bottom-[100px] left-0 right-0 flex justify-center z-40 pointer-events-none">
                  <button 
                    onClick={() => setShowQuickBuild(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-full shadow-2xl pointer-events-auto transform transition-transform active:scale-95"
                  >
                    <Plus size={20} className="text-amber-300" />
                    <span className="text-sm font-black tracking-tight">AI 帮我攒个局</span>
                  </button>
                </div>`,
  `                <div className="absolute bottom-[128px] left-0 right-0 flex justify-center z-40 pointer-events-none">
                  <button 
                    onClick={() => setShowQuickBuild(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-full shadow-2xl pointer-events-auto transform transition-transform active:scale-95"
                  >
                    <Plus size={20} className="text-amber-300" />
                    <span className="text-sm font-black tracking-tight">AI 帮我攒个局</span>
                  </button>
                </div>`
);

// Fix community "+" button (same issue)
c = c.replace(
  `                <div className="absolute bottom-[100px] right-6 z-40 pointer-events-none animate-in zoom-in-95 duration-300">
                  <button 
                    onClick={() => setShowPublishModal(true)}
                    className="w-14 h-14 bg-[#F9D8B1] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(249,216,177,0.6)] pointer-events-auto active:scale-90 transition-transform"
                  >
                    <Plus size={24} style={{ color: COLORS.ink }} />
                  </button>
                </div>`,
  `                <div className="absolute bottom-[128px] right-6 z-40 pointer-events-none animate-in zoom-in-95 duration-300">
                  <button 
                    onClick={() => setShowPublishModal(true)}
                    className="w-14 h-14 bg-[#F9D8B1] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(249,216,177,0.6)] pointer-events-auto active:scale-90 transition-transform"
                  >
                    <Plus size={24} style={{ color: COLORS.ink }} />
                  </button>
                </div>`
);

// ===========================================================
// D: Join → navigate to messages tab
// ===========================================================
c = c.replace(
  `  const handleJoin = async (id: number) => {
    if (joinedIds.includes(id)) return;
    // 乐观更新 UI
    setJoinedIds(prev => [...prev, id]);
    setScenes(prev =>
      prev.map(s => s.id === id ? { ...s, current: s.current + 1 } : s)
    );`,
  `  const handleJoin = async (id: number) => {
    if (joinedIds.includes(id)) return;
    setJoinedIds(prev => [...prev, id]);
    setScenes(prev =>
      prev.map(s => s.id === id ? { ...s, current: s.current + 1 } : s)
    );
    // 加入后跳转消息界面
    setActiveTab('message');`
);

// ===========================================================
// C: Company keyword search in SetupFlow
// ===========================================================
// Find the company input section and add suggestions list
const OLD_COMPANY_INPUT = `                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">你在哪个公司实习？</label>
                <input type="text" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })}
                  placeholder="例如：腾讯、字节跳动、美团..."
                  className="w-full bg-white border border-slate-200 focus:border-[#87A382] rounded-[20px] px-5 py-4 text-[16px] font-black text-[#2F3E46] placeholder:text-slate-300 focus:outline-none transition-colors shadow-sm mb-auto" />`;

const NEW_COMPANY_INPUT = `                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">你在哪个公司实习？</label>
                <div className="relative mb-auto">
                  <input type="text" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })}
                    placeholder="例如：腾讯、字节跳动、美团..."
                    className="w-full bg-white border border-slate-200 focus:border-[#87A382] rounded-[20px] px-5 py-4 text-[16px] font-black text-[#2F3E46] placeholder:text-slate-300 focus:outline-none transition-colors shadow-sm" />
                  {profile.company.length >= 1 && (() => {
                    const COMPANIES = ['腾讯','字节跳动','美团','阿里巴巴','百度','京东','网易','快手','小米','华为','OPPO','vivo','滴滴','拼多多','B站','爱奇艺','哔哩哔哩','蚂蚁集团','微软','谷歌','苹果','三星','亚马逊','Meta','英特尔','思科','IBM','博世','西门子','宝洁','麦肯锡','德勤','普华永道','毕马威','安永','高盛','摩根大通','花旗银行','工商银行','中国银行','建设银行','农业银行','招商银行','万科','碧桂园','恒大','联想','TCL','海尔','格力','比亚迪','宁德时代','中芯国际','寒武纪','商汤科技','旷视科技','科大讯飞','同程旅行','携程','去哪儿','途牛','同城','招聘','脉脉','BOSS直聘','猎聘','智联招聘','前程无忧'];
                    const filtered = COMPANIES.filter(co => co.includes(profile.company) || profile.company.includes(co.slice(0,2))).slice(0, 5);
                    return filtered.length > 0 ? (
                      <div className="mt-2 bg-white rounded-[16px] border border-slate-100 shadow-lg overflow-hidden">
                        {filtered.map(co => (
                          <button key={co} onClick={() => setProfile({...profile, company: co})}
                            className="w-full text-left px-5 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 last:border-0 flex items-center gap-2">
                            <Briefcase size={14} className="text-[#87A382] shrink-0" /> {co}
                          </button>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>`;

c = c.replace(OLD_COMPANY_INPUT, NEW_COMPANY_INPUT);

// ===========================================================
// G: Image upload in PublishModal (小红书 style)
// ===========================================================
// Add imageFile state and file input ref
c = c.replace(
  `  const [activeCat, setActiveCat] = useState(CATEGORIES[2]); 
  const [text, setText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);`,
  `  const [activeCat, setActiveCat] = useState(CATEGORIES[2]); 
  const [text, setText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImages(prev => [...prev, ev.target?.result as string].slice(0, 9));
      };
      reader.readAsDataURL(file);
    });
  };

  const LOCATION_OPTIONS = [
    userProfile?.company,
    '公司附近',
    '公司园区内',
    '公司食堂',
    '公司楼下咖啡厅',
    '地铁站',
  ].filter(Boolean) as string[];`
);

// Replace the image icon button with real file input trigger
c = c.replace(
  `          <div className="flex items-center gap-5 mt-auto pt-4 shrink-0">
            <button className="text-slate-400 hover:text-[#87A382] active:scale-90 transition-all">
              <ImageIcon size={22} />
            </button>
            <button className="text-slate-400 hover:text-[#87A382] active:scale-90 transition-all">
              <MapPin size={22} />
            </button>
          </div>`,
  `          <div className="flex items-center gap-5 mt-auto pt-4 shrink-0">
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-[#87A382] active:scale-90 transition-all">
              <ImageIcon size={22} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            <button onClick={() => setShowLocationPicker(true)} className="text-slate-400 hover:text-[#87A382] active:scale-90 transition-all flex items-center gap-1">
              <MapPin size={22} />
              {selectedLocation && <span className="text-[11px] font-bold text-[#87A382]">{selectedLocation}</span>}
            </button>
          </div>`
);

// Add image preview grid below the textarea container
c = c.replace(
  `        <div className="mt-4 shrink-0">
          {isPolishing ? (`,
  `        {selectedImages.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 shrink-0">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-[14px] overflow-hidden bg-slate-100 shadow-sm">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {selectedImages.length < 9 && (
              <button onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[14px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 active:scale-95 transition-transform">
                <Plus size={20} />
                <span className="text-[10px] font-bold mt-1">添加</span>
              </button>
            )}
          </div>
        )}

        {/* 定位选择弹窗 */}
        {showLocationPicker && (
          <div className="fixed inset-0 z-[9999] flex items-end" onClick={() => setShowLocationPicker(false)}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="relative bg-white rounded-t-[32px] w-full p-6 z-10 animate-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-[16px] font-black text-[#2F3E46] mb-4">选择发布位置</h3>
              <div className="flex flex-col gap-2">
                {LOCATION_OPTIONS.map(loc => (
                  <button key={loc} onClick={() => { setSelectedLocation(loc); setShowLocationPicker(false); }}
                    className={\`w-full text-left px-5 py-3.5 rounded-[16px] text-[14px] font-bold transition-all flex items-center gap-2 \${selectedLocation === loc ? 'bg-[#87A382] text-white' : 'bg-slate-50 text-slate-700 active:bg-slate-100'}\`}>
                    <MapPin size={15} className={selectedLocation === loc ? 'text-white' : 'text-[#87A382]'} /> {loc}
                  </button>
                ))}
                <button onClick={() => { setSelectedLocation(''); setShowLocationPicker(false); }}
                  className="w-full py-3 text-center text-[13px] font-bold text-slate-400 active:opacity-70">
                  不显示位置
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 shrink-0">
          {isPolishing ? (`
);

// Update handlePublish to include selectedLocation and has_image
c = c.replace(
  `        body: JSON.stringify({
          content,
          tags: [\`\${activeCat.icon} \${activeCat.label}\`],
          avatar: randomAvatar,
          author: userProfile?.nickname ?? '匿名实习生',
          location: userProfile?.company ?? '未知位置',
        }),`,
  `        body: JSON.stringify({
          content,
          tags: [\`\${activeCat.icon} \${activeCat.label}\`],
          avatar: userProfile?.avatar ?? randomAvatar,
          author: userProfile?.nickname ?? '匿名实习生',
          location: selectedLocation || userProfile?.company || '未知位置',
          has_image: selectedImages.length > 0,
        }),`
);

writeFileSync(file, c, 'utf8');
console.log('Done: B(FAB), C(company search), D(join→msg), G(image upload), H(location picker) applied.');
