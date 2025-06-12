import { describe, it } from "node:test";
import { interpret } from "./interpret.ts";
import { deepStrictEqual } from "node:assert/strict";
import type { AST } from "../ast.ts";

describe("interpret", () => {
  it("should interpret a simple number", () => {
    const ast: AST = {
      type: "LiteralExpression",
      value: 486,
    };
    const result = interpret(ast);
    deepStrictEqual(result, 486);
  });

  it("should interpret a call expression", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: "+",
      args: [
        { type: "LiteralExpression", value: 137 },
        { type: "LiteralExpression", value: 349 },
      ],
    };
    const result = interpret(ast);
    deepStrictEqual(result, 486);
  });

  it("should interpret a nested call expression", () => {
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
            { type: "LiteralExpression", value: 10 },
            { type: "LiteralExpression", value: 6 },
          ],
        },
      ],
    };
    const result = interpret(ast);
    deepStrictEqual(result, 19);
  });

  it("should interpret a define expression", () => {
    const ast: AST = {
      type: "DefineExpression",
      name: "x",
      expression: {
        type: "LiteralExpression",
        value: 42,
      },
    };
    const result = interpret(ast);
    deepStrictEqual(result, 42);
  });
});
