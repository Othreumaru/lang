from "math" import { sqrt };

const sum = (xs) => xs[0] + xs[1] + xs[2] + xs[3] + xs[4];

const mean = (xs) => (sum(xs) / 5);

const variance = (xs) =>
  let (m = mean(xs)) (
    ((xs[0] - m) * (xs[0] - m) +
     (xs[1] - m) * (xs[1] - m) +
     (xs[2] - m) * (xs[2] - m) +
     (xs[3] - m) * (xs[3] - m) +
     (xs[4] - m) * (xs[4] - m)) / 5
  );

const stddev = (xs) => sqrt(variance(xs));

const data = [2, 4, 4, 4, 6];
