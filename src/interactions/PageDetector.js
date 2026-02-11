export class PageDetector {
  constructor(pet) {
    this.pet = pet;
    this.reacted = false;
  }

  check() {
    if (this.reacted) return;
    const host = location.hostname.replace('www.', '');

    const reactions = {
      'twitter.com':  { msg: 'Time to tweet!', behavior: 'bark' },
      'x.com':        { msg: 'Time to tweet!', behavior: 'bark' },
      'youtube.com':  { msg: 'Watching videos?', behavior: 'sit' },
      'github.com':   { msg: 'Coding time!', behavior: 'idle' },
      'google.com':   { msg: 'Looking for something?', behavior: 'bark' },
      'netflix.com':  { msg: 'Can I watch too?', behavior: 'sit' },
      'reddit.com':   { msg: 'Time flies on Reddit...', behavior: 'bark' },
    };

    for (const [domain, reaction] of Object.entries(reactions)) {
      if (host === domain || host.endsWith('.' + domain)) {
        this.reacted = true;
        setTimeout(() => {
          this.pet.speechBubble.show(reaction.msg);
          if (reaction.behavior) {
            this.pet.behaviorManager.transition(reaction.behavior);
          }
        }, 2000);
        break;
      }
    }
  }
}
