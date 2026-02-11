import { SpriteManager } from './SpriteManager.js';
import { Physics } from './Physics.js';
import { DragHandler } from './DragHandler.js';
import { BehaviorManager } from '../behaviors/BehaviorManager.js';
import { IdleBehavior } from '../behaviors/IdleBehavior.js';
import { WalkBehavior } from '../behaviors/WalkBehavior.js';
import { SleepBehavior } from '../behaviors/SleepBehavior.js';
import { BarkBehavior } from '../behaviors/BarkBehavior.js';
import { SitBehavior } from '../behaviors/SitBehavior.js';
import { ChaseBehavior } from '../behaviors/ChaseBehavior.js';
import { PoopBehavior } from '../behaviors/PoopBehavior.js';
import { PeeBehavior } from '../behaviors/PeeBehavior.js';
import { CryBehavior } from '../behaviors/CryBehavior.js';
import { FlipBehavior } from '../behaviors/FlipBehavior.js';
import { CrashBehavior } from '../behaviors/CrashBehavior.js';
import { HideEyesBehavior } from '../behaviors/HideEyesBehavior.js';
import { SpeechBubble } from '../ui/SpeechBubble.js';

import { MouseTracker } from '../interactions/MouseTracker.js';
import { PasswordDetector } from '../interactions/PasswordDetector.js';
import { PageDetector } from '../interactions/PageDetector.js';
import { KeyboardTracker } from '../interactions/KeyboardTracker.js';

export class Pet {
  constructor() {
    this.element = document.createElement('img');
    this.element.id = 'shiba-pet';
    this.element.draggable = false;
    document.body.appendChild(this.element);

    this.x = Math.random() * (window.innerWidth - 100);
    this.y = window.innerHeight - 166;
    this.direction = 1;

    this.spriteManager = new SpriteManager();
    this.spriteManager.bind(this.element);

    this.physics = new Physics();
    this.speechBubble = new SpeechBubble(this);
    this.dragHandler = new DragHandler(this);
    this.behaviorManager = new BehaviorManager(this);
    this.mouseTracker = new MouseTracker(this);
    this.passwordDetector = new PasswordDetector(this);
    this.pageDetector = new PageDetector(this);
    this.keyboardTracker = new KeyboardTracker(this);
    this.crashTimer = 0;

    this.registerBehaviors();

    this.element.addEventListener('dblclick', () => this.onDoubleClick());
    this.element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.onChat();
    });
    window.addEventListener('resize', () => this.onResize());

    this.behaviorManager.transition('idle');
    this.pageDetector.check();
    this.startLoop();
  }

  registerBehaviors() {
    this.behaviorManager.register('idle', IdleBehavior);
    this.behaviorManager.register('walk', WalkBehavior);
    this.behaviorManager.register('sleep', SleepBehavior);
    this.behaviorManager.register('bark', BarkBehavior);
    this.behaviorManager.register('sit', SitBehavior);
    this.behaviorManager.register('chase', ChaseBehavior);
    this.behaviorManager.register('poop', PoopBehavior);
    this.behaviorManager.register('pee', PeeBehavior);
    this.behaviorManager.register('cry', CryBehavior);
    this.behaviorManager.register('flip', FlipBehavior);
    this.behaviorManager.register('crash', CrashBehavior);
    this.behaviorManager.register('hideEyes', HideEyesBehavior);
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = now - lastTime;
      lastTime = now;

      if (!this.dragHandler.isDragging) {
        this.behaviorManager.update(dt);
        this.physics.update(this);
        this.mouseTracker.update();
        this.dragHandler.checkLanded();

        // Crash timer: check every 30 minutes, 0.5% chance
        this.crashTimer += dt;
        if (this.crashTimer >= 1800000) {
          this.crashTimer = 0;
          if (Math.random() < 0.005) {
            this.behaviorManager.transition('crash', true);
          }
        }
      }

      this.element.style.left = this.x + 'px';
      this.element.style.top = this.y + 'px';
      this.spriteManager.setDirection(this.direction);
      this.speechBubble.updatePosition();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  onChat() {
    if (this.speechBubble.isInputMode || this.speechBubble.isFocusMode) return;
    this.behaviorManager.pause();
    this.physics.isGrounded = true;
    this.physics.velocityX = 0;
    this.physics.velocityY = 0;
    this.x = window.innerWidth - 186;
    this.y = window.innerHeight - 166;
    this.direction = -1;
    this.spriteManager.current = null;
    this.spriteManager.play('talk');
    this.speechBubble.showMenu(() => {
      this.behaviorManager.resume();
    });
  }

  onDoubleClick() {
    const action = Math.random() > 0.3 ? 'bark' : 'flip';
    this.behaviorManager.transition(action, true);
  }

  onResize() {
    this.x = Math.min(this.x, window.innerWidth - 166);
    this.y = Math.min(this.y, window.innerHeight - 166);
  }

  show() { this.element.style.display = ''; }
  hide() { this.element.style.display = 'none'; }
}
