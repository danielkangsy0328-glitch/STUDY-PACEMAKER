import confetti from 'canvas-confetti';

export function triggerTaskConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#006b58', '#48ddbc', '#67f7d5', '#d4e3ff', '#005da7', '#f7e61a']
  });
}

export function triggerGoalConfetti() {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: ['#005da7', '#006b58', '#f7e61a', '#ffb59f', '#67f7d5']
    });
  }, 250);
}
