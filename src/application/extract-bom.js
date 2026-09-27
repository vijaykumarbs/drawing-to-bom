import { extractWithProvider } from '../infrastructure/provider-client.js';
import { parseBomResponse } from '../domain/bom.js';

/** Application use case: validate inputs, request extraction, and normalize output. */
export async function extractBom({ image, apiKey, provider, signal }) {
  if (!image || !apiKey || !provider) throw new Error('Add a drawing and API key before extracting.');
  const responseText = await extractWithProvider({ image, apiKey, provider, signal });
  return parseBomResponse(responseText);
}
