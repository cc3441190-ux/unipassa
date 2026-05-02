import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const guestId = req.nextUrl.searchParams.get('guest_id');

  if (!guestId) {
    return NextResponse.json({ error: 'guest_id 必须' }, { status: 400 });
  }

  try {
    // 获取用户个人数据（成就、加入的局等）
    const { data: appData, error: appError } = await supabase
      .from('app_guest_data')
      .select('*')
      .eq('guest_id', guestId)
      .single();

    if (appError && appError.code !== 'PGRST116') {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    // 获取用户喜欢的 feeds（基于 likes 更新时间）
    const { data: likedFeeds, error: likeError } = await supabase
      .from('feed_likes')
      .select('feed_id, created_at')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (likeError) {
      console.error('Failed to fetch liked feeds:', likeError.message);
    }

    // 获取用户的评论
    const { data: userComments, error: commentError } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (commentError) {
      console.error('Failed to fetch user comments:', commentError.message);
    }

    return NextResponse.json({
      app_data: appData,
      liked_feeds: likedFeeds ?? [],
      comments: userComments ?? [],
    });
  } catch (e) {
    console.error('User data fetch error:', e);
    return NextResponse.json({ error: '服务暂时不可用' }, { status: 500 });
  }
}
