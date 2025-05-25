import { char, either } from "./combinators.ts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("combinators", () => {
  describe("char combinator", () => {
    it("should return true for matching character", () => {
      const result = char("a")("abc");
      assert.strictEqual(result, true);
    });

    it("should return false for non-matching character", () => {
      const result = char("a")("bca");
      assert.strictEqual(result, false);
    });
  });

  describe("either combinator", () => {
    it("should return true if any combinator matches", () => {
      const result = either(char("a"), char("b"))("abc");
      assert.strictEqual(result, true);
    });

    it("should return false if no combinator matches", () => {
      const result = either(char("x"), char("y"))("abc");
      assert.strictEqual(result, false);
    });
  });
});
