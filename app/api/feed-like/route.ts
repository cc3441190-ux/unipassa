import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const { feed_id, guest_id, action } = body;

  if (!feed_id || !guest_id || !action) {
    return NextResponse.json(
      { error: 'feed_id, guest_id, action 必须' },
      { status: 400 }
    );
  }

  try {
    if (action === 'like') {
      const { error } = await supabase
        .from('feed_likes')
        .insert([{ feed_id, guest_id }])
        .select()
        .single();

      if (error && error.code !== '23505') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    } else if (action === 'unlike') {
      const { error } = await supabase
        .from('feed_likes')
        .delete()
        .eq('feed_id', feed_id)
        .eq('guest_id', guest_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: '无效的 action' }, { status: 400 });
    }
  } catch (e) {
    console.error('Feed like action error:', e);
    return NextResponse.json({ error: '服务暂时不可用' }, { status: 500 });
  }
}
