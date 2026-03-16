import { describe, it } from "node:test";
import { print, printAll, printExpr } from "./print.ts";
import { deepStrictEqual, throws } from "node:assert/strict";
import type { AST } from "../ast.ts";

describe("print", () => {
  describe("LiteralExpression", () => {
    it("should print a simple number", () => {
      const ast: AST = { type: "LiteralExpression", value: 42 };
      const printed = print(ast);
      deepStrictEqual(printed, "42");
    });

    it("should print a simple string", () => {
      const ast: AST = { type: "LiteralExpression", value: "hello" };
      const printed = print(ast);
      deepStrictEqual(printed, '"hello"');
    });

    it("should print a true boolean", () => {
      const ast: AST = { type: "LiteralExpression", value: true };
      const printed = print(ast);
      deepStrictEqual(printed, "true");
    });

    it("should print a false boolean", () => {
      const ast: AST = { type: "LiteralExpression", value: false };
      const printed = print(ast);
      deepStrictEqual(printed, "false");
    });
  });

  describe("SymbolExpression", () => {
    it("should print a simple symbol", () => {
      const ast: AST = { type: "SymbolExpression", name: "foo" };
      const printed = print(ast);
      deepStrictEqual(printed, "foo");
    });
  });

  describe("CallExpression", () => {
    it("should print a + call expression with atoms", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "+",
        args: [
          { type: "LiteralExpression", value: 1 },
          { type: "LiteralExpression", value: 2 },
          { type: "LiteralExpression", value: 3 },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "(1 + 2 + 3)");
    });

    it("should print a - call expression with atoms", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "-",
        args: [
          { type: "LiteralExpression", value: 1 },
          { type: "LiteralExpression", value: 2 },
          { type: "LiteralExpression", value: 3 },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "(1 - 2 - 3)");
    });

    it("should print a * call expression with atoms", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "*",
        args: [
          { type: "LiteralExpression", value: 1 },
          { type: "LiteralExpression", value: 2 },
          { type: "LiteralExpression", value: 3 },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "(1 * 2 * 3)");
    });

    it("should print a / call expression with atoms", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "/",
        args: [
          { type: "LiteralExpression", value: 1 },
          { type: "LiteralExpression", value: 2 },
          { type: "LiteralExpression", value: 3 },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "(1 / 2 / 3)");
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
              { type: "LiteralExpression", value: 10 },
              { type: "LiteralExpression", value: 6 },
            ],
          },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "((3 * 5) + (10 - 6))");
    });

    it("should print a call expression with a symbol callee", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "foo",
        args: [
          { type: "LiteralExpression", value: 1 },
          { type: "LiteralExpression", value: 2 },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "foo(1, 2);");
    });

    it("should print a call expression with a nested call callee", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: {
          type: "CallExpression",
          callee: "foo",
          args: [
            { type: "LiteralExpression", value: 1 },
            { type: "LiteralExpression", value: 2 },
          ],
        },
        args: [
          { type: "LiteralExpression", value: 3 },
          { type: "LiteralExpression", value: 4 },
        ],
      };
      const printed = print(ast);
      deepStrictEqual(printed, "foo(1, 2)(3, 4);");
    });

    it("should print a call expression with a SymbolExpression arg", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "+",
        args: [
          { type: "SymbolExpression", name: "x" },
          { type: "LiteralExpression", value: 1 },
        ],
      };
      deepStrictEqual(print(ast), "(x + 1)");
    });

    it("should print a call expression with boolean literal args", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "foo",
        args: [
          { type: "LiteralExpression", value: true },
          { type: "LiteralExpression", value: false },
        ],
      };
      deepStrictEqual(print(ast), "foo(true, false);");
    });

    it("should print a call expression with an expression-callee arg", () => {
      const ast: AST = {
        type: "CallExpression",
        callee: "+",
        args: [
          {
            type: "CallExpression",
            callee: { type: "SymbolExpression", name: "getAdd" },
            args: [],
          },
          { type: "LiteralExpression", value: 1 },
        ],
      };
      deepStrictEqual(print(ast), "(getAdd() + 1)");
    });

    it("should throw for an unknown nested AST node type", () => {
      const ast = {
        type: "CallExpression",
        callee: "foo",
        args: [
          {
            type: "LetExpression",
            bindings: [],
            body: { type: "LiteralExpression", value: 1 },
          },
        ],
      } as unknown as AST;
      throws(() => print(ast), /Unknown AST node type: LetExpression/);
    });
  });

  describe("DefineExpression", () => {
    it("should print a DefineExpression", () => {
      const ast: AST = {
        type: "DefineExpression",
        name: "x",
        expression: { type: "LiteralExpression", value: 42 },
      };
      deepStrictEqual(print(ast), "const x = 42;");
    });

    it("should print a DefineExpression with a nested DefineExpression", () => {
      const ast: AST = {
        type: "DefineExpression",
        name: "x",
        expression: {
          type: "DefineExpression",
          name: "y",
          expression: { type: "LiteralExpression", value: 1 },
        },
      };
      deepStrictEqual(print(ast), "const x = const y = 1;");
    });
  });

  describe("DefineFunctionExpression", () => {
    it("should print an arrow function via print", () => {
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
      deepStrictEqual(print(ast), "const square = (x) => (x * x);");
    });

    it("should print an arrow function via printExpr", () => {
      const ast: AST = {
        type: "DefineFunctionExpression",
        name: "double",
        params: ["n"],
        body: {
          type: "CallExpression",
          callee: "*",
          args: [
            { type: "LiteralExpression", value: 2 },
            { type: "SymbolExpression", name: "n" },
          ],
        },
      };
      deepStrictEqual(printExpr(ast), "const double = (n) => (2 * n)");
    });
  });

  describe("IfExpression", () => {
    it("should print an if/else via print", () => {
      const ast: AST = {
        type: "IfExpression",
        condition: { type: "SymbolExpression", name: "x" },
        thenBranch: { type: "LiteralExpression", value: 1 },
        elseBranch: { type: "LiteralExpression", value: 2 },
      };
      deepStrictEqual(print(ast), "if (x) { return 1; } else { return 2; }");
    });

    it("should print an if without else", () => {
      const ast: AST = {
        type: "IfExpression",
        condition: { type: "SymbolExpression", name: "x" },
        thenBranch: { type: "LiteralExpression", value: 1 },
        elseBranch: null,
      };
      deepStrictEqual(print(ast), "if (x) { return 1; }");
    });
  });

  describe("AndExpression", () => {
    it("should print an and expression", () => {
      const ast: AST = {
        type: "AndExpression",
        conditions: [
          { type: "SymbolExpression", name: "a" },
          { type: "SymbolExpression", name: "b" },
        ],
      };
      deepStrictEqual(printExpr(ast), "a && b");
    });
  });

  describe("OrExpression", () => {
    it("should print an or expression", () => {
      const ast: AST = {
        type: "OrExpression",
        conditions: [
          { type: "SymbolExpression", name: "a" },
          { type: "SymbolExpression", name: "b" },
        ],
      };
      deepStrictEqual(printExpr(ast), "a || b");
    });
  });

  describe("errors", () => {
    it("should throw for an unknown top-level AST node type", () => {
      const ast = {
        type: "LetExpression",
        bindings: [],
        body: { type: "LiteralExpression", value: 1 },
      } as unknown as AST;
      throws(() => print(ast), /Unknown AST node type: LetExpression/);
    });
  });

  describe("printAll", () => {
    it("should print multiple AST nodes joined by newlines", () => {
      const asts: AST[] = [
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
      ];
      deepStrictEqual(printAll(asts), "const x = 1;\nconst y = 2;");
    });
  });
});
