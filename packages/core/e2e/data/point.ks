from "math" import { sqrt };

const point = (x, y) => { x: x, y: y };

const magnitude = (p) => sqrt(((p.x * p.x) + (p.y * p.y)));

const origin = point(0, 0);
const p = point(3, 4);
