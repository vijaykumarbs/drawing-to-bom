/** Normalize untrusted model output into the small, stable BoM domain shape. */
export function normalizeBomItems(value) {
  if (!Array.isArray(value)) throw new Error('The model response was not a list of parts.');
  const items = value.slice(0, 500).map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const quantity = Number(item.quantity);
    return {
      part_name: cleanText(item.part_name, 160),
      description: cleanText(item.description, 240),
      quantity: Number.isFinite(quantity) ? quantity : '',
      unit: cleanText(item.unit, 40) || 'pcs',
      notes: cleanText(item.notes, 500),
    };
  }).filter((item) => item && Object.values(item).some((field) => field !== ''));
  if (!items.length) throw new Error('No usable components were found. Try a clearer drawing.');
  return items;
}

function cleanText(value, limit) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}

/** Parse common JSON-only and fenced JSON model responses without evaluating text. */
export function parseBomResponse(text) {
  const cleaned = String(text ?? '').replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start < 0 || end <= start) throw new Error('The model did not return a valid component list.');
  try {
    return normalizeBomItems(JSON.parse(cleaned.slice(start, end + 1)));
  } catch {
    throw new Error('The model response could not be read as a component list. Try again.');
  }
}
