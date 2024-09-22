export const linear = (r) => r;

export const easeInSine    = (r) => -1 * Math.cos(r * (Math.PI / 2)) + 1;
export const easeOutSine   = (r) => Math.sin(r * (Math.PI / 2));
export const easeInOutSine = (r) => -0.5 * (Math.cos(Math.PI * r) - 1);

export const easeInQuad    = (r) => r * r;
export const easeOutQuad   = (r) => r * (2 - r);
export const easeInOutQuad = (r) => r < 0.5 ? 2 * r * r : -1 + (4 - 2 * r) * r;

export const pingPongFactory = (intFn) => (r) => intFn(r < 0.5 ? 2 * r : 1 - 2 * (r - 0.5));

export const rgb2num = ([r, g, b]) => (r << 16) | (g << 8) | b;
export const num2rgb = (num) => [
  (num >> 16) & 0xff,
  (num >>  8) & 0xff,
   num        & 0xff,
];
