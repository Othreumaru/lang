import { describe, it } from "node:test";
import { parse } from "./parse.ts";
import { deepStrictEqual } from "node:assert/strict";
import type { AST } from "./ast.ts";
import type { Token } from "./token.ts";

describe("parse", () => {
  it("should parse a simple number", () => {
    const tokens: Token[] = [{ type: "Number", value: 42 }, { type: "EOL" }];
    const ast = parse(tokens);
    const expectedAst: AST[] = [{ type: "LiteralExpression", value: 42 }];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a simple symbol", () => {
    const tokens: Token[] = [{ type: "Symbol", value: "foo" }, { type: "EOL" }];
    const ast = parse(tokens);
    const expectedAst: AST[] = [{ type: "SymbolExpression", name: "foo" }];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a simple string", () => {
    const tokens: Token[] = [
      { type: "String", value: "hello world" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      { type: "LiteralExpression", value: "hello world" },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a simple boolean", () => {
    const tokens: Token[] = [{ type: "Boolean", value: true }, { type: "EOL" }];
    const ast = parse(tokens);
    const expectedAst: AST[] = [{ type: "LiteralExpression", value: true }];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a call expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "+" },
      { type: "Number", value: 1 },
      { type: "Number", value: 2 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "CallExpression",
        callee: "+",
        args: [
          { type: "LiteralExpression", value: 1 },
          { type: "LiteralExpression", value: 2 },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a nested call expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "+" },
      { type: "Number", value: 1 },
      { type: "LeftBracket" },
      { type: "Symbol", value: "*" },
      { type: "Number", value: 2 },
      { type: "Number", value: 3 },
      { type: "RightBracket" },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "CallExpression",
        callee: "+",
        args: [
          { type: "LiteralExpression", value: 1 },
          {
            type: "CallExpression",
            callee: "*",
            args: [
              { type: "LiteralExpression", value: 2 },
              { type: "LiteralExpression", value: 3 },
            ],
          },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a define expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "define" },
      { type: "Symbol", value: "x" },
      { type: "Number", value: 42 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "DefineExpression",
        name: "x",
        expression: { type: "LiteralExpression", value: 42 },
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });
});
