import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let messages: unknown, mode: unknown;
  try {
    ({ messages, mode } = await req.json());
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 });
  }

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'deepseek-chat';

  // 根据 mode 调整 system prompt
  let systemPrompt = '你是 UniAI，UniPass 职场社交平台的专属 AI 助手。你聪明、温暖、幽默，专注于帮助实习生处理职场问题。你可以帮用户写邮件、分析职场人际关系、提供心理支持、提炼实习经历亮点、润色职场表达等。回复简洁亲切，中文为主，不要啰嗦。';

  if (mode === 'feed-summary') {
    systemPrompt = '你是 UniAI 内容评估师。你的任务是给圈子内容生成一句话的 AI 摘要或建议，帮助读者快速了解内容的核心价值。你的摘要应该：1）聚焦事实而非情绪；2）直指内容对用户的实际帮助；3）用轻松幽默的口吻；4）不超过 20 字。';
  } else if (mode === 'feed-comment') {
    systemPrompt = '你是 UniAI 高情商嘴替。你的任务是根据圈子内容，生成 3 条可直接复制的高情商评论或私聊话术。要求：1）每条不超过 35 字；2）体现同理心与建设性；3）可直接复制使用；4）根据内容类型调整语气（求助用鼓励，吐槽用共鸣，推荐用感谢）。';
  }

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
            content: systemPrompt,
          },
          ...messages,
        ],
        max_tokens: mode === 'feed-summary' ? 50 : 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message ?? 'AI 请求失败' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ result });
  } catch (e) {
    console.error('Chat error:', e);
    return NextResponse.json({ error: '服务暂时不可用，请稍后重试' }, { status: 500 });
  }
}
