export class Effects {
  static spawnPoop(x, y) {
    const poop = document.createElement('div');
    poop.textContent = '\uD83D\uDCA9';
    poop.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 24px;
      z-index: 999997;
      transition: opacity 1s;
      pointer-events: none;
    `;
    document.body.appendChild(poop);
    setTimeout(() => { poop.style.opacity = '0'; }, 9000);
    setTimeout(() => { poop.remove(); }, 10000);
  }

  static spawnPee(x, y, direction) {
    for (let i = 0; i < 4; i++) {
      const drop = document.createElement('div');
      drop.textContent = '\uD83D\uDCA7';
      drop.style.cssText = `
        position: fixed;
        left: ${x + (direction * i * 5)}px;
        top: ${y + 20}px;
        font-size: ${10 + Math.random() * 8}px;
        z-index: 999997;
        pointer-events: none;
        animation: shiba-drip ${1 + Math.random()}s ease-in forwards;
        animation-delay: ${i * 0.2}s;
      `;
      document.body.appendChild(drop);
      setTimeout(() => drop.remove(), 5000);
    }
  }

  static spawnCrack(x, y) {
    const crack = document.createElement('div');
    crack.innerHTML = '\uD83D\uDCA5';
    crack.style.cssText = `
      position: fixed;
      left: ${x - 30}px;
      top: ${y - 10}px;
      font-size: 64px;
      z-index: 999997;
      pointer-events: none;
      transition: opacity 1s;
    `;
    document.body.appendChild(crack);
    setTimeout(() => { crack.style.opacity = '0'; }, 2000);
    setTimeout(() => { crack.remove(); }, 3000);
  }

  static shakeScreen() {
    document.body.style.animation = 'shiba-shake 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }
}
