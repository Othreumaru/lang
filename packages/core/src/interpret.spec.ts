import { describe, it } from "node:test";
import { deepStrictEqual, throws } from "node:assert/strict";
import { interpret } from "./interpret.ts";
import { Environment, defaultEnv } from "./environment.ts";
import type { AST } from "./ast.ts";

describe("interpret", () => {
  describe("LetExpression", () => {
    it("should evaluate bindings and make them available in the body", () => {
      const ast: AST = {
        type: "LetExpression",
        bindings: [
          { name: "x", expression: { type: "LiteralExpression", value: 2 } },
          { name: "y", expression: { type: "LiteralExpression", value: 3 } },
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
      deepStrictEqual(interpret(ast), 5);
    });
  });

  describe("CondExpression", () => {
    it("should evaluate the first matching clause", () => {
      const ast: AST = {
        type: "CondExpression",
        clauses: [
          {
            condition: { type: "LiteralExpression", value: false },
            thenBranch: { type: "LiteralExpression", value: 1 },
          },
          {
            condition: { type: "LiteralExpression", value: true },
            thenBranch: { type: "LiteralExpression", value: 2 },
          },
        ],
      };
      deepStrictEqual(interpret(ast), 2);
    });

    it("should return null when no clause matches", () => {
      const ast: AST = {
        type: "CondExpression",
        clauses: [
          {
            condition: { type: "LiteralExpression", value: false },
            thenBranch: { type: "LiteralExpression", value: 1 },
          },
        ],
      };
      deepStrictEqual(interpret(ast), null);
    });
  });

  describe("CallExpression with expression callee", () => {
    it("should call a JS function returned by evaluating the callee expression", () => {
      const env = new Environment([], [], defaultEnv);
      env.set("makeAdder", (n: number) => (x: number) => x + n);
      const ast: AST = {
        type: "CallExpression",
        callee: {
          type: "CallExpression",
          callee: "makeAdder",
          args: [{ type: "LiteralExpression", value: 1 }],
        },
        args: [{ type: "LiteralExpression", value: 5 }],
      };
      deepStrictEqual(interpret(ast, env), 6);
    });
  });

  describe("unary minus", () => {
    it("should negate a single number via the - operator", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "-",
        args: [{ type: "LiteralExpression", value: 5 }],
      };
      deepStrictEqual(interpret(ast), -5);
    });
  });

  describe("errors", () => {
    it("should throw when calling an undefined function", () => {
      throws(
        () =>
          interpret({ type: "CallExpression", callee: "unknownFn", args: [] }),
        /is not defined/,
      );
    });

    it("should throw when referencing an undefined symbol", () => {
      throws(
        () => interpret({ type: "SymbolExpression", name: "undefinedVar" }),
        /is not defined/,
      );
    });

    it("should throw for an unknown AST node type", () => {
      throws(
        () => interpret({ type: "UnknownNode" } as unknown as AST),
        /Unknown AST node type/,
      );
    });
  });
});
