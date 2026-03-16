import { describe, it } from "node:test";
import { print, printAll } from "./print.ts";
import { deepStrictEqual } from "node:assert/strict";
import type { AST } from "../ast.ts";

describe("print", () => {
  it("should print a simple number", () => {
    const ast: AST = { type: "LiteralExpression", value: 42 };
    const printed = print(ast);
    deepStrictEqual(printed, "42");
  });

  it("should print a simple symbol", () => {
    const ast: AST = { type: "SymbolExpression", name: "foo" };
    const printed = print(ast);
    deepStrictEqual(printed, "foo");
  });

  it("should print a simple string", () => {
    const ast: AST = { type: "LiteralExpression", value: "hello" };
    const printed = print(ast);
    deepStrictEqual(printed, '"hello"');
  });

  it("should print a true boolean", () => {
    const ast: AST = { type: "LiteralExpression", value: true };
    const printed = print(ast);
    deepStrictEqual(printed, "#t");
  });

  it("should print a false boolean", () => {
    const ast: AST = { type: "LiteralExpression", value: false };
    const printed = print(ast);
    deepStrictEqual(printed, "#f");
  });

  it("should print a call expression with atoms", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: "+",
      args: [
        { type: "LiteralExpression", value: 1 },
        { type: "LiteralExpression", value: 2 },
      ],
    };
    const printed = print(ast);
    deepStrictEqual(printed, "(+ 1 2)");
  });

  it("should print a nested call expression", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: "+",
      args: [
        {
          type: "CallExpression",
          callee: "*",
          args: [
            { type: "LiteralExpression", value: 3 },
            { type: "LiteralExpression", value: 5 },
          ],
        },
        {
          type: "CallExpression",
          callee: "-",
          args: [
            {
              type: "CallExpression",
              callee: "+",
              args: [
                { type: "LiteralExpression", value: 3 },
                { type: "LiteralExpression", value: 7 },
              ],
            },
            { type: "LiteralExpression", value: 6 },
          ],
        },
      ],
    };
    const printed = print(ast);
    deepStrictEqual(
      printed,
      `(+ 
  (* 3 5)
  (- 
    (+ 3 7)
    6
  )
)`,
    );
  });

  it("should print a define expression", () => {
    const ast: AST = {
      type: "DefineExpression",
      name: "x",
      expression: { type: "LiteralExpression", value: 42 },
    };
    const printed = print(ast);
    deepStrictEqual(printed, "(define x 42)");
  });

  it("should print a define expression with nested expressions", () => {
    const ast: AST = {
      type: "DefineExpression",
      name: "y",
      expression: {
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
    };
    const printed = print(ast);
    deepStrictEqual(
      printed,
      `(define y 
  (+ 
    1
    (* 2 3)
  )
)`,
    );
  });

  it("should print an empty call expression", () => {
    const ast: AST = { type: "CallExpression", callee: "foo", args: [] };
    deepStrictEqual(print(ast), "(foo)");
  });

  it("should print a cond expression", () => {
    const ast: AST = {
      type: "CondExpression",
      clauses: [
        {
          condition: { type: "SymbolExpression", name: "x" },
          thenBranch: { type: "LiteralExpression", value: 1 },
        },
        {
          condition: { type: "SymbolExpression", name: "else" },
          thenBranch: { type: "LiteralExpression", value: 2 },
        },
      ],
    };
    deepStrictEqual(print(ast), "(cond \n  (x 1)\n  (else 2)\n)");
  });

  it("should print an if expression with else", () => {
    const ast: AST = {
      type: "IfExpression",
      condition: { type: "SymbolExpression", name: "x" },
      thenBranch: { type: "LiteralExpression", value: 1 },
      elseBranch: { type: "LiteralExpression", value: 2 },
    };
    deepStrictEqual(print(ast), "(if x \n  1\n  2\n)");
  });

  it("should print an if expression without else", () => {
    const ast: AST = {
      type: "IfExpression",
      condition: { type: "SymbolExpression", name: "x" },
      thenBranch: { type: "LiteralExpression", value: 1 },
      elseBranch: null,
    };
    deepStrictEqual(print(ast), "(if x \n  1\n)");
  });

  it("should print an and expression", () => {
    const ast: AST = {
      type: "AndExpression",
      conditions: [
        { type: "SymbolExpression", name: "a" },
        { type: "SymbolExpression", name: "b" },
      ],
    };
    deepStrictEqual(print(ast), "(and \n  a\n  b\n)");
  });

  it("should print an or expression", () => {
    const ast: AST = {
      type: "OrExpression",
      conditions: [
        { type: "SymbolExpression", name: "a" },
        { type: "SymbolExpression", name: "b" },
      ],
    };
    deepStrictEqual(print(ast), "(or \n  a\n  b\n)");
  });

  it("should print a let expression", () => {
    const ast: AST = {
      type: "LetExpression",
      bindings: [
        { name: "x", expression: { type: "LiteralExpression", value: 1 } },
        { name: "y", expression: { type: "LiteralExpression", value: 2 } },
      ],
      body: {
        type: "CallExpression",
        callee: "+",
        args: [
          { type: "SymbolExpression", name: "x" },
          { type: "SymbolExpression", name: "y" },
        ],
      },
    };
    deepStrictEqual(print(ast), "(let ((x 1) (y 2))\n  (+ x y)\n)");
  });

  it("should print a define function expression with params", () => {
    const ast: AST = {
      type: "DefineFunctionExpression",
      name: "square",
      params: ["x"],
      body: {
        type: "CallExpression",
        callee: "*",
        args: [
          { type: "SymbolExpression", name: "x" },
          { type: "SymbolExpression", name: "x" },
        ],
      },
    };
    deepStrictEqual(print(ast), "(define (square x)\n  (* x x)\n)");
  });

  it("should print a define function expression with no params", () => {
    const ast: AST = {
      type: "DefineFunctionExpression",
      name: "answer",
      params: [],
      body: { type: "LiteralExpression", value: 42 },
    };
    deepStrictEqual(print(ast), "(define (answer)\n  42\n)");
  });

  it("should print all expressions", () => {
    const asts: AST[] = [
      { type: "LiteralExpression", value: 1 },
      { type: "LiteralExpression", value: 2 },
    ];
    deepStrictEqual(printAll(asts), "1\n\n2\n");
  });
});
