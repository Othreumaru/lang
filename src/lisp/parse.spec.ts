import { describe, it } from "node:test";
import { parse } from "./parse.ts";
import { deepStrictEqual } from "node:assert/strict";
import type { AST } from "../ast.ts";
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

  it("should parse a define function expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "define" },
      { type: "LeftBracket" },
      { type: "Symbol", value: "foo" },
      { type: "Symbol", value: "bar" },
      { type: "RightBracket" },
      { type: "Number", value: 42 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "DefineFunctionExpression",
        name: "foo",
        params: ["bar"],
        body: { type: "LiteralExpression", value: 42 },
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a let expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "let" },
      { type: "LeftBracket" },
      { type: "Symbol", value: "x" },
      { type: "Number", value: 10 },
      { type: "RightBracket" },
      { type: "Number", value: 20 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "LetExpression",
        bindings: [
          { name: "x", expression: { type: "LiteralExpression", value: 10 } },
        ],
        body: { type: "LiteralExpression", value: 20 },
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse an if expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "if" },
      { type: "Boolean", value: true },
      { type: "Number", value: 1 },
      { type: "Number", value: 0 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "IfExpression",
        condition: { type: "LiteralExpression", value: true },
        thenBranch: { type: "LiteralExpression", value: 1 },
        elseBranch: { type: "LiteralExpression", value: 0 },
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a cond expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "cond" },
      { type: "LeftBracket" },
      { type: "Boolean", value: true },
      { type: "Number", value: 1 },
      { type: "RightBracket" },
      { type: "LeftBracket" },
      { type: "Boolean", value: false },
      { type: "Number", value: 0 },
      { type: "RightBracket" },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "CondExpression",
        clauses: [
          {
            condition: { type: "LiteralExpression", value: true },
            thenBranch: { type: "LiteralExpression", value: 1 },
          },
          {
            condition: { type: "LiteralExpression", value: false },
            thenBranch: { type: "LiteralExpression", value: 0 },
          },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse a cond expression with else", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "cond" },
      { type: "LeftBracket" },
      { type: "Boolean", value: false },
      { type: "Number", value: 1 },
      { type: "RightBracket" },
      { type: "LeftBracket" },
      { type: "Boolean", value: false },
      { type: "Number", value: 0 },
      { type: "RightBracket" },
      { type: "LeftBracket" }, // else clause
      { type: "Symbol", value: "else" },
      { type: "Number", value: -1 },
      { type: "RightBracket" },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "CondExpression",
        clauses: [
          {
            condition: { type: "LiteralExpression", value: false },
            thenBranch: { type: "LiteralExpression", value: 1 },
          },
          {
            condition: { type: "LiteralExpression", value: false },
            thenBranch: { type: "LiteralExpression", value: 0 },
          },
          {
            condition: { type: "SymbolExpression", name: "else" },
            thenBranch: { type: "LiteralExpression", value: -1 },
          },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse an and expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "and" },
      { type: "Boolean", value: true },
      { type: "Boolean", value: false },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "AndExpression",
        conditions: [
          { type: "LiteralExpression", value: true },
          { type: "LiteralExpression", value: false },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should parse an or expression", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "or" },
      { type: "Boolean", value: true },
      { type: "Boolean", value: false },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "OrExpression",
        conditions: [
          { type: "LiteralExpression", value: true },
          { type: "LiteralExpression", value: false },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });
});
