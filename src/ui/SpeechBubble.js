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
    this.isFocusMode = false;
    this.inputEl = null;
    this.timerEl = null;
    this.focusInterval = null;
    this._onClose = null;
    this._outsideClick = null;
  }

  show(text, duration = 3000) {
    if (this.isInputMode || this.isFocusMode) return;
    clearTimeout(this.hideTimer);
    clearInterval(this.typeInterval);
    this.element.textContent = '';
    this.element.style.display = 'block';
    this.element.style.opacity = '1';
    this.element.style.pointerEvents = 'none';

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
    if (this.isInputMode || this.isFocusMode) return;
    clearInterval(this.typeInterval);
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.style.display = 'none';
    }, 300);
  }

  updateText(text) {
    if (this.isInputMode || this.isFocusMode) return;
    this.element.textContent = text;
  }

  updatePosition() {
    this.element.style.left = (this.pet.x + 10) + 'px';
    this.element.style.top = (this.pet.y - 50) + 'px';
    if (this.timerEl) {
      const rect = this.element.getBoundingClientRect();
      this.timerEl.style.left = rect.left + 'px';
      this.timerEl.style.top = (rect.top - 36) + 'px';
    }
  }

  // === MENU ===

  showMenu(onClose) {
    this._onClose = onClose || null;
    clearTimeout(this.hideTimer);
    clearInterval(this.typeInterval);
    this.isInputMode = true;

    this.element.style.display = 'block';
    this.element.style.opacity = '1';
    this.element.style.pointerEvents = 'auto';
    this.element.style.zIndex = '2147483647';
    this.element.textContent = '';

    const menu = document.createElement('div');
    menu.className = 'shiba-menu';

    const talkBtn = this._createMenuBtn('Talk to Rover');
    talkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._switchToInput();
    });

    const focusBtn = this._createMenuBtn('Focus Mode');
    focusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._switchToFocus();
    });

    menu.appendChild(talkBtn);
    menu.appendChild(focusBtn);
    this.element.appendChild(menu);

    this._addOutsideClickListener(() => this._closeAll());
  }

  _createMenuBtn(text) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'shiba-menu-btn';
    btn.addEventListener('mousedown', (e) => e.stopPropagation());
    return btn;
  }

  // === INPUT (Talk) ===

  _switchToInput() {
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

        // Remove input, show typing indicator
        this.inputEl.remove();
        this.inputEl = null;
        this.element.textContent = '...';

        // Send to background for API chat
        chrome.runtime.sendMessage({ type: 'chat', message: text }, (response) => {
          if (response && response.message) {
            this._typeResponse(response.message);
          } else {
            // No API or error — just show user's own text
            this._typeResponse(text);
          }
        });
      }
      if (e.key === 'Escape') {
        this._closeAll();
      }
    });

    this.inputEl.addEventListener('keyup', (e) => e.stopPropagation());
    this.inputEl.addEventListener('keypress', (e) => e.stopPropagation());
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

  // === FOCUS MODE ===

  _switchToFocus() {
    this.isInputMode = false;
    this.isFocusMode = true;
    this.element.textContent = 'Focusing...';

    this.pet.spriteManager.current = null;
    this.pet.spriteManager.play('focus');

    // Timer element above the speech bubble
    this.timerEl = document.createElement('div');
    this.timerEl.id = 'shiba-focus-timer';
    document.body.appendChild(this.timerEl);

    this.focusRemaining = 600; // 10 minutes
    this._updateTimerDisplay();
    this.focusInterval = setInterval(() => {
      this.focusRemaining--;
      this._updateTimerDisplay();
      if (this.focusRemaining <= 0) {
        this._closeAll();
      }
    }, 1000);

    // Click timer to stop early
    this.timerEl.addEventListener('click', () => this._closeAll());

    this.updatePosition();
  }

  _updateTimerDisplay() {
    if (!this.timerEl) return;
    const min = Math.floor(this.focusRemaining / 60);
    const sec = this.focusRemaining % 60;
    this.timerEl.textContent =
      min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
  }

  // === CLOSE / CLEANUP ===

  _addOutsideClickListener(callback) {
    if (this._outsideClick) {
      document.removeEventListener('mousedown', this._outsideClick);
    }
    setTimeout(() => {
      this._outsideClick = (e) => {
        if (
          !this.element.contains(e.target) &&
          e.target !== this.pet.element &&
          (!this.timerEl || !this.timerEl.contains(e.target))
        ) {
          callback();
        }
      };
      document.addEventListener('mousedown', this._outsideClick);
    }, 100);
  }

  _closeAll() {
    // Clean up input
    if (this.inputEl) {
      this.inputEl.remove();
      this.inputEl = null;
    }

    // Clean up focus mode
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;
    }
    if (this.timerEl) {
      this.timerEl.remove();
      this.timerEl = null;
    }

    // Clean up outside click
    if (this._outsideClick) {
      document.removeEventListener('mousedown', this._outsideClick);
      this._outsideClick = null;
    }

    // Reset state
    this.isInputMode = false;
    this.isFocusMode = false;
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = '999998';
    this.element.textContent = '';
    this.element.style.display = 'none';
    this.element.style.opacity = '0';

    // Notify
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
