'use client';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          'radial-gradient(circle at 16% 4%,rgba(150,225,206,0.3) 0%,transparent 30%), radial-gradient(circle at 94% 12%,rgba(178,176,245,0.26) 0%,transparent 32%), linear-gradient(180deg,#F8FCFA 0%,#F7F8FF 50%,#FFFCF6 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-4 px-8 text-center">
        <span className="text-6xl">🐧</span>
        <h1
          className="text-[28px] font-black leading-tight"
          style={{ color: '#2F3E46' }}
        >
          迷路了！
        </h1>
        <p className="text-[14px] font-medium" style={{ color: '#56756D' }}>
          这个页面不存在，企鹅也找不到它。
        </p>
        <a
          href="/"
          className="mt-2 rounded-full border border-white/70 px-6 py-2.5 text-[14px] font-black text-[#2F3E46] shadow-sm active:scale-95"
          style={{
            background:
              'linear-gradient(125deg,rgba(255,231,171,0.95) 0%,rgba(150,225,206,0.9) 100%)',
          }}
        >
          回首页
        </a>
      </div>
    </div>
  );
}
