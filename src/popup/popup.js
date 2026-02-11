const toggle = document.getElementById('toggle-pet');
const status = document.getElementById('pet-status');
const apiUrlInput = document.getElementById('api-url');

chrome.storage.local.get(['enabled', 'roverApiUrl'], (result) => {
  const enabled = result.enabled !== false;
  toggle.checked = enabled;
  status.textContent = enabled ? 'Active' : 'Off';
  apiUrlInput.value = result.roverApiUrl || '';
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  status.textContent = enabled ? 'Active' : 'Off';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle', enabled });
    }
  });
});

apiUrlInput.addEventListener('change', () => {
  let url = apiUrlInput.value.trim();
  // Remove trailing slash
  if (url.endsWith('/')) url = url.slice(0, -1);
  apiUrlInput.value = url;
  chrome.storage.local.set({ roverApiUrl: url });
});
