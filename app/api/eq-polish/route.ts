import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }
  const text = typeof body.text === 'string' ? body.text : '';
  const scenario = typeof body.scenario === 'string' ? body.scenario : '';

  if (!text?.trim()) {
    return NextResponse.json({ error: '请输入内容' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服务未配置' }, { status: 500 });
  }

  const scenarioMap: Record<string, string> = {
    催促进度: '催促对方推进工作进度',
    委婉拒绝: '委婉拒绝对方的请求',
    工作汇报: '向上级汇报工作进展',
    '道歉/甩锅': '在职场中优雅地道歉或解释情况',
    请假说明: '向领导请假并说明原因',
  };

  const scenarioHint = scenario && scenarioMap[scenario]
    ? `场景：${scenarioMap[scenario]}。`
    : '';

  // 支持自定义 API Base URL（用于国内代理），在 .env.local 中设置 OPENAI_BASE_URL
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
            content: `你是一位职场沟通专家，擅长将白话文转化为得体、高情商的职场用语。${scenarioHint}
请将用户的大白话改写成一段简短、得体、自然的职场消息（中文），不超过80字。
只输出改写后的内容，不要任何解释或前缀。`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 200,
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
    console.error('EQ polish error:', e);
    return NextResponse.json({ error: '服务暂时不可用' }, { status: 500 });
  }
}
