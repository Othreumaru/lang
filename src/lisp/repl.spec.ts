import { describe, it } from "node:test";
import { createRepl } from "./repl.ts";
import { deepStrictEqual } from "node:assert/strict";

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
      57
    );
  });

  it("should evaluate a define expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(define size 2)"), 2);
    deepStrictEqual(repl("size"), 2);
  });
});
