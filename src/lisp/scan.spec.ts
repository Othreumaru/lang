import { describe, it } from "node:test";
import { scan } from "./scan.ts";
import { deepStrictEqual } from "node:assert/strict";

describe("scan", () => {
  it("should tokenize a simple number", () => {
    const input = "42";
    const tokens = scan(input);
    const expectedTokens = [{ type: "Number", value: 42 }, { type: "EOL" }];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a negative number", () => {
    const input = "-42";
    const tokens = scan(input);
    const expectedTokens = [{ type: "Number", value: -42 }, { type: "EOL" }];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a floating number", () => {
    const input = "3.14";
    const tokens = scan(input);
    const expectedTokens = [{ type: "Number", value: 3.14 }, { type: "EOL" }];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a simple symbol", () => {
    const input = "foo";
    const tokens = scan(input);
    const expectedTokens = [{ type: "Symbol", value: "foo" }, { type: "EOL" }];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a simple string", () => {
    const input = '"hello"';
    const tokens = scan(input);
    const expectedTokens = [
      { type: "String", value: "hello" },
      { type: "EOL" },
    ];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a simple boolean", () => {
    const input = "#t";
    const tokens = scan(input);
    const expectedTokens = [{ type: "Boolean", value: true }, { type: "EOL" }];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a simple list", () => {
    const input = "(1 2 3)";
    const tokens = scan(input);
    const expectedTokens = [
      { type: "LeftBracket" },
      { type: "Number", value: 1 },
      { type: "Number", value: 2 },
      { type: "Number", value: 3 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a nested list", () => {
    const input = "(1 (2 3) 4)";
    const tokens = scan(input);
    const expectedTokens = [
      { type: "LeftBracket" },
      { type: "Number", value: 1 },
      { type: "LeftBracket" },
      { type: "Number", value: 2 },
      { type: "Number", value: 3 },
      { type: "RightBracket" },
      { type: "Number", value: 4 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a call expression", () => {
    const input = "(<= 1 2)";
    const tokens = scan(input);
    const expectedTokens = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "<=" },
      { type: "Number", value: 1 },
      { type: "Number", value: 2 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize multi line expression", () => {
    const input = `
      (define (square x)
        (* x x))
    `;
    const tokens = scan(input);
    const expectedTokens = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "define" },
      { type: "LeftBracket" },
      { type: "Symbol", value: "square" },
      { type: "Symbol", value: "x" },
      { type: "RightBracket" },
      { type: "LeftBracket" },
      { type: "Symbol", value: "*" },
      { type: "Symbol", value: "x" },
      { type: "Symbol", value: "x" },
      { type: "RightBracket" },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    deepStrictEqual(tokens, expectedTokens);
  });

  it("should tokenize a call expression with expression calle", () => {
    const input = `
      ((if (> b 0)
          +
          -
        ) a b)
    `;
    const tokens = scan(input);
    const expectedTokens = [
      { type: "LeftBracket" },
      { type: "LeftBracket" },
      { type: "Symbol", value: "if" },
      { type: "LeftBracket" },
      { type: "Symbol", value: ">" },
      { type: "Symbol", value: "b" },
      { type: "Number", value: 0 },
      { type: "RightBracket" },
      { type: "Symbol", value: "+" },
      { type: "Symbol", value: "-" },
      { type: "RightBracket" },
      { type: "Symbol", value: "a" },
      { type: "Symbol", value: "b" },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    deepStrictEqual(tokens, expectedTokens);
  });
});
