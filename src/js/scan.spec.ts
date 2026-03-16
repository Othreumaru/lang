import { describe, it } from "node:test";
import { scan } from "./scan.ts";
import { deepStrictEqual, throws } from "node:assert/strict";
import type { Token } from "./token.ts";

describe("scan", () => {
  describe("whitespace", () => {
    it("should skip spaces, tabs, and newlines", () => {
      const tokens = scan(" \t\n\r");
      deepStrictEqual(tokens, [{ type: "EOL" }]);
    });
  });

  describe("numbers", () => {
    it("should scan an integer", () => {
      const tokens = scan("42");
      deepStrictEqual(tokens, [
        { type: "Number", value: 42 },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan a float", () => {
      const tokens = scan("3.14");
      deepStrictEqual(tokens, [
        { type: "Number", value: 3.14 },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan a negative integer", () => {
      const tokens = scan("-7");
      deepStrictEqual(tokens, [
        { type: "Number", value: -7 },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan a negative float", () => {
      const tokens = scan("-1.5");
      deepStrictEqual(tokens, [
        { type: "Number", value: -1.5 },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan - as operator when not followed by a digit", () => {
      const tokens = scan("x - y");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "x" },
        { type: "Operator", value: "-" },
        { type: "Identifier", value: "y" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("strings", () => {
    it("should scan a double-quoted string", () => {
      const tokens = scan('"hello"');
      deepStrictEqual(tokens, [
        { type: "String", value: "hello" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan a single-quoted string", () => {
      const tokens = scan("'world'");
      deepStrictEqual(tokens, [
        { type: "String", value: "world" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan an empty string", () => {
      const tokens = scan('""');
      deepStrictEqual(tokens, [
        { type: "String", value: "" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("operators", () => {
    it("should scan +", () => {
      const tokens = scan("+");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "+" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan -", () => {
      const tokens = scan("-");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "-" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan *", () => {
      const tokens = scan("*");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "*" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan /", () => {
      const tokens = scan("/");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "/" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan ===", () => {
      const tokens = scan("===");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "===" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan !==", () => {
      const tokens = scan("!==");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "!==" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan >", () => {
      const tokens = scan(">");
      deepStrictEqual(tokens, [
        { type: "Operator", value: ">" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan >=", () => {
      const tokens = scan(">=");
      deepStrictEqual(tokens, [
        { type: "Operator", value: ">=" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan <", () => {
      const tokens = scan("<");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "<" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan <=", () => {
      const tokens = scan("<=");
      deepStrictEqual(tokens, [
        { type: "Operator", value: "<=" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("assignment and arrow", () => {
    it("should scan =", () => {
      const tokens = scan("=");
      deepStrictEqual(tokens, [
        { type: "Assign" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan =>", () => {
      const tokens = scan("=>");
      deepStrictEqual(tokens, [
        { type: "Arrow" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("punctuation", () => {
    it("should scan (", () => {
      const tokens = scan("(");
      deepStrictEqual(tokens, [
        { type: "LeftParen" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan )", () => {
      const tokens = scan(")");
      deepStrictEqual(tokens, [
        { type: "RightParen" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan {", () => {
      const tokens = scan("{");
      deepStrictEqual(tokens, [
        { type: "LeftBrace" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan }", () => {
      const tokens = scan("}");
      deepStrictEqual(tokens, [
        { type: "RightBrace" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan ;", () => {
      const tokens = scan(";");
      deepStrictEqual(tokens, [
        { type: "Semicolon" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan ,", () => {
      const tokens = scan(",");
      deepStrictEqual(tokens, [
        { type: "Comma" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("keywords", () => {
    it("should scan const", () => {
      const tokens = scan("const");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "const" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan let", () => {
      const tokens = scan("let");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "let" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan return", () => {
      const tokens = scan("return");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "return" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan if", () => {
      const tokens = scan("if");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "if" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan else", () => {
      const tokens = scan("else");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "else" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan true", () => {
      const tokens = scan("true");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "true" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan false", () => {
      const tokens = scan("false");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "false" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("identifiers", () => {
    it("should scan a simple identifier", () => {
      const tokens = scan("foo");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "foo" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan an identifier with digits", () => {
      const tokens = scan("foo123");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "foo123" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan an identifier starting with underscore", () => {
      const tokens = scan("_bar");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "_bar" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });

  describe("&&  and  ||  operators", () => {
    it("should scan &&", () => {
      const tokens = scan("a && b");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "a" },
        { type: "Operator", value: "&&" },
        { type: "Identifier", value: "b" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan ||", () => {
      const tokens = scan("a || b");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "a" },
        { type: "Operator", value: "||" },
        { type: "Identifier", value: "b" },
        { type: "EOL" },
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
      const tokens = scan("const x = 1;");
      deepStrictEqual(tokens, [
        { type: "Keyword", value: "const" },
        { type: "Identifier", value: "x" },
        { type: "Assign" },
        { type: "Number", value: 1 },
        { type: "Semicolon" },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan an arrow function", () => {
      const tokens = scan("(x) => x + 1");
      deepStrictEqual(tokens, [
        { type: "LeftParen" },
        { type: "Identifier", value: "x" },
        { type: "RightParen" },
        { type: "Arrow" },
        { type: "Identifier", value: "x" },
        { type: "Operator", value: "+" },
        { type: "Number", value: 1 },
        { type: "EOL" },
      ] satisfies Token[]);
    });

    it("should scan a function call", () => {
      const tokens = scan("add(1, 2)");
      deepStrictEqual(tokens, [
        { type: "Identifier", value: "add" },
        { type: "LeftParen" },
        { type: "Number", value: 1 },
        { type: "Comma" },
        { type: "Number", value: 2 },
        { type: "RightParen" },
        { type: "EOL" },
      ] satisfies Token[]);
    });
  });
});
