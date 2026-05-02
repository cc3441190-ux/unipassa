import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const { feed_id, guest_id, avatar, author } = body;
  const content = typeof body.content === 'string' ? body.content : '';

  if (!feed_id || !guest_id || !content.trim()) {
    return NextResponse.json(
      { error: '缺少必要字段' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('feed_comments')
      .insert([{
        feed_id,
        guest_id,
        avatar: (typeof avatar === 'string' ? avatar : null) ?? '🐧',
        author: (typeof author === 'string' ? author : null) ?? '匿名实习生',
        content: content.trim(),
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error('Feed comment save error:', e);
    return NextResponse.json({ error: '服务暂时不可用' }, { status: 500 });
  }
}
