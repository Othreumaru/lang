import { describe, it } from "node:test";
import { interpret, interpretAll } from "../interpret.ts";
import { deepStrictEqual, throws } from "node:assert/strict";
import type { AST } from "../ast.ts";
import { defaultEnv, Environment } from "../environment.ts";

describe("interpret", () => {
  it("should interpret a simple number", () => {
    const ast: AST = {
      type: "LiteralExpression",
      value: 486,
    };
    const result = interpret(ast);
    deepStrictEqual(result, 486);
  });

  it("should interpret a + call expression", () => {
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

  it("should interpret a > call expression", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: ">",
      args: [
        { type: "LiteralExpression", value: 10 },
        { type: "LiteralExpression", value: 5 },
      ],
    };
    const result = interpret(ast);
    deepStrictEqual(result, true);
  });

  it("should interpret a < call expression", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: "<",
      args: [
        { type: "LiteralExpression", value: 10 },
        { type: "LiteralExpression", value: 5 },
      ],
    };
    const result = interpret(ast);
    deepStrictEqual(result, false);
  });

  it("should interpret a < call expression returning false when left > right (second case)", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: "<",
      args: [
        { type: "LiteralExpression", value: 1000 },
        { type: "LiteralExpression", value: 334 },
      ],
    };
    const result = interpret(ast);
    deepStrictEqual(result, false);
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

  it("should interpret an cond expression with else", () => {
    const ast: AST = {
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
    };
    const result = interpret(ast);
    deepStrictEqual(result, -1);
  });

  it("should parse a call expression with expression calle", () => {
    const ast: AST = {
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
    };

    const env = new Environment(["a", "b"], [5, 10], defaultEnv);
    const result = interpret(ast, env);
    deepStrictEqual(result, 15); // Assuming b is 10, so it uses +
  });

  it("should interpret a define function expression", () => {
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
    const env = new Environment([], [], defaultEnv);
    interpret(ast, env);
    deepStrictEqual(env.get("square")(5), 25);
  });

  it("should throw when calling an undefined function", () => {
    const ast: AST = {
      type: "CallExpression",
      callee: "undefined-fn",
      args: [],
    };
    throws(() => interpret(ast), /Function undefined-fn is not defined/);
  });

  it("should throw when symbol is not defined", () => {
    const ast: AST = { type: "SymbolExpression", name: "unknown" };
    throws(() => interpret(ast), /Symbol unknown is not defined/);
  });

  it("should interpret an if expression with false condition and no else", () => {
    const ast: AST = {
      type: "IfExpression",
      condition: { type: "LiteralExpression", value: false },
      thenBranch: { type: "LiteralExpression", value: 1 },
      elseBranch: null,
    };
    deepStrictEqual(interpret(ast), null);
  });

  it("should interpret an if expression with false condition and else branch", () => {
    const ast: AST = {
      type: "IfExpression",
      condition: { type: "LiteralExpression", value: false },
      thenBranch: { type: "LiteralExpression", value: 1 },
      elseBranch: { type: "LiteralExpression", value: 99 },
    };
    deepStrictEqual(interpret(ast), 99);
  });

  it("should interpret a cond expression where no clause matches", () => {
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

  it("should interpret an and expression that short-circuits on false", () => {
    const ast: AST = {
      type: "AndExpression",
      conditions: [
        { type: "LiteralExpression", value: true },
        { type: "LiteralExpression", value: false },
      ],
    };
    deepStrictEqual(interpret(ast), false);
  });

  it("should interpret an and expression where all are true", () => {
    const ast: AST = {
      type: "AndExpression",
      conditions: [
        { type: "LiteralExpression", value: true },
        { type: "LiteralExpression", value: true },
      ],
    };
    deepStrictEqual(interpret(ast), true);
  });

  it("should interpret an or expression that short-circuits on true", () => {
    const ast: AST = {
      type: "OrExpression",
      conditions: [
        { type: "LiteralExpression", value: false },
        { type: "LiteralExpression", value: true },
      ],
    };
    deepStrictEqual(interpret(ast), true);
  });

  it("should interpret an or expression where all are false", () => {
    const ast: AST = {
      type: "OrExpression",
      conditions: [
        { type: "LiteralExpression", value: false },
        { type: "LiteralExpression", value: false },
      ],
    };
    deepStrictEqual(interpret(ast), false);
  });

  it("should throw on unknown AST node type", () => {
    throws(
      () => interpret({ type: "UnknownNode" } as any),
      /Unknown AST node type/,
    );
  });

  it("should interpretAll and return last result", () => {
    const asts: AST[] = [
      { type: "LiteralExpression", value: 1 },
      { type: "LiteralExpression", value: 2 },
    ];
    deepStrictEqual(interpretAll(asts), 2);
  });
});
