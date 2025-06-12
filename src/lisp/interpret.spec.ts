import { describe, it } from "node:test";
import { scan } from "./scan.ts";
import { parse } from "./parse.ts";
import { interpretAll } from "./interpret.ts";
import { deepStrictEqual } from "node:assert/strict";

describe("interpretAll", () => {
  it("should interpret a simple number", () => {
    const input = "486";
    const tokens = scan(input);
    const ast = parse(tokens);
    const result = interpretAll(ast);
    deepStrictEqual(result, 486);
  });

  it("should interpret a call expression", () => {
    const input = "(+ 137 349)";
    const tokens = scan(input);
    const ast = parse(tokens);
    const result = interpretAll(ast);
    deepStrictEqual(result, 486);
  });

  it("should interpret a nested call expression", () => {
    const input = "(+ (* 3 5) (- 10 6))";
    const tokens = scan(input);
    const ast = parse(tokens);
    const result = interpretAll(ast);
    deepStrictEqual(result, 19);
  });

  it("should interpret a define expression", () => {
    const input = `
      (define x 42)
    `;
    const tokens = scan(input);
    const ast = parse(tokens);
    const result = interpretAll(ast);
    deepStrictEqual(result, 42);
  });
});
