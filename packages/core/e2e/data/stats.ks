from "math" import { sqrt };

const add = (a, b) => (a + b);
const square = (x) => (x * x);

const sum = (xs) => xs.reduce(add, 0);

const mean = (xs) => (sum(xs) / xs.length);

const variance = (xs) =>
  let (m = mean(xs)) (
    sum(xs.map((x) => square((x - m)))) / xs.length
  );

const stddev = (xs) => sqrt(variance(xs));

const data = [2, 4, 4, 4, 6];
