from "math" import { min, max, sign, abs };

const clamp = (x, lo, hi) => min(max(x, lo), hi);
const isPositive = (x) => (sign(x) > 0);
const diff = (a, b) => abs((a - b));
