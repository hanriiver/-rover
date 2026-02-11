const API_BASE_URL = process.env.API_BASE_URL;

// Extension 시작 시 API 키 확인 및 생성
chrome.runtime.onInstalled.addListener(() => ensureApiKey());
chrome.runtime.onStartup.addListener(() => ensureApiKey());

async function ensureApiKey() {
  const { roverApiKey } = await chrome.storage.local.get(['roverApiKey']);
  if (!roverApiKey) {
    await generateKey();
  }
}

async function generateKey() {
  const res = await fetch(`${API_BASE_URL}/api/keys`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate API key');
  const data = await res.json();
  await chrome.storage.local.set({ roverApiKey: data.api_key });
  return data.api_key;
}

// Chat 메시지 처리
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'chat') {
    handleChat(msg.message).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true;
  }
});

async function handleChat(message) {
  let { roverApiKey, roverModel } = await chrome.storage.local.get(['roverApiKey', 'roverModel']);

  if (!roverApiKey) {
    roverApiKey = await generateKey();
  }

  const model = roverModel || 'gemini-2.5';

  try {
    return await callChat(roverApiKey, message, model);
  } catch (err) {
    if (err.status === 401) {
      roverApiKey = await generateKey();
      return await callChat(roverApiKey, message, model);
    }
    throw err;
  }
}

async function callChat(apiKey, message, model) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    const error = new Error(err.error || 'API error');
    error.status = res.status;
    throw error;
  }

  return await res.json();
}
