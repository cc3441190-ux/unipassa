'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

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
          className="text-[26px] font-black leading-tight"
          style={{ color: '#2F3E46' }}
        >
          出了点小问题
        </h1>
        <p className="text-[13px] font-medium max-w-[260px]" style={{ color: '#56756D' }}>
          {error?.message || '应用崩了一下，企鹅正在努力修复中。'}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={reset}
            className="rounded-full border border-white/70 px-5 py-2.5 text-[13px] font-black text-[#2F3E46] shadow-sm active:scale-95"
            style={{
              background:
                'linear-gradient(125deg,rgba(255,231,171,0.95) 0%,rgba(150,225,206,0.9) 100%)',
            }}
          >
            重试
          </button>
          <a
            href="/"
            className="rounded-full border border-white/60 bg-white/70 px-5 py-2.5 text-[13px] font-black text-[#56756D] shadow-sm active:scale-95"
          >
            回首页
          </a>
        </div>
      </div>
    </div>
  );
}
