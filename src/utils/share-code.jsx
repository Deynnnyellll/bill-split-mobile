import LZString from 'lz-string';

export function encodeReceipt(receipt) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(receipt));
}

export function decodeReceipt(code) {
  if (!code || typeof code !== 'string') {
    console.log('[decodeReceipt] no code / not a string:', code);
    return null;
  }

  let trimmed = code.trim();
  console.log('[decodeReceipt] input length:', trimmed.length);

  trimmed = trimmed.replace(/^bill\s*splitter\s*code\s*[:\-]?\s*/i, '');
  console.log('[decodeReceipt] after label strip, length:', trimmed.length);

  let json;
  try {
    json = LZString.decompressFromEncodedURIComponent(trimmed);
  } catch (err) {
    console.log('[decodeReceipt] decompress threw:', err);
    return null;
  }

  console.log('[decodeReceipt] decompressed:', json ? json.slice(0, 80) : json);

  if (!json) return null;

  let data;
  try {
    data = JSON.parse(json);
  } catch (err) {
    console.log('[decodeReceipt] JSON.parse threw:', err);
    return null;
  }

  if (!data || !Array.isArray(data.items) || !Array.isArray(data.members)) {
    console.log('[decodeReceipt] shape check failed:', data);
    return null;
  }

  return data;
}