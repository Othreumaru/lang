const square = (x) => (x * x);

const abs = (x) => if ((x < 0)) { return (0 - x); } else { return x; };

const factorial = (n) => if ((n < 1)) { return 1; } else { return (n * factorial((n - 1))); };
