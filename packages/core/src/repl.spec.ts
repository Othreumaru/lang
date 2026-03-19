import { describe, it } from "node:test";
import { createRepl } from "./repl.ts";
import { deepStrictEqual, throws } from "node:assert/strict";

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
    repl(
      "const abs = (x) => if ((x < 0)) { return (0 - x); } else { return x; };",
    );
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
    repl(
      "const factorial = (n) => if ((n < 1)) { return 1; } else { return (n * factorial((n - 1))); };",
    );
    deepStrictEqual(repl("factorial(5)"), 120);
  });

  it("should import and use stdlib functions", () => {
    const repl = createRepl();
    repl('from "math" import { floor, sqrt };');
    deepStrictEqual(repl("floor(3.7)"), 3);
    deepStrictEqual(repl("sqrt(9)"), 3);
  });

  it("should throw when importing an unknown module", () => {
    const repl = createRepl();
    throws(
      () => repl('from "unknown" import { foo };'),
      /Module "unknown" not found/,
    );
  });

  it("should throw when importing a name not in the module", () => {
    const repl = createRepl();
    throws(
      () => repl('from "math" import { doesNotExist };'),
      /"doesNotExist" is not exported/,
    );
  });

  it("should return null from if without else when condition is false", () => {
    const repl = createRepl();
    deepStrictEqual(repl("if (false) { return 1; }"), null);
  });

  it("should throw when calling an undefined function", () => {
    const repl = createRepl();
    throws(() => repl("unknownFn(1)"), /is not defined/);
  });

  it("should throw when referencing an undefined symbol", () => {
    const repl = createRepl();
    throws(() => repl("undefinedVar"), /is not defined/);
  });

  it("should call wrapped stdlib lambda functions", () => {
    const repl = createRepl();
    repl('from "math" import { min, max };');
    deepStrictEqual(repl("min(3, 1, 2)"), 1);
    deepStrictEqual(repl("max(3, 1, 2)"), 3);
  });

  it("should call stdlib string functions", () => {
    const repl = createRepl();
    repl(
      'from "string" import { length, toUpperCase, toLowerCase, trim, includes, startsWith, endsWith, slice, concat, repeat, indexOf, replace };',
    );
    deepStrictEqual(repl('length("hello")'), 5);
    deepStrictEqual(repl('toUpperCase("hi")'), "HI");
    deepStrictEqual(repl('toLowerCase("HI")'), "hi");
    deepStrictEqual(repl('trim("  hi  ")'), "hi");
    deepStrictEqual(repl('includes("hello", "ell")'), true);
    deepStrictEqual(repl('startsWith("hello", "hel")'), true);
    deepStrictEqual(repl('endsWith("hello", "llo")'), true);
    deepStrictEqual(repl('slice("hello", 1, 3)'), "el");
    deepStrictEqual(repl('concat("foo", "bar")'), "foobar");
    deepStrictEqual(repl('repeat("ha", 3)'), "hahaha");
    deepStrictEqual(repl('indexOf("hello", "llo")'), 2);
    deepStrictEqual(repl('replace("hello", "llo", "y")'), "hey");
  });

  it("should call console.log from stdlib", () => {
    const repl = createRepl();
    repl('from "console" import { log };');
    repl('log("coverage test")');
  });

  it("should evaluate defaultEnv operators: abs and not", () => {
    const repl = createRepl();
    deepStrictEqual(repl("abs(-5)"), 5);
    deepStrictEqual(repl("not(true)"), false);
    deepStrictEqual(repl("not(false)"), true);
  });

  it("should create and access object properties", () => {
    const repl = createRepl();
    repl("const point = { x: 3, y: 4 };");
    deepStrictEqual(repl("point.x"), 3);
    deepStrictEqual(repl("point.y"), 4);
  });

  it("should evaluate object property that is an expression", () => {
    const repl = createRepl();
    repl("const rect = { area: (3 * 4) };");
    deepStrictEqual(repl("rect.area"), 12);
  });

  it("should access property on an inline object literal", () => {
    const repl = createRepl();
    deepStrictEqual(repl("{ name: 42 }.name"), 42);
  });

  it("should support chained member access", () => {
    const repl = createRepl();
    repl("const a = { b: { c: 99 } };");
    deepStrictEqual(repl("a.b.c"), 99);
  });

  it("should throw when accessing a non-existent property", () => {
    const repl = createRepl();
    repl("const p = { x: 1 };");
    throws(() => repl("p.z"), /is not a property/);
  });
});
