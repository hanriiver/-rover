const toggle = document.getElementById('toggle-pet');
const status = document.getElementById('pet-status');
const modelSelect = document.getElementById('model-select');

chrome.storage.local.get(['enabled', 'roverModel'], (result) => {
  const enabled = result.enabled !== false;
  toggle.checked = enabled;
  status.textContent = enabled ? 'Active' : 'Off';
  modelSelect.value = result.roverModel || 'gemini-2.5';
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

modelSelect.addEventListener('change', () => {
  chrome.storage.local.set({ roverModel: modelSelect.value });
});
