import { NextRequest, NextResponse } from 'next/server';

const OTP_STORE = new Map<string, { code: string; expiresAt: number }>();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: '请提供邮箱地址' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    if (!normalized.endsWith('.edu.cn')) {
      return NextResponse.json({ error: '请使用 .edu.cn 结尾的高校邮箱' }, { status: 400 });
    }

    const code = generateOtp();
    OTP_STORE.set(normalized, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    // 尝试通过 Resend 发送邮件
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({
          from: 'UniPass <noreply@unipass.app>',
          to: normalized,
          subject: '【UniPass】学生认证验证码',
          html: `<p>你好，</p><p>你的 UniPass 学生认证验证码为：</p><h2 style="letter-spacing:8px">${code}</h2><p>验证码 10 分钟内有效，请勿泄露给他人。</p>`,
        }),
      });
      if (!res.ok) {
        console.error('Resend error', await res.text());
        // 即使发送失败也继续（开发模式下通过日志看到）
      }
    } else {
      // 无邮件服务时，在服务端日志输出（开发调试用）
      console.info(`[DEV] OTP for ${normalized}: ${code}`);
    }

    return NextResponse.json({ ok: true, dev_code: resendApiKey ? undefined : code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '服务异常，请稍后重试' }, { status: 500 });
  }
}

// 供 verify 路由调用的内部验证函数
export function verifyOtp(email: string, code: string): boolean {
  const normalized = email.trim().toLowerCase();
  const entry = OTP_STORE.get(normalized);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    OTP_STORE.delete(normalized);
    return false;
  }
  if (entry.code !== code) return false;
  OTP_STORE.delete(normalized);
  return true;
}
