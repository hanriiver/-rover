chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'chat') {
    handleChat(msg.message).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true;
  }
});

async function handleChat(message) {
  const { roverApiUrl, roverApiKey } = await chrome.storage.local.get([
    'roverApiUrl',
    'roverApiKey',
  ]);

  if (!roverApiUrl) {
    return { message: null };
  }

  let apiKey = roverApiKey;

  if (!apiKey) {
    apiKey = await generateKey(roverApiUrl);
  }

  try {
    return await callChat(roverApiUrl, apiKey, message);
  } catch (err) {
    if (err.status === 401) {
      apiKey = await generateKey(roverApiUrl);
      return await callChat(roverApiUrl, apiKey, message);
    }
    throw err;
  }
}

async function generateKey(baseUrl) {
  const res = await fetch(`${baseUrl}/api/keys`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate API key');
  const data = await res.json();
  const apiKey = data.api_key;
  await chrome.storage.local.set({ roverApiKey: apiKey });
  return apiKey;
}

async function callChat(baseUrl, apiKey, message) {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    const error = new Error(err.error || 'API error');
    error.status = res.status;
    throw error;
  }

  return await res.json();
}
