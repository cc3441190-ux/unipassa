import { NextRequest, NextResponse } from 'next/server';

/**
 * 从一条圈子动态中提取「职场成就胶囊」展示用的一行摘要。
 * 与 /api/eq-polish（话术润色）职责分离。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const dynamicText = typeof body.content === 'string' ? body.content : typeof body.text === 'string' ? body.text : '';

  if (!dynamicText.trim()) {
    return NextResponse.json({ error: '缺少动态正文' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 });
  }

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'deepseek-chat';

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是职业发展助手。根据用户发的「职场圈子动态」，提炼出一条可展示的「微小成就」或能力点。\n' +
              '要求：\n' +
              '1. 只输出一行。\n' +
              '2. 格式必须使用中文全角冒号分隔：前半段用方括号包住能力标签，后半段 20～40 字鼓励性简述。\n' +
              '3. 示例：[跨部门协作]：主动同步进度，让小需求也能顺利上线\n' +
              '4. 不要输出解释、Markdown、引号或第二行。',
          },
          {
            role: 'user',
            content: dynamicText.trim().slice(0, 1200),
          },
        ],
        max_tokens: 120,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: String(err?.error?.message ?? 'AI 请求失败') },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = String(data.choices?.[0]?.message?.content ?? '').trim();
    return NextResponse.json({ result });
  } catch (e) {
    console.error('achievement-extract error:', e);
    return NextResponse.json({ error: '服务暂时不可用' }, { status: 500 });
  }
}
