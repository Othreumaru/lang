import { describe, it } from "node:test";
import { print } from "./print.ts";
import { deepStrictEqual } from "node:assert/strict";
import type { AST } from "./ast.ts";

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
)`
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
)`
    );
  });
});
