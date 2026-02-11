export class ChatPanel {
  constructor(pet) {
    this.pet = pet;
    this.isOpen = false;
    this.element = null;
    this.messagesEl = null;
    this.inputEl = null;

    this.create();
    this.listen();
  }

  create() {
    this.element = document.createElement('div');
    this.element.id = 'shiba-chat-panel';
    this.element.innerHTML = `
      <div style="padding:12px 16px;background:#d2691e;color:white;font-weight:bold;display:flex;justify-content:space-between;align-items:center;">
        <span>시바와 대화</span>
        <span id="shiba-chat-close" style="cursor:pointer;font-size:18px;padding:0 4px;">&times;</span>
      </div>
      <div id="shiba-chat-messages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;"></div>
      <div style="padding:8px 12px;border-top:1px solid #eee;display:flex;gap:8px;">
        <input id="shiba-chat-input" type="text" placeholder="시바에게 말하기..."
          style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:20px;outline:none;font-size:13px;" />
        <button id="shiba-chat-send"
          style="background:#d2691e;color:white;border:none;border-radius:20px;padding:8px 14px;cursor:pointer;font-size:13px;">전송</button>
      </div>
    `;
    document.body.appendChild(this.element);

    this.messagesEl = this.element.querySelector('#shiba-chat-messages');
    this.inputEl = this.element.querySelector('#shiba-chat-input');

    this.element.querySelector('#shiba-chat-close').addEventListener('click', () => this.close());
    this.element.querySelector('#shiba-chat-send').addEventListener('click', () => this.send());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.send();
    });
  }

  listen() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'chat-response') {
        this.addMessage(msg.message, 'bot');
        this.pet.speechBubble.show(msg.message.slice(0, 30) + (msg.message.length > 30 ? '...' : ''), 3000);
      }
    });
  }

  open() {
    this.isOpen = true;
    this.element.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.element.style.display = 'none';
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  send() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    this.inputEl.value = '';

    chrome.runtime.sendMessage({ type: 'chat', message: text });
  }

  addMessage(text, sender) {
    const msg = document.createElement('div');
    const isUser = sender === 'user';
    msg.style.cssText = `
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.4;
      word-break: keep-all;
      align-self: ${isUser ? 'flex-end' : 'flex-start'};
      background: ${isUser ? '#d2691e' : '#f0f0f0'};
      color: ${isUser ? 'white' : '#333'};
    `;
    msg.textContent = text;
    this.messagesEl.appendChild(msg);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}
