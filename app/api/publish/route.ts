import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 城市识别规则
const cityMap: Record<string, string> = {
  '深圳': '深圳', '北京': '北京', '上海': '上海', '杭州': '杭州',
  '广州': '广州', '苏州': '苏州', '南京': '南京', '武汉': '武汉',
  '西安': '西安', '重庆': '重庆',
};

function extractCity(location: string, company: string): string | null {
  const text = `${location} ${company}`.toLowerCase();
  for (const [key, value] of Object.entries(cityMap)) {
    if (text.includes(key.toLowerCase())) return value;
  }
  return null;
}

// 分类识别规则
function inferCategory(content: string, tags: string[]): string {
  const text = `${content} ${tags.join(' ')}`.toLowerCase();
  if (/(电梯|通勤|地铁|打车|下班)/.test(text)) return '通勤';
  if (/(咖啡|食堂|饭|吃|午餐|晚餐)/.test(text)) return '干饭';
  if (/(会议|打印|工位|办公)/.test(text)) return '办公';
  if (/(吐槽|踩雷)/.test(text)) return '吐槽';
  if (/(求助|紧急)/.test(text)) return '求助';
  if (/(避雷|提醒)/.test(text)) return '避雷';
  if (/(打卡|推荐|推介)/.test(text)) return '打卡';
  return 'other';
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }

  const content  = typeof body.content  === 'string' ? body.content  : '';
  const location = typeof body.location === 'string' ? body.location : '未知位置';
  const company  = typeof body.company  === 'string' ? body.company  : '';
  const category = typeof body.category === 'string' ? body.category : '';
  const avatar   = typeof body.avatar   === 'string' ? body.avatar   : '🐧';
  const author   = typeof body.author   === 'string' ? body.author   : '匿名实习生';
  const tags     = Array.isArray(body.tags) ? (body.tags as unknown[]).map(String) : [];
  const has_image = Boolean(body.has_image);
  const lat = typeof body.lat === 'number' ? body.lat : null;
  const lng = typeof body.lng === 'number' ? body.lng : null;

  if (!content.trim()) {
    return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
  }

  const inferredCity = extractCity(location, company);
  const inferredCategory = category || inferCategory(content, tags);

  const { data, error } = await supabase
    .from('feeds')
    .insert([
      {
        content: content.trim(),
        tags,
        avatar,
        author,
        location,
        has_image,
        likes: 0,
        comments: 0,
        city: inferredCity,
        company: company || null,
        category: inferredCategory,
        source_type: 'user',
        lat,
        lng,
        status: 'active',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
