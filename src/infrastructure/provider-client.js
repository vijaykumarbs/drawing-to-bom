const PROMPT = `You extract a bill of materials from engineering, assembly, structural, or packaging drawings. Read visible BOM tables, callouts, title blocks, labels, and clearly identifiable components. Do not invent details; use empty strings or null quantities when uncertain. Return only a JSON array. Each item must have exactly: {"part_name":"string","description":"string","quantity":number or null,"unit":"string","notes":"string"}.`;
const REQUEST_TIMEOUT_MS = 90_000;

/** Provider-specific HTTP details stay behind one adapter boundary. */
export async function extractWithProvider({ image, apiKey, provider, signal }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await providerRequest({ image, apiKey, provider, signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Provider error bodies can echo request details; never surface them to the UI.
      if (response.status === 401 || response.status === 403) throw new Error('The API key was rejected. Check it in Settings.');
      if (response.status === 429) throw new Error('The provider rate limit was reached. Wait and try again.');
      throw new Error(`The ${providerLabel(provider)} request failed (HTTP ${response.status}).`);
    }
    return getResponseText(payload, provider);
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out or was cancelled. Try again.');
    if (error instanceof TypeError) throw new Error('Could not reach the provider. Check your connection and key permissions.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

async function providerRequest({ image, apiKey, provider, signal }) {
  const dataUrl = await fileAsDataUrl(image);
  if (provider === 'gemini') {
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent', {
      method: 'POST', signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: image.type, data: dataUrl.split(',')[1] } }, { text: PROMPT }] }], generationConfig: { temperature: 0, maxOutputTokens: 4096 } }),
    });
  }
  if (provider === 'openai') {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o', max_tokens: 4096, messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: dataUrl } }] }] }),
    });
  }
  if (provider === 'anthropic') {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 4096, system: PROMPT, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: image.type, data: dataUrl.split(',')[1] } }, { type: 'text', text: 'Extract the complete bill of materials from this drawing.' }] }] }),
    });
  }
  throw new Error('This API key format is not recognized. Choose a provider in Settings.');
}

function getResponseText(payload, provider) {
  const text = provider === 'gemini'
    ? payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n')
    : provider === 'openai'
      ? payload.choices?.[0]?.message?.content
      : payload.content?.find((block) => block.type === 'text')?.text;
  if (!text) throw new Error('The provider returned no readable content. Try again.');
  return text;
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The drawing could not be read.'));
    reader.readAsDataURL(file);
  });
}

function providerLabel(provider) { return ({ gemini: 'Gemini', openai: 'OpenAI', anthropic: 'Anthropic' })[provider] ?? 'AI provider'; }
