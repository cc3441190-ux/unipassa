/**
 * 与 `/v1/chat/completions` 拼接用。若在 .env 里把 OPENAI_BASE_URL 写成「…/v1」，
 * 直接拼会得到「…/v1/v1/chat/completions」导致 404，这里去掉重复的 /v1。
 */
export function getOpenAiCompatibleApiRoot(): string {
  let base = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com').trim();
  base = base.replace(/\/+$/, '');
  if (/\/v1$/i.test(base)) {
    base = base.replace(/\/v1$/i, '').replace(/\/+$/, '');
  }
  return base || 'https://api.deepseek.com';
}
