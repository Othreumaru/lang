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

  it("should interpret a symbol expression", () => {
    const ast: AST = {
      type: "SymbolExpression",
      name: "x",
    };
    const env = {
      has: (name: string) => name === "x",
      get: (name: string) => 42,
      set: () => {},
    };
    const result = interpret(ast, env);
    deepStrictEqual(result, 42);
  });

  it("should interpret a let expression", () => {
    const ast: AST = {
      type: "LetExpression",
      bindings: [
        { name: "x", expression: { type: "LiteralExpression", value: 10 } },
        { name: "y", expression: { type: "LiteralExpression", value: 20 } },
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
    const result = interpret(ast);
    deepStrictEqual(result, 30);
  });
});
