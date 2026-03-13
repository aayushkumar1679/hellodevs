export const POLYGLOT_MOTION_CSS = `
@keyframes polyglot-float {
  0%, 100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-14px);
  }
}

@keyframes polyglot-pulse-soft {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.92;
    transform: scale(1.02);
  }
}

@keyframes polyglot-rise-in {
  0% {
    opacity: 0;
    transform: translateY(28px) scale(0.98);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes polyglot-orbit {
  0%, 100% {
    transform: perspective(1400px) rotateX(12deg) rotateY(-10deg);
  }

  50% {
    transform: perspective(1400px) rotateX(16deg) rotateY(12deg);
  }
}
`.trim();

export const POLYGLOT_INTERACTION_TRANSITION =
  "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease, filter 220ms ease";
