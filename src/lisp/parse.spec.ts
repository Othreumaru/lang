import { describe, it } from "node:test";
import { scan } from "./scan.ts";
import { parse } from "./parse.ts";
import { deepStrictEqual } from "node:assert/strict";
import type { AST } from "./ast.ts";

describe("parse", () => {
  it("should parse a simple number", () => {
    const input = "42";
    const tokens = scan(input);
    const ast = parse(tokens);
    const expectedAst: AST[] = [{ type: "LiteralExpression", value: 42 }];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a simple symbol", () => {
    const input = "foo";
    const tokens = scan(input);
    const ast = parse(tokens);
    const expectedAst: AST[] = [{ type: "SymbolExpression", name: "foo" }];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a simple string", () => {
    const input = '"hello world"';
    const tokens = scan(input);
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      { type: "LiteralExpression", value: "hello world" },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a simple boolean", () => {
    const input = "#t";
    const tokens = scan(input);
    const ast = parse(tokens);
    const expectedAst: AST[] = [{ type: "LiteralExpression", value: true }];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a call expression", () => {
    const input = "(+ 1 2)";
    const tokens = scan(input);
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
    const input = "(+ 1 (* 2 3))";
    const tokens = scan(input);
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
    const input = "(define x 42)";
    const tokens = scan(input);
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
