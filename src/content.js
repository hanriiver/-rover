import { Pet } from './pet/Pet.js';

let pet = null;

function init() {
  if (pet) return;

  chrome.storage.local.get(['enabled'], (result) => {
    const enabled = result.enabled !== false;
    if (enabled) {
      pet = new Pet();
    }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'toggle') {
    if (msg.enabled) {
      if (!pet) {
        pet = new Pet();
      } else {
        pet.show();
      }
    } else {
      if (pet) {
        pet.hide();
      }
    }
  }

  if (msg.type === 'chat-response' && pet) {
    // ChatPanel handles this via its own listener
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
