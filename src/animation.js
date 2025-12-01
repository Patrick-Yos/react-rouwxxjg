// Cosmic Syndicate & Inquisitional Dashboard - Animation System
// Roll20-grade animation controller with fallbacks

let animeLib = null;

// Safe animation wrapper that works even if anime.js fails to load
const safeAnime = (targets, props) => {
  // If anime.js is available, use it
  if (typeof window !== 'undefined' && window.anime) {
    return window.anime({ targets, ...props });
  }
  
  // Fallback: simple CSS transitions
  if (typeof document !== 'undefined') {
    const elements = typeof targets === 'string' 
      ? document.querySelectorAll(targets) 
      : targets;
    
    elements.forEach(el => {
      if (props.opacity !== undefined) el.style.opacity = props.opacity;
      if (props.translateX !== undefined) el.style.transform = `translateX(${props.translateX}px)`;
      if (props.translateY !== undefined) el.style.transform += ` translateY(${props.translateY}px)`;
      if (props.scale !== undefined) el.style.transform += ` scale(${props.scale})`;
      if (props.color !== undefined) el.style.color = props.color;
    });
  }
  
  // Return a thenable to maintain API compatibility
  return { finished: Promise.resolve() };
};

export const Anima = {
  // Page entry animations
  entry: (targets, delay = 0) => safeAnime(targets, {
    opacity: [0, 1],
    translateY: [30, 0],
    scale: [0.95, 1],
    duration: 600,
    delay,
    easing: 'easeOutCubic'
  }),

  // Combat shake effect
  combat: (targets, intensity = 1) => safeAnime(targets, {
    keyframes: [
      { translateX: -3 * intensity, rotateZ: -2 * intensity },
      { translateX: 3 * intensity, rotateZ: 2 * intensity },
      { translateX: -3 * intensity, rotateZ: -2 * intensity },
      { translateX: 0, rotateZ: 0 }
    ],
    duration: 300,
    easing: 'easeInOutQuad'
  }),

  // Exterminatus countdown
  exterminatus: (onComplete) => {
    if (typeof window !== 'undefined' && window.anime) {
      return window.anime.timeline({
        easing: 'easeOutExpo',
        complete: onComplete
      });
    }
    // Fallback: just call onComplete after delay
    setTimeout(onComplete, 3000);
    return { add: () => {} };
  },

  // Corruption filter
  corruption: (targets, intensity) => safeAnime(targets, {
    filter: `hue-rotate(${intensity * 3.6}deg) brightness(${1 + intensity / 200})`,
    duration: 2000,
    easing: 'easeInOutQuad'
  }),

  // Weapon fire flash
  weaponFire: (targets) => safeAnime(targets, {
    keyframes: [
      { scale: 1, opacity: 1, boxShadow: '0 0 0 rgba(255,0,0,0)' },
      { scale: 1.2, opacity: 0.8, boxShadow: '0 0 20px rgba(255,0,0,0.8)' },
      { scale: 1, opacity: 1, boxShadow: '0 0 0 rgba(255,0,0,0)' }
    ],
    duration: 200
  }),

  // Pulse effect
  pulse: (targets) => safeAnime(targets, {
    scale: [1, 1.05, 1],
    duration: 1000,
    loop: true,
    easing: 'easeInOutQuad'
  }),

  // Shake effect
  shake: (targets, intensity = 5) => safeAnime(targets, {
    translateX: [
      { value: -intensity, duration: 50 },
      { value: intensity, duration: 50 },
      { value: -intensity, duration: 50 },
      { value: 0, duration: 50 }
    ],
    loop: 3
  }),

  // Notification toast
  notify: (message, type = 'info') => {
    if (typeof document === 'undefined') return;

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[300] px-4 py-2 font-tech text-xs border max-w-xs transform translate-x-full opacity-0 ${
      type === 'success' ? 'border-green-500 text-green-400 bg-black/95' :
      type === 'error' ? 'border-red-500 text-red-400 bg-black/95' :
      type === 'warning' ? 'border-yellow-500 text-yellow-400 bg-black/95' :
      'border-[#c5a059] text-[#c5a059] bg-black/95'
    } shadow-[0_0_20px_rgba(0,0,0,0.8)]`;
    
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    safeAnime(toast, {
      translateX: [300, 0],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic'
    });

    // Auto remove
    setTimeout(() => {
      safeAnime(toast, {
        translateX: [0, 300],
        opacity: [1, 0],
        duration: 300,
        complete: () => toast.remove()
      });
    }, 3000);
  }
};
