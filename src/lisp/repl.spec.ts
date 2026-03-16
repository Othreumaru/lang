import { describe, it } from "node:test";
import { createRepl } from "./repl.ts";
import { deepStrictEqual, ok } from "node:assert/strict";

describe("repl", () => {
  it("should evaluate a simple number", () => {
    const repl = createRepl();
    const result = repl("486");
    deepStrictEqual(result, 486);
  });

  it("should evaluate a call expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(+ 137 349)"), 486);
    deepStrictEqual(repl("(- 1000 334)"), 666);
    deepStrictEqual(repl("(* 5 99)"), 495);
    deepStrictEqual(repl("(/ 10 5)"), 2);
    deepStrictEqual(repl("(+ 2.7 10)"), 12.7);
    deepStrictEqual(repl("(+ 21 35 12 7)"), 75);
    deepStrictEqual(repl("(* 25 4 12)"), 1200);
    deepStrictEqual(repl("(not #t)"), false);
  });

  it("should evaluate a nested call expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(+ (* 3 5) (- 10 6))"), 19);
    deepStrictEqual(
      repl(`
    (+ (* 3
           (+ (* 2 4)
              (+ 3 5)))
      (+ (- 10 7)
         6))
    `),
      57,
    );
  });

  it("should evaluate a define expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(define size 2)"), 2);
    deepStrictEqual(repl("size"), 2);
  });

  it("should evaluate a define expression with a call", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(define size (+ 2 3))"), 5);
    deepStrictEqual(repl("size"), 5);
  });

  it("should evaluate a define expression with symbols", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(define pi 3.14159)"), 3.14159);
    deepStrictEqual(repl("(define radius 10"), 10);
    deepStrictEqual(repl("(* pi (* radius radius))"), 314.159);
    deepStrictEqual(repl("(define circumference (* 2 pi radius))"), 62.8318);
    deepStrictEqual(repl("circumference"), 62.8318);
  });

  it("should evaluate a define function expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(define (square x) (* x x))"), undefined);
    deepStrictEqual(repl("(square 5)"), 25);
    deepStrictEqual(repl("(square 10)"), 100);
    deepStrictEqual(
      repl("(define (sum-of-squares x y) (+ (square x) (square y)))"),
      undefined,
    );
    deepStrictEqual(repl("(sum-of-squares 3 4)"), 25);
    deepStrictEqual(repl("(sum-of-squares 5 12)"), 169);
  });

  it("should evaluate an if expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(if #t 1 0)"), 1);
    deepStrictEqual(repl("(if #f 1 0)"), 0);
    deepStrictEqual(repl("(if (= 1 1) 1 0)"), 1);
    deepStrictEqual(repl("(if (= 1 2) 1 0)"), 0);
  });

  it("should evaluate a nested if expression", () => {
    const repl = createRepl();
    deepStrictEqual(
      repl(`
      (define (abs x)
        (if (> x 0)
          x
          (- x)))
    `),
      undefined,
    );
    deepStrictEqual(repl("(abs -5)"), 5);
    deepStrictEqual(repl("(abs 5)"), 5);
  });

  it("should evaluate a cond expression", () => {
    const repl = createRepl();
    deepStrictEqual(
      repl(`
      (define (abs x)
        (cond ((> x 0) x)
          ((= x 0) 0)
          ((< x 0) (- x))))
    `),
      undefined,
    );
    deepStrictEqual(repl("(abs -5)"), 5);
    deepStrictEqual(repl("(abs 5)"), 5);
  });

  it("should evaluate 1.1 excercise", () => {
    const repl = createRepl();
    deepStrictEqual(repl("10"), 10);
    deepStrictEqual(repl("(+ 5 3 4)"), 12);
    deepStrictEqual(repl("(- 9 1)"), 8);
    deepStrictEqual(repl("(/ 6 2)"), 3);
    deepStrictEqual(repl("(+ (* 2 4) (- 4 6))"), 6);
    deepStrictEqual(repl("(define a 3)"), 3);
    deepStrictEqual(repl("(define b (+ a 1))"), 4);
    deepStrictEqual(repl("(+ a b (* a b))"), 19);
    deepStrictEqual(repl("(= a b)"), false);
    deepStrictEqual(repl("(if (and (> b a) (< b (* a b))) b a)"), 4);
    deepStrictEqual(
      repl(`(cond ((= a 4) 6)
                  ((= b 4) (+ 6 7 a))
                  (else 25)
            )`),
      16,
    );
    deepStrictEqual(repl("(+ 2 (if (> b a) b a))"), 6);
    deepStrictEqual(
      repl(`(* (cond ((> a b) a)
                     ((< a b) b)
                     (else -1))
               (+ a 1)
            )`),
      16,
    );
  });

  it("should evaluate 1.2 excercise", () => {
    const repl = createRepl();
    deepStrictEqual(
      repl("(/ (+ 5 4 (- 2(- 3 (+ 6 (/ 4 5))))) (* 3 (- 6 2) (- 2 7)))"),
      -0.24666666666666667,
    );
  });

  it("should evaluate 1.3 excercise", () => {
    const repl = createRepl();
    deepStrictEqual(
      repl(`
      (define (f a b c)
              (cond ((and (<= a b) (<= a c)) (+ (* b b) (* c c)))
                    ((and (<= b a) (<= b c)) (+ (* a a) (* c c)))
                    ((and (<= c a) (<= c b)) (+ (* a a) (* b b)))
              )
      )
    `),
      undefined,
    );
    deepStrictEqual(repl("(f 1 2 3)"), 13);
    deepStrictEqual(repl("(f 3 2 1)"), 13);
    deepStrictEqual(repl("(f 2 3 1)"), 13);
  });

  it("should evaluate 1.4 excercise", () => {
    const repl = createRepl();
    deepStrictEqual(
      repl(`
      (define (a-plus-abs-b a b)
        ((if (> b 0)
          +
          -
        ) a b)
      )
    `),
      undefined,
    );
    deepStrictEqual(repl("(a-plus-abs-b 5 3)"), 8);
    deepStrictEqual(repl("(a-plus-abs-b 5 -3)"), 8);
  });

  it("should evaluate 1.5 excercise", () => {
    const repl = createRepl();
    deepStrictEqual(
      repl(`
      (define (p) (p))
    `),
      undefined,
    );
    deepStrictEqual(
      repl(`
      (define (test x y)
        (if (= x 0)
          0
          y
        )
      )
    `),
      undefined,
    );
    try {
      repl("(test 0 (p))");
    } catch (error: unknown) {
      ok(error instanceof Error);
      deepStrictEqual(error.message, "Maximum call stack size exceeded");
    }
  });

  it("should evaluate sqrt", () => {
    const repl = createRepl();
    repl(`
      (define (sqrt-iter guess x)
        (if (good-enough? guess x)
            guess
            (sqrt-iter (improve guess x) x)))
    `);
    repl(`
      (define (improve guess x)
        (average guess (/ x guess)))
    `);
    repl(`
      (define (average x y)
        (/ (+ x y) 2))
    `);
    repl(`
      (define (good-enough? guess x)
        (< (abs (- (square guess) x)) 0.001))
    `);
    repl(`
      (define (square x)
        (* x x))
    `);
    repl(`
      (define (sqrt x)
        (sqrt-iter 1.0 x))
    `);
    deepStrictEqual(repl("(sqrt 9)"), 3.00009155413138);
    deepStrictEqual(repl("(sqrt (+ 100 37))"), 11.704699917758145);
    deepStrictEqual(repl("(sqrt (+ (sqrt 2) (sqrt 3)))"), 1.7739279023207892);
    deepStrictEqual(repl("(square (sqrt 1000))"), 1000.000369924366);
  });
});
