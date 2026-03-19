import { describe, it } from "node:test";
import { deepStrictEqual, throws } from "node:assert/strict";
import { scan } from "./scan.ts";
import { parse } from "./parse.ts";
import type { AST } from "./ast.ts";

describe("parse", () => {
  describe("literals", () => {
    it("should parse a number", () => {
      deepStrictEqual(parse(scan("42")), [
        { type: "LiteralExpression", value: 42 },
      ] satisfies AST[]);
    });

    it("should parse a string", () => {
      deepStrictEqual(parse(scan('"hello"')), [
        { type: "LiteralExpression", value: "hello" },
      ] satisfies AST[]);
    });

    it("should parse true", () => {
      deepStrictEqual(parse(scan("true")), [
        { type: "LiteralExpression", value: true },
      ] satisfies AST[]);
    });

    it("should parse false", () => {
      deepStrictEqual(parse(scan("false")), [
        { type: "LiteralExpression", value: false },
      ] satisfies AST[]);
    });
  });

  describe("identifiers", () => {
    it("should parse an identifier as a SymbolExpression", () => {
      deepStrictEqual(parse(scan("x")), [
        { type: "SymbolExpression", name: "x" },
      ] satisfies AST[]);
    });
  });

  describe("infix expressions", () => {
    it("should parse (1 + 2)", () => {
      deepStrictEqual(parse(scan("(1 + 2)")), [
        {
          type: "CallExpression",
          callee: "+",
          args: [
            { type: "LiteralExpression", value: 1 },
            { type: "LiteralExpression", value: 2 },
          ],
        },
      ] satisfies AST[]);
    });

    it("should parse (x - y)", () => {
      deepStrictEqual(parse(scan("(x - y)")), [
        {
          type: "CallExpression",
          callee: "-",
          args: [
            { type: "SymbolExpression", name: "x" },
            { type: "SymbolExpression", name: "y" },
          ],
        },
      ] satisfies AST[]);
    });

    it("should parse nested ((1 + 2) * 3)", () => {
      deepStrictEqual(parse(scan("((1 + 2) * 3)")), [
        {
          type: "CallExpression",
          callee: "*",
          args: [
            {
              type: "CallExpression",
              callee: "+",
              args: [
                { type: "LiteralExpression", value: 1 },
                { type: "LiteralExpression", value: 2 },
              ],
            },
            { type: "LiteralExpression", value: 3 },
          ],
        },
      ] satisfies AST[]);
    });
  });

  describe("function calls", () => {
    it("should parse f(1, 2)", () => {
      deepStrictEqual(parse(scan("f(1, 2)")), [
        {
          type: "CallExpression",
          callee: "f",
          args: [
            { type: "LiteralExpression", value: 1 },
            { type: "LiteralExpression", value: 2 },
          ],
        },
      ] satisfies AST[]);
    });

    it("should parse a call with no arguments", () => {
      deepStrictEqual(parse(scan("f()")), [
        {
          type: "CallExpression",
          callee: "f",
          args: [],
        },
      ] satisfies AST[]);
    });

    it("should parse nested calls", () => {
      deepStrictEqual(parse(scan("f(g(1), 2)")), [
        {
          type: "CallExpression",
          callee: "f",
          args: [
            {
              type: "CallExpression",
              callee: "g",
              args: [{ type: "LiteralExpression", value: 1 }],
            },
            { type: "LiteralExpression", value: 2 },
          ],
        },
      ] satisfies AST[]);
    });
  });

  describe("const declarations", () => {
    it("should parse const x = 42;", () => {
      deepStrictEqual(parse(scan("const x = 42;")), [
        {
          type: "DefineExpression",
          name: "x",
          expression: { type: "LiteralExpression", value: 42 },
        },
      ] satisfies AST[]);
    });

    it("should parse const x = (1 + 2);", () => {
      deepStrictEqual(parse(scan("const x = (1 + 2);")), [
        {
          type: "DefineExpression",
          name: "x",
          expression: {
            type: "CallExpression",
            callee: "+",
            args: [
              { type: "LiteralExpression", value: 1 },
              { type: "LiteralExpression", value: 2 },
            ],
          },
        },
      ] satisfies AST[]);
    });

    it("should parse const f = (a, b) => (a + b);", () => {
      deepStrictEqual(parse(scan("const f = (a, b) => (a + b);")), [
        {
          type: "DefineFunctionExpression",
          name: "f",
          params: ["a", "b"],
          body: {
            type: "CallExpression",
            callee: "+",
            args: [
              { type: "SymbolExpression", name: "a" },
              { type: "SymbolExpression", name: "b" },
            ],
          },
        },
      ] satisfies AST[]);
    });

    it("should parse const f = () => 42;", () => {
      deepStrictEqual(parse(scan("const f = () => 42;")), [
        {
          type: "DefineFunctionExpression",
          name: "f",
          params: [],
          body: { type: "LiteralExpression", value: 42 },
        },
      ] satisfies AST[]);
    });
  });

  describe("import statements", () => {
    it('should parse from "math" import { floor, sqrt }', () => {
      deepStrictEqual(parse(scan('from "math" import { floor, sqrt };')), [
        { type: "ImportExpression", module: "math", names: ["floor", "sqrt"] },
      ] satisfies AST[]);
    });

    it("should parse a single import", () => {
      deepStrictEqual(parse(scan('from "console" import { log };')), [
        { type: "ImportExpression", module: "console", names: ["log"] },
      ] satisfies AST[]);
    });

    it("should throw when 'import' keyword is missing", () => {
      throws(() => parse(scan('from "math" floor;')), /Expected 'import'/);
    });
  });

  describe("and / or expressions", () => {
    it("should parse (a && b) as AndExpression", () => {
      deepStrictEqual(parse(scan("(a && b)")), [
        {
          type: "AndExpression",
          conditions: [
            { type: "SymbolExpression", name: "a" },
            { type: "SymbolExpression", name: "b" },
          ],
        },
      ] satisfies AST[]);
    });

    it("should parse (a || b) as OrExpression", () => {
      deepStrictEqual(parse(scan("(a || b)")), [
        {
          type: "OrExpression",
          conditions: [
            { type: "SymbolExpression", name: "a" },
            { type: "SymbolExpression", name: "b" },
          ],
        },
      ] satisfies AST[]);
    });
  });

  describe("if expressions", () => {
    it("should parse if (x) { return a; } else { return b; }", () => {
      deepStrictEqual(parse(scan("if (x) { return a; } else { return b; }")), [
        {
          type: "IfExpression",
          condition: { type: "SymbolExpression", name: "x" },
          thenBranch: { type: "SymbolExpression", name: "a" },
          elseBranch: { type: "SymbolExpression", name: "b" },
        },
      ] satisfies AST[]);
    });

    it("should parse if without else", () => {
      deepStrictEqual(parse(scan("if (x) { return a; }")), [
        {
          type: "IfExpression",
          condition: { type: "SymbolExpression", name: "x" },
          thenBranch: { type: "SymbolExpression", name: "a" },
          elseBranch: null,
        },
      ] satisfies AST[]);
    });

    it("should parse if with a comparison condition", () => {
      deepStrictEqual(
        parse(scan("if ((x > 0)) { return x; } else { return 0; }")),
        [
          {
            type: "IfExpression",
            condition: {
              type: "CallExpression",
              callee: ">",
              args: [
                { type: "SymbolExpression", name: "x" },
                { type: "LiteralExpression", value: 0 },
              ],
            },
            thenBranch: { type: "SymbolExpression", name: "x" },
            elseBranch: { type: "LiteralExpression", value: 0 },
          },
        ] satisfies AST[],
      );
    });
  });

  describe("multiple statements", () => {
    it("should parse multiple statements", () => {
      deepStrictEqual(parse(scan("const x = 1;\nconst y = 2;")), [
        {
          type: "DefineExpression",
          name: "x",
          expression: { type: "LiteralExpression", value: 1 },
        },
        {
          type: "DefineExpression",
          name: "y",
          expression: { type: "LiteralExpression", value: 2 },
        },
      ] satisfies AST[]);
    });
  });

  describe("parenthesised expression", () => {
    it("should parse (x) as just x", () => {
      deepStrictEqual(parse(scan("(x)")), [
        { type: "SymbolExpression", name: "x" },
      ] satisfies AST[]);
    });
  });

  describe("errors", () => {
    it("should throw on unexpected token", () => {
      throws(() => parse(scan("===")));
    });

    it("should throw when expected token type is missing", () => {
      throws(() => parse(scan("const 42")), /Expected token Identifier/);
    });

    it("should throw when input ends unexpectedly", () => {
      throws(
        () => parse([{ type: "LeftParen", offset: 0 }]),
        /Unexpected end of input/,
      );
    });

    it("should throw when if body lacks return", () => {
      throws(
        () => parse(scan("if (x) { 42; }")),
        /Expected 'return' in if body/,
      );
    });

    it("should throw when else body lacks return", () => {
      throws(
        () => parse(scan("if (x) { return a; } else { 42; }")),
        /Expected 'return' in else body/,
      );
    });
  });
});
