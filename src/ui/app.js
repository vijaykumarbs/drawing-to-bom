import { extractBom } from '../application/extract-bom.js';
import { clearSettings, detectProvider, isProvider, loadSettings, saveSettings } from '../infrastructure/settings-store.js';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const elements = Object.fromEntries(['settingsBtn','settingsPanel','apiKeyInput','providerSelect','keyStatus','keyDot','fileInput','dropZone','previewBox','previewImg','previewName','extractBtn','statusBar','resultSection','itemBadge','bomBody'].map((id) => [id, document.getElementById(id)]));
let imageFile = null;
let settings = loadSettings();

initialize();

function initialize() {
  elements.apiKeyInput.value = settings.apiKey;
  elements.providerSelect.value = '';
  updateKeyIndicator();
  elements.settingsBtn.addEventListener('click', toggleSettings);
  document.getElementById('saveKeyBtn').addEventListener('click', saveKey);
  document.getElementById('removeKeyBtn').addEventListener('click', removeKey);
  elements.fileInput.addEventListener('change', () => acceptFile(elements.fileInput.files?.[0]));
  elements.dropZone.addEventListener('dragover', (event) => { event.preventDefault(); elements.dropZone.classList.add('drag'); });
  elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('drag'));
  elements.dropZone.addEventListener('drop', (event) => { event.preventDefault(); elements.dropZone.classList.remove('drag'); acceptFile(event.dataTransfer.files?.[0]); });
  document.getElementById('clearFileBtn').addEventListener('click', clearFile);
  elements.extractBtn.addEventListener('click', runExtraction);
  document.getElementById('addRowBtn').addEventListener('click', addRow);
  document.getElementById('exportBtn').addEventListener('click', exportCsv);
  window.addEventListener('storage', (event) => { if (event.key === 'drawing-to-bom.settings.v1') { settings = loadSettings(); updateKeyIndicator(); } });
  updateExtractButton();
}

function toggleSettings() {
  const open = !elements.settingsPanel.hidden;
  elements.settingsPanel.hidden = open;
  elements.settingsBtn.setAttribute('aria-expanded', String(!open));
  elements.settingsBtn.classList.toggle('active', !open);
}

function saveKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  const provider = elements.providerSelect.value || detectProvider(apiKey);
  if (!apiKey) return showKeyStatus('Enter an API key first.', 'err');
  if (!isProvider(provider)) return showKeyStatus('We could not identify that key format. Choose its provider.', 'err');
  settings = { apiKey, provider };
  try { saveSettings(settings); }
  catch { return showKeyStatus('The browser could not save settings. Check storage availability.', 'err'); }
  updateKeyIndicator();
  updateExtractButton();
  showKeyStatus('Key saved in this browser.', 'ok');
}

function removeKey() {
  clearSettings();
  settings = { apiKey: '', provider: '' };
  elements.apiKeyInput.value = '';
  elements.providerSelect.value = '';
  updateKeyIndicator();
  updateExtractButton();
  showKeyStatus('Saved key removed.', 'ok');
}

function updateKeyIndicator() { elements.keyDot.classList.toggle('visible', Boolean(settings.apiKey)); }
function showKeyStatus(message, kind) { elements.keyStatus.textContent = message; elements.keyStatus.className = `key-status ${kind}`; }

function acceptFile(file) {
  if (!file) return;
  if (!ALLOWED_TYPES.has(file.type)) return showStatus('error', 'Use a JPG, PNG, or WEBP image.');
  if (file.size > MAX_FILE_BYTES) return showStatus('error', 'The drawing exceeds the 10 MB limit.');
  imageFile = file;
  elements.previewImg.src = URL.createObjectURL(file);
  elements.previewName.textContent = `${file.name} (${Math.ceil(file.size / 1024)} KB)`;
  elements.previewBox.hidden = false;
  elements.resultSection.hidden = true;
  hideStatus();
  updateExtractButton();
}

function clearFile() {
  if (elements.previewImg.src.startsWith('blob:')) URL.revokeObjectURL(elements.previewImg.src);
  imageFile = null;
  elements.fileInput.value = '';
  elements.previewImg.removeAttribute('src');
  elements.previewBox.hidden = true;
  elements.resultSection.hidden = true;
  updateExtractButton();
}

function updateExtractButton() { elements.extractBtn.disabled = !(imageFile && settings.apiKey && settings.provider); }

async function runExtraction() {
  elements.extractBtn.disabled = true;
  elements.extractBtn.textContent = 'Analyzing drawing…';
  elements.resultSection.hidden = true;
  showStatus('loading', 'Sending the drawing directly to your selected AI provider…');
  try {
    const items = await extractBom({ image: imageFile, ...settings });
    renderRows(items);
    elements.itemBadge.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'} found`;
    elements.resultSection.hidden = false;
    hideStatus();
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showStatus('error', error.message || 'Extraction failed. Check settings and try again.');
  } finally {
    elements.extractBtn.textContent = 'Extract bill of materials';
    updateExtractButton();
  }
}

function renderRows(items) { elements.bomBody.replaceChildren(...items.map((item, index) => buildRow(index + 1, item))); }

function buildRow(index, item) {
  const row = document.createElement('tr');
  const number = document.createElement('td');
  number.className = 'col-no'; number.textContent = String(index); row.append(number);
  for (const [field, placeholder] of [['part_name','Part name'],['description','Description'],['quantity','0'],['unit','pcs'],['notes','Notes or specification']]) {
    const cell = document.createElement('td');
    if (field === 'quantity') cell.className = 'col-qty';
    if (field === 'unit') cell.className = 'col-unit';
    const input = document.createElement('input');
    input.type = 'text'; input.value = String(item[field] ?? ''); input.placeholder = placeholder; input.setAttribute('aria-label', placeholder);
    cell.append(input); row.append(cell);
  }
  return row;
}

function addRow() {
  const count = elements.bomBody.rows.length + 1;
  elements.bomBody.append(buildRow(count, { part_name: '', description: '', quantity: '', unit: 'pcs', notes: '' }));
  elements.itemBadge.textContent = `${count} items`;
}

function exportCsv() {
  const rows = [['No','Component / Part','Description','Qty','Unit','Notes / Spec']];
  [...elements.bomBody.rows].forEach((row, index) => rows.push([String(index + 1), ...[...row.querySelectorAll('input')].map((input) => input.value)]));
  // Prefix formula-like cells so spreadsheet software treats them as text.
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'bom-export.csv'; link.click(); URL.revokeObjectURL(url);
}

function csvCell(value) {
  const safe = /^[\s]*[=+@\-]/.test(String(value)) ? `'${value}` : String(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

function showStatus(kind, message) { elements.statusBar.textContent = message; elements.statusBar.className = `status-bar ${kind}`; elements.statusBar.hidden = false; }
function hideStatus() { elements.statusBar.hidden = true; }
