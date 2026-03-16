import { describe, it } from "node:test";
import { parse } from "./parse.ts";
import { deepStrictEqual, throws } from "node:assert/strict";
import type { AST } from "../ast.ts";
import type { Token } from "./token.ts";

describe("parse", () => {
  it("should parse a from/import expression", () => {
    deepStrictEqual(
      parse([
        { type: "LeftBracket" },
        { type: "Symbol", value: "from" },
        { type: "String", value: "math" },
        { type: "Symbol", value: "import" },
        { type: "Symbol", value: "floor" },
        { type: "Symbol", value: "sqrt" },
        { type: "RightBracket" },
        { type: "EOL" },
      ]),
      [
        { type: "ImportExpression", module: "math", names: ["floor", "sqrt"] },
      ] satisfies AST[],
    );
  });

  it("should throw when 'import' keyword is missing in from expression", () => {
    throws(
      () =>
        parse([
          { type: "LeftBracket" },
          { type: "Symbol", value: "from" },
          { type: "String", value: "math" },
          { type: "Symbol", value: "floor" },
          { type: "RightBracket" },
          { type: "EOL" },
        ]),
      /Expected 'import'/,
    );
  });

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

  it("should parse a call expression with expression calle", () => {
    const tokens: Token[] = [
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
    const ast = parse(tokens);
    const expectedAst: AST[] = [
      {
        type: "CallExpression",
        callee: {
          type: "IfExpression",
          condition: {
            type: "CallExpression",
            callee: ">",
            args: [
              { type: "SymbolExpression", name: "b" },
              { type: "LiteralExpression", value: 0 },
            ],
          },
          thenBranch: {
            type: "SymbolExpression",
            name: "+",
          },
          elseBranch: {
            type: "SymbolExpression",
            name: "-",
          },
        },
        args: [
          { type: "SymbolExpression", name: "a" },
          { type: "SymbolExpression", name: "b" },
        ],
      },
    ];
    deepStrictEqual(ast, expectedAst);
  });

  it("should throw on unexpected end of input", () => {
    throws(() => parse([]), /Unexpected end of input/);
  });

  it("should parse an empty list as null", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    deepStrictEqual(parse(tokens), [
      { type: "LiteralExpression", value: null },
    ]);
  });

  it("should throw when define name is not a symbol", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "define" },
      { type: "Number", value: 42 },
      { type: "Number", value: 1 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    throws(() => parse(tokens), /Expected a symbol for the function name/);
  });

  it("should throw when call expression callee is not a symbol", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Number", value: 42 },
      { type: "Number", value: 1 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    throws(
      () => parse(tokens),
      /Expected a symbol for the function name or expression/,
    );
  });

  it("should throw on unexpected token type in literal", () => {
    const tokens: Token[] = [{ type: "RightBracket" }, { type: "EOL" }];
    throws(() => parse(tokens), /Unexpected token type/);
  });

  it("should throw when cond clause is missing closing bracket", () => {
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "cond" },
      { type: "LeftBracket" },
      { type: "Boolean", value: true },
      { type: "Number", value: 1 },
      { type: "Number", value: 2 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    throws(() => parse(tokens), /Expected closing bracket for cond clause/);
  });

  it("should throw when consumeTokenOrThrow finds wrong token type", () => {
    // (define (42 x) body) — LeftBracket seen so consumeDefineFunctionExpression
    // is called, which calls consumeTokenOrThrow("Symbol") for name but finds Number
    const tokens: Token[] = [
      { type: "LeftBracket" },
      { type: "Symbol", value: "define" },
      { type: "LeftBracket" },
      { type: "Number", value: 42 },
      { type: "Symbol", value: "x" },
      { type: "RightBracket" },
      { type: "Number", value: 1 },
      { type: "RightBracket" },
      { type: "EOL" },
    ];
    throws(
      () => parse(tokens),
      /Expected token of type Symbol, but found none/,
    );
  });
});
