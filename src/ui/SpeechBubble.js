export class SpeechBubble {
  constructor(pet) {
    this.pet = pet;
    this.element = document.createElement('div');
    this.element.id = 'shiba-speech';
    this.element.style.display = 'none';
    document.body.appendChild(this.element);
    this.hideTimer = null;
    this.typeInterval = null;
    this.isInputMode = false;
    this.inputEl = null;
    this._onClose = null;
    this._outsideClick = null;
    this.isTalking = false;
  }

  show(text, duration = 3000) {
    if (this.isInputMode) return;
    clearTimeout(this.hideTimer);
    clearInterval(this.typeInterval);
    this.element.textContent = '';
    this.element.style.display = 'block';
    this.element.style.opacity = '1';
    this.element.style.pointerEvents = 'none';

    if (duration > 0) {
      this.isTalking = true;
    }

    let i = 0;
    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.element.textContent += text[i];
        i++;
      } else {
        clearInterval(this.typeInterval);
      }
    }, 50);

    if (duration > 0) {
      this.hideTimer = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    if (this.isInputMode) return;
    clearInterval(this.typeInterval);
    this.isTalking = false;
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.style.display = 'none';
    }, 300);
  }

  updateText(text) {
    if (this.isInputMode) return;
    this.element.textContent = text;
  }

  updatePosition() {
    this.element.style.left = (this.pet.x + 10) + 'px';
    this.element.style.top = 'auto';
    this.element.style.bottom = (window.innerHeight - this.pet.y + 10) + 'px';
  }

  showInput(onClose) {
    this._onClose = onClose || null;
    clearTimeout(this.hideTimer);
    clearInterval(this.typeInterval);
    this.isInputMode = true;
    this.isTalking = true;

    this.element.style.display = 'block';
    this.element.style.opacity = '1';
    this.element.style.pointerEvents = 'auto';
    this.element.style.zIndex = '2147483647';
    this.element.textContent = '';

    this.pet.spriteManager.current = null;
    this.pet.spriteManager.play('talk');

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.placeholder = 'Talk to Rover...';
    this.inputEl.style.cssText = `
      width: 100%;
      border: none;
      outline: none;
      font-size: 13px;
      font-family: inherit;
      background: transparent;
      color: #333;
      z-index: 2147483647;
      position: relative;
    `;

    this.element.appendChild(this.inputEl);

    this.inputEl.addEventListener('mousedown', (e) => e.stopPropagation());
    this.inputEl.addEventListener('click', (e) => e.stopPropagation());
    this.inputEl.addEventListener('focus', (e) => e.stopPropagation());

    setTimeout(() => this.inputEl.focus(), 50);

    this.inputEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const text = this.inputEl.value.trim();
        if (!text) return;

        this.inputEl.remove();
        this.inputEl = null;
        this.element.textContent = '...';

        chrome.runtime.sendMessage({ type: 'chat', message: text }, (response) => {
          if (chrome.runtime.lastError || !response || !response.message) {
            this._typeResponse(text);
          } else {
            this._typeResponse(response.message);
          }
        });
      }
      if (e.key === 'Escape') {
        this._closeAll();
      }
    });

    this.inputEl.addEventListener('keyup', (e) => e.stopPropagation());
    this.inputEl.addEventListener('keypress', (e) => e.stopPropagation());

    this._addOutsideClickListener(() => this._closeAll());
  }

  _typeResponse(text) {
    this.element.textContent = '';
    let i = 0;
    clearInterval(this.typeInterval);
    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.element.textContent += text[i];
        i++;
      } else {
        clearInterval(this.typeInterval);
        setTimeout(() => this._closeAll(), 4000);
      }
    }, 50);
  }

  _addOutsideClickListener(callback) {
    if (this._outsideClick) {
      document.removeEventListener('mousedown', this._outsideClick);
    }
    setTimeout(() => {
      this._outsideClick = (e) => {
        if (!this.element.contains(e.target) && e.target !== this.pet.element) {
          callback();
        }
      };
      document.addEventListener('mousedown', this._outsideClick);
    }, 100);
  }

  _closeAll() {
    if (this.inputEl) {
      this.inputEl.remove();
      this.inputEl = null;
    }

    if (this._outsideClick) {
      document.removeEventListener('mousedown', this._outsideClick);
      this._outsideClick = null;
    }

    this.isInputMode = false;
    this.isTalking = false;
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = '999998';
    this.element.textContent = '';
    this.element.style.display = 'none';
    this.element.style.opacity = '0';

    if (this._onClose) {
      const cb = this._onClose;
      this._onClose = null;
      cb();
    }
  }

  closeInput() {
    this._closeAll();
  }
}
