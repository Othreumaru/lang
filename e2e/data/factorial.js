const square = (x) => (x * x);

function abs(x) { return if ((x < 0)) { return (0 - x); } else { return x; } }

function factorial(n) { return if ((n < 1)) { return 1; } else { return (n * factorial((n - 1))); } }
