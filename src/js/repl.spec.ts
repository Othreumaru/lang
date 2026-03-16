import { describe, it } from "node:test";
import { createRepl } from "./repl.ts";
import { deepStrictEqual } from "node:assert/strict";

describe("js repl", () => {
  it("should evaluate a number literal", () => {
    const repl = createRepl();
    deepStrictEqual(repl("486"), 486);
  });

  it("should evaluate a string literal", () => {
    const repl = createRepl();
    deepStrictEqual(repl('"hello"'), "hello");
  });

  it("should evaluate a boolean literal", () => {
    const repl = createRepl();
    deepStrictEqual(repl("true"), true);
    deepStrictEqual(repl("false"), false);
  });

  it("should evaluate arithmetic expressions", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(1 + 2)"), 3);
    deepStrictEqual(repl("(10 - 4)"), 6);
    deepStrictEqual(repl("(3 * 5)"), 15);
    deepStrictEqual(repl("(10 / 2)"), 5);
  });

  it("should evaluate a nested arithmetic expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("((3 * 5) + (10 - 6))"), 19);
  });

  it("should evaluate a comparison expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(10 > 5)"), true);
    deepStrictEqual(repl("(10 < 5)"), false);
    deepStrictEqual(repl("(5 >= 5)"), true);
    deepStrictEqual(repl("(5 <= 4)"), false);
  });

  it("should evaluate a const declaration", () => {
    const repl = createRepl();
    deepStrictEqual(repl("const x = 42;"), 42);
    deepStrictEqual(repl("x"), 42);
  });

  it("should evaluate a const declaration with an expression", () => {
    const repl = createRepl();
    deepStrictEqual(repl("const x = (2 + 3);"), 5);
    deepStrictEqual(repl("x"), 5);
  });

  it("should evaluate an arrow function definition and call", () => {
    const repl = createRepl();
    deepStrictEqual(repl("const square = (x) => (x * x);"), undefined);
    deepStrictEqual(repl("square(5)"), 25);
    deepStrictEqual(repl("square(10)"), 100);
  });

  it("should evaluate an arrow function with if body", () => {
    const repl = createRepl();
    repl("const abs = (x) => if ((x < 0)) { return (0 - x); } else { return x; };");
    deepStrictEqual(repl("abs(-5)"), 5);
    deepStrictEqual(repl("abs(5)"), 5);
  });

  it("should evaluate && as and", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(true && false)"), false);
    deepStrictEqual(repl("(true && true)"), true);
  });

  it("should evaluate || as or", () => {
    const repl = createRepl();
    deepStrictEqual(repl("(false || true)"), true);
    deepStrictEqual(repl("(false || false)"), false);
  });

  it("should maintain state across calls", () => {
    const repl = createRepl();
    repl("const x = 10;");
    repl("const double = (n) => (n * 2);");
    deepStrictEqual(repl("double(x)"), 20);
  });

  it("should support recursive functions", () => {
    const repl = createRepl();
    repl("const factorial = (n) => if ((n < 1)) { return 1; } else { return (n * factorial((n - 1))); };");
    deepStrictEqual(repl("factorial(5)"), 120);
  });
});
