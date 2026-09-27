const KEY_NAME = 'drawing-to-bom.settings.v1';

/** Keep preferences in one versioned record; callers never need storage details. */
export function loadSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY_NAME) || '{}');
    return { apiKey: typeof value.apiKey === 'string' ? value.apiKey : '', provider: isProvider(value.provider) ? value.provider : '' };
  } catch {
    return { apiKey: '', provider: '' };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY_NAME, JSON.stringify({ apiKey: settings.apiKey, provider: settings.provider }));
}

export function clearSettings() { localStorage.removeItem(KEY_NAME); }

export function isProvider(value) { return ['gemini', 'openai', 'anthropic'].includes(value); }

/** Detect only prefixes that are sufficiently distinct; never probe providers with a key. */
export function detectProvider(apiKey) {
  if (/^sk-ant-/.test(apiKey)) return 'anthropic';
  if (/^(sk-proj-|sk-svcacct-)/.test(apiKey)) return 'openai';
  if (/^(AIza|AQ)/.test(apiKey)) return 'gemini';
  return '';
}
