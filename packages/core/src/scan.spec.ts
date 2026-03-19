import { describe, it } from "node:test";
import { scan } from "./scan.ts";
import { deepStrictEqual, throws } from "node:assert/strict";
import type { Token } from "./token.ts";

describe("scan", () => {
  describe("whitespace", () => {
    it("should skip spaces, tabs, and newlines", () => {
      const tokens = scan(" \t\n\r");
      deepStrictEqual(tokens, [{ type: "EOL", offset: 4 }]);
    });
  });

  describe("numbers", () => {
    it("should scan an integer", () => {
      const tokens = scan("42");
      deepStrictEqual(tokens, [
        { type: "Number", value: 42, offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });

    it("should scan a float", () => {
      const tokens = scan("3.14");
      deepStrictEqual(tokens, [
        { type: "Number", value: 3.14, offset: 0 },
        { type: "EOL", offset: 4 },
      ] satisfies Token[]);
    });

    it("should scan a negative integer", () => {
      const tokens = scan("-7");
      deepStrictEqual(tokens, [
        { type: "Number", value: -7, offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });

    it("should scan a negative float", () => {
      const tokens = scan("-1.5");
      deepStrictEqual(tokens, [
        { type: "Number", value: -1.5, offset: 0 },
        { type: "EOL", offset: 4 },
      ] satisfies Token[]);
    });

    it("should scan - as operator when not followed by a digit", () => {
      const tokens = scan("x - y");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "x", offset: 0 },
        { type: "Operator", value: "-", offset: 2 },
        { type: "Identifier", value: "y", offset: 4 },
        { type: "EOL", offset: 5 },
      ] satisfies Token[]);
    });
  });

  describe("strings", () => {
    it("should scan a double-quoted string", () => {
      const tokens = scan('"hello"');
      deepStrictEqual(tokens, [
        { type: "String", value: "hello", offset: 0 },
        { type: "EOL", offset: 7 },
      ] satisfies Token[]);
    });

    it("should scan a single-quoted string", () => {
      const tokens = scan("'world'");
      deepStrictEqual(tokens, [
        { type: "String", value: "world", offset: 0 },
        { type: "EOL", offset: 7 },
      ] satisfies Token[]);
    });

    it("should scan an empty string", () => {
      const tokens = scan('""');
      deepStrictEqual(tokens, [
        { type: "String", value: "", offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });
  });

  describe("operators", () => {
    it("should scan +", () => {
      const tokens = scan("+");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "+", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan -", () => {
      const tokens = scan("-");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "-", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan *", () => {
      const tokens = scan("*");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "*", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan /", () => {
      const tokens = scan("/");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "/", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan ===", () => {
      const tokens = scan("===");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "===", offset: 0 },
        { type: "EOL", offset: 3 },
      ] satisfies Token[]);
    });

    it("should scan !==", () => {
      const tokens = scan("!==");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "!==", offset: 0 },
        { type: "EOL", offset: 3 },
      ] satisfies Token[]);
    });

    it("should scan >", () => {
      const tokens = scan(">");
      deepStrictEqual(tokens, [
        { type: "Operator", value: ">", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan >=", () => {
      const tokens = scan(">=");
      deepStrictEqual(tokens, [
        { type: "Operator", value: ">=", offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });

    it("should scan <", () => {
      const tokens = scan("<");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "<", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan <=", () => {
      const tokens = scan("<=");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "<=", offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });
  });

  describe("assignment and arrow", () => {
    it("should scan =", () => {
      const tokens = scan("=");
      deepStrictEqual(tokens, [
        { type: "Assign", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan =>", () => {
      const tokens = scan("=>");
      deepStrictEqual(tokens, [
        { type: "Arrow", offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });
  });

  describe("punctuation", () => {
    it("should scan (", () => {
      const tokens = scan("(");
      deepStrictEqual(tokens, [
        { type: "LeftParen", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan )", () => {
      const tokens = scan(")");
      deepStrictEqual(tokens, [
        { type: "RightParen", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan {", () => {
      const tokens = scan("{");
      deepStrictEqual(tokens, [
        { type: "LeftBrace", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan }", () => {
      const tokens = scan("}");
      deepStrictEqual(tokens, [
        { type: "RightBrace", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan ;", () => {
      const tokens = scan(";");
      deepStrictEqual(tokens, [
        { type: "Semicolon", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });

    it("should scan ,", () => {
      const tokens = scan(",");
      deepStrictEqual(tokens, [
        { type: "Comma", offset: 0 },
        { type: "EOL", offset: 1 },
      ] satisfies Token[]);
    });
  });

  describe("keywords", () => {
    it("should scan const", () => {
      const tokens = scan("const");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "const", offset: 0 },
        { type: "EOL", offset: 5 },
      ] satisfies Token[]);
    });

    it("should scan let", () => {
      const tokens = scan("let");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "let", offset: 0 },
        { type: "EOL", offset: 3 },
      ] satisfies Token[]);
    });

    it("should scan return", () => {
      const tokens = scan("return");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "return", offset: 0 },
        { type: "EOL", offset: 6 },
      ] satisfies Token[]);
    });

    it("should scan if", () => {
      const tokens = scan("if");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "if", offset: 0 },
        { type: "EOL", offset: 2 },
      ] satisfies Token[]);
    });

    it("should scan else", () => {
      const tokens = scan("else");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "else", offset: 0 },
        { type: "EOL", offset: 4 },
      ] satisfies Token[]);
    });

    it("should scan true", () => {
      const tokens = scan("true");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "true", offset: 0 },
        { type: "EOL", offset: 4 },
      ] satisfies Token[]);
    });

    it("should scan false", () => {
      const tokens = scan("false");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "false", offset: 0 },
        { type: "EOL", offset: 5 },
      ] satisfies Token[]);
    });
  });

  describe("identifiers", () => {
    it("should scan a simple identifier", () => {
      const tokens = scan("foo");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "foo", offset: 0 },
        { type: "EOL", offset: 3 },
      ] satisfies Token[]);
    });

    it("should scan an identifier with digits", () => {
      const tokens = scan("foo123");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "foo123", offset: 0 },
        { type: "EOL", offset: 6 },
      ] satisfies Token[]);
    });

    it("should scan an identifier starting with underscore", () => {
      const tokens = scan("_bar");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "_bar", offset: 0 },
        { type: "EOL", offset: 4 },
      ] satisfies Token[]);
    });
  });

  describe("&&  and  ||  operators", () => {
    it("should scan &&", () => {
      const tokens = scan("a && b");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "a", offset: 0 },
        { type: "Operator", value: "&&", offset: 2 },
        { type: "Identifier", value: "b", offset: 5 },
        { type: "EOL", offset: 6 },
      ] satisfies Token[]);
    });

    it("should scan ||", () => {
      const tokens = scan("a || b");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "a", offset: 0 },
        { type: "Operator", value: "||", offset: 2 },
        { type: "Identifier", value: "b", offset: 5 },
        { type: "EOL", offset: 6 },
      ] satisfies Token[]);
    });

    it("should throw on bare &", () => {
      throws(() => scan("&"), /Unexpected character: &/);
    });

    it("should throw on bare |", () => {
      throws(() => scan("|"), /Unexpected character: |/);
    });
  });

  describe("errors", () => {
    it("should throw on ==", () => {
      throws(() => scan("=="), /Expected '===' but got '=='/);
    });

    it("should throw on !=", () => {
      throws(() => scan("!="), /Expected '!==' but got '!='/);
    });

    it("should throw on bare !", () => {
      throws(() => scan("!"), /Unexpected character: !/);
    });

    it("should throw on an unknown character", () => {
      throws(() => scan("@"), /Unexpected character: @/);
    });
  });

  describe("sequences", () => {
    it("should scan a const declaration", () => {
      // "const x = 1;"
      //  0123456789...
      const tokens = scan("const x = 1;");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "const", offset: 0 },
        { type: "Identifier", value: "x", offset: 6 },
        { type: "Assign", offset: 8 },
        { type: "Number", value: 1, offset: 10 },
        { type: "Semicolon", offset: 11 },
        { type: "EOL", offset: 12 },
      ] satisfies Token[]);
    });

    it("should scan an arrow function", () => {
      // "(x) => x + 1"
      //  0123456789012
      const tokens = scan("(x) => x + 1");
      deepStrictEqual(tokens, [
        { type: "LeftParen", offset: 0 },
        { type: "Identifier", value: "x", offset: 1 },
        { type: "RightParen", offset: 2 },
        { type: "Arrow", offset: 4 },
        { type: "Identifier", value: "x", offset: 7 },
        { type: "Operator", value: "+", offset: 9 },
        { type: "Number", value: 1, offset: 11 },
        { type: "EOL", offset: 12 },
      ] satisfies Token[]);
    });

    it("should scan a function call", () => {
      // "add(1, 2)"
      //  012345678
      const tokens = scan("add(1, 2)");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "add", offset: 0 },
        { type: "LeftParen", offset: 3 },
        { type: "Number", value: 1, offset: 4 },
        { type: "Comma", offset: 5 },
        { type: "Number", value: 2, offset: 7 },
        { type: "RightParen", offset: 8 },
        { type: "EOL", offset: 9 },
      ] satisfies Token[]);
    });

    it("should scan a from/import statement", () => {
      // 'from "math" import { floor, sqrt };'
      //  0    5      12     19 21    27   33
      const tokens = scan('from "math" import { floor, sqrt };');
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "from", offset: 0 },
        { type: "String", value: "math", offset: 5 },
        { type: "Keyword", value: "import", offset: 12 },
        { type: "LeftBrace", offset: 19 },
        { type: "Identifier", value: "floor", offset: 21 },
        { type: "Comma", offset: 26 },
        { type: "Identifier", value: "sqrt", offset: 28 },
        { type: "RightBrace", offset: 33 },
        { type: "Semicolon", offset: 34 },
        { type: "EOL", offset: 35 },
      ] satisfies Token[]);
    });

    it("should scan an object literal with member access", () => {
      // "{ x: 1 }.x"
      //  01234567890
      const tokens = scan("{ x: 1 }.x");
      deepStrictEqual(tokens, [
        { type: "LeftBrace", offset: 0 },
        { type: "Identifier", value: "x", offset: 2 },
        { type: "Colon", offset: 3 },
        { type: "Number", value: 1, offset: 5 },
        { type: "RightBrace", offset: 7 },
        { type: "Dot", offset: 8 },
        { type: "Identifier", value: "x", offset: 9 },
        { type: "EOL", offset: 10 },
      ] satisfies Token[]);
    });

    it("should scan an array literal", () => {
      // "[1, 2]"
      //  012345
      const tokens = scan("[1, 2]");
      deepStrictEqual(tokens, [
        { type: "LeftBracket", offset: 0 },
        { type: "Number", value: 1, offset: 1 },
        { type: "Comma", offset: 2 },
        { type: "Number", value: 2, offset: 4 },
        { type: "RightBracket", offset: 5 },
        { type: "EOL", offset: 6 },
      ] satisfies Token[]);
    });

    it("should scan index access", () => {
      // "arr[0]"
      //  012345
      const tokens = scan("arr[0]");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "arr", offset: 0 },
        { type: "LeftBracket", offset: 3 },
        { type: "Number", value: 0, offset: 4 },
        { type: "RightBracket", offset: 5 },
        { type: "EOL", offset: 6 },
      ] satisfies Token[]);
    });
  });
});
