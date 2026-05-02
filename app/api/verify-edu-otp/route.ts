import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '../send-edu-otp/route';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const ok = verifyOtp(email, code);
    if (!ok) {
      return NextResponse.json({ error: '验证码错误或已过期，请重新获取' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '服务异常，请稍后重试' }, { status: 500 });
  }
}
